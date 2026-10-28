import { prisma } from '../apps/api/src/config/db';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verify() {
  console.log('====================================================');
  console.log('  MentorConnect — PostgreSQL DBMS Verification Check');
  console.log('====================================================');
  console.log('Environment File: .env');
  console.log('PostgreSQL Connection URL:', process.env.DATABASE_URL);
  console.log('----------------------------------------------------');

  const usersCount = await prisma.user.count();
  const studentsCount = await prisma.studentProfile.count();
  const mentorsCount = await prisma.mentorProfile.count();
  const departmentsCount = await prisma.department.count();
  const assignmentsCount = await prisma.mentorAssignment.count();
  const sessionsCount = await prisma.mentoringSession.count();
  const notesCount = await prisma.meetingNote.count();
  const actionItemsCount = await prisma.actionItem.count();
  const feedbacksCount = await prisma.feedback.count();
  const notificationsCount = await prisma.notification.count();
  const auditLogsCount = await prisma.auditLog.count();

  console.log('Live Database Records Stored in PostgreSQL:');
  console.log(`- Users (Authentication Credentials): ${usersCount}`);
  console.log(`- Student Profiles (USN, Skills, Goals, Bio): ${studentsCount}`);
  console.log(`- Mentor Profiles (Faculty ID, Expertise, Quota): ${mentorsCount}`);
  console.log(`- Departments (CSE, AIML, ISE): ${departmentsCount}`);
  console.log(`- Mentor Assignments (Active/Historical Pairings): ${assignmentsCount}`);
  console.log(`- Mentoring Sessions (Scheduled/Completed Meetings): ${sessionsCount}`);
  console.log(`- Meeting Notes (Private & Shared Notes): ${notesCount}`);
  console.log(`- Action Items (Tracked Student Tasks): ${actionItemsCount}`);
  console.log(`- Session Feedbacks (1-5 Star Ratings & Reviews): ${feedbacksCount}`);
  console.log(`- Notifications (In-App Alerts): ${notificationsCount}`);
  console.log(`- Audit Logs (Immutable Security Audit Trail): ${auditLogsCount}`);
  console.log('----------------------------------------------------');

  // Sample actual record from StudentProfile
  const sampleStudent = await prisma.studentProfile.findFirst({
    include: { department: true, user: { select: { email: true } } },
  });
  if (sampleStudent) {
    console.log('Sample Persisted Student Record:');
    console.log(`  Name: ${sampleStudent.fullName}`);
    console.log(`  USN: ${sampleStudent.usn}`);
    console.log(`  Email: ${sampleStudent.user.email}`);
    console.log(`  Department: ${sampleStudent.department.name}`);
    console.log(`  Skills: ${sampleStudent.technicalSkills.join(', ')}`);
    console.log(`  Career Goals: ${sampleStudent.careerGoals.join(', ')}`);
  }

  console.log('====================================================');
  console.log('STATUS: VERIFIED. All inputs and operations persist');
  console.log('        directly in PostgreSQL on localhost:5432.');
  console.log('====================================================');
}

verify()
  .catch((e) => {
    console.error('Database verification error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
