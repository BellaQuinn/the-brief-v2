import { describe, expect, it } from "vitest";
import { champlainUndergraduatePolicy as policy } from "@/lib/academicPolicy/champlain";
import { computeCourseGrade, computeCumulativeGpa, computeTermGpa, percentageToGradeBand } from "@/lib/academicStanding/grades";
import type { Assignment, Course } from "@/types/database.types";

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: "course-1",
    term_id: "term-1",
    course_code: "CYBR-310",
    course_name: "Test Course",
    credits: 3,
    professor: null,
    delivery_mode: null,
    status: "in_progress",
    notes: null,
    final_grade_override: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: "a1",
    course_id: "course-1",
    title: "Assignment",
    description: null,
    type: "homework",
    due_date: null,
    points_possible: 100,
    points_earned: null,
    status: "not_started",
    priority: "medium",
    estimated_minutes: null,
    weight_percent: null,
    grade_excluded: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("percentageToGradeBand", () => {
  it("maps boundary percentages to the correct band", () => {
    expect(percentageToGradeBand(93, policy)?.grade).toBe("A");
    expect(percentageToGradeBand(92.9, policy)?.grade).toBe("A-");
    expect(percentageToGradeBand(90, policy)?.grade).toBe("A-");
    expect(percentageToGradeBand(59.9, policy)?.grade).toBe("F");
    expect(percentageToGradeBand(100, policy)?.grade).toBe("A");
  });

  it("never returns NP from a computed percentage", () => {
    for (const pct of [0, 25, 50, 75, 100]) {
      expect(percentageToGradeBand(pct, policy)?.grade).not.toBe("NP");
    }
  });
});

describe("computeCourseGrade", () => {
  it("returns 'none' when nothing is graded yet", () => {
    const course = makeCourse();
    const assignments = [makeAssignment({ points_earned: null })];
    const result = computeCourseGrade(course, assignments, policy);
    expect(result.source).toBe("none");
    expect(result.grade).toBeNull();
    expect(result.isGpaBearing).toBe(false);
  });

  it("computes a points-based grade and marks it provisional while in progress", () => {
    const course = makeCourse({ status: "in_progress" });
    const assignments = [
      makeAssignment({ id: "a1", points_possible: 100, points_earned: 95 }),
      makeAssignment({ id: "a2", points_possible: 100, points_earned: 85 }),
    ];
    const result = computeCourseGrade(course, assignments, policy);
    expect(result.percentage).toBeCloseTo(90);
    expect(result.grade).toBe("A-");
    expect(result.isProvisional).toBe(true);
    expect(result.isGpaBearing).toBe(false); // not GPA-bearing until the course is completed
  });

  it("marks a completed points-based course as GPA-bearing", () => {
    const course = makeCourse({ status: "completed" });
    const assignments = [makeAssignment({ points_possible: 100, points_earned: 93 })];
    const result = computeCourseGrade(course, assignments, policy);
    expect(result.isGpaBearing).toBe(true);
    expect(result.isProvisional).toBe(false);
    expect(result.grade).toBe("A");
  });

  it("excludes grade_excluded assignments from the calculation", () => {
    const course = makeCourse({ status: "completed" });
    const assignments = [
      makeAssignment({ id: "a1", points_possible: 100, points_earned: 60 }),
      makeAssignment({ id: "a2", points_possible: 100, points_earned: 100, grade_excluded: true }),
    ];
    const result = computeCourseGrade(course, assignments, policy);
    // Only the 60/100 assignment should count — excluding the perfect score.
    expect(result.percentage).toBeCloseTo(60);
  });

  it("uses a weighted average when any assignment has weight_percent set", () => {
    const course = makeCourse({ status: "completed" });
    const assignments = [
      makeAssignment({ id: "a1", points_possible: 100, points_earned: 100, weight_percent: 20 }), // homework, 100%
      makeAssignment({ id: "a2", points_possible: 100, points_earned: 80, weight_percent: 80 }), // exam, 80%
    ];
    const result = computeCourseGrade(course, assignments, policy);
    // (100*20 + 80*80) / 100 = 84
    expect(result.percentage).toBeCloseTo(84);
  });

  it("counts missing (ungraded, included) assignments", () => {
    const course = makeCourse();
    const assignments = [
      makeAssignment({ id: "a1", points_possible: 100, points_earned: 90 }),
      makeAssignment({ id: "a2", points_possible: 100, points_earned: null }),
      makeAssignment({ id: "a3", points_possible: 100, points_earned: null, grade_excluded: true }),
    ];
    const result = computeCourseGrade(course, assignments, policy);
    expect(result.missingAssignmentCount).toBe(1); // a3 is excluded, doesn't count as "missing"
  });

  it("respects a final_grade_override over computed assignment data", () => {
    const course = makeCourse({ status: "completed", final_grade_override: "B+" });
    const assignments = [makeAssignment({ points_possible: 100, points_earned: 10 })]; // would compute an F
    const result = computeCourseGrade(course, assignments, policy);
    expect(result.grade).toBe("B+");
    expect(result.source).toBe("override");
    expect(result.isGpaBearing).toBe(true);
  });

  it("treats a non-GPA override grade as not GPA-bearing", () => {
    const course = makeCourse({ status: "completed", final_grade_override: "W" });
    const result = computeCourseGrade(course, [], policy);
    expect(result.grade).toBe("W");
    expect(result.isGpaBearing).toBe(false);
  });

  it("keeps an NP override at 0.00 grade points but still GPA-bearing", () => {
    const course = makeCourse({ status: "completed", final_grade_override: "NP" });
    const result = computeCourseGrade(course, [], policy);
    expect(result.gradePoints).toBe(0.0);
    expect(result.isGpaBearing).toBe(true);
  });
});

describe("computeTermGpa and computeCumulativeGpa", () => {
  it("credit-weights GPA-bearing courses and excludes in-progress/non-GPA ones", () => {
    const courseA = makeCourse({ id: "a", credits: 3, status: "completed", final_grade_override: "A" }); // 4.00
    const courseB = makeCourse({ id: "b", credits: 4, status: "completed", final_grade_override: "B" }); // 3.00
    const courseC = makeCourse({ id: "c", credits: 3, status: "in_progress" }); // excluded, still in progress
    const courseGrades = [courseA, courseB, courseC].map((course) => ({
      course,
      grade: computeCourseGrade(course, [], policy),
    }));

    const term = computeTermGpa("term-1", courseGrades, policy);
    // (4.00*3 + 3.00*4) / 7 = 24/7
    expect(term.gpa).toBeCloseTo(24 / 7);
    expect(term.gpaBearingCredits).toBe(7);
    expect(term.totalCredits).toBe(10);
  });

  it("computes cumulative GPA directly across terms, not by averaging term GPAs", () => {
    // Term 1: one 3-credit A (4.00). Term 2: one 12-credit C (2.00).
    // Averaging term GPAs would give (4.00 + 2.00) / 2 = 3.00 — wrong.
    // Credit-weighted cumulative should be far closer to the 12-credit term.
    const termOneCourse = makeCourse({ id: "t1c1", credits: 3, status: "completed", final_grade_override: "A" });
    const termTwoCourse = makeCourse({ id: "t2c1", credits: 12, status: "completed", final_grade_override: "C" });
    const allCourseGrades = [termOneCourse, termTwoCourse].map((course) => ({
      course,
      grade: computeCourseGrade(course, [], policy),
    }));

    const cumulative = computeCumulativeGpa(allCourseGrades, policy);
    const naiveTermAverage = 3.0;
    expect(cumulative.gpa).not.toBeCloseTo(naiveTermAverage, 1);
    // (4.00*3 + 2.00*12) / 15 = 36/15 = 2.4
    expect(cumulative.gpa).toBeCloseTo(2.4);
  });

  it("returns null GPA with zero basis when nothing is GPA-bearing yet", () => {
    const course = makeCourse({ status: "in_progress" });
    const courseGrades = [{ course, grade: computeCourseGrade(course, [], policy) }];
    const cumulative = computeCumulativeGpa(courseGrades, policy);
    expect(cumulative.gpa).toBeNull();
    expect(cumulative.basis.completedCredits).toBe(0);
    expect(cumulative.basis.inProgressCourseCount).toBe(1);
  });
});
