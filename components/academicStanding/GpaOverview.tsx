import { CalculationBasisNote } from "@/components/academicStanding/CalculationBasisNote";
import type { CumulativeGpaResult, TermGpaResult } from "@/lib/academicStanding/types";

export function GpaOverview({
  termGpa,
  cumulativeGpa,
}: {
  termGpa: TermGpaResult | null;
  cumulativeGpa: CumulativeGpaResult;
}) {
  const cumulativePosition = cumulativeGpa.gpa == null ? null : Math.max(0, Math.min(100, (cumulativeGpa.gpa / 4) * 100));
  const termPosition = termGpa?.gpa == null ? null : Math.max(0, Math.min(100, (termGpa.gpa / 4) * 100));

  return (
    <div className="signal-field px-5 py-7 md:px-7">
      <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-signal/75">Cumulative reading</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-6xl font-bold leading-none tabular-nums text-ink-primary">
              {cumulativeGpa.gpa !== null ? cumulativeGpa.gpa.toFixed(2) : "—"}
            </span>
            <span className="font-mono text-[10px] text-ink-tertiary">/ 4.00</span>
          </div>
          <p className="mt-2 text-xs text-ink-secondary">
            {cumulativeGpa.gpa === null
              ? "Waiting for completed GPA-bearing coursework."
              : `${cumulativeGpa.basis.completedCredits} completed credits support this reading.`}
          </p>
        </div>
        <div className="md:text-right">
          <p className="font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">Current term</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-accent-bright">
            {termGpa?.gpa != null ? termGpa.gpa.toFixed(2) : "—"}
          </p>
          <p className="mt-1 text-xs text-ink-tertiary">
            {termGpa?.gpa != null
              ? "Provisional term reading"
              : termGpa
                ? "No graded work in the current term"
                : "No active term found"}
          </p>
        </div>
      </div>

      <div className="mt-9">
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-3 h-px bg-border-strong" />
          {[0, 1, 2, 3, 4].map((mark) => (
            <span key={mark} aria-hidden className="absolute top-1.5 h-4 w-px bg-border-strong" style={{ left: `${mark * 25}%` }} />
          ))}
          {termPosition != null && (
            <span
              className="absolute top-0 h-6 w-px bg-accent"
              style={{ left: `${termPosition}%` }}
              aria-label={`Current term GPA ${termGpa?.gpa?.toFixed(2)}`}
            />
          )}
          {cumulativePosition != null && (
            <span
              className="absolute top-[7px] h-3 w-3 -translate-x-1/2 rotate-45 border border-signal bg-background shadow-[0_0_10px_rgba(16,185,129,0.7)]"
              style={{ left: `${cumulativePosition}%` }}
              aria-label={`Cumulative GPA ${cumulativeGpa.gpa?.toFixed(2)}`}
            />
          )}
        </div>
        <div className="flex justify-between font-mono text-[8px] text-ink-tertiary">
          <span>0.00</span><span>1.00</span><span>2.00</span><span>3.00</span><span>4.00</span>
        </div>
      </div>

      <div className="mt-5 border-t border-border-subtle pt-3">
        <CalculationBasisNote basis={cumulativeGpa.basis} />
      </div>
    </div>
  );
}
