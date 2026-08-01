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
  requirements_in_progress: "text-ink-secondary",
  potentially_eligible: "text-seal",
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
    <div className="border-y border-border-subtle">
      {progress.map((rule, ruleIndex) => (
        <section key={rule.ruleId} className="border-b border-border-subtle py-5 last:border-b-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-accent/80">MATRIX {String(ruleIndex + 1).padStart(2, "0")}</span>
              <p className="font-display text-base font-medium text-ink-primary">{rule.label}</p>
            </div>
            <span className={cn("shrink-0 font-mono text-[9px] uppercase tracking-wide", OVERALL_CLASS[rule.overallStatus])}>
              {OVERALL_LABEL[rule.overallStatus]}
            </span>
          </div>
          <div className="trace-rail">
            {rule.requirements.map((req, reqIndex) => (
              <div key={req.id} className="relative flex items-start justify-between gap-3 py-2.5 pl-9">
                <span aria-hidden className="trace-node !top-4 border-border-strong" />
                <span aria-hidden className="trace-connector !top-[19px]" />
                <p className="text-sm text-ink-primary">
                  <span className="mr-2 font-mono text-[8px] text-ink-tertiary">{String(reqIndex + 1).padStart(2, "0")}</span>
                  {req.label}
                </p>
                <div className="shrink-0 text-right">
                  <p className={cn("text-xs font-medium", REQUIREMENT_CLASS[req.status])}>{REQUIREMENT_LABEL[req.status]}</p>
                  <p className="text-[11px] text-ink-tertiary">{req.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
