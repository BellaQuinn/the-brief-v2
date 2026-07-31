import { CalculationBasisNote } from "@/components/academicStanding/CalculationBasisNote";
import type { CumulativeGpaResult, TermGpaResult } from "@/lib/academicStanding/types";

export function GpaOverview({
  termGpa,
  cumulativeGpa,
}: {
  termGpa: TermGpaResult | null;
  cumulativeGpa: CumulativeGpaResult;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-card border border-border bg-surface p-5">
        <p className="eyebrow mb-1">Cumulative GPA</p>
        <p className="font-display text-3xl font-medium text-ink-primary">
          {cumulativeGpa.gpa !== null ? cumulativeGpa.gpa.toFixed(2) : "Not available yet"}
        </p>
        {cumulativeGpa.gpa === null && (
          <p className="mt-1 text-sm text-ink-secondary">Waiting for completed Champlain coursework.</p>
        )}
        <CalculationBasisNote basis={cumulativeGpa.basis} />
      </div>
      <div className="rounded-card border border-border bg-surface p-5">
        <p className="eyebrow mb-1">Current Term GPA</p>
        <p className="font-display text-3xl font-medium text-ink-primary">
          {termGpa?.gpa != null ? termGpa.gpa.toFixed(2) : "Not available yet"}
        </p>
        {termGpa ? (
          <CalculationBasisNote basis={termGpa.basis} />
        ) : (
          <p className="mt-2 text-xs text-ink-tertiary">No active term found.</p>
        )}
      </div>
    </div>
  );
}
