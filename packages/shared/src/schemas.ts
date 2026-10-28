import { z } from 'zod';
import {
  UserRole,
  MeetingStatus,
  MeetingType,
  NoteVisibility,
  ActionItemStatus,
  AnnouncementPriority,
} from './types';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const studentRegisterSchema = z.object({
  email: z.string().email('Please enter a valid college email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  usn: z.string().min(3, 'Valid Student ID / USN is required'),
  departmentId: z.string().min(1, 'Department is required'),
  semester: z.number().int().min(1).max(8).default(1),
  degree: z.string().default('B.E. Computer Science'),
  section: z.string().optional(),
  academicYear: z.string().default('2026-2027'),
});

export const studentProfileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').optional(),
  phone: z.string().optional().nullable(),
  degree: z.string().optional(),
  semester: z.number().int().min(1).max(8).optional(),
  section: z.string().optional().nullable(),
  academicYear: z.string().optional(),
  hobbies: z.string().optional().nullable(),
  technicalSkills: z.array(z.string()).default([]),
  careerGoals: z.array(z.string()).default([]),
  guidanceNeeds: z.array(z.string()).default([]),
  preferredTopics: z.array(z.string()).default([]),
  bio: z.string().max(1000).optional().nullable(),
});

export const mentorProfileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').optional(),
  phone: z.string().optional().nullable(),
  designation: z.string().min(2, 'Designation is required').optional(),
  expertise: z.array(z.string()).default([]),
  technicalSkills: z.array(z.string()).default([]),
  researchInterests: z.array(z.string()).default([]),
  mentoringInterests: z.array(z.string()).default([]),
  bio: z.string().max(2000).optional().nullable(),
  maxCapacity: z.number().int().min(1).max(50).optional(),
});

export const createAssignmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  mentorId: z.string().min(1, 'Mentor ID is required'),
  academicTermId: z.string().optional(),
  notes: z.string().optional(),
  overrideCapacity: z.boolean().default(false),
});

export const reassignMentorSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  newMentorId: z.string().min(1, 'New mentor ID is required'),
  reason: z.string().min(3, 'Reason for reassignment is required'),
  overrideCapacity: z.boolean().default(false),
});

export const createChangeRequestSchema = z.object({
  requestedMentorId: z.string().optional().nullable(),
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
});

export const reviewChangeRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  targetMentorId: z.string().optional(),
  reviewNotes: z.string().min(2, 'Review notes are required'),
});

export const createSessionSchema = z.object({
  title: z.string().min(3, 'Meeting title is required'),
  studentId: z.string().min(1, 'Mentee is required'),
  mentorId: z.string().optional(), // Inferred from mentor token if mentor schedules
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid scheduled date and time',
  }),
  durationMinutes: z.number().int().min(15).max(240).default(30),
  meetingType: z.nativeEnum(MeetingType).default(MeetingType.IN_PERSON),
  location: z.string().optional().nullable(),
  meetingLink: z.string().url().optional().nullable().or(z.literal('')),
  agenda: z.string().min(5, 'Agenda is required'),
  followUpDate: z.string().optional().nullable(),
});

export const updateSessionStatusSchema = z.object({
  status: z.nativeEnum(MeetingStatus),
  cancellationReason: z.string().optional(),
});

export const createMeetingNoteSchema = z.object({
  content: z.string().min(3, 'Note content is required'),
  visibility: z.nativeEnum(NoteVisibility).default(NoteVisibility.PRIVATE_MENTOR),
});

export const createActionItemSchema = z.object({
  description: z.string().min(3, 'Description is required'),
  dueDate: z.string().optional().nullable(),
  status: z.nativeEnum(ActionItemStatus).default(ActionItemStatus.PENDING),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(5, 'Content is required'),
  targetRole: z.string().default('ALL'),
  priority: z.nativeEnum(AnnouncementPriority).default(AnnouncementPriority.NORMAL),
  departmentId: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export const createFeedbackSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Feedback comment must be at least 5 characters'),
});

export const departmentSchema = z.object({
  code: z.string().min(2).max(10).toUpperCase(),
  name: z.string().min(3),
  description: z.string().optional(),
});
