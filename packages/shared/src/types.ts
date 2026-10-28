export enum UserRole {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
  HOD = 'HOD',
}

export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export enum MeetingType {
  IN_PERSON = 'IN_PERSON',
  VIRTUAL = 'VIRTUAL',
  HYBRID = 'HYBRID',
}

export enum NoteVisibility {
  PRIVATE_MENTOR = 'PRIVATE_MENTOR',
  SHARED_STUDENT = 'SHARED_STUDENT',
  SHARED_HOD = 'SHARED_HOD',
}

export enum ActionItemStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  REASSIGNED = 'REASSIGNED',
  COMPLETED = 'COMPLETED',
}

export enum ChangeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RecommendationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum AnnouncementPriority {
  NORMAL = 'NORMAL',
  IMPORTANT = 'IMPORTANT',
  URGENT = 'URGENT',
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  departmentCode?: string;
  departmentName?: string;
  studentProfileId?: string;
  mentorProfileId?: string;
}

export interface RecommendationExplanation {
  departmentMatch: boolean;
  departmentScore: number;
  expertiseScore: number;
  matchedExpertise: string[];
  skillsScore: number;
  matchedSkills: string[];
  capacityScore: number;
  currentMentees: number;
  maxCapacity: number;
  totalScore: number;
  summary: string;
}
