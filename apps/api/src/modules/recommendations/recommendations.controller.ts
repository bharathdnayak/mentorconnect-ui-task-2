import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { rankMentorRecommendations, UserRole } from '@mentorconnect/shared';
import { recordAuditLog } from '../../middleware/audit';

export async function getRecommendationsForStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId } = req.params;

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { department: true },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const mentors = await prisma.mentorProfile.findMany({
      include: { department: true },
    });

    // Update real-time mentee counts
    const mentorMatchProfiles = await Promise.all(
      mentors.map(async (m) => {
        const currentCount = await prisma.mentorAssignment.count({
          where: { mentorId: m.id, status: 'ACTIVE' },
        });
        return {
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
          currentMenteeCount: currentCount,
        };
      })
    );

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
      mentorMatchProfiles
    );

    return res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          fullName: student.fullName,
          usn: student.usn,
          department: student.department.name,
          semester: student.semester,
          careerGoals: student.careerGoals,
          technicalSkills: student.technicalSkills,
          guidanceNeeds: student.guidanceNeeds,
        },
        recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listStoredRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const { status = 'PENDING' } = req.query;

    const recommendations = await prisma.mentorRecommendation.findMany({
      where: { status: status as any },
      include: {
        student: {
          include: { department: true },
        },
        mentor: {
          include: { department: true },
        },
      },
      orderBy: { matchScore: 'desc' },
    });

    return res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
}

export async function acceptRecommendation(req: Request, res: Response, next: NextFunction) {
  try {
    const { recommendationId, overrideCapacity = false } = req.body;

    const rec = await prisma.mentorRecommendation.findUnique({
      where: { id: recommendationId },
      include: {
        student: true,
        mentor: true,
      },
    });

    if (!rec) {
      return res.status(404).json({ success: false, message: 'Recommendation record not found.' });
    }

    if (rec.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This recommendation has already been ${rec.status.toLowerCase()}.`,
      });
    }

    // Check mentor capacity
    const currentActiveCount = await prisma.mentorAssignment.count({
      where: { mentorId: rec.mentorId, status: 'ACTIVE' },
    });

    if (currentActiveCount >= rec.mentor.maxCapacity && !overrideCapacity) {
      return res.status(400).json({
        success: false,
        message: `Mentor ${rec.mentor.fullName} is at capacity (${currentActiveCount}/${rec.mentor.maxCapacity}). Override required.`,
        canOverride: true,
      });
    }

    // Execute in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mark recommendation as ACCEPTED
      await tx.mentorRecommendation.update({
        where: { id: rec.id },
        data: { status: 'ACCEPTED', reviewedAt: new Date() },
      });

      // 2. Deactivate any prior active assignment
      await tx.mentorAssignment.updateMany({
        where: { studentId: rec.studentId, status: 'ACTIVE' },
        data: { status: 'REASSIGNED', endedAt: new Date() },
      });

      // 3. Create new assignment
      await tx.mentorAssignment.create({
        data: {
          studentId: rec.studentId,
          mentorId: rec.mentorId,
          status: 'ACTIVE',
          assignedBy: req.user!.fullName,
          notes: `Assigned via accepted recommendation (Match score: ${rec.matchScore}%)`,
        },
      });

      // 4. Update mentor mentee count
      await tx.mentorProfile.update({
        where: { id: rec.mentorId },
        data: { currentMenteeCount: currentActiveCount + 1 },
      });
    });

    await recordAuditLog({
      req,
      action: 'RECOMMENDATION_ACCEPTED',
      entityType: 'MentorRecommendation',
      entityId: rec.id,
      details: {
        studentId: rec.studentId,
        studentName: rec.student.fullName,
        mentorId: rec.mentorId,
        mentorName: rec.mentor.fullName,
        matchScore: rec.matchScore,
      },
    });

    return res.json({
      success: true,
      message: `Recommendation accepted! ${rec.student.fullName} assigned to ${rec.mentor.fullName}.`,
    });
  } catch (error) {
    next(error);
  }
}
