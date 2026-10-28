import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { createAssignmentSchema, reassignMentorSchema } from '@mentorconnect/shared';
import { recordAuditLog } from '../../middleware/audit';

export async function listAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search, departmentId, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (departmentId) {
      where.student = { departmentId: String(departmentId) };
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { student: { fullName: { contains: q, mode: 'insensitive' } } },
        { student: { usn: { contains: q, mode: 'insensitive' } } },
        { mentor: { fullName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, assignments] = await Promise.all([
      prisma.mentorAssignment.count({ where }),
      prisma.mentorAssignment.findMany({
        where,
        include: {
          student: {
            include: { department: true },
          },
          mentor: {
            include: { department: true },
          },
          academicTerm: true,
        },
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        assignments,
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

export async function createAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createAssignmentSchema.parse(req.body);

    // 1. Verify student exists
    const student = await prisma.studentProfile.findUnique({
      where: { id: data.studentId },
      include: { user: true },
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // 2. Verify mentor exists
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: data.mentorId },
      include: { user: true },
    });
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor profile not found.' });
    }

    // 3. Check for existing active assignment
    const existingActive = await prisma.mentorAssignment.findFirst({
      where: { studentId: data.studentId, status: 'ACTIVE' },
    });
    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: 'This student already has an active mentor assigned. Use the Reassign feature to change mentors.',
      });
    }

    // 4. Check mentor capacity
    const currentActiveCount = await prisma.mentorAssignment.count({
      where: { mentorId: data.mentorId, status: 'ACTIVE' },
    });

    if (currentActiveCount >= mentor.maxCapacity && !data.overrideCapacity) {
      return res.status(400).json({
        success: false,
        message: `Mentor ${mentor.fullName} is currently at maximum capacity (${currentActiveCount}/${mentor.maxCapacity}). Override capacity is required to proceed.`,
        canOverride: true,
      });
    }

    // Find current academic term if not specified
    let termId = data.academicTermId;
    if (!termId) {
      const currentTerm = await prisma.academicTerm.findFirst({ where: { isCurrent: true } });
      termId = currentTerm?.id;
    }

    // 5. Execute assignment in transaction
    const assignment = await prisma.$transaction(async (tx) => {
      const newAssignment = await tx.mentorAssignment.create({
        data: {
          studentId: data.studentId,
          mentorId: data.mentorId,
          academicTermId: termId,
          status: 'ACTIVE',
          assignedBy: req.user!.fullName,
          notes: data.notes || 'Direct administrative assignment',
        },
        include: {
          student: true,
          mentor: true,
        },
      });

      // Update mentor's current mentee count cache
      await tx.mentorProfile.update({
        where: { id: data.mentorId },
        data: { currentMenteeCount: currentActiveCount + 1 },
      });

      // Send notification to student
      await tx.notification.create({
        data: {
          userId: student.userId,
          title: 'Mentor Assigned',
          message: `You have been assigned to faculty mentor ${mentor.fullName}.`,
          type: 'SUCCESS',
          link: '/student/mentor',
        },
      });

      // Send notification to mentor
      await tx.notification.create({
        data: {
          userId: mentor.userId,
          title: 'New Mentee Assigned',
          message: `Student ${student.fullName} (${student.usn}) has been assigned to your mentoring group.`,
          type: 'INFO',
          link: '/mentor/mentees',
        },
      });

      return newAssignment;
    });

    // 6. Record audit log
    await recordAuditLog({
      req,
      action: 'MENTOR_ASSIGNED',
      entityType: 'MentorAssignment',
      entityId: assignment.id,
      details: {
        studentId: student.id,
        studentName: student.fullName,
        studentUsn: student.usn,
        mentorId: mentor.id,
        mentorName: mentor.fullName,
        overrideCapacity: data.overrideCapacity,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Successfully assigned ${student.fullName} to ${mentor.fullName}.`,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}

export async function reassignMentor(req: Request, res: Response, next: NextFunction) {
  try {
    const data = reassignMentorSchema.parse(req.body);

    const student = await prisma.studentProfile.findUnique({
      where: { id: data.studentId },
      include: { user: true },
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const newMentor = await prisma.mentorProfile.findUnique({
      where: { id: data.newMentorId },
      include: { user: true },
    });
    if (!newMentor) {
      return res.status(404).json({ success: false, message: 'New mentor not found.' });
    }

    const currentAssignment = await prisma.mentorAssignment.findFirst({
      where: { studentId: data.studentId, status: 'ACTIVE' },
      include: { mentor: { include: { user: true } } },
    });

    if (!currentAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Student has no active assignment to reassign. Use standard assignment instead.',
      });
    }

    if (currentAssignment.mentorId === data.newMentorId) {
      return res.status(400).json({
        success: false,
        message: 'The student is already assigned to this mentor.',
      });
    }

    // Check new mentor capacity
    const newMentorActiveCount = await prisma.mentorAssignment.count({
      where: { mentorId: data.newMentorId, status: 'ACTIVE' },
    });

    if (newMentorActiveCount >= newMentor.maxCapacity && !data.overrideCapacity) {
      return res.status(400).json({
        success: false,
        message: `Mentor ${newMentor.fullName} is at capacity (${newMentorActiveCount}/${newMentor.maxCapacity}). Override is required.`,
        canOverride: true,
      });
    }

    // Execute reassignment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark previous assignment as REASSIGNED
      await tx.mentorAssignment.update({
        where: { id: currentAssignment.id },
        data: {
          status: 'REASSIGNED',
          endedAt: new Date(),
        },
      });

      // 2. Decrement old mentor mentee count
      const oldMentorActiveCount = await tx.mentorAssignment.count({
        where: { mentorId: currentAssignment.mentorId, status: 'ACTIVE' },
      });
      await tx.mentorProfile.update({
        where: { id: currentAssignment.mentorId },
        data: { currentMenteeCount: Math.max(0, oldMentorActiveCount) },
      });

      // 3. Create new ACTIVE assignment
      const newAssignment = await tx.mentorAssignment.create({
        data: {
          studentId: data.studentId,
          mentorId: data.newMentorId,
          academicTermId: currentAssignment.academicTermId,
          status: 'ACTIVE',
          assignedBy: req.user!.fullName,
          notes: `Reassigned from ${currentAssignment.mentor.fullName}. Reason: ${data.reason}`,
        },
        include: { mentor: true, student: true },
      });

      // 4. Increment new mentor mentee count
      await tx.mentorProfile.update({
        where: { id: data.newMentorId },
        data: { currentMenteeCount: newMentorActiveCount + 1 },
      });

      // 5. Notify student
      await tx.notification.create({
        data: {
          userId: student.userId,
          title: 'Mentor Reassigned',
          message: `Your faculty mentor has been reassigned to ${newMentor.fullName}.`,
          type: 'INFO',
          link: '/student/mentor',
        },
      });

      // 6. Notify new mentor
      await tx.notification.create({
        data: {
          userId: newMentor.userId,
          title: 'Mentee Reassigned to You',
          message: `Student ${student.fullName} has been reassigned to your group.`,
          type: 'INFO',
          link: '/mentor/mentees',
        },
      });

      return newAssignment;
    });

    await recordAuditLog({
      req,
      action: 'MENTOR_REASSIGNED',
      entityType: 'MentorAssignment',
      entityId: result.id,
      details: {
        studentId: student.id,
        studentUsn: student.usn,
        previousMentorId: currentAssignment.mentorId,
        previousMentorName: currentAssignment.mentor.fullName,
        newMentorId: newMentor.id,
        newMentorName: newMentor.fullName,
        reason: data.reason,
      },
    });

    return res.json({
      success: true,
      message: `Successfully reassigned ${student.fullName} from ${currentAssignment.mentor.fullName} to ${newMentor.fullName}.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUnassignedStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const { departmentId, search } = req.query;

    const where: any = {
      assignments: {
        none: { status: 'ACTIVE' },
      },
    };

    if (departmentId) {
      where.departmentId = String(departmentId);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { usn: { contains: q, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.studentProfile.findMany({
      where,
      include: {
        department: true,
        user: { select: { email: true } },
      },
      orderBy: { fullName: 'asc' },
    });

    return res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
}

export async function getMentorWorkloads(req: Request, res: Response, next: NextFunction) {
  try {
    const mentors = await prisma.mentorProfile.findMany({
      include: {
        department: true,
        user: { select: { email: true } },
      },
      orderBy: { fullName: 'asc' },
    });

    const workloads = await Promise.all(
      mentors.map(async (m) => {
        const activeCount = await prisma.mentorAssignment.count({
          where: { mentorId: m.id, status: 'ACTIVE' },
        });

        const utilizationPercent = Math.round((activeCount / m.maxCapacity) * 100);

        return {
          id: m.id,
          fullName: m.fullName,
          designation: m.designation,
          department: m.department,
          email: m.user.email,
          phone: m.phone,
          maxCapacity: m.maxCapacity,
          activeCount,
          availableSlots: Math.max(0, m.maxCapacity - activeCount),
          utilizationPercent,
          isAtCapacity: activeCount >= m.maxCapacity,
          expertise: m.expertise,
        };
      })
    );

    return res.json({ success: true, data: workloads });
  } catch (error) {
    next(error);
  }
}
