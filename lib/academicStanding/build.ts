import { computeCourseGrade, computeCumulativeGpa, computeTermGpa } from "@/lib/academicStanding/grades";
import { computeGraduationHonorsForecast, computeHonorsListStatus } from "@/lib/academicStanding/honors";
import { computeHonorSocietyProgress } from "@/lib/academicStanding/honorSociety";
import type { InstitutionAcademicPolicy } from "@/lib/academicPolicy/types";
import type { Assignment, Course, Degree, Term } from "@/types/database.types";
import type {
  CourseGradeResult,
  CumulativeGpaResult,
  GraduationHonorsForecast,
  HonorSocietyProgressResult,
  HonorsListStatusEntry,
  TermGpaResult,
} from "@/lib/academicStanding/types";

export interface CourseWithFullAssignments extends Course {
  assignments: Assignment[];
}
export interface TermWithFullCourses extends Term {
  courses: CourseWithFullAssignments[];
}
export interface DegreeWithFullTerms extends Degree {
  terms: TermWithFullCourses[];
}

export interface AcademicStandingData {
  termGpa: TermGpaResult | null;
  cumulativeGpa: CumulativeGpaResult;
  courseGrades: Array<{ course: Course; grade: CourseGradeResult }>;
  honorsStatuses: HonorsListStatusEntry[];
  graduationForecast: GraduationHonorsForecast;
  honorSocietyProgress: HonorSocietyProgressResult[];
}

// Single entry point both the private and Portfolio Preview pages call
// after fetching one degree's terms/courses/assignments — keeps the
// term-grouping and honors-input assembly from being duplicated per page.
export function buildAcademicStandingData(degree: DegreeWithFullTerms, policy: InstitutionAcademicPolicy): AcademicStandingData {
  const allCourseGrades = degree.terms.flatMap((term) =>
    term.courses.map((course) => ({ course, grade: computeCourseGrade(course, course.assignments, policy) }))
  );

  const cumulativeGpa = computeCumulativeGpa(allCourseGrades, policy);

  const termEntries = degree.terms.map((term) => {
    const courseGradesForTerm = term.courses.map((course) => ({
      course,
      grade: allCourseGrades.find((cg) => cg.course.id === course.id)!.grade,
    }));
    return {
      term,
      hasInProgressCourses: term.courses.some((c) => c.status === "in_progress" || c.status === "planned"),
      gpaResult: computeTermGpa(term.id, courseGradesForTerm, policy),
    };
  });

  const currentTermEntry =
    termEntries.find((t) => t.term.status === "active") ??
    [...termEntries].sort((a, b) => (b.term.start_date ?? "").localeCompare(a.term.start_date ?? ""))[0] ??
    null;

  const honorsStatuses = computeHonorsListStatus(
    termEntries.map((t) => ({
      termId: t.term.id,
      startDate: t.term.start_date,
      hasInProgressCourses: t.hasInProgressCourses,
      gpaResult: t.gpaResult,
    })),
    policy
  );

  const graduationForecast = computeGraduationHonorsForecast(cumulativeGpa, degree.status === "completed", policy);
  const honorSocietyProgress = computeHonorSocietyProgress(cumulativeGpa.basis.completedCredits, cumulativeGpa.gpa, policy);

  return {
    termGpa: currentTermEntry?.gpaResult ?? null,
    cumulativeGpa,
    courseGrades: allCourseGrades,
    honorsStatuses,
    graduationForecast,
    honorSocietyProgress,
  };
}
