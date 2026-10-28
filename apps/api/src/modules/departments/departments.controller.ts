import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { departmentSchema } from '@mentorconnect/shared';
import { recordAuditLog } from '../../middleware/audit';

export async function listDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await prisma.department.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            students: true,
            mentors: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = departmentSchema.parse(req.body);

    const existing = await prisma.department.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: `Department code ${data.code} already exists.` });
    }

    const dept = await prisma.department.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        active: true,
      },
    });

    await recordAuditLog({
      req,
      action: 'DEPARTMENT_CREATED',
      entityType: 'Department',
      entityId: dept.id,
      details: { code: dept.code, name: dept.name },
    });

    return res.status(201).json({ success: true, message: 'Department created.', data: dept });
  } catch (error) {
    next(error);
  }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    const dept = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(active !== undefined && { active }),
      },
    });

    await recordAuditLog({
      req,
      action: 'DEPARTMENT_UPDATED',
      entityType: 'Department',
      entityId: dept.id,
      details: { name, active },
    });

    return res.json({ success: true, message: 'Department updated.', data: dept });
  } catch (error) {
    next(error);
  }
}
