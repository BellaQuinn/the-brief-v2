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
  active: "bg-signal text-background",
  upcoming: "bg-ink-tertiary text-background",
  completed: "bg-status-onTrack text-background",
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
    <section className="relative grid border-b border-border-subtle last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)]">
      <span
        aria-hidden
        className={cn(
          "absolute -left-5 top-7 h-2 w-2 -translate-x-1/2 rotate-45 border bg-background md:-left-9",
          term.status === "active"
            ? "border-signal bg-signal shadow-[0_0_8px_rgba(16,185,129,0.7)]"
            : term.status === "completed"
              ? "border-status-onTrack/50"
              : "border-border-strong"
        )}
      />
      <div className="flex items-start gap-2 py-6 pr-1 sm:gap-3 md:pr-6">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-start gap-2 text-left"
          aria-expanded={open}
        >
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-ink-tertiary transition-transform", !open && "-rotate-90")}
          />
          <div>
            <span className="block text-sm font-medium text-ink-primary">{term.name}</span>
            <span className={cn("mt-2 inline-block px-2 py-0.5 font-mono text-[8px] uppercase tracking-wide", STATUS_STYLE[term.status])}>
              {STATUS_LABEL[term.status]}
            </span>
            <span className="mt-2 block font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">
              {term.courses.length} course{term.courses.length === 1 ? "" : "s"} / {totalCredits} cr
            </span>
          </div>
        </button>
        <div className="flex shrink-0 flex-col gap-1">
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
      </div>

      {open && (
        <div className="border-t border-border-subtle pb-5 pt-2 md:border-l md:border-t-0 md:pl-7">
          {term.courses.length === 0 ? (
            <p className="px-1 py-2 text-sm text-ink-tertiary">No courses in this term yet.</p>
          ) : (
            <div className="py-1">
              {term.courses.map((course, index) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  courseIndex={index + 1}
                  termId={term.id}
                  actions={actions}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => setAddingCourse(true)}
            className="mt-3 flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright"
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
    </section>
  );
}
