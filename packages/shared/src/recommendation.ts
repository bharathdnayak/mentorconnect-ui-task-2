import { RecommendationExplanation } from './types';

export interface StudentMatchProfile {
  id: string;
  departmentId: string;
  departmentName?: string;
  careerGoals: string[];
  guidanceNeeds: string[];
  technicalSkills: string[];
  preferredTopics: string[];
}

export interface MentorMatchProfile {
  id: string;
  userId: string;
  fullName: string;
  departmentId: string;
  departmentName?: string;
  designation: string;
  expertise: string[];
  technicalSkills: string[];
  mentoringInterests: string[];
  maxCapacity: number;
  currentMenteeCount: number;
}

export interface RecommendationResult {
  mentorId: string;
  mentorName: string;
  designation: string;
  departmentName: string;
  expertise: string[];
  availableSlots: number;
  maxCapacity: number;
  currentMenteeCount: number;
  score: number; // 0 - 100
  isAtCapacity: boolean;
  explanation: RecommendationExplanation;
}

/**
 * Normalizes strings for robust fuzzy keyword matching
 */
function normalizeKeyword(str: string): string {
  return str.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Calculates overlap between two sets of tags/phrases
 */
function calculateTagOverlap(studentTags: string[], mentorTags: string[]): string[] {
  const matched: string[] = [];
  const normalizedMentor = mentorTags.map(t => ({ original: t, norm: normalizeKeyword(t) }));

  for (const sTag of studentTags) {
    const sNorm = normalizeKeyword(sTag);
    if (!sNorm) continue;

    for (const m of normalizedMentor) {
      if (m.norm === sNorm || m.norm.includes(sNorm) || sNorm.includes(m.norm)) {
        if (!matched.includes(m.original)) {
          matched.push(m.original);
        }
      }
    }
  }
  return matched;
}

/**
 * Calculates explainable mentor-mentee compatibility score (0-100)
 */
export function calculateMentorCompatibility(
  student: StudentMatchProfile,
  mentor: MentorMatchProfile
): RecommendationResult {
  // 1. Department Compatibility (Weight: 25 points)
  const isDeptMatch = student.departmentId === mentor.departmentId;
  const departmentScore = isDeptMatch ? 25 : 5; // Base 5 for inter-departmental mentorship

  // 2. Expertise & Career Goals / Guidance Alignment (Weight: 35 points)
  const combinedStudentNeeds = [...(student.careerGoals || []), ...(student.guidanceNeeds || [])];
  const matchedExpertise = calculateTagOverlap(combinedStudentNeeds, mentor.expertise || []);
  
  let expertiseScore = 0;
  if (matchedExpertise.length >= 3) {
    expertiseScore = 35;
  } else if (matchedExpertise.length === 2) {
    expertiseScore = 26;
  } else if (matchedExpertise.length === 1) {
    expertiseScore = 15;
  } else {
    // Partial score for general guidance
    expertiseScore = 5;
  }

  // 3. Technical Skills & Mentoring Topics Overlap (Weight: 20 points)
  const combinedStudentTopics = [...(student.technicalSkills || []), ...(student.preferredTopics || [])];
  const combinedMentorSkills = [...(mentor.technicalSkills || []), ...(mentor.mentoringInterests || [])];
  const matchedSkills = calculateTagOverlap(combinedStudentTopics, combinedMentorSkills);

  let skillsScore = 0;
  if (matchedSkills.length >= 3) {
    skillsScore = 20;
  } else if (matchedSkills.length === 2) {
    skillsScore = 14;
  } else if (matchedSkills.length === 1) {
    skillsScore = 8;
  } else {
    skillsScore = 2;
  }

  // 4. Capacity & Availability Margin (Weight: 20 points)
  const availableSlots = Math.max(0, mentor.maxCapacity - mentor.currentMenteeCount);
  const isAtCapacity = availableSlots <= 0;
  
  let capacityScore = 0;
  if (isAtCapacity) {
    capacityScore = 0; // At max capacity
  } else {
    const capacityRatio = availableSlots / mentor.maxCapacity;
    capacityScore = Math.round(capacityRatio * 20);
  }

  const totalScore = Math.min(100, departmentScore + expertiseScore + skillsScore + capacityScore);

  // Generate plain-language explainability breakdown
  const summaryParts: string[] = [];
  if (isDeptMatch) {
    summaryParts.push(`Same department (${mentor.departmentName || 'Core'})`);
  }
  if (matchedExpertise.length > 0) {
    summaryParts.push(`Aligned domain expertise in ${matchedExpertise.slice(0, 2).join(', ')}`);
  }
  if (matchedSkills.length > 0) {
    summaryParts.push(`Shared focus in ${matchedSkills.slice(0, 2).join(', ')}`);
  }
  if (availableSlots > 0) {
    summaryParts.push(`${availableSlots} open mentee slot${availableSlots > 1 ? 's' : ''}`);
  } else {
    summaryParts.push(`Currently at full capacity (${mentor.currentMenteeCount}/${mentor.maxCapacity})`);
  }

  const summary = summaryParts.join(' • ');

  const explanation: RecommendationExplanation = {
    departmentMatch: isDeptMatch,
    departmentScore,
    expertiseScore,
    matchedExpertise,
    skillsScore,
    matchedSkills,
    capacityScore,
    currentMentees: mentor.currentMenteeCount,
    maxCapacity: mentor.maxCapacity,
    totalScore,
    summary,
  };

  return {
    mentorId: mentor.id,
    mentorName: mentor.fullName,
    designation: mentor.designation,
    departmentName: mentor.departmentName || 'Engineering',
    expertise: mentor.expertise,
    availableSlots,
    maxCapacity: mentor.maxCapacity,
    currentMenteeCount: mentor.currentMenteeCount,
    score: totalScore,
    isAtCapacity,
    explanation,
  };
}

/**
 * Generates ranked recommendations for a student given a pool of mentors
 */
export function rankMentorRecommendations(
  student: StudentMatchProfile,
  mentors: MentorMatchProfile[]
): RecommendationResult[] {
  return mentors
    .map(mentor => calculateMentorCompatibility(student, mentor))
    .sort((a, b) => {
      // Prioritize available mentors over full ones, then higher score
      if (a.isAtCapacity !== b.isAtCapacity) {
        return a.isAtCapacity ? 1 : -1;
      }
      return b.score - a.score;
    });
}
