import type { InstitutionAcademicPolicy, GradeBand } from "@/lib/academicPolicy/types";
import type { Assignment, Course } from "@/types/database.types";
import type { CalculationBasis, CourseGradeResult, CumulativeGpaResult, TermGpaResult } from "@/lib/academicStanding/types";

// Highest grade band whose minPercent the given percentage clears. Marks
// like "NP" (minPercent: -1) are never reachable here — they only ever
// arrive via an explicit final_grade_override.
export function percentageToGradeBand(percentage: number, policy: InstitutionAcademicPolicy): GradeBand | null {
  const eligible = policy.gradingScale.filter((band) => band.minPercent >= 0 && percentage >= band.minPercent);
  if (eligible.length === 0) return null;
  return eligible.reduce((highest, band) => (band.minPercent > highest.minPercent ? band : highest));
}

export function gradeStringToBand(grade: string, policy: InstitutionAcademicPolicy): GradeBand | null {
  return policy.gradingScale.find((band) => band.grade === grade) ?? null;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function computeCourseGrade(course: Course, assignments: Assignment[], policy: InstitutionAcademicPolicy): CourseGradeResult {
  const included = assignments.filter((a) => !a.grade_excluded);

  if (course.final_grade_override) {
    const band = gradeStringToBand(course.final_grade_override, policy);
    const grade = course.final_grade_override;
    const isNonGpa = policy.nonGpaGrades.includes(grade);
    return {
      courseId: course.id,
      grade,
      gradePoints: band ? band.gradePoints : null,
      percentage: null,
      isProvisional: false,
      isGpaBearing: course.status === "completed" && !isNonGpa,
      gradedWeight: 100,
      missingAssignmentCount: 0,
      source: "override",
    };
  }

  const graded = included.filter((a) => a.points_possible != null && a.points_earned != null);
  const missingAssignmentCount = included.length - graded.length;

  if (graded.length === 0) {
    return {
      courseId: course.id,
      grade: null,
      gradePoints: null,
      percentage: null,
      isProvisional: true,
      isGpaBearing: false,
      gradedWeight: 0,
      missingAssignmentCount,
      source: "none",
    };
  }

  const weighted = graded.filter((a) => a.weight_percent != null);
  let percentage: number;
  let gradedWeight: number;

  if (weighted.length > 0) {
    const totalWeight = weighted.reduce((sum, a) => sum + a.weight_percent!, 0);
    const weightedPoints = weighted.reduce((sum, a) => {
      const pct = (a.points_earned! / a.points_possible!) * 100;
      return sum + pct * a.weight_percent!;
    }, 0);
    percentage = totalWeight > 0 ? weightedPoints / totalWeight : 0;
    gradedWeight = Math.min(100, totalWeight);
  } else {
    const earnedSum = graded.reduce((sum, a) => sum + a.points_earned!, 0);
    const possibleSum = graded.reduce((sum, a) => sum + a.points_possible!, 0);
    const includedPossibleSum = included.reduce((sum, a) => sum + (a.points_possible ?? 0), 0);
    percentage = possibleSum > 0 ? (earnedSum / possibleSum) * 100 : 0;
    gradedWeight = includedPossibleSum > 0 ? (possibleSum / includedPossibleSum) * 100 : 100;
  }

  const band = percentageToGradeBand(percentage, policy);
  const isGpaBearing = course.status === "completed" && band !== null;

  return {
    courseId: course.id,
    grade: band?.grade ?? null,
    gradePoints: band?.gradePoints ?? null,
    percentage,
    isProvisional: course.status !== "completed",
    isGpaBearing,
    gradedWeight,
    missingAssignmentCount,
    source: "computed",
  };
}

function buildBasis(
  gpaBearing: Array<{ course: Course }>,
  all: Array<{ course: Course }>
): CalculationBasis {
  return {
    completedCredits: gpaBearing.reduce((sum, c) => sum + (c.course.credits ?? 0), 0),
    completedCourseCount: gpaBearing.length,
    inProgressCourseCount: all.length - gpaBearing.length,
    calculatedAt: nowIso(),
  };
}

export function computeTermGpa(
  termId: string,
  courseGrades: Array<{ course: Course; grade: CourseGradeResult }>,
  _policy: InstitutionAcademicPolicy
): TermGpaResult {
  const gpaBearing = courseGrades.filter((c) => c.grade.isGpaBearing && c.course.credits != null);
  const totalCredits = courseGrades.reduce((sum, c) => sum + (c.course.credits ?? 0), 0);

  if (gpaBearing.length === 0) {
    return {
      termId,
      gpa: null,
      gpaBearingCredits: 0,
      totalCredits,
      basis: buildBasis(gpaBearing, courseGrades),
    };
  }

  const gpaBearingCredits = gpaBearing.reduce((sum, c) => sum + (c.course.credits ?? 0), 0);
  const points = gpaBearing.reduce((sum, c) => sum + c.grade.gradePoints! * (c.course.credits ?? 0), 0);

  return {
    termId,
    gpa: gpaBearingCredits > 0 ? points / gpaBearingCredits : null,
    gpaBearingCredits,
    totalCredits,
    basis: buildBasis(gpaBearing, courseGrades),
  };
}

// Cumulative GPA is credit-weighted across every GPA-bearing completed
// course directly — never an average of term GPAs.
export function computeCumulativeGpa(
  courseGrades: Array<{ course: Course; grade: CourseGradeResult }>,
  _policy: InstitutionAcademicPolicy
): CumulativeGpaResult {
  const gpaBearing = courseGrades.filter((c) => c.grade.isGpaBearing && c.course.credits != null);

  if (gpaBearing.length === 0) {
    return { gpa: null, basis: buildBasis(gpaBearing, courseGrades) };
  }

  const credits = gpaBearing.reduce((sum, c) => sum + (c.course.credits ?? 0), 0);
  const points = gpaBearing.reduce((sum, c) => sum + c.grade.gradePoints! * (c.course.credits ?? 0), 0);

  return {
    gpa: credits > 0 ? points / credits : null,
    basis: buildBasis(gpaBearing, courseGrades),
  };
}
