import { cn } from "@/lib/utils";
import { CalculationBasisNote } from "@/components/academicStanding/CalculationBasisNote";
import type { GraduationHonorsForecast, HonorsListStatusEntry, HonorsListStatusValue } from "@/lib/academicStanding/types";

const STATUS_LABEL: Record<HonorsListStatusValue, string> = {
  eligible: "Eligible",
  on_track: "On Track",
  at_risk: "At Risk",
  not_yet_eligible: "Not Yet Eligible",
  awaiting_final_grades: "Awaiting Final Grades",
  institution_confirmation_required: "Institution Confirmation Required",
  earned: "Earned",
};

const STATUS_CLASS: Record<HonorsListStatusValue, string> = {
  eligible: "text-signal",
  earned: "text-signal",
  on_track: "text-seal",
  institution_confirmation_required: "text-seal",
  at_risk: "text-status-atRisk",
  not_yet_eligible: "text-ink-secondary",
  awaiting_final_grades: "text-ink-secondary",
};

function StatusBadge({ status }: { status: HonorsListStatusValue }) {
  return (
    <span className={cn("shrink-0 font-mono text-[9px] uppercase tracking-wide", STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function HonorsProgress({
  statuses,
  graduationForecast,
}: {
  statuses: HonorsListStatusEntry[];
  graduationForecast: GraduationHonorsForecast;
}) {
  return (
    <div className="space-y-6">
      <div className="trace-rail border-y border-border-subtle py-2">
        {statuses.map((entry) => (
          <div key={entry.ruleId} className="relative py-4 pl-9">
            <span aria-hidden className="trace-node" />
            <span aria-hidden className="trace-connector" />
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink-primary">{entry.label}</p>
              <StatusBadge status={entry.status} />
            </div>
            <p className="mt-1 text-xs text-ink-tertiary">{entry.detail}</p>
          </div>
        ))}
      </div>

      <div className="signal-field signal-field-accent px-5 py-6">
        <p className="eyebrow mb-2">Graduation honors forecast</p>
        {graduationForecast.currentDistinctionLabel ? (
          <>
            <p className="font-display text-2xl font-semibold tracking-tight text-ink-primary">
              {graduationForecast.isOfficial ? "Earned: " : "Current projection: "}
              {graduationForecast.currentDistinctionLabel}
            </p>
            {graduationForecast.nextDistinctionLabel && graduationForecast.gpaToNextDistinction !== null && (
              <p className="mt-1 text-sm text-ink-secondary">
                {graduationForecast.gpaToNextDistinction.toFixed(2)} GPA points from {graduationForecast.nextDistinctionLabel}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-ink-secondary">Not on track for a graduation distinction yet.</p>
        )}
        {!graduationForecast.isOfficial && (
          <p className="mt-1 text-xs text-ink-tertiary">Projection based on current entered grades — not an official award.</p>
        )}
        <CalculationBasisNote basis={graduationForecast.basis} />
      </div>
    </div>
  );
}
