import type { LsatGoalCheckpoint, LsatPracticeTest } from "@/types/database.types";

type ScoredSection = "logical_reasoning_score" | "reading_comprehension_score" | "analytical_reasoning_score";

export interface SectionStats {
  average: number | null;
  // "improving" / "declining" compares this section's first-recorded vs.
  // most-recent-recorded score for THIS section specifically -- a fair,
  // same-unit comparison. There's deliberately no cross-section "weakest"
  // verdict: LR, RC, and AR have different question counts on the real
  // exam, so comparing raw averages across sections would be a claim this
  // data can't actually back.
  trend: "improving" | "declining" | "flat" | null;
}

export interface SectionAverages {
  logicalReasoning: SectionStats;
  readingComprehension: SectionStats;
  analyticalReasoning: SectionStats;
}

// Fewer than this many scored data points for a section, and neither an
// average nor a trend is shown for it -- one data point isn't a pattern.
const MIN_SCORES_FOR_SECTION_STATS = 2;

function sectionStats(tests: LsatPracticeTest[], field: ScoredSection): SectionStats {
  const scored = tests
    .filter((t) => t[field] != null)
    .sort((a, b) => a.test_date.localeCompare(b.test_date));
  if (scored.length < MIN_SCORES_FOR_SECTION_STATS) {
    return { average: null, trend: null };
  }
  const values = scored.map((t) => t[field] as number);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;
  const delta = values[values.length - 1]! - values[0]!;
  const trend = delta > 0 ? "improving" : delta < 0 ? "declining" : "flat";
  return { average, trend };
}

export function sectionAverages(tests: LsatPracticeTest[]): SectionAverages {
  return {
    logicalReasoning: sectionStats(tests, "logical_reasoning_score"),
    readingComprehension: sectionStats(tests, "reading_comprehension_score"),
    analyticalReasoning: sectionStats(tests, "analytical_reasoning_score"),
  };
}

// Sorted ascending by date -- the order a goal-gap chart plots them in.
export function sortCheckpoints(checkpoints: LsatGoalCheckpoint[]): LsatGoalCheckpoint[] {
  return [...checkpoints].sort((a, b) => a.target_date.localeCompare(b.target_date));
}

// The next checkpoint whose date hasn't passed yet -- what the workspace
// brief and directive should actually name, not just "the goal" in the
// abstract.
export function nextCheckpoint(checkpoints: LsatGoalCheckpoint[], today: Date = new Date()): LsatGoalCheckpoint | null {
  const key = today.toISOString().slice(0, 10);
  const upcoming = sortCheckpoints(checkpoints).filter((c) => c.target_date >= key);
  return upcoming[0] ?? null;
}

export function latestScore(tests: LsatPracticeTest[]): number | null {
  const withScores = tests.filter((t) => t.scaled_score != null);
  if (withScores.length === 0) return null;
  const mostRecent = [...withScores].sort((a, b) => b.test_date.localeCompare(a.test_date))[0];
  return mostRecent ? mostRecent.scaled_score : null;
}

export function highestScore(tests: LsatPracticeTest[]): number | null {
  const scores = tests.map((t) => t.scaled_score).filter((s): s is number => s != null);
  return scores.length > 0 ? Math.max(...scores) : null;
}

export function improvement(latest: number | null, diagnostic: number | null): number | null {
  if (latest == null || diagnostic == null) return null;
  return latest - diagnostic;
}

export function remainingToGoal(latest: number | null, goal: number | null): number | null {
  if (latest == null || goal == null) return null;
  return Math.max(0, goal - latest);
}

// Not `new Date(plannedTestDate)` / parseISO — those parse as UTC midnight,
// which can roll back a day once compared in a negative-UTC-offset
// timezone (same gotcha documented in lib/calendar.ts's parseDateKey).
export function daysUntilTest(plannedTestDate: string | null): number | null {
  if (!plannedTestDate) return null;
  const parts = plannedTestDate.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const target = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
