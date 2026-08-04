// Calculation-result shapes for the academic standing engine. These aren't
// database rows (see types/database.types.ts for those) — they're what
// lib/academicStanding's pure functions return, mirroring how
// lib/calendar.ts keeps CalendarEvent alongside its own builder rather than
// in the DB types file.

export interface CalculationBasis {
  completedCredits: number;
  completedCourseCount: number;
  inProgressCourseCount: number; // excluded from this calculation, shown so nothing feels silently dropped
  calculatedAt: string; // ISO timestamp — nothing is cached, so this is "as of this render"
}

export type CourseGradeSource = "override" | "computed" | "none";

export interface CourseGradeResult {
  courseId: string;
  grade: string | null; // e.g. "A-", "W" — null when nothing graded yet
  gradePoints: number | null;
  percentage: number | null;
  isProvisional: boolean; // derived from in-progress assignment data rather than a completed course
  isGpaBearing: boolean; // false for non-GPA marks or no grade yet
  gradedWeight: number; // 0–100, how much of the course's weight/points has graded work behind it
  missingAssignmentCount: number; // included, ungraded assignments
  source: CourseGradeSource;
}

export interface TermGpaResult {
  termId: string;
  gpa: number | null;
  gpaBearingCredits: number;
  totalCredits: number; // all courses in the term, GPA-bearing or not — used for full-time checks
  basis: CalculationBasis;
}

export interface CumulativeGpaResult {
  gpa: number | null;
  basis: CalculationBasis;
}

// The Scenario Planner's "what grade do I need" answer. `achievable:
// false` with a real grade/projectedGpa still filled in means "here's the
// best case, an A, and it still falls short" -- an honest ceiling, not a
// blank failure.
export interface RequiredGradeResult {
  achievable: boolean;
  grade: string | null;
  gradePoints: number | null;
  projectedGpa: number | null;
}

export type HonorsListStatusValue =
  | "eligible"
  | "on_track"
  | "at_risk"
  | "not_yet_eligible"
  | "awaiting_final_grades"
  | "institution_confirmation_required"
  | "earned";

export interface HonorsListStatusEntry {
  ruleId: string;
  label: string;
  status: HonorsListStatusValue;
  detail: string;
  termId?: string;
}

export interface GraduationHonorsForecast {
  currentDistinctionId: string | null;
  currentDistinctionLabel: string | null;
  isOfficial: boolean; // true only once the degree itself is fully completed
  gpaToNextDistinction: number | null;
  nextDistinctionLabel: string | null;
  basis: CalculationBasis;
}

export type HonorSocietyRequirementStatusValue =
  | "met"
  | "in_progress"
  | "institution_confirmation_required"
  | "not_yet_verified"
  | "assumed_true";

export interface HonorSocietyRequirementStatus {
  id: string;
  label: string;
  status: HonorSocietyRequirementStatusValue;
  detail: string;
}

export type HonorSocietyOverallStatus = "requirements_in_progress" | "potentially_eligible";

export interface HonorSocietyProgressResult {
  ruleId: string;
  label: string;
  overallStatus: HonorSocietyOverallStatus;
  requirements: HonorSocietyRequirementStatus[];
}
