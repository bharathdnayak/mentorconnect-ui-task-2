import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { createAnnouncementSchema, UserRole } from '@mentorconnect/shared';
import { recordAuditLog } from '../../middleware/audit';

export async function listAnnouncements(req: Request, res: Response, next: NextFunction) {
  try {
    const userRole = req.user!.role;

    const roleFilters: string[] = ['ALL'];
    if (userRole === UserRole.STUDENT) {
      roleFilters.push('STUDENT');
    } else if (userRole === UserRole.MENTOR) {
      roleFilters.push('MENTOR');
    } else if (userRole === UserRole.HOD) {
      roleFilters.push('STUDENT', 'MENTOR');
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        targetRole: { in: roleFilters },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
}

export async function createAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createAnnouncementSchema.parse(req.body);

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        targetRole: data.targetRole,
        priority: data.priority as any,
        departmentId: data.departmentId || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        authorId: req.user!.userId,
      },
      include: {
        department: true,
      },
    });

    await recordAuditLog({
      req,
      action: 'ANNOUNCEMENT_PUBLISHED',
      entityType: 'Announcement',
      entityId: announcement.id,
      details: { title: data.title, targetRole: data.targetRole, priority: data.priority },
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({ where: { id } });

    await recordAuditLog({
      req,
      action: 'ANNOUNCEMENT_DELETED',
      entityType: 'Announcement',
      entityId: id,
    });

    return res.json({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    next(error);
  }
}
