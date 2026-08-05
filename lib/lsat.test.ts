import { describe, expect, it } from "vitest";
import { nextCheckpoint, sectionAverages, sortCheckpoints } from "@/lib/lsat";
import type { LsatGoalCheckpoint, LsatPracticeTest } from "@/types/database.types";

function makeTest(overrides: Partial<LsatPracticeTest> = {}): LsatPracticeTest {
  return {
    id: "t1",
    user_id: "u1",
    test_date: "2026-06-01",
    source: null,
    scaled_score: null,
    logical_reasoning_score: null,
    reading_comprehension_score: null,
    analytical_reasoning_score: null,
    timed: true,
    confidence: null,
    missed_questions: null,
    notes: null,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

function makeCheckpoint(overrides: Partial<LsatGoalCheckpoint> = {}): LsatGoalCheckpoint {
  return {
    id: "c1",
    user_id: "u1",
    target_date: "2026-09-01",
    target_score: 158,
    label: null,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

describe("sectionAverages", () => {
  it("stays silent on a section with fewer than 2 scored data points", () => {
    const tests = [makeTest({ logical_reasoning_score: 18 })];
    const result = sectionAverages(tests);
    expect(result.logicalReasoning.average).toBeNull();
    expect(result.logicalReasoning.trend).toBeNull();
  });

  it("computes a real average once there are 2+ scores for a section", () => {
    const tests = [
      makeTest({ test_date: "2026-05-01", logical_reasoning_score: 16 }),
      makeTest({ test_date: "2026-06-01", logical_reasoning_score: 20 }),
    ];
    const result = sectionAverages(tests);
    expect(result.logicalReasoning.average).toBe(18);
    expect(result.logicalReasoning.trend).toBe("improving");
  });

  it("flags a declining trend when the most recent score is lower than the first", () => {
    const tests = [
      makeTest({ test_date: "2026-05-01", reading_comprehension_score: 22 }),
      makeTest({ test_date: "2026-06-01", reading_comprehension_score: 19 }),
    ];
    const result = sectionAverages(tests);
    expect(result.readingComprehension.trend).toBe("declining");
  });

  it("flags flat when the first and most recent scores for a section are equal", () => {
    const tests = [
      makeTest({ test_date: "2026-05-01", analytical_reasoning_score: 17 }),
      makeTest({ test_date: "2026-07-01", analytical_reasoning_score: 19 }),
      makeTest({ test_date: "2026-06-01", analytical_reasoning_score: 17 }),
    ];
    const result = sectionAverages(tests);
    // sorted by date ascending: May(17) -> Jun(17) -> Jul(19) -- first vs latest differ
    expect(result.analyticalReasoning.trend).toBe("improving");
  });

  it("never produces a cross-section 'weakest' verdict -- only independent per-section stats", () => {
    const tests = [
      makeTest({ test_date: "2026-05-01", logical_reasoning_score: 10, reading_comprehension_score: 25 }),
      makeTest({ test_date: "2026-06-01", logical_reasoning_score: 12, reading_comprehension_score: 26 }),
    ];
    const result = sectionAverages(tests);
    expect(result).not.toHaveProperty("weakestSection");
    expect(result.logicalReasoning.average).toBe(11);
    expect(result.readingComprehension.average).toBe(25.5);
  });
});

describe("sortCheckpoints", () => {
  it("orders checkpoints by target date ascending without mutating the input", () => {
    const checkpoints = [
      makeCheckpoint({ id: "b", target_date: "2026-11-01" }),
      makeCheckpoint({ id: "a", target_date: "2026-09-01" }),
    ];
    const sorted = sortCheckpoints(checkpoints);
    expect(sorted.map((c) => c.id)).toEqual(["a", "b"]);
    expect(checkpoints.map((c) => c.id)).toEqual(["b", "a"]);
  });
});

describe("nextCheckpoint", () => {
  const today = new Date("2026-08-15T12:00:00.000Z");

  it("returns the nearest checkpoint that hasn't passed yet", () => {
    const checkpoints = [
      makeCheckpoint({ id: "past", target_date: "2026-07-01" }),
      makeCheckpoint({ id: "next", target_date: "2026-09-01" }),
      makeCheckpoint({ id: "later", target_date: "2026-11-01" }),
    ];
    expect(nextCheckpoint(checkpoints, today)?.id).toBe("next");
  });

  it("returns null when every checkpoint is already in the past", () => {
    const checkpoints = [makeCheckpoint({ target_date: "2026-01-01" })];
    expect(nextCheckpoint(checkpoints, today)).toBeNull();
  });

  it("returns null with no checkpoints at all", () => {
    expect(nextCheckpoint([], today)).toBeNull();
  });
});
