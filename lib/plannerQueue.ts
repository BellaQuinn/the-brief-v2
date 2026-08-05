import type { AssignmentWithDegreeContext } from "@/types/database.types";

export type QueueTier = "Overdue" | "Do now" | "Do next" | "On deck";

export interface QueueItem {
  assignment: AssignmentWithDegreeContext;
  tier: QueueTier;
  reason: string;
}

const TIER_RANK: Record<QueueTier, number> = { Overdue: 0, "Do now": 1, "Do next": 2, "On deck": 3 };
const PRIORITY_RANK: Record<AssignmentWithDegreeContext["priority"], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(dueDate: Date, now: Date): number {
  return Math.ceil((dueDate.getTime() - now.getTime()) / DAY_MS);
}

function isOpen(assignment: AssignmentWithDegreeContext): boolean {
  return assignment.status !== "submitted" && assignment.status !== "graded";
}

// Tier + reason are both derived only from fields the assignment actually
// has (due_date, priority) — nothing here claims urgency the record can't
// back. due_date is `timestamptz` (schema.sql), already timezone-aware,
// so plain `new Date()` is correct here (unlike the plain `date` columns
// lib/utils.ts's parseDateOnly exists for).
function classify(assignment: AssignmentWithDegreeContext, now: Date): { tier: QueueTier; reason: string } {
  if (!assignment.due_date) {
    return { tier: "On deck", reason: "No due date set." };
  }

  const due = new Date(assignment.due_date);
  const days = daysUntil(due, now);
  const isUrgent = assignment.priority === "urgent";
  const isHigh = assignment.priority === "high";

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return { tier: "Overdue", reason: `Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}.` };
  }
  if (days <= 2 || isUrgent) {
    const dueLabel = days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
    return {
      tier: "Do now",
      reason: isUrgent && days > 2 ? "Marked urgent." : `Due ${dueLabel}${isUrgent ? " and marked urgent" : ""}.`,
    };
  }
  if (days <= 7 || isHigh) {
    return {
      tier: "Do next",
      reason: days <= 7 ? `Due in ${days} days.` : "High priority.",
    };
  }
  return { tier: "On deck", reason: `Due in ${days} days.` };
}

// The ranked queue: tier first, then due date (soonest first, no date
// last within a tier), then priority as the final tiebreaker. Only open
// (not submitted/graded) work is ever queued — completed work has
// nothing left to prioritize.
export function buildWorkQueue(
  assignments: AssignmentWithDegreeContext[],
  now: Date = new Date()
): QueueItem[] {
  return assignments
    .filter(isOpen)
    .map((assignment) => ({ assignment, ...classify(assignment, now) }))
    .sort((a, b) => {
      const tierDiff = TIER_RANK[a.tier] - TIER_RANK[b.tier];
      if (tierDiff !== 0) return tierDiff;

      const aDue = a.assignment.due_date ? new Date(a.assignment.due_date).getTime() : Infinity;
      const bDue = b.assignment.due_date ? new Date(b.assignment.due_date).getTime() : Infinity;
      if (aDue !== bDue) return aDue - bDue;

      return PRIORITY_RANK[a.assignment.priority] - PRIORITY_RANK[b.assignment.priority];
    });
}

// null when nothing in the slice has an estimate — the caller shows an
// honest "no estimate" state rather than treating a missing number as
// zero minutes of work.
export function sumEstimatedMinutes(items: QueueItem[]): number | null {
  const withEstimate = items.filter((item) => item.assignment.estimated_minutes != null);
  if (withEstimate.length === 0) return null;
  return withEstimate.reduce((sum, item) => sum + item.assignment.estimated_minutes!, 0);
}

export function formatEstimatedMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
