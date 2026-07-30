import { format, isToday, isPast } from "date-fns";
import type { AssignmentWithContext } from "@/types/database.types";
import { cn } from "@/lib/utils";

const PRIORITY_DOT: Record<AssignmentWithContext["priority"], string> = {
  urgent: "bg-seal",
  high: "bg-status-atRisk",
  medium: "bg-signal",
  low: "bg-ink-tertiary",
};

export function FocusList({ items }: { items: AssignmentWithContext[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border px-5 py-8 text-center">
        <p className="text-sm text-ink-secondary">Nothing due. This is what on track looks like.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border-subtle rounded-card border border-border bg-surface">
      {items.map((item) => {
        const due = item.due_date ? new Date(item.due_date) : null;
        const overdue = due ? isPast(due) && !isToday(due) : false;

        return (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3">
            <span
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT[item.priority])}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink-primary">{item.title}</p>
              <p className="mt-0.5 font-mono text-[11px] text-ink-tertiary">
                {item.course.course_code ?? item.course.course_name}
              </p>
            </div>
            {due && (
              <span
                className={cn(
                  "shrink-0 font-mono text-xs",
                  overdue ? "text-status-atRisk" : "text-ink-secondary"
                )}
              >
                {isToday(due) ? "Today" : format(due, "MMM d")}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
