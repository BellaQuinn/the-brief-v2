import { describe, expect, it } from "vitest";
import { champlainUndergraduatePolicy as policy } from "@/lib/academicPolicy/champlain";
import { computeGraduationHonorsForecast, computeHonorsListStatus } from "@/lib/academicStanding/honors";
import type { TermForHonors } from "@/lib/academicStanding/honors";
import type { CumulativeGpaResult, TermGpaResult } from "@/lib/academicStanding/types";

function makeTermGpa(overrides: Partial<TermGpaResult> = {}): TermGpaResult {
  return {
    termId: "term-1",
    gpa: null,
    gpaBearingCredits: 0,
    totalCredits: 6,
    basis: { completedCredits: 0, completedCourseCount: 0, inProgressCourseCount: 0, calculatedAt: "2026-07-31T00:00:00Z" },
    ...overrides,
  };
}

describe("computeHonorsListStatus", () => {
  it("requires institution confirmation below the full-time credit threshold", () => {
    const terms: TermForHonors[] = [
      {
        termId: "t1",
        startDate: "2026-08-01",
        hasInProgressCourses: false,
        gpaResult: makeTermGpa({ termId: "t1", totalCredits: 6, gpaBearingCredits: 6, gpa: 4.0 }),
      },
    ];
    const statuses = computeHonorsListStatus(terms, policy);
    const deansList = statuses.find((s) => s.ruleId === "deans_list")!;
    expect(deansList.status).toBe("institution_confirmation_required");
  });

  it("marks Dean's List earned for a completed full-time term at or above 3.50", () => {
    const terms: TermForHonors[] = [
      {
        termId: "t1",
        startDate: "2026-08-01",
        hasInProgressCourses: false,
        gpaResult: makeTermGpa({ termId: "t1", totalCredits: 15, gpaBearingCredits: 15, gpa: 3.7 }),
      },
    ];
    const statuses = computeHonorsListStatus(terms, policy);
    expect(statuses.find((s) => s.ruleId === "deans_list")?.status).toBe("earned");
    expect(statuses.find((s) => s.ruleId === "presidents_list")?.status).toBe("not_yet_eligible");
  });

  it("marks Trustees' List earned for two consecutive complete 4.0 full-time terms", () => {
    const terms: TermForHonors[] = [
      {
        termId: "t1",
        startDate: "2026-01-01",
        hasInProgressCourses: false,
        gpaResult: makeTermGpa({ termId: "t1", totalCredits: 15, gpaBearingCredits: 15, gpa: 4.0 }),
      },
      {
        termId: "t2",
        startDate: "2026-05-01",
        hasInProgressCourses: false,
        gpaResult: makeTermGpa({ termId: "t2", totalCredits: 15, gpaBearingCredits: 15, gpa: 4.0 }),
      },
    ];
    const statuses = computeHonorsListStatus(terms, policy);
    expect(statuses.find((s) => s.ruleId === "trustees_list")?.status).toBe("earned");
  });

  it("does not award Trustees' List for a single qualifying term", () => {
    const terms: TermForHonors[] = [
      {
        termId: "t1",
        startDate: "2026-01-01",
        hasInProgressCourses: false,
        gpaResult: makeTermGpa({ termId: "t1", totalCredits: 15, gpaBearingCredits: 15, gpa: 4.0 }),
      },
    ];
    const statuses = computeHonorsListStatus(terms, policy);
    expect(statuses.find((s) => s.ruleId === "trustees_list")?.status).not.toBe("earned");
  });
});

describe("computeGraduationHonorsForecast", () => {
  function makeCumulative(gpa: number | null): CumulativeGpaResult {
    return {
      gpa,
      basis: { completedCredits: 60, completedCourseCount: 20, inProgressCourseCount: 2, calculatedAt: "2026-07-31T00:00:00Z" },
    };
  }

  it("returns no distinction when GPA is unavailable", () => {
    const forecast = computeGraduationHonorsForecast(makeCumulative(null), false, policy);
    expect(forecast.currentDistinctionLabel).toBeNull();
    expect(forecast.nextDistinctionLabel).toBe("Summa Cum Laude");
  });

  it("identifies the current distinction and gap to the next one", () => {
    const forecast = computeGraduationHonorsForecast(makeCumulative(3.7), false, policy);
    expect(forecast.currentDistinctionLabel).toBe("Magna Cum Laude");
    expect(forecast.nextDistinctionLabel).toBe("Summa Cum Laude");
    expect(forecast.gpaToNextDistinction).toBeCloseTo(0.1);
    expect(forecast.isOfficial).toBe(false);
  });

  it("marks the forecast official only once the degree is completed", () => {
    const inProgress = computeGraduationHonorsForecast(makeCumulative(3.9), false, policy);
    const completed = computeGraduationHonorsForecast(makeCumulative(3.9), true, policy);
    expect(inProgress.isOfficial).toBe(false);
    expect(completed.isOfficial).toBe(true);
  });

  it("has no next distinction once already at the top tier", () => {
    const forecast = computeGraduationHonorsForecast(makeCumulative(3.95), false, policy);
    expect(forecast.currentDistinctionLabel).toBe("Summa Cum Laude");
    expect(forecast.nextDistinctionLabel).toBeNull();
    expect(forecast.gpaToNextDistinction).toBeNull();
  });
});
