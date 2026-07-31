import type { DegreeStatus } from "@/types/database.types";

export const DEGREE_STATUS_LABEL: Record<DegreeStatus, string> = {
  active: "Active",
  planned: "Planned",
  paused: "Paused",
  completed: "Completed",
};

// Shared between the editable DegreeSummary card and the read-only
// public/review cards so a degree's status reads the same everywhere.
export const DEGREE_STATUS_BADGE_CLASS: Record<DegreeStatus, string> = {
  active: "border-signal/40 bg-signal/10 text-signal",
  planned: "border-seal/40 bg-seal/10 text-seal",
  paused: "border-border-strong text-ink-secondary",
  completed: "border-ink-tertiary/40 bg-ink-tertiary/10 text-ink-tertiary",
};
