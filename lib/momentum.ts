import type { Assignment } from "@/types/database.types";

export type MomentumLabel = "Excellent" | "Steady" | "Building" | "Losing ground";

const WINDOW_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// A real signal, not a mood the app claims to be in: the completion
// rate of assignments that came due in the last two weeks (the same
// window the "all clear" situation line already references). Assignment
// has no submitted_at timestamp, only a final status, so this measures
// "did it get done" rather than "was it on time" -- a real, honest
// signal within what the schema actually captures, not an invented one.
//
// due_date is `timestamptz` (database/schema.sql), unlike the plain
// `date` columns lib/utils.ts's parseDateOnly exists for -- it already
// carries its own timezone, so plain `new Date()` is correct here.
export function computeMomentum(assignments: Assignment[], now: Date = new Date()): MomentumLabel | null {
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * MS_PER_DAY);

  const pastDue = assignments.filter((a) => {
    if (!a.due_date) return false;
    const due = new Date(a.due_date);
    return due >= windowStart && due < now;
  });

  // Nothing to measure — say nothing, per "silence is a feature." A
  // Momentum reading with zero data points behind it would be
  // inventing confidence the numbers don't back.
  if (pastDue.length === 0) return null;

  const completed = pastDue.filter((a) => a.status === "submitted" || a.status === "graded").length;
  const rate = completed / pastDue.length;

  if (rate >= 0.9) return "Excellent";
  if (rate >= 0.7) return "Steady";
  if (rate >= 0.4) return "Building";
  return "Losing ground";
}
