import { cn } from "@/lib/utils";
import type {
  HonorSocietyOverallStatus,
  HonorSocietyProgressResult,
  HonorSocietyRequirementStatusValue,
} from "@/lib/academicStanding/types";

const OVERALL_LABEL: Record<HonorSocietyOverallStatus, string> = {
  requirements_in_progress: "Requirements in Progress",
  potentially_eligible: "Potentially Eligible",
};

const OVERALL_CLASS: Record<HonorSocietyOverallStatus, string> = {
  requirements_in_progress: "border-border-strong text-ink-secondary",
  potentially_eligible: "border-seal/40 bg-seal/10 text-seal",
};

const REQUIREMENT_LABEL: Record<HonorSocietyRequirementStatusValue, string> = {
  met: "Requirement met",
  in_progress: "In progress",
  institution_confirmation_required: "Institution confirmation required",
  not_yet_verified: "Not yet verified",
  assumed_true: "Confirmed",
};

const REQUIREMENT_CLASS: Record<HonorSocietyRequirementStatusValue, string> = {
  met: "text-signal",
  assumed_true: "text-signal",
  in_progress: "text-ink-secondary",
  institution_confirmation_required: "text-seal",
  not_yet_verified: "text-ink-tertiary",
};

export function HonorSocietyProgress({ progress }: { progress: HonorSocietyProgressResult[] }) {
  return (
    <div className="space-y-4">
      {progress.map((rule) => (
        <div key={rule.ruleId} className="rounded-card border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-display text-base font-medium text-ink-primary">{rule.label}</p>
            <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-xs", OVERALL_CLASS[rule.overallStatus])}>
              {OVERALL_LABEL[rule.overallStatus]}
            </span>
          </div>
          <div className="space-y-2.5">
            {rule.requirements.map((req) => (
              <div key={req.id} className="flex items-start justify-between gap-3 border-t border-border-subtle pt-2.5 first:border-t-0 first:pt-0">
                <p className="text-sm text-ink-primary">{req.label}</p>
                <div className="shrink-0 text-right">
                  <p className={cn("text-xs font-medium", REQUIREMENT_CLASS[req.status])}>{REQUIREMENT_LABEL[req.status]}</p>
                  <p className="text-[11px] text-ink-tertiary">{req.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
