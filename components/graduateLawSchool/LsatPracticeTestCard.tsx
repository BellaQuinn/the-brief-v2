"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { LsatPracticeTestForm } from "@/components/graduateLawSchool/LsatPracticeTestForm";
import { formatDateOnly } from "@/lib/utils";
import type { LsatPracticeTest } from "@/types/database.types";

export function LsatPracticeTestCard({
  test,
  onSaved,
  onDeleted,
}: {
  test: LsatPracticeTest;
  onSaved: (test: LsatPracticeTest) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete the practice test from ${formatDateOnly(test.test_date)}?`);
    if (!confirmed) return;
    const { error } = await supabase.from("lsat_practice_tests").delete().eq("id", test.id);
    if (error) {
      alert(error.message);
      return;
    }
    onDeleted(test.id);
  }

  const sections = [
    test.logical_reasoning_score != null && `LR ${test.logical_reasoning_score}`,
    test.reading_comprehension_score != null && `RC ${test.reading_comprehension_score}`,
    test.analytical_reasoning_score != null && `AR ${test.analytical_reasoning_score}`,
  ].filter(Boolean);

  return (
    <article className="group grid gap-3 border-b border-border-subtle px-1 py-4 last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-start sm:gap-5">
      <div>
        <p className="font-mono text-xs font-medium text-ink-secondary">{formatDateOnly(test.test_date)}</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">
            {[test.source, test.timed ? "Timed" : "Untimed"].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {test.scaled_score != null && (
            <span className="font-mono text-2xl font-bold tabular-nums text-ink-primary">{test.scaled_score}</span>
          )}
          {sections.length > 0 && <p className="font-mono text-[11px] text-ink-secondary">{sections.join(" · ")}</p>}
        </div>
        {(test.confidence != null || test.missed_questions != null) && (
          <p className="mt-1 text-xs text-ink-tertiary">
            {[
              test.confidence != null && `Confidence ${test.confidence}/5`,
              test.missed_questions != null && `${test.missed_questions} missed`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {test.notes && <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-ink-secondary">{test.notes}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit practice test"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete practice test"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit practice test">
        <LsatPracticeTestForm
          test={test}
          onSaved={(t) => {
            onSaved(t);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </article>
  );
}
