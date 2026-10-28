import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { generateCsv } from '../../utils/csvExporter';

export async function getOverviewReport(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalStudents,
      totalMentors,
      totalDepartments,
      activeAssignments,
      totalSessions,
      completedSessions,
      scheduledSessions,
      pendingRequests,
      feedbacks,
      departments,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.mentorProfile.count(),
      prisma.department.count(),
      prisma.mentorAssignment.count({ where: { status: 'ACTIVE' } }),
      prisma.mentoringSession.count(),
      prisma.mentoringSession.count({ where: { status: 'COMPLETED' } }),
      prisma.mentoringSession.count({ where: { status: 'SCHEDULED' } }),
      prisma.mentorChangeRequest.count({ where: { status: 'PENDING' } }),
      prisma.feedback.findMany({ select: { rating: true } }),
      prisma.department.findMany({
        include: {
          _count: {
            select: { students: true, mentors: true },
          },
        },
      }),
    ]);

    const unassignedStudents = Math.max(0, totalStudents - activeAssignments);
    const coveragePercentage = totalStudents > 0 ? Math.round((activeAssignments / totalStudents) * 100) : 0;

    const avgRating =
      feedbacks.length > 0
        ? Number((feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1))
        : 5.0;

    // Mentor workload distribution
    const mentors = await prisma.mentorProfile.findMany({
      select: {
        id: true,
        fullName: true,
        maxCapacity: true,
        currentMenteeCount: true,
      },
    });

    const workloadChart = mentors.map(m => ({
      name: m.fullName.replace(/^(Dr\.|Prof\.)\s*/, ''),
      activeMentees: m.currentMenteeCount,
      capacity: m.maxCapacity,
      utilization: Math.round((m.currentMenteeCount / m.maxCapacity) * 100),
    }));

    // Department breakdown
    const departmentDistribution = departments.map(d => ({
      name: d.code,
      fullName: d.name,
      students: d._count.students,
      mentors: d._count.mentors,
    }));

    return res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalMentors,
          totalDepartments,
          activeAssignments,
          unassignedStudents,
          coveragePercentage,
          totalSessions,
          completedSessions,
          scheduledSessions,
          pendingRequests,
          averageFeedbackRating: avgRating,
        },
        workloadChart,
        departmentDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function exportAssignmentsCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const assignments = await prisma.mentorAssignment.findMany({
      include: {
        student: { include: { department: true } },
        mentor: { include: { department: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });

    const headers = [
      'Assignment ID',
      'Student Name',
      'USN',
      'Department',
      'Semester',
      'Mentor Name',
      'Faculty ID',
      'Mentor Department',
      'Status',
      'Assigned At',
      'Notes',
    ];

    const rows = assignments.map(a => [
      a.id,
      a.student.fullName,
      a.student.usn,
      a.student.department.code,
      a.student.semester,
      a.mentor.fullName,
      a.mentor.facultyId,
      a.mentor.department.code,
      a.status,
      a.assignedAt.toISOString().split('T')[0],
      a.notes || '',
    ]);

    const csvContent = generateCsv(headers, rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="mentor_assignments.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

export async function exportSessionsCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const sessions = await prisma.mentoringSession.findMany({
      include: {
        student: true,
        mentor: true,
        feedbacks: true,
        _count: { select: { actionItems: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    const headers = [
      'Session ID',
      'Title',
      'Student USN',
      'Student Name',
      'Mentor Name',
      'Scheduled Date',
      'Duration (Mins)',
      'Meeting Type',
      'Status',
      'Action Items Count',
      'Feedback Rating',
    ];

    const rows = sessions.map(s => [
      s.id,
      s.title,
      s.student.usn,
      s.student.fullName,
      s.mentor.fullName,
      s.scheduledAt.toISOString().replace('T', ' ').substring(0, 16),
      s.durationMinutes,
      s.meetingType,
      s.status,
      s._count.actionItems,
      s.feedbacks.length > 0 ? s.feedbacks[0].rating : 'N/A',
    ]);

    const csvContent = generateCsv(headers, rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="mentoring_sessions.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

export async function exportMentorsCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const mentors = await prisma.mentorProfile.findMany({
      include: {
        department: true,
        user: { select: { email: true } },
      },
      orderBy: { fullName: 'asc' },
    });

    const headers = [
      'Faculty ID',
      'Full Name',
      'Department',
      'Designation',
      'Email',
      'Phone',
      'Max Capacity',
      'Active Mentees',
      'Available Slots',
      'Utilization %',
    ];

    const rows = mentors.map(m => {
      const available = Math.max(0, m.maxCapacity - m.currentMenteeCount);
      const util = Math.round((m.currentMenteeCount / m.maxCapacity) * 100);
      return [
        m.facultyId,
        m.fullName,
        m.department.name,
        m.designation,
        m.user.email,
        m.phone || 'N/A',
        m.maxCapacity,
        m.currentMenteeCount,
        available,
        `${util}%`,
      ];
    });

    const csvContent = generateCsv(headers, rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="faculty_mentor_workloads.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}
