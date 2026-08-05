import { describe, expect, it } from "vitest";
import { daysUntilExam, domainAverages, highestScore, latestScore, remainingToPassing } from "@/lib/certificationPractice";
import type { CertificationDomainScore, CertificationPracticeTest } from "@/types/database.types";

function makeTest(overrides: Partial<CertificationPracticeTest> = {}): CertificationPracticeTest {
  return {
    id: "t1",
    certification_id: "cert1",
    user_id: "u1",
    test_date: "2026-06-01",
    overall_score: null,
    overall_result: null,
    domain_scores: [],
    notes: null,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

function domains(...entries: Array<[string, number | null]>): CertificationDomainScore[] {
  return entries.map(([domain, score]) => ({ domain, score }));
}

describe("domainAverages", () => {
  it("stays silent on a domain with fewer than 2 scored data points", () => {
    const tests = [makeTest({ domain_scores: domains(["People", 82]) })];
    const result = domainAverages(tests);
    expect(result.People!.average).toBeNull();
    expect(result.People!.trend).toBeNull();
  });

  it("computes a real average and trend once there are 2+ scores for a domain", () => {
    const tests = [
      makeTest({ test_date: "2026-05-01", domain_scores: domains(["People", 70]) }),
      makeTest({ test_date: "2026-06-01", domain_scores: domains(["People", 90]) }),
    ];
    const result = domainAverages(tests);
    expect(result.People!.average).toBe(80);
    expect(result.People!.trend).toBe("improving");
  });

  it("flags a declining trend when the most recent score is lower than the first", () => {
    const tests = [
      makeTest({ test_date: "2026-05-01", domain_scores: domains(["Process", 88]) }),
      makeTest({ test_date: "2026-06-01", domain_scores: domains(["Process", 70]) }),
    ];
    expect(domainAverages(tests).Process!.trend).toBe("declining");
  });

  it("handles multiple independently-named domains across the same tests, with no cross-domain verdict", () => {
    const tests = [
      makeTest({ test_date: "2026-05-01", domain_scores: domains(["People", 60], ["Process", 90]) }),
      makeTest({ test_date: "2026-06-01", domain_scores: domains(["People", 65], ["Process", 92]) }),
    ];
    const result = domainAverages(tests);
    expect(result).not.toHaveProperty("weakestDomain");
    expect(result.People!.average).toBe(62.5);
    expect(result.Process!.average).toBe(91);
  });

  it("ignores domain entries with a null score", () => {
    const tests = [
      makeTest({ test_date: "2026-05-01", domain_scores: domains(["People", null]) }),
      makeTest({ test_date: "2026-06-01", domain_scores: domains(["People", null]) }),
    ];
    expect(domainAverages(tests)).toEqual({});
  });
});

describe("latestScore / highestScore", () => {
  it("returns the most recently dated scored test's overall_score", () => {
    const tests = [
      makeTest({ id: "a", test_date: "2026-05-01", overall_score: 700 }),
      makeTest({ id: "b", test_date: "2026-06-01", overall_score: 780 }),
    ];
    expect(latestScore(tests)).toBe(780);
  });

  it("returns null when no test has a score", () => {
    expect(latestScore([makeTest()])).toBeNull();
  });

  it("returns the highest overall_score regardless of date", () => {
    const tests = [
      makeTest({ test_date: "2026-06-01", overall_score: 700 }),
      makeTest({ test_date: "2026-05-01", overall_score: 810 }),
    ];
    expect(highestScore(tests)).toBe(810);
  });
});

describe("remainingToPassing", () => {
  it("returns the gap between latest and passing score, floored at 0", () => {
    expect(remainingToPassing(700, 750)).toBe(50);
    expect(remainingToPassing(800, 750)).toBe(0);
  });

  it("returns null when either input is missing", () => {
    expect(remainingToPassing(null, 750)).toBeNull();
    expect(remainingToPassing(700, null)).toBeNull();
  });
});

describe("daysUntilExam", () => {
  it("returns null when no exam date is set", () => {
    expect(daysUntilExam(null)).toBeNull();
  });

  it("computes a positive day count for a future date", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const iso = future.toISOString().slice(0, 10);
    expect(daysUntilExam(iso)).toBeGreaterThanOrEqual(9);
  });
});
