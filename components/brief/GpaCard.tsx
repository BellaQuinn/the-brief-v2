import Link from "next/link";
import { champlainUndergraduatePolicy } from "@/lib/academicPolicy/champlain";
import type { GraduationHonorsForecast } from "@/lib/academicStanding/types";

function honorsRangeLabel(termGpa: number | null): string | null {
  if (termGpa === null) return null;
  const rules = [...champlainUndergraduatePolicy.honorsLists].sort((a, b) => b.minTermGpa - a.minTermGpa);
  const match = rules.find((rule) => termGpa >= rule.minTermGpa);
  return match ? `${match.label} range` : null;
}

export function GpaCard({
  cumulativeGpa,
  termGpa,
  graduationForecast,
  href = "/academics/standing",
}: {
  cumulativeGpa: number | null;
  termGpa: number | null;
  graduationForecast: GraduationHonorsForecast;
  href?: string;
}) {
  const rangeLabel = honorsRangeLabel(termGpa);

  return (
    <Link
      href={href}
      className="block rounded-card border border-border bg-surface px-4 py-3.5 shadow-card transition-shadow hover:shadow-elevated"
    >
      <p className="eyebrow mb-2">Current GPA</p>
      {cumulativeGpa !== null ? (
        <>
          <p className="font-display text-xl font-medium text-ink-primary">{cumulativeGpa.toFixed(2)}</p>
          <div className="mt-1 space-y-0.5">
            {rangeLabel && <p className="text-xs text-ink-secondary">{rangeLabel}</p>}
            {graduationForecast.currentDistinctionLabel && (
              <p className="text-xs text-ink-secondary">
                {graduationForecast.isOfficial ? "Earned" : "Projected"} {graduationForecast.currentDistinctionLabel}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="font-display text-xl font-medium text-ink-primary">Not available yet</p>
          <p className="mt-1 text-xs text-ink-tertiary">Waiting for completed Champlain coursework</p>
        </>
      )}
    </Link>
  );
}
