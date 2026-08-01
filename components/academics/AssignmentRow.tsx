"use client";

import { useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { AssignmentForm } from "@/components/academics/AssignmentForm";
import { cn } from "@/lib/utils";
import type { AcademicsActions } from "@/components/academics/AcademicsClient";
import type { Assignment } from "@/types/database.types";

const PRIORITY_DOT: Record<Assignment["priority"], string> = {
  urgent: "bg-seal",
  high: "bg-status-atRisk",
  medium: "bg-signal",
  low: "bg-ink-tertiary",
};

const STATUS_LABEL: Record<Assignment["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Submitted",
  graded: "Graded",
};

export function AssignmentRow({
  assignment,
  courseId,
  actions,
}: {
  assignment: Assignment;
  courseId: string;
  actions: AcademicsActions;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);

  const due = assignment.due_date ? new Date(assignment.due_date) : null;
  const overdue = due ? isPast(due) && !isToday(due) && assignment.status !== "submitted" && assignment.status !== "graded" : false;

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${assignment.title}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("assignments").delete().eq("id", assignment.id);
    if (error) {
      alert(error.message);
      return;
    }
    actions.onAssignmentDeleted(courseId, assignment.id);
  }

  return (
    <div className="group relative flex items-center gap-2.5 py-2.5">
      <span aria-hidden className="absolute -left-5 top-1/2 h-px w-4 bg-border-strong" />
      <span className={cn("h-1.5 w-1.5 shrink-0 rotate-45", PRIORITY_DOT[assignment.priority])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-primary">{assignment.title}</p>
        <p className="mt-0.5 font-mono text-[11px] text-ink-tertiary">{STATUS_LABEL[assignment.status]}</p>
      </div>
      {assignment.points_possible != null && (
        <span className="hidden shrink-0 font-mono text-xs text-ink-tertiary sm:inline">
          {assignment.points_earned ?? "—"}/{assignment.points_possible}
        </span>
      )}
      {due && (
        <span className={cn("shrink-0 font-mono text-xs", overdue ? "text-status-atRisk" : "text-ink-secondary")}>
          {isToday(due) ? "Today" : format(due, "MMM d")}
        </span>
      )}
      <button
        onClick={() => setEditing(true)}
        aria-label="Edit assignment"
        className="rounded-md p-1 text-ink-tertiary opacity-70 transition-all hover:bg-surface-raised hover:text-ink-primary group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        onClick={handleDelete}
        aria-label="Delete assignment"
        className="rounded-md p-1 text-ink-tertiary opacity-70 transition-all hover:bg-status-atRisk/10 hover:text-status-atRisk group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit assignment">
        <AssignmentForm
          courseId={courseId}
          assignment={assignment}
          onSaved={(a) => {
            actions.onAssignmentSaved(courseId, a);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
