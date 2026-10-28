import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { reviewChangeRequestSchema } from '@mentorconnect/shared';
import { recordAuditLog } from '../../middleware/audit';

export async function listChangeRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const requests = await prisma.mentorChangeRequest.findMany({
      where,
      include: {
        student: {
          include: { department: true },
        },
        currentMentor: {
          include: { department: true },
        },
        requestedMentor: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
}

export async function reviewChangeRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = reviewChangeRequestSchema.parse(req.body);

    const changeRequest = await prisma.mentorChangeRequest.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        currentMentor: true,
        requestedMentor: true,
      },
    });

    if (!changeRequest) {
      return res.status(404).json({ success: false, message: 'Change request not found.' });
    }

    if (changeRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${changeRequest.status.toLowerCase()}.`,
      });
    }

    const newTargetMentorId = data.targetMentorId || changeRequest.requestedMentorId;

    await prisma.$transaction(async (tx) => {
      // 1. Update request status and review notes
      await tx.mentorChangeRequest.update({
        where: { id },
        data: {
          status: data.status,
          reviewedBy: req.user!.fullName,
          reviewNotes: data.reviewNotes,
          reviewedAt: new Date(),
        },
      });

      // 2. If approved and target mentor is provided, execute reassignment
      if (data.status === 'APPROVED' && newTargetMentorId) {
        // Mark existing assignment as REASSIGNED
        await tx.mentorAssignment.updateMany({
          where: { studentId: changeRequest.studentId, status: 'ACTIVE' },
          data: { status: 'REASSIGNED', endedAt: new Date() },
        });

        // Decrement old mentor mentee count
        if (changeRequest.currentMentorId) {
          const oldCount = await tx.mentorAssignment.count({
            where: { mentorId: changeRequest.currentMentorId, status: 'ACTIVE' },
          });
          await tx.mentorProfile.update({
            where: { id: changeRequest.currentMentorId },
            data: { currentMenteeCount: Math.max(0, oldCount) },
          });
        }

        // Create new assignment
        await tx.mentorAssignment.create({
          data: {
            studentId: changeRequest.studentId,
            mentorId: newTargetMentorId,
            status: 'ACTIVE',
            assignedBy: req.user!.fullName,
            notes: `Approved mentor change request: ${data.reviewNotes}`,
          },
        });

        // Increment new mentor mentee count
        const newCount = await tx.mentorAssignment.count({
          where: { mentorId: newTargetMentorId, status: 'ACTIVE' },
        });
        await tx.mentorProfile.update({
          where: { id: newTargetMentorId },
          data: { currentMenteeCount: newCount + 1 },
        });
      }

      // 3. Notify student
      await tx.notification.create({
        data: {
          userId: changeRequest.student.userId,
          title: `Mentor Change Request ${data.status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
          message: `Your mentor change request was ${data.status.toLowerCase()} by the HOD. Notes: "${data.reviewNotes}"`,
          type: data.status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
          link: '/student/mentor',
        },
      });
    });

    await recordAuditLog({
      req,
      action: `MENTOR_CHANGE_${data.status}`,
      entityType: 'MentorChangeRequest',
      entityId: id,
      details: {
        studentId: changeRequest.studentId,
        studentUsn: changeRequest.student.usn,
        status: data.status,
        reviewNotes: data.reviewNotes,
        targetMentorId: newTargetMentorId,
      },
    });

    return res.json({
      success: true,
      message: `Mentor change request ${data.status.toLowerCase()} successfully.`,
    });
  } catch (error) {
    next(error);
  }
}
