import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { mentorProfileUpdateSchema } from '@mentorconnect/shared';

export async function getMentorProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const mentorProfileId = req.user!.mentorProfileId;
    if (!mentorProfileId) {
      return res.status(400).json({ success: false, message: 'Mentor profile not associated with user.' });
    }

    const profile = await prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId },
      include: {
        department: true,
        user: { select: { email: true, createdAt: true } },
      },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Mentor profile not found.' });
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function updateMentorProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const mentorProfileId = req.user!.mentorProfileId;
    if (!mentorProfileId) {
      return res.status(400).json({ success: false, message: 'Mentor profile not associated with user.' });
    }

    const data = mentorProfileUpdateSchema.parse(req.body);

    const updated = await prisma.mentorProfile.update({
      where: { id: mentorProfileId },
      data,
      include: { department: true },
    });

    return res.json({
      success: true,
      message: 'Faculty profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyMentees(req: Request, res: Response, next: NextFunction) {
  try {
    const mentorProfileId = req.user!.mentorProfileId;
    if (!mentorProfileId) {
      return res.status(400).json({ success: false, message: 'Mentor profile not associated with user.' });
    }

    const { search, semester } = req.query;

    const whereClause: any = {
      mentorId: mentorProfileId,
      status: 'ACTIVE',
    };

    if (search) {
      const q = String(search).trim();
      whereClause.student = {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { usn: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    if (semester) {
      whereClause.student = {
        ...(whereClause.student || {}),
        semester: parseInt(String(semester), 10),
      };
    }

    const assignments = await prisma.mentorAssignment.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            department: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    // Enhance mentees with session and pending action counts
    const menteeData = await Promise.all(
      assignments.map(async (assignment) => {
        const student = assignment.student;
        const totalSessions = await prisma.mentoringSession.count({
          where: { studentId: student.id, mentorId: mentorProfileId },
        });
        const pendingActionItems = await prisma.actionItem.count({
          where: { studentId: student.id, status: { in: ['PENDING', 'IN_PROGRESS'] } },
        });

        return {
          assignmentId: assignment.id,
          assignedAt: assignment.assignedAt,
          student: {
            id: student.id,
            fullName: student.fullName,
            usn: student.usn,
            email: student.user.email,
            phone: student.phone,
            semester: student.semester,
            degree: student.degree,
            department: student.department,
            careerGoals: student.careerGoals,
            technicalSkills: student.technicalSkills,
            guidanceNeeds: student.guidanceNeeds,
            profileCompleted: student.profileCompleted,
          },
          totalSessions,
          pendingActionItems,
        };
      })
    );

    return res.json({ success: true, data: menteeData });
  } catch (error) {
    next(error);
  }
}

export async function getMenteeProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const mentorProfileId = req.user!.mentorProfileId;
    const { studentId } = req.params;

    if (!mentorProfileId) {
      return res.status(400).json({ success: false, message: 'Mentor profile not associated with user.' });
    }

    // Verify ownership: Mentor can ONLY access their assigned mentees
    const assignment = await prisma.mentorAssignment.findFirst({
      where: {
        studentId,
        mentorId: mentorProfileId,
        status: 'ACTIVE',
      },
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not assigned as the mentor for this student.',
      });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        department: true,
        user: { select: { email: true } },
        actionItems: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Get sessions between this mentor and student
    const sessions = await prisma.mentoringSession.findMany({
      where: {
        studentId,
        mentorId: mentorProfileId,
      },
      include: {
        notes: true, // Mentor can see their notes (private & shared)
        actionItems: true,
        feedbacks: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return res.json({
      success: true,
      data: {
        student,
        assignment,
        sessions,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMentorDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const mentorProfileId = req.user!.mentorProfileId;
    if (!mentorProfileId) {
      return res.status(400).json({ success: false, message: 'Mentor profile not associated with user.' });
    }

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId },
      include: { department: true },
    });

    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found.' });
    }

    const activeAssignmentsCount = await prisma.mentorAssignment.count({
      where: { mentorId: mentorProfileId, status: 'ACTIVE' },
    });

    // Upcoming sessions
    const upcomingSessions = await prisma.mentoringSession.findMany({
      where: {
        mentorId: mentorProfileId,
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
      include: {
        student: { select: { fullName: true, usn: true, semester: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });

    // Recent completed sessions
    const completedSessions = await prisma.mentoringSession.count({
      where: { mentorId: mentorProfileId, status: 'COMPLETED' },
    });

    // Pending action items across all mentees
    const pendingActionItems = await prisma.actionItem.findMany({
      where: {
        session: { mentorId: mentorProfileId },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      include: {
        student: { select: { fullName: true, usn: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 6,
    });

    return res.json({
      success: true,
      data: {
        mentor: {
          fullName: mentor.fullName,
          designation: mentor.designation,
          departmentName: mentor.department.name,
          maxCapacity: mentor.maxCapacity,
          currentMenteeCount: activeAssignmentsCount,
          availableSlots: Math.max(0, mentor.maxCapacity - activeAssignmentsCount),
        },
        upcomingSessions,
        completedSessions,
        pendingActionItems,
      },
    });
  } catch (error) {
    next(error);
  }
}
