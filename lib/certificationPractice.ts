import { parseDateOnly } from "@/lib/utils";
import type { CertificationPracticeTest } from "@/types/database.types";

export interface DomainStats {
  average: number | null;
  // Compares this domain's first-recorded vs. most-recent-recorded score
  // for THIS domain specifically. No cross-domain "weakest" verdict --
  // different certs' domains have different weightings and scales, so
  // comparing raw averages across domains would be a claim the data
  // can't back (same reasoning as lib/lsat.ts's sectionAverages()).
  trend: "improving" | "declining" | "flat" | null;
}

// Fewer than this many scored data points for a domain, and neither an
// average nor a trend is shown for it -- one data point isn't a pattern.
const MIN_SCORES_FOR_DOMAIN_STATS = 2;

// Domains are user-named per certification (not a fixed set like the
// LSAT's LR/RC/AR), so this collects whatever domain names actually
// appear across the given tests rather than assuming any.
export function domainAverages(tests: CertificationPracticeTest[]): Record<string, DomainStats> {
  const byDomain = new Map<string, Array<{ date: string; score: number }>>();

  for (const test of [...tests].sort((a, b) => a.test_date.localeCompare(b.test_date))) {
    for (const { domain, score } of test.domain_scores) {
      if (score == null) continue;
      const existing = byDomain.get(domain) ?? [];
      existing.push({ date: test.test_date, score });
      byDomain.set(domain, existing);
    }
  }

  const result: Record<string, DomainStats> = {};
  for (const [domain, scored] of byDomain) {
    if (scored.length < MIN_SCORES_FOR_DOMAIN_STATS) {
      result[domain] = { average: null, trend: null };
      continue;
    }
    const values = scored.map((s) => s.score);
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    const delta = values[values.length - 1]! - values[0]!;
    result[domain] = { average, trend: delta > 0 ? "improving" : delta < 0 ? "declining" : "flat" };
  }
  return result;
}

export function latestScore(tests: CertificationPracticeTest[]): number | null {
  const withScores = tests.filter((t) => t.overall_score != null);
  if (withScores.length === 0) return null;
  const mostRecent = [...withScores].sort((a, b) => b.test_date.localeCompare(a.test_date))[0];
  return mostRecent ? mostRecent.overall_score : null;
}

export function highestScore(tests: CertificationPracticeTest[]): number | null {
  const scores = tests.map((t) => t.overall_score).filter((s): s is number => s != null);
  return scores.length > 0 ? Math.max(...scores) : null;
}

export function remainingToPassing(latest: number | null, passingScore: number | null): number | null {
  if (latest == null || passingScore == null) return null;
  return Math.max(0, passingScore - latest);
}

// Not `new Date(dateString)` -- that parses as UTC midnight, which can
// roll back a day once compared in a negative-UTC-offset timezone (same
// gotcha documented in lib/lsat.ts's daysUntilTest).
export function daysUntilExam(examDate: string | null): number | null {
  if (!examDate) return null;
  const target = parseDateOnly(examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
