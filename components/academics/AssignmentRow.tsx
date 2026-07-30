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
    <div className="flex items-center gap-2.5 rounded-md bg-surface-overlay px-2.5 py-2">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT[assignment.priority])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-primary">{assignment.title}</p>
        <p className="mt-0.5 font-mono text-[11px] text-ink-tertiary">{STATUS_LABEL[assignment.status]}</p>
      </div>
      {assignment.points_possible != null && (
        <span className="shrink-0 font-mono text-xs text-ink-tertiary">
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
        className="rounded-md p-1 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        onClick={handleDelete}
        aria-label="Delete assignment"
        className="rounded-md p-1 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
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
