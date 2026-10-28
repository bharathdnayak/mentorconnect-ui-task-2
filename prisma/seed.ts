import { PrismaClient, Role, MeetingStatus, MeetingType, NoteVisibility, ActionItemStatus, AssignmentStatus, RecommendationStatus, Priority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // Clean existing tables in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.meetingNote.deleteMany();
  await prisma.mentoringSession.deleteMany();
  await prisma.mentorChangeRequest.deleteMany();
  await prisma.mentorRecommendation.deleteMany();
  await prisma.mentorAssignment.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.mentorProfile.deleteMany();
  await prisma.academicTerm.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  console.log('[Seed] Cleaned existing records.');

  // Default password hash for all seed accounts
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Departments
  const deptCse = await prisma.department.create({
    data: {
      code: 'CSE',
      name: 'Computer Science & Engineering',
      description: 'Department of Computer Science & Engineering',
      active: true,
    },
  });

  const deptAiml = await prisma.department.create({
    data: {
      code: 'AIML',
      name: 'Artificial Intelligence & Machine Learning',
      description: 'Department of AI & Data Science',
      active: true,
    },
  });

  const deptIse = await prisma.department.create({
    data: {
      code: 'ISE',
      name: 'Information Science & Engineering',
      description: 'Department of Information Science & Systems',
      active: true,
    },
  });

  // 2. Academic Term
  const currentTerm = await prisma.academicTerm.create({
    data: {
      name: 'Fall 2026 - Academic Cycle',
      year: '2026-2027',
      semester: 'Odd Semester (3rd, 5th, 7th)',
      isCurrent: true,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  // 3. System Settings
  await prisma.systemSetting.createMany({
    data: [
      { key: 'INSTITUTION_NAME', value: 'Nitte Mahalinga Adyanthaya Memorial Institute of Technology', description: 'College Name' },
      { key: 'DEFAULT_MENTOR_CAPACITY', value: '10', description: 'Default mentee capacity per faculty member' },
      { key: 'ALLOW_STUDENT_CHANGE_REQUESTS', value: 'true', description: 'Enable or disable mentor change request submission' },
    ],
  });

  // 4. HOD Administrator User
  const hodUser = await prisma.user.create({
    data: {
      email: 'hod.cse@college.edu',
      passwordHash,
      role: Role.HOD,
      isActive: true,
    },
  });

  // 5. Faculty Mentors
  const mentor1User = await prisma.user.create({
    data: {
      email: 'dr.sharma@college.edu',
      passwordHash,
      role: Role.MENTOR,
      isActive: true,
    },
  });

  const mentor1Profile = await prisma.mentorProfile.create({
    data: {
      userId: mentor1User.id,
      facultyId: 'FAC-CSE-001',
      fullName: 'Dr. Ramesh Sharma',
      designation: 'Professor & Senior Research Lead',
      phone: '+91 98765 43210',
      departmentId: deptCse.id,
      expertise: ['Cloud Computing', 'Distributed Systems', 'Software Architecture', 'DevOps'],
      technicalSkills: ['Kubernetes', 'Docker', 'Go', 'AWS', 'System Design'],
      researchInterests: ['High-Performance Computing', 'Microservices Reliability'],
      mentoringInterests: ['Career Coaching', 'Higher Studies Guidance', 'Open Source Projects'],
      bio: 'Over 18 years of academic and research experience. Passionate about guiding students towards scalable cloud architectures and engineering excellence.',
      maxCapacity: 8,
      currentMenteeCount: 2,
    },
  });

  const mentor2User = await prisma.user.create({
    data: {
      email: 'prof.anita@college.edu',
      passwordHash,
      role: Role.MENTOR,
      isActive: true,
    },
  });

  const mentor2Profile = await prisma.mentorProfile.create({
    data: {
      userId: mentor2User.id,
      facultyId: 'FAC-CSE-002',
      fullName: 'Prof. Anita Rao',
      designation: 'Associate Professor',
      phone: '+91 98765 43211',
      departmentId: deptCse.id,
      expertise: ['Full-Stack Web Development', 'Database Systems', 'Mobile App Development'],
      technicalSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
      researchInterests: ['Human-Computer Interaction', 'Modern Web Architectures'],
      mentoringInterests: ['Industry Readiness', 'Portfolio Building', 'Hackathons'],
      bio: 'Passionate about mentoring undergraduates in building production-ready applications, modern UI/UX design, and securing internships.',
      maxCapacity: 10,
      currentMenteeCount: 1,
    },
  });

  const mentor3User = await prisma.user.create({
    data: {
      email: 'dr.vikram@college.edu',
      passwordHash,
      role: Role.MENTOR,
      isActive: true,
    },
  });

  const mentor3Profile = await prisma.mentorProfile.create({
    data: {
      userId: mentor3User.id,
      facultyId: 'FAC-AIML-003',
      fullName: 'Dr. Vikram Patel',
      designation: 'Associate Professor & AI Lab Incharge',
      phone: '+91 98765 43212',
      departmentId: deptAiml.id,
      expertise: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Generative AI'],
      technicalSkills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'OpenCV'],
      researchInterests: ['Explainable AI', 'Multimodal Foundation Models'],
      mentoringInterests: ['Research Paper Publication', 'AI Product Building'],
      bio: 'Published over 30 international peer-reviewed papers. Actively guides students participating in global research and Kaggle challenges.',
      maxCapacity: 6,
      currentMenteeCount: 0,
    },
  });

  // 6. Students
  // Student 1: Assigned to Dr. Sharma
  const student1User = await prisma.user.create({
    data: {
      email: 'bharath.cs@college.edu',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
    },
  });

  const student1Profile = await prisma.studentProfile.create({
    data: {
      userId: student1User.id,
      usn: '4NM23CS042',
      fullName: 'Bharath D. Nayak',
      phone: '+91 91234 56789',
      degree: 'B.E. Computer Science & Engineering',
      semester: 7,
      section: 'A',
      academicYear: '2026-2027',
      departmentId: deptCse.id,
      hobbies: 'Competitive Programming, Open Source Contributing, Technical Blogging',
      technicalSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
      careerGoals: ['Full-Stack Software Engineer', 'Cloud Systems Architect'],
      guidanceNeeds: ['System Design Preparation', 'Final Year Project Guidance', 'Higher Studies'],
      preferredTopics: ['Distributed Systems', 'Cloud Native Development', 'Resume & Interview Prep'],
      bio: 'Final year CSE undergraduate passionate about building scalable, responsive web applications and full-stack software architectures.',
      profileCompleted: true,
    },
  });

  // Student 2: Assigned to Prof. Anita Rao
  const student2User = await prisma.user.create({
    data: {
      email: 'priya.cs@college.edu',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
    },
  });

  const student2Profile = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      usn: '4NM23CS098',
      fullName: 'Priya Hegde',
      phone: '+91 92345 67890',
      degree: 'B.E. Computer Science & Engineering',
      semester: 5,
      section: 'B',
      academicYear: '2026-2027',
      departmentId: deptCse.id,
      hobbies: 'UI/UX Design, Chess, Volunteering',
      technicalSkills: ['Figma', 'React', 'CSS', 'JavaScript'],
      careerGoals: ['Frontend Engineer', 'Product Designer'],
      guidanceNeeds: ['Frontend Architecture', 'Portfolio Projects', 'Internship Search'],
      preferredTopics: ['UI Component Libraries', 'Web Accessibility', 'Interview Case Studies'],
      bio: 'Enthusiastic web developer and designer seeking to master modern frontend workflows.',
      profileCompleted: true,
    },
  });

  // Student 3: Assigned to Dr. Sharma
  const student3User = await prisma.user.create({
    data: {
      email: 'aditya.cs@college.edu',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
    },
  });

  const student3Profile = await prisma.studentProfile.create({
    data: {
      userId: student3User.id,
      usn: '4NM23CS015',
      fullName: 'Aditya Shenoy',
      phone: '+91 93456 78901',
      degree: 'B.E. Computer Science & Engineering',
      semester: 7,
      section: 'A',
      academicYear: '2026-2027',
      departmentId: deptCse.id,
      hobbies: 'Robotics, IoT Hardware, Gaming',
      technicalSkills: ['Go', 'Docker', 'Linux', 'C++'],
      careerGoals: ['DevOps Engineer', 'Site Reliability Engineer'],
      guidanceNeeds: ['Cloud Certification', 'Kubernetes Orchestration'],
      preferredTopics: ['Infrastructure as Code', 'Observability', 'CI/CD Pipelines'],
      bio: 'Focused on platform engineering and system reliability.',
      profileCompleted: true,
    },
  });

  // Student 4: Unassigned student looking for mentor
  const student4User = await prisma.user.create({
    data: {
      email: 'kavya.ai@college.edu',
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
    },
  });

  const student4Profile = await prisma.studentProfile.create({
    data: {
      userId: student4User.id,
      usn: '4NM24AI025',
      fullName: 'Kavya Acharya',
      phone: '+91 94567 89012',
      degree: 'B.E. AI & Machine Learning',
      semester: 3,
      section: 'A',
      academicYear: '2026-2027',
      departmentId: deptAiml.id,
      hobbies: 'Data Visualization, Reading Sci-Fi, Cycling',
      technicalSkills: ['Python', 'Pandas', 'NumPy', 'Scikit-Learn'],
      careerGoals: ['Machine Learning Engineer', 'Data Scientist'],
      guidanceNeeds: ['Deep Learning Roadmap', 'Research Project Selection'],
      preferredTopics: ['Computer Vision', 'Generative Models', 'Competitive Data Science'],
      bio: 'Passionate about data science and building intelligent machine learning models.',
      profileCompleted: true,
    },
  });

  // 7. Active Mentor Assignments
  await prisma.mentorAssignment.create({
    data: {
      studentId: student1Profile.id,
      mentorId: mentor1Profile.id,
      academicTermId: currentTerm.id,
      status: AssignmentStatus.ACTIVE,
      assignedBy: 'HOD CSE',
      notes: 'Assigned based on shared interest in distributed systems and cloud architecture.',
    },
  });

  await prisma.mentorAssignment.create({
    data: {
      studentId: student2Profile.id,
      mentorId: mentor2Profile.id,
      academicTermId: currentTerm.id,
      status: AssignmentStatus.ACTIVE,
      assignedBy: 'HOD CSE',
      notes: 'Assigned for frontend, UI/UX, and web development guidance.',
    },
  });

  await prisma.mentorAssignment.create({
    data: {
      studentId: student3Profile.id,
      mentorId: mentor1Profile.id,
      academicTermId: currentTerm.id,
      status: AssignmentStatus.ACTIVE,
      assignedBy: 'HOD CSE',
      notes: 'Assigned for cloud and infrastructure mentoring.',
    },
  });

  // 8. Sample Recommendations
  await prisma.mentorRecommendation.create({
    data: {
      studentId: student4Profile.id,
      mentorId: mentor3Profile.id,
      matchScore: 92,
      matchExplanation: 'Same department (AIML) • Aligned domain expertise in Machine Learning, Deep Learning • Shared focus in Python, Generative Models • 6 open mentee slots',
      criteriaBreakdown: {
        departmentMatch: true,
        departmentScore: 25,
        expertiseScore: 35,
        matchedExpertise: ['Machine Learning', 'Generative AI'],
        skillsScore: 14,
        matchedSkills: ['Python'],
        capacityScore: 20,
        totalScore: 92,
      },
      recommendedBy: 'SYSTEM_ALGORITHM',
      status: RecommendationStatus.PENDING,
    },
  });

  // 9. Mentoring Sessions & Meeting Notes & Action Items
  // Session 1: Completed Session
  const session1 = await prisma.mentoringSession.create({
    data: {
      title: '7th Semester Project Inception & Architecture Review',
      studentId: student1Profile.id,
      mentorId: mentor1Profile.id,
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      durationMinutes: 45,
      meetingType: MeetingType.IN_PERSON,
      location: 'Faculty Cabin #304, CSE Block',
      agenda: 'Review final year project topic, microservice architecture design, and database schema.',
      status: MeetingStatus.COMPLETED,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.meetingNote.create({
    data: {
      sessionId: session1.id,
      authorId: mentor1User.id,
      visibility: NoteVisibility.SHARED_STUDENT,
      content: 'Bharath demonstrated solid initiative in designing the database schema. Advised to enforce foreign key constraints, indexes on USN and foreign keys, and write automated tests for multi-role access control.',
    },
  });

  await prisma.meetingNote.create({
    data: {
      sessionId: session1.id,
      authorId: mentor1User.id,
      visibility: NoteVisibility.PRIVATE_MENTOR,
      content: 'Mentee is self-driven. Strong candidate for college technical excellence award. Follow up on his campus placement interviews.',
    },
  });

  await prisma.actionItem.create({
    data: {
      sessionId: session1.id,
      studentId: student1Profile.id,
      description: 'Refine Prisma schema with PostgreSQL indexes and create comprehensive seed dataset.',
      status: ActionItemStatus.COMPLETED,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.actionItem.create({
    data: {
      sessionId: session1.id,
      studentId: student1Profile.id,
      description: 'Prepare API documentation and Swagger / Postman export for review.',
      status: ActionItemStatus.IN_PROGRESS,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Session 2: Upcoming Scheduled Session
  await prisma.mentoringSession.create({
    data: {
      title: 'Mid-Term Progress & Technical Evaluation',
      studentId: student1Profile.id,
      mentorId: mentor1Profile.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
      durationMinutes: 30,
      meetingType: MeetingType.HYBRID,
      location: 'Faculty Cabin #304 / Google Meet',
      meetingLink: 'https://meet.google.com/xyz-mentor-cse',
      agenda: 'Check completed action items, evaluate frontend-backend integration, and verify role-based test coverage.',
      status: MeetingStatus.SCHEDULED,
    },
  });

  // Session 3: Priya with Prof. Anita
  const session3 = await prisma.mentoringSession.create({
    data: {
      title: 'Frontend Portfolio & Responsive Design Review',
      studentId: student2Profile.id,
      mentorId: mentor2Profile.id,
      scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      durationMinutes: 40,
      meetingType: MeetingType.IN_PERSON,
      location: 'UI/UX Design Studio, Lab 2',
      agenda: 'Discuss Tailwind layout, mobile drawer navigation, and accessible forms.',
      status: MeetingStatus.COMPLETED,
    },
  });

  await prisma.feedback.create({
    data: {
      sessionId: session3.id,
      studentId: student2Profile.id,
      mentorId: mentor2Profile.id,
      rating: 5,
      comment: 'Prof. Anita gave invaluable feedback on optimizing my responsive layouts and keyboard accessibility.',
    },
  });

  // 10. Announcements
  await prisma.announcement.create({
    data: {
      title: 'Mandatory Monthly Mentoring Review Cycle (Fall 2026)',
      content: 'All faculty mentors and students are requested to conduct and record at least one official mentoring session before the 15th of next month. Ensure all action items and meeting outcomes are updated in the system.',
      targetRole: 'ALL',
      priority: Priority.IMPORTANT,
      authorId: hodUser.id,
      departmentId: deptCse.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Campus Placement Prep & Mock Technical Interviews',
      content: 'Special mentoring clinics will be held this Saturday for 7th-semester students focusing on System Design, Data Structures, and behavioral interviews. Reach out to your respective mentors to register.',
      targetRole: 'STUDENT',
      priority: Priority.URGENT,
      authorId: hodUser.id,
      departmentId: deptCse.id,
    },
  });

  // 11. Initial Notifications
  await prisma.notification.create({
    data: {
      userId: student1User.id,
      title: 'Upcoming Mentoring Session Scheduled',
      message: 'Dr. Ramesh Sharma scheduled "Mid-Term Progress & Technical Evaluation" for in 3 days.',
      type: 'INFO',
      link: '/student/sessions',
    },
  });

  await prisma.notification.create({
    data: {
      userId: mentor1User.id,
      title: 'Action Item Completed by Bharath D. Nayak',
      message: 'Mentee completed action item: "Refine Prisma schema with PostgreSQL indexes".',
      type: 'SUCCESS',
      link: '/mentor/mentees',
    },
  });

  // 12. Audit Logs
  await prisma.auditLog.create({
    data: {
      actorId: hodUser.id,
      actorRole: 'HOD',
      action: 'SYSTEM_INITIALIZED',
      entityType: 'SystemSetting',
      details: {
        message: 'Initial institution parameters configured for Fall 2026 academic year.',
      },
      ipAddress: '127.0.0.1',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: hodUser.id,
      actorRole: 'HOD',
      action: 'MENTOR_ASSIGNED',
      entityType: 'MentorAssignment',
      details: {
        studentUsn: '4NM23CS042',
        studentName: 'Bharath D. Nayak',
        facultyId: 'FAC-CSE-001',
        mentorName: 'Dr. Ramesh Sharma',
      },
      ipAddress: '127.0.0.1',
    },
  });

  console.log('[Seed] Database successfully seeded with realistic sample data!');
  console.log('------------------------------------------------------------');
  console.log('Development Credentials for Testing:');
  console.log('1. HOD Admin:      hod.cse@college.edu        / Password123!');
  console.log('2. Mentor 1:       dr.sharma@college.edu      / Password123!');
  console.log('3. Mentor 2:       prof.anita@college.edu     / Password123!');
  console.log('4. Mentor 3:       dr.vikram@college.edu      / Password123!');
  console.log('5. Student 1:      bharath.cs@college.edu     / Password123!');
  console.log('6. Student 2:      priya.cs@college.edu       / Password123!');
  console.log('7. Student (Unass):kavya.ai@college.edu       / Password123!');
  console.log('------------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
