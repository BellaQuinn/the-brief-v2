// Institution academic policy — grading scale, honors, and honor-society
// rules live here as typed configuration, not hardcoded across components.
// One institution's policy today (Champlain College Online undergraduate);
// shaped so another institution or program level could be added alongside
// it without touching any calculation or UI code.

export type VerificationStatus = "verified" | "partial" | "unverified";
export type ProgramLevel = "undergraduate" | "graduate";

export interface GradeBand {
  grade: string; // "A", "A-", "B+", ... "F", plus non-percentage marks like "NP"
  minPercent: number; // inclusive lower bound; unreachable marks (e.g. "NP") use -1
  gradePoints: number;
}

export interface HonorsListRule {
  id: string;
  label: string;
  minTermGpa: number;
  consecutiveTerms: number; // 1 for Dean's/President's, 2 for Trustees'
  requiresFullTime: boolean;
  fullTimeCreditThreshold: number;
}

export interface GraduationHonorRule {
  id: string;
  label: string;
  minCumulativeGpa: number;
}

export type HonorSocietyRequirementKind =
  | "gradedCredits"
  | "cumulativeGpa"
  | "classRank"
  | "adultStudent"
  | "localChapter";

export interface HonorSocietyRequirement {
  id: string;
  label: string;
  kind: HonorSocietyRequirementKind;
  threshold?: number; // credit count or GPA, depending on kind
}

export interface HonorSocietyRule {
  id: string;
  label: string;
  programLevel: ProgramLevel;
  requirements: HonorSocietyRequirement[];
  verificationStatus: VerificationStatus;
  notes?: string;
}

export interface InstitutionAcademicPolicy {
  institutionId: string;
  institutionName: string;
  programLevel: ProgramLevel;
  gradingScale: GradeBand[]; // ordered highest to lowest by minPercent
  nonGpaGrades: string[]; // excluded from GPA math entirely (e.g. P, W, I, AU)
  honorsLists: HonorsListRule[];
  graduationHonors: GraduationHonorRule[]; // ordered highest to lowest by minCumulativeGpa
  honorSocieties: HonorSocietyRule[];
  policySourceUrls: string[];
  effectiveDate?: string;
  verificationStatus: VerificationStatus;
  notes?: string;
}
