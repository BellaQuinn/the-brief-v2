"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TermForm } from "@/components/academics/TermForm";
import { CourseRow } from "@/components/academics/CourseRow";
import { CourseForm } from "@/components/academics/CourseForm";
import { cn } from "@/lib/utils";
import type { AcademicsActions } from "@/components/academics/AcademicsClient";
import type { Term, TermWithCourses } from "@/types/database.types";

const STATUS_STYLE: Record<Term["status"], string> = {
  active: "border-signal/40 text-signal",
  upcoming: "border-border-strong text-ink-tertiary",
  completed: "border-status-onTrack/40 text-status-onTrack",
};

const STATUS_LABEL: Record<Term["status"], string> = {
  active: "Active",
  upcoming: "Upcoming",
  completed: "Completed",
};

export function TermSection({ term, actions }: { term: TermWithCourses; actions: AcademicsActions }) {
  const supabase = createClient();
  const [open, setOpen] = useState(term.status === "active");
  const [editing, setEditing] = useState(false);
  const [addingCourse, setAddingCourse] = useState(false);

  const totalCredits = term.courses.reduce((sum, c) => sum + (c.credits ?? 0), 0);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${term.name}"? This removes its ${term.courses.length} course(s) and all their assignments.`
    );
    if (!confirmed) return;

    const { error } = await supabase.from("terms").delete().eq("id", term.id);
    if (error) {
      alert(error.message);
      return;
    }
    actions.onTermDeleted(term.id);
  }

  return (
    <div className="rounded-card border border-border bg-surface">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-3 text-left"
          aria-expanded={open}
        >
          <ChevronDown className={cn("h-4 w-4 text-ink-tertiary transition-transform", !open && "-rotate-90")} />
          <span className="text-sm font-medium text-ink-primary">{term.name}</span>
          <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", STATUS_STYLE[term.status])}>
            {STATUS_LABEL[term.status]}
          </span>
          <span className="font-mono text-xs text-ink-tertiary">
            {term.courses.length} course{term.courses.length === 1 ? "" : "s"} · {totalCredits} cr
          </span>
        </button>
        <button
          onClick={() => setEditing(true)}
          aria-label="Edit term"
          className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Delete term"
          className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border-subtle px-4 py-3">
          {term.courses.length === 0 ? (
            <p className="px-1 py-2 text-sm text-ink-tertiary">No courses in this term yet.</p>
          ) : (
            <div className="space-y-2">
              {term.courses.map((course) => (
                <CourseRow key={course.id} course={course} termId={term.id} actions={actions} />
              ))}
            </div>
          )}
          <button
            onClick={() => setAddingCourse(true)}
            className="mt-3 flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
          >
            <Plus className="h-3.5 w-3.5" />
            Add course
          </button>
        </div>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit term">
        <TermForm
          degreeId={term.degree_id}
          term={term}
          onSaved={(t) => {
            actions.onTermSaved(t);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>

      <Modal open={addingCourse} onClose={() => setAddingCourse(false)} title="Add course">
        <CourseForm
          termId={term.id}
          onSaved={(c) => {
            actions.onCourseSaved(term.id, c);
            setAddingCourse(false);
          }}
          onCancel={() => setAddingCourse(false)}
        />
      </Modal>
    </div>
  );
}
