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
  eligible: "border-signal/40 bg-signal/10 text-signal",
  earned: "border-signal/40 bg-signal/10 text-signal",
  on_track: "border-seal/40 bg-seal/10 text-seal",
  institution_confirmation_required: "border-seal/40 bg-seal/10 text-seal",
  at_risk: "border-status-atRisk/40 bg-status-atRisk/10 text-status-atRisk",
  not_yet_eligible: "border-border-strong text-ink-secondary",
  awaiting_final_grades: "border-border-strong text-ink-secondary",
};

function StatusBadge({ status }: { status: HonorsListStatusValue }) {
  return (
    <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-xs", STATUS_CLASS[status])}>
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
    <div className="space-y-4">
      <div className="space-y-2">
        {statuses.map((entry) => (
          <div key={entry.ruleId} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-ink-primary">{entry.label}</p>
              <StatusBadge status={entry.status} />
            </div>
            <p className="mt-1 text-xs text-ink-tertiary">{entry.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-border bg-surface p-5">
        <p className="eyebrow mb-1">Graduation Honors Forecast</p>
        {graduationForecast.currentDistinctionLabel ? (
          <>
            <p className="font-display text-xl font-medium text-ink-primary">
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
