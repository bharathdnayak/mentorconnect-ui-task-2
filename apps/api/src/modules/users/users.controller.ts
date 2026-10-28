import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/db';
import { recordAuditLog } from '../../middleware/audit';

export async function listStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, departmentId, semester, assigned, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (departmentId) where.departmentId = String(departmentId);
    if (semester) where.semester = parseInt(String(semester), 10);

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { usn: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (assigned === 'true') {
      where.assignments = { some: { status: 'ACTIVE' } };
    } else if (assigned === 'false') {
      where.assignments = { none: { status: 'ACTIVE' } };
    }

    const [total, students] = await Promise.all([
      prisma.studentProfile.count({ where }),
      prisma.studentProfile.findMany({
        where,
        include: {
          department: true,
          user: { select: { id: true, email: true, isActive: true, lastLogin: true } },
          assignments: {
            where: { status: 'ACTIVE' },
            include: { mentor: { select: { id: true, fullName: true, facultyId: true } } },
          },
        },
        orderBy: { fullName: 'asc' },
        skip,
        take: limitNum,
      }),
    ]);

    const formatted = students.map(s => ({
      id: s.id,
      userId: s.user.id,
      fullName: s.fullName,
      usn: s.usn,
      email: s.user.email,
      phone: s.phone,
      department: s.department,
      semester: s.semester,
      degree: s.degree,
      profileCompleted: s.profileCompleted,
      isActive: s.user.isActive,
      lastLogin: s.user.lastLogin,
      activeMentor: s.assignments.length > 0 ? s.assignments[0].mentor : null,
      technicalSkills: s.technicalSkills,
      careerGoals: s.careerGoals,
    }));

    return res.json({
      success: true,
      data: {
        students: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listMentors(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, departmentId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (departmentId) where.departmentId = String(departmentId);
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { facultyId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, mentors] = await Promise.all([
      prisma.mentorProfile.count({ where }),
      prisma.mentorProfile.findMany({
        where,
        include: {
          department: true,
          user: { select: { id: true, email: true, isActive: true, lastLogin: true } },
          assignments: {
            where: { status: 'ACTIVE' },
          },
        },
        orderBy: { fullName: 'asc' },
        skip,
        take: limitNum,
      }),
    ]);

    const formatted = mentors.map(m => {
      const activeCount = m.assignments.length;
      return {
        id: m.id,
        userId: m.user.id,
        fullName: m.fullName,
        facultyId: m.facultyId,
        designation: m.designation,
        email: m.user.email,
        phone: m.phone,
        department: m.department,
        maxCapacity: m.maxCapacity,
        activeMenteeCount: activeCount,
        availableSlots: Math.max(0, m.maxCapacity - activeCount),
        isAtCapacity: activeCount >= m.maxCapacity,
        isActive: m.user.isActive,
        lastLogin: m.user.lastLogin,
        expertise: m.expertise,
      };
    });

    return res.json({
      success: true,
      data: {
        mentors: formatted,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; // userId
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    await recordAuditLog({
      req,
      action: isActive ? 'USER_REACTIVATED' : 'USER_DEACTIVATED',
      entityType: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role, isActive: user.isActive },
    });

    return res.json({
      success: true,
      message: `User ${user.email} has been ${isActive ? 'reactivated' : 'deactivated'}.`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function createMentorUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, fullName, facultyId, departmentId, designation, maxCapacity = 10, expertise = [] } = req.body;

    if (!email || !password || !fullName || !facultyId || !departmentId || !designation) {
      return res.status(400).json({ success: false, message: 'All required faculty fields must be provided.' });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { mentorProfile: { facultyId: facultyId.trim() } },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Email or Faculty ID already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role: 'MENTOR',
          isActive: true,
        },
      });

      const profile = await tx.mentorProfile.create({
        data: {
          userId: user.id,
          fullName: fullName.trim(),
          facultyId: facultyId.trim(),
          departmentId,
          designation: designation.trim(),
          maxCapacity: parseInt(String(maxCapacity), 10) || 10,
          expertise: Array.isArray(expertise) ? expertise : [],
        },
        include: { department: true },
      });

      return { user, profile };
    });

    await recordAuditLog({
      req,
      action: 'FACULTY_MENTOR_CREATED',
      entityType: 'MentorProfile',
      entityId: result.profile.id,
      details: { facultyId, fullName, email },
    });

    return res.status(201).json({
      success: true,
      message: 'Faculty mentor account created successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
