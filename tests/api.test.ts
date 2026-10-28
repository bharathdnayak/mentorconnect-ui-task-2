import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../apps/api/src/app';

const app = createApp();

let studentToken = '';
let mentorToken = '';
let hodToken = '';
let studentProfileId = '';
let mentorProfileId = '';
let unassignedStudentId = '';
let fullMentorId = '';

describe('MentorConnect Backend API & Security Suite', () => {
  beforeAll(async () => {
    // 1. Authenticate as Student
    const studentRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bharath.is@college.edu', password: 'Password123!' });
    expect(studentRes.status).toBe(200);
    studentToken = studentRes.body.data.accessToken;
    studentProfileId = studentRes.body.data.user.studentProfileId;

    // 2. Authenticate as Mentor
    const mentorRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'dr.sharma@college.edu', password: 'Password123!' });
    expect(mentorRes.status).toBe(200);
    mentorToken = mentorRes.body.data.accessToken;
    mentorProfileId = mentorRes.body.data.user.mentorProfileId;

    // 3. Authenticate as HOD
    const hodRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'hod.ise@college.edu', password: 'Password123!' });
    expect(hodRes.status).toBe(200);
    hodToken = hodRes.body.data.accessToken;
  });

  // ==========================================
  // 1. AUTHENTICATION & SECURITY
  // ==========================================
  describe('Authentication & Security', () => {
    it('rejects invalid login credentials with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'bharath.is@college.edu', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects access to protected routes without a token with 401', async () => {
      const res = await request(app).get('/api/v1/students/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('prevents students from accessing HOD-only administrative endpoints (403)', async () => {
      const res = await request(app)
        .get('/api/v1/assignments')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('prevents students from viewing audit logs (403)', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('allows valid token refresh', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'priya.is@college.edu', password: 'Password123!' });

      const refreshToken = loginRes.body.data.refreshToken;
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.accessToken).toBeDefined();
    });
  });

  // ==========================================
  // 2. STUDENT PROFILES & MENTOR ASSIGNMENT
  // ==========================================
  describe('Student Profiles & Operations', () => {
    it('retrieves student profile and updates permitted fields', async () => {
      const getRes = await request(app)
        .get('/api/v1/students/profile')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.usn).toBe('NNM23IS033');

      const updateRes = await request(app)
        .put('/api/v1/students/profile')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          hobbies: 'Open Source, Distributed Systems, Cloud Architecture',
          technicalSkills: ['TypeScript', 'React', 'Go', 'Docker', 'PostgreSQL'],
          careerGoals: ['Cloud Architect', 'Staff Engineer'],
          guidanceNeeds: ['System Design', 'Scalability'],
          preferredTopics: ['Microservices', 'Database Internals'],
          bio: 'Passionate student engineer dedicated to building resilient distributed systems.',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.profileCompleted).toBe(true);
    });

    it('retrieves active assigned mentor details for student', async () => {
      const res = await request(app)
        .get('/api/v1/students/my-mentor')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.mentor.fullName).toBe('Dr. Ramesh Sharma');
    });

    it('retrieves explainable mentor recommendations for student', async () => {
      const res = await request(app)
        .get('/api/v1/students/recommendations')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].score).toBeGreaterThan(0);
      expect(res.body.data[0].explanation.summary).toBeDefined();
    });
  });

  // ==========================================
  // 3. MENTOR WORKFLOWS & ACCESS CONTROL
  // ==========================================
  describe('Mentor Operations & Boundaries', () => {
    it('lists assigned mentees for faculty mentor', async () => {
      const res = await request(app)
        .get('/api/v1/mentors/mentees')
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const student = res.body.data.find((m: any) => m.student.fullName === 'Bharath D. Nayak');
      expect(student).toBeDefined();
    });

    it('prevents mentor from accessing mentees not assigned to them (403)', async () => {
      // Priya Hegde is assigned to Prof. Anita Rao, NOT Dr. Ramesh Sharma
      const studentsList = await request(app)
        .get('/api/v1/users/students')
        .set('Authorization', `Bearer ${hodToken}`);
      
      const priya = studentsList.body.data.students.find((s: any) => s.fullName === 'Priya Hegde');
      expect(priya).toBeDefined();

      const res = await request(app)
        .get(`/api/v1/mentors/mentees/${priya.id}`)
        .set('Authorization', `Bearer ${mentorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 4. HOD ADMINISTRATION & CAPACITY ENFORCEMENT
  // ==========================================
  describe('HOD Administration & Capacity Rules', () => {
    it('lists unassigned students', async () => {
      const res = await request(app)
        .get('/api/v1/assignments/unassigned-students')
        .set('Authorization', `Bearer ${hodToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const kavya = res.body.data.find((s: any) => s.usn === '4NM24AI025');
      expect(kavya).toBeDefined();
      unassignedStudentId = kavya.id;
    });

    it('prevents duplicate active assignment for already assigned student', async () => {
      const res = await request(app)
        .post('/api/v1/assignments')
        .set('Authorization', `Bearer ${hodToken}`)
        .send({
          studentId: studentProfileId,
          mentorId: mentorProfileId,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already has an active mentor');
    });

    it('generates report overview and exports CSV files', async () => {
      const overviewRes = await request(app)
        .get('/api/v1/reports/overview')
        .set('Authorization', `Bearer ${hodToken}`);

      expect(overviewRes.status).toBe(200);
      expect(overviewRes.body.data.summary.totalStudents).toBeGreaterThan(0);
      expect(overviewRes.body.data.summary.totalMentors).toBeGreaterThan(0);

      const csvRes = await request(app)
        .get('/api/v1/reports/export-assignments-csv')
        .set('Authorization', `Bearer ${hodToken}`);

      expect(csvRes.status).toBe(200);
      expect(csvRes.header['content-type']).toContain('text/csv');
      expect(csvRes.text).toContain('Student Name');
      expect(csvRes.text).toContain('Bharath D. Nayak');
    });
  });

  // ==========================================
  // 5. MENTORING SESSIONS & VISIBILITY
  // ==========================================
  describe('Mentoring Sessions & Note Visibility', () => {
    let createdSessionId = '';

    it('allows mentor to schedule a mentoring session', async () => {
      const res = await request(app)
        .post('/api/v1/sessions')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          title: 'Automated Test Session Review',
          studentId: studentProfileId,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 45,
          meetingType: 'IN_PERSON',
          location: 'Lab 401',
          agenda: 'Review automated tests and architectural constraints',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Automated Test Session Review');
      createdSessionId = res.body.data.id;
    });

    it('enforces note visibility: student cannot view private mentor notes', async () => {
      // 1. Mentor adds a private note
      await request(app)
        .post(`/api/v1/sessions/${createdSessionId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          content: 'CONFIDENTIAL: Student shows exceptional analytical thinking.',
          visibility: 'PRIVATE_MENTOR',
        });

      // 2. Mentor adds a shared note
      await request(app)
        .post(`/api/v1/sessions/${createdSessionId}/notes`)
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({
          content: 'SHARED: Great progress on Vitest automated test suite.',
          visibility: 'SHARED_STUDENT',
        });

      // 3. Student fetches session
      const studentFetch = await request(app)
        .get(`/api/v1/sessions/${createdSessionId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(studentFetch.status).toBe(200);
      const notes = studentFetch.body.data.notes;
      expect(notes.length).toBe(1);
      expect(notes[0].content).toContain('SHARED: Great progress');
      expect(JSON.stringify(notes)).not.toContain('CONFIDENTIAL');
    });
  });

  // ==========================================
  // 6. DEPLOYMENT & HEALTH CHECKS
  // ==========================================
  describe('Deployment & Health Verification', () => {
    it('responds to /health probe for Render container monitoring', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('MentorConnect API');
    });

    it('responds to versioned /api/v1/health probe', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });

    it('handles unknown routes with a clean 404 JSON response', async () => {
      const res = await request(app).get('/api/v1/non-existent-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Endpoint not found');
    });

    it('allows CORS from Netlify frontend domain and localhost', async () => {
      const res = await request(app)
        .options('/api/v1/health')
        .set('Origin', 'https://mentorconnect-ui.netlify.app')
        .set('Access-Control-Request-Method', 'GET');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('https://mentorconnect-ui.netlify.app');
    });
  });
});
