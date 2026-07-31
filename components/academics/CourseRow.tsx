"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { CourseForm } from "@/components/academics/CourseForm";
import { AssignmentRow } from "@/components/academics/AssignmentRow";
import { AssignmentForm } from "@/components/academics/AssignmentForm";
import { cn } from "@/lib/utils";
import type { AcademicsActions } from "@/components/academics/AcademicsClient";
import type { Assignment, CourseWithAssignments } from "@/types/database.types";

const STATUS_STYLE: Record<CourseWithAssignments["status"], string> = {
  in_progress: "border-signal/40 text-signal",
  planned: "border-border-strong text-ink-tertiary",
  completed: "border-status-onTrack/40 text-status-onTrack",
  withdrawn: "border-status-atRisk/40 text-status-atRisk",
};

const STATUS_LABEL: Record<CourseWithAssignments["status"], string> = {
  in_progress: "In progress",
  planned: "Planned",
  completed: "Completed",
  withdrawn: "Withdrawn",
};

export function CourseRow({
  course,
  termId,
  actions,
}: {
  course: CourseWithAssignments;
  termId: string;
  actions: AcademicsActions;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [addingAssignment, setAddingAssignment] = useState(false);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && course.assignments === undefined) {
      setLoadingAssignments(true);
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", course.id)
        .order("due_date", { ascending: true, nullsFirst: false });
      setLoadingAssignments(false);
      if (!error) {
        actions.onAssignmentsLoaded(course.id, (data as Assignment[]) ?? []);
      }
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${course.course_name}"? This removes all its assignments too.`
    );
    if (!confirmed) return;

    const { error } = await supabase.from("courses").delete().eq("id", course.id);
    if (error) {
      alert(error.message);
      return;
    }
    actions.onCourseDeleted(termId, course.id);
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-surface-raised">
      <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3">
        <button
          onClick={handleToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-2.5"
          aria-expanded={open}
        >
          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-ink-tertiary transition-transform", !open && "-rotate-90")} />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              {course.course_code && (
                <span className="hidden shrink-0 font-mono text-xs text-ink-tertiary sm:inline">
                  {course.course_code}
                </span>
              )}
              <span className="truncate text-sm text-ink-primary">{course.course_name}</span>
            </div>
            {course.notes && <p className="mt-0.5 truncate text-xs text-ink-tertiary">{course.notes}</p>}
          </div>
          <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px]", STATUS_STYLE[course.status])}>
            {STATUS_LABEL[course.status]}
          </span>
          {course.credits != null && (
            <span className="hidden shrink-0 font-mono text-xs text-ink-tertiary sm:inline">
              {course.credits} cr
            </span>
          )}
        </button>
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit course"
          className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-overlay hover:text-ink-primary"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Delete course"
          className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border-subtle px-3 py-2.5">
          {loadingAssignments ? (
            <p className="px-1 py-1 text-xs text-ink-tertiary">Loading assignments…</p>
          ) : course.assignments && course.assignments.length > 0 ? (
            <div className="space-y-1.5">
              {course.assignments.map((a) => (
                <AssignmentRow key={a.id} assignment={a} courseId={course.id} actions={actions} />
              ))}
            </div>
          ) : (
            <p className="px-1 py-1 text-xs text-ink-tertiary">No assignments yet.</p>
          )}
          <button
            onClick={() => setAddingAssignment(true)}
            className="mt-2 flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
          >
            <Plus className="h-3 w-3" />
            Add assignment
          </button>
        </div>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit course">
        <CourseForm
          termId={termId}
          course={course}
          onSaved={(c) => {
            actions.onCourseSaved(termId, c);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>

      <Modal open={addingAssignment} onClose={() => setAddingAssignment(false)} title="Add assignment">
        <AssignmentForm
          courseId={course.id}
          onSaved={(a) => {
            actions.onAssignmentSaved(course.id, a);
            setAddingAssignment(false);
          }}
          onCancel={() => setAddingAssignment(false)}
        />
      </Modal>
    </div>
  );
}
