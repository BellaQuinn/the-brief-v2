import type { LsatPracticeTest } from "@/types/database.types";

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
