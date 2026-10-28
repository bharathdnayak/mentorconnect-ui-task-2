import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import {
  createSessionSchema,
  updateSessionStatusSchema,
  createMeetingNoteSchema,
  createActionItemSchema,
  createFeedbackSchema,
  UserRole,
} from '@mentorconnect/shared';
import { recordAuditLog } from '../../middleware/audit';

export async function createSession(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createSessionSchema.parse(req.body);

    const mentorProfileId = req.user!.mentorProfileId || data.mentorId;
    if (!mentorProfileId) {
      return res.status(400).json({ success: false, message: 'Mentor profile ID required.' });
    }

    // Verify student exists
    const student = await prisma.studentProfile.findUnique({
      where: { id: data.studentId },
      include: { user: true },
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Mentee not found.' });
    }

    // Verify mentor exists
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId },
      include: { user: true },
    });
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found.' });
    }

    // Verify assignment exists if caller is mentor
    if (req.user!.role === UserRole.MENTOR) {
      const isAssigned = await prisma.mentorAssignment.findFirst({
        where: { studentId: data.studentId, mentorId: mentorProfileId, status: 'ACTIVE' },
      });
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'You can only schedule mentoring sessions with your assigned mentees.',
        });
      }
    }

    const session = await prisma.mentoringSession.create({
      data: {
        title: data.title,
        studentId: data.studentId,
        mentorId: mentorProfileId,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes,
        meetingType: data.meetingType as any,
        location: data.location || null,
        meetingLink: data.meetingLink || null,
        agenda: data.agenda,
        status: 'SCHEDULED',
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
      include: {
        student: { select: { fullName: true, usn: true } },
        mentor: { select: { fullName: true, designation: true } },
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: 'New Mentoring Session Scheduled',
        message: `${mentor.fullName} scheduled "${data.title}" for ${new Date(data.scheduledAt).toLocaleString()}.`,
        type: 'INFO',
        link: '/student/sessions',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Mentoring session scheduled successfully.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSessionById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = req.user!;

    const session = await prisma.mentoringSession.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            department: true,
            user: { select: { email: true } },
          },
        },
        mentor: {
          include: {
            department: true,
            user: { select: { email: true } },
          },
        },
        actionItems: {
          orderBy: { createdAt: 'asc' },
        },
        feedbacks: true,
        notes: {
          include: {
            author: { select: { email: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Role-based visibility check
    const isStudent = user.role === UserRole.STUDENT && user.studentProfileId === session.studentId;
    const isMentor = user.role === UserRole.MENTOR && user.mentorProfileId === session.mentorId;
    const isHod = user.role === UserRole.HOD;

    if (!isStudent && !isMentor && !isHod) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this session.',
      });
    }

    // Filter notes based on user role
    let visibleNotes = session.notes;
    if (isStudent) {
      // Students only see SHARED_STUDENT notes
      visibleNotes = session.notes.filter(n => n.visibility === 'SHARED_STUDENT');
    } else if (isMentor) {
      // Mentors see PRIVATE_MENTOR and SHARED_STUDENT notes
      visibleNotes = session.notes.filter(n => n.visibility !== 'SHARED_HOD' || n.authorId === user.userId);
    }

    return res.json({
      success: true,
      data: {
        ...session,
        notes: visibleNotes,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSessionStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = updateSessionStatusSchema.parse(req.body);

    const session = await prisma.mentoringSession.findUnique({
      where: { id },
      include: { student: { include: { user: true } }, mentor: true },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Mentor or HOD can update status
    const isMentor = req.user!.role === UserRole.MENTOR && req.user!.mentorProfileId === session.mentorId;
    const isHod = req.user!.role === UserRole.HOD;
    if (!isMentor && !isHod) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update session status.' });
    }

    const updated = await prisma.mentoringSession.update({
      where: { id },
      data: { status: data.status as any },
    });

    // Notify student if completed or cancelled
    if (data.status === 'COMPLETED') {
      await prisma.notification.create({
        data: {
          userId: session.student.userId,
          title: 'Session Marked Completed',
          message: `Your mentoring session "${session.title}" was marked as completed. Please submit your feedback.`,
          type: 'SUCCESS',
          link: '/student/sessions',
        },
      });
    }

    return res.json({
      success: true,
      message: `Session status updated to ${data.status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function addMeetingNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: sessionId } = req.params;
    const data = createMeetingNoteSchema.parse(req.body);

    const session = await prisma.mentoringSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Only mentor of the session or HOD can add notes
    const isMentor = req.user!.role === UserRole.MENTOR && req.user!.mentorProfileId === session.mentorId;
    const isHod = req.user!.role === UserRole.HOD;
    if (!isMentor && !isHod) {
      return res.status(403).json({ success: false, message: 'Unauthorized to add meeting notes to this session.' });
    }

    const note = await prisma.meetingNote.create({
      data: {
        sessionId,
        authorId: req.user!.userId,
        visibility: data.visibility as any,
        content: data.content,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Note added successfully.',
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

export async function addActionItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: sessionId } = req.params;
    const data = createActionItemSchema.parse(req.body);

    const session = await prisma.mentoringSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const actionItem = await prisma.actionItem.create({
      data: {
        sessionId,
        studentId: session.studentId,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status as any,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Action item created successfully.',
      data: actionItem,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateActionItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const actionItem = await prisma.actionItem.findUnique({
      where: { id },
      include: { session: true },
    });

    if (!actionItem) {
      return res.status(404).json({ success: false, message: 'Action item not found.' });
    }

    // Student owner, session mentor, or HOD can update
    const isStudent = req.user!.role === UserRole.STUDENT && req.user!.studentProfileId === actionItem.studentId;
    const isMentor = req.user!.role === UserRole.MENTOR && req.user!.mentorProfileId === actionItem.session.mentorId;
    const isHod = req.user!.role === UserRole.HOD;

    if (!isStudent && !isMentor && !isHod) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    const updated = await prisma.actionItem.update({
      where: { id },
      data: {
        status: status as any,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    return res.json({
      success: true,
      message: `Action item marked as ${status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: sessionId } = req.params;
    const data = createFeedbackSchema.parse({ ...req.body, sessionId });

    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      return res.status(400).json({ success: false, message: 'Only students can submit session feedback.' });
    }

    const session = await prisma.mentoringSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (session.studentId !== studentProfileId) {
      return res.status(403).json({ success: false, message: 'You can only submit feedback for your own sessions.' });
    }

    if (session.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted for completed sessions.' });
    }

    // Check if feedback already submitted
    const existingFeedback = await prisma.feedback.findFirst({
      where: { sessionId, studentId: studentProfileId },
    });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: 'Feedback has already been submitted for this session.' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        sessionId,
        studentId: studentProfileId,
        mentorId: session.mentorId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
}

export async function listAllSessionsOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, mentorId, studentId, startDate, endDate, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (mentorId) where.mentorId = String(mentorId);
    if (studentId) where.studentId = String(studentId);
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(String(startDate));
      if (endDate) where.scheduledAt.lte = new Date(String(endDate));
    }

    const [total, sessions] = await Promise.all([
      prisma.mentoringSession.count({ where }),
      prisma.mentoringSession.findMany({
        where,
        include: {
          student: { select: { fullName: true, usn: true, department: true } },
          mentor: { select: { fullName: true, designation: true, department: true } },
          feedbacks: true,
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        sessions,
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

export async function listMentorSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const mentorProfileId = req.user!.mentorProfileId;
    if (!mentorProfileId) {
      return res.status(400).json({ success: false, message: 'Mentor profile required.' });
    }

    const { status } = req.query;
    const where: any = { mentorId: mentorProfileId };
    if (status) where.status = status;

    const sessions = await prisma.mentoringSession.findMany({
      where,
      include: {
        student: { select: { id: true, fullName: true, usn: true, semester: true } },
        actionItems: true,
        feedbacks: true,
        notes: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
}
