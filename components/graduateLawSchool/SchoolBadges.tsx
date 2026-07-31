import { cn } from "@/lib/utils";
import type { LawSchool } from "@/types/database.types";

export const STATUS_LABEL: Record<LawSchool["status"], string> = {
  researching: "Researching",
  planning_to_apply: "Planning to apply",
  applying: "Applying",
  applied: "Applied",
  waitlisted: "Waitlisted",
  accepted: "Accepted",
  rejected: "Rejected",
  enrolled: "Enrolled",
};

const STATUS_CLASS: Record<LawSchool["status"], string> = {
  researching: "border-border-strong text-ink-tertiary",
  planning_to_apply: "border-border-strong text-ink-secondary",
  applying: "border-seal/40 text-seal",
  applied: "border-seal/40 text-seal",
  waitlisted: "border-seal/40 text-seal",
  accepted: "border-signal/40 text-signal",
  enrolled: "border-signal/40 text-signal",
  rejected: "border-status-atRisk/40 text-status-atRisk",
};

export const PRIORITY_LABEL: Record<NonNullable<LawSchool["priority"]>, string> = {
  dream: "Dream",
  reach: "Reach",
  target: "Target",
  safety: "Safety",
};

const PRIORITY_CLASS: Record<NonNullable<LawSchool["priority"]>, string> = {
  dream: "border-seal/40 bg-seal/10 text-seal",
  reach: "border-status-atRisk/40 bg-status-atRisk/10 text-status-atRisk",
  target: "border-signal/40 bg-signal/10 text-signal",
  safety: "border-border-strong text-ink-secondary",
};

export function StatusBadge({ status }: { status: LawSchool["status"] }) {
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: LawSchool["priority"] }) {
  if (!priority) return null;
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", PRIORITY_CLASS[priority])}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
