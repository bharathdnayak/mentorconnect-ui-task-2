import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { studentProfileUpdateSchema, createChangeRequestSchema, rankMentorRecommendations } from '@mentorconnect/shared';
import { recordAuditLog } from '../../middleware/audit';

export async function getStudentProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      return res.status(400).json({ success: false, message: 'Student profile not associated with user.' });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        department: true,
        user: { select: { email: true, createdAt: true } },
      },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    return res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function updateStudentProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      return res.status(400).json({ success: false, message: 'Student profile not associated with user.' });
    }

    const data = studentProfileUpdateSchema.parse(req.body);

    // Calculate profile completion
    const hasSkills = data.technicalSkills && data.technicalSkills.length > 0;
    const hasGoals = data.careerGoals && data.careerGoals.length > 0;
    const hasGuidance = data.guidanceNeeds && data.guidanceNeeds.length > 0;
    const hasBio = !!(data.bio && data.bio.trim().length > 10);
    const hasHobbies = !!(data.hobbies && data.hobbies.trim().length > 2);

    const isComplete = Boolean(hasSkills && hasGoals && hasGuidance && hasBio && hasHobbies);

    const updated = await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: {
        ...data,
        profileCompleted: isComplete,
      },
      include: { department: true },
    });

    return res.json({
      success: true,
      message: 'Student profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyMentor(req: Request, res: Response, next: NextFunction) {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      return res.status(400).json({ success: false, message: 'Student profile not associated with user.' });
    }

    const activeAssignment = await prisma.mentorAssignment.findFirst({
      where: {
        studentId: studentProfileId,
        status: 'ACTIVE',
      },
      include: {
        mentor: {
          include: {
            department: true,
            user: { select: { email: true } },
          },
        },
        academicTerm: true,
      },
    });

    if (!activeAssignment) {
      return res.json({
        success: true,
        data: null,
        message: 'No mentor is currently assigned.',
      });
    }

    // Get count of completed sessions with this mentor
    const completedSessionsCount = await prisma.mentoringSession.count({
      where: {
        studentId: studentProfileId,
        mentorId: activeAssignment.mentor.id,
        status: 'COMPLETED',
      },
    });

    return res.json({
      success: true,
      data: {
        assignmentId: activeAssignment.id,
        assignedAt: activeAssignment.assignedAt,
        notes: activeAssignment.notes,
        mentor: {
          id: activeAssignment.mentor.id,
          fullName: activeAssignment.mentor.fullName,
          designation: activeAssignment.mentor.designation,
          email: activeAssignment.mentor.user.email,
          phone: activeAssignment.mentor.phone,
          department: activeAssignment.mentor.department,
          expertise: activeAssignment.mentor.expertise,
          technicalSkills: activeAssignment.mentor.technicalSkills,
          mentoringInterests: activeAssignment.mentor.mentoringInterests,
          bio: activeAssignment.mentor.bio,
        },
        academicTerm: activeAssignment.academicTerm,
        completedSessionsCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      return res.status(400).json({ success: false, message: 'Student profile not found.' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { department: true },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const mentors = await prisma.mentorProfile.findMany({
      include: { department: true },
    });

    const recommendations = rankMentorRecommendations(
      {
        id: student.id,
        departmentId: student.departmentId,
        departmentName: student.department.name,
        careerGoals: student.careerGoals,
        guidanceNeeds: student.guidanceNeeds,
        technicalSkills: student.technicalSkills,
        preferredTopics: student.preferredTopics,
      },
      mentors.map(m => ({
        id: m.id,
        userId: m.userId,
        fullName: m.fullName,
        departmentId: m.departmentId,
        departmentName: m.department.name,
        designation: m.designation,
        expertise: m.expertise,
        technicalSkills: m.technicalSkills,
        mentoringInterests: m.mentoringInterests,
        maxCapacity: m.maxCapacity,
        currentMenteeCount: m.currentMenteeCount,
      }))
    );

    return res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
}

export async function requestMentorChange(req: Request, res: Response, next: NextFunction) {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      return res.status(400).json({ success: false, message: 'Student profile not found.' });
    }

    const data = createChangeRequestSchema.parse(req.body);

    // Check if there is already a pending change request
    const existingPending = await prisma.mentorChangeRequest.findFirst({
      where: {
        studentId: studentProfileId,
        status: 'PENDING',
      },
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending mentor change request under review by the HOD.',
      });
    }

    // Get current active assignment
    const activeAssignment = await prisma.mentorAssignment.findFirst({
      where: {
        studentId: studentProfileId,
        status: 'ACTIVE',
      },
    });

    const request = await prisma.mentorChangeRequest.create({
      data: {
        studentId: studentProfileId,
        currentMentorId: activeAssignment?.mentorId || null,
        requestedMentorId: data.requestedMentorId || null,
        reason: data.reason,
        status: 'PENDING',
      },
      include: {
        currentMentor: true,
        requestedMentor: true,
      },
    });

    await recordAuditLog({
      req,
      action: 'MENTOR_CHANGE_REQUESTED',
      entityType: 'MentorChangeRequest',
      entityId: request.id,
      details: {
        reason: data.reason,
        currentMentorId: activeAssignment?.mentorId,
        requestedMentorId: data.requestedMentorId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Mentor change request submitted successfully. It will be reviewed by the HOD.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentChangeRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      return res.status(400).json({ success: false, message: 'Student profile not found.' });
    }

    const requests = await prisma.mentorChangeRequest.findMany({
      where: { studentId: studentProfileId },
      include: {
        currentMentor: { select: { fullName: true, designation: true } },
        requestedMentor: { select: { fullName: true, designation: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
}

export async function getStudentSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      return res.status(400).json({ success: false, message: 'Student profile not found.' });
    }

    const sessions = await prisma.mentoringSession.findMany({
      where: { studentId: studentProfileId },
      include: {
        mentor: {
          select: {
            id: true,
            fullName: true,
            designation: true,
            department: { select: { name: true, code: true } },
          },
        },
        notes: {
          where: {
            // Students can only see notes that are shared with them
            visibility: 'SHARED_STUDENT',
          },
        },
        actionItems: true,
        feedbacks: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
}

export async function getStudentDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      return res.status(400).json({ success: false, message: 'Student profile not found.' });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { department: true },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    // Active assignment
    const activeAssignment = await prisma.mentorAssignment.findFirst({
      where: { studentId: studentProfileId, status: 'ACTIVE' },
      include: {
        mentor: {
          select: {
            id: true,
            fullName: true,
            designation: true,
            phone: true,
            user: { select: { email: true } },
            department: true,
          },
        },
      },
    });

    // Upcoming session
    const upcomingSession = await prisma.mentoringSession.findFirst({
      where: {
        studentId: studentProfileId,
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
      include: {
        mentor: { select: { fullName: true, designation: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    // Pending action items
    const pendingActionItems = await prisma.actionItem.findMany({
      where: {
        studentId: studentProfileId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    // Total completed sessions
    const completedSessionsCount = await prisma.mentoringSession.count({
      where: { studentId: studentProfileId, status: 'COMPLETED' },
    });

    // Calculate detailed completion score
    let completionPercentage = 40; // Base details from registration
    if (profile.technicalSkills.length > 0) completionPercentage += 15;
    if (profile.careerGoals.length > 0) completionPercentage += 15;
    if (profile.guidanceNeeds.length > 0) completionPercentage += 15;
    if (profile.bio && profile.bio.length > 10) completionPercentage += 10;
    if (profile.hobbies && profile.hobbies.length > 2) completionPercentage += 5;
    completionPercentage = Math.min(100, completionPercentage);

    return res.json({
      success: true,
      data: {
        profile: {
          fullName: profile.fullName,
          usn: profile.usn,
          semester: profile.semester,
          departmentName: profile.department.name,
          profileCompleted: profile.profileCompleted,
          completionPercentage,
        },
        assignedMentor: activeAssignment ? activeAssignment.mentor : null,
        upcomingSession,
        pendingActionItems,
        completedSessionsCount,
      },
    });
  } catch (error) {
    next(error);
  }
}
