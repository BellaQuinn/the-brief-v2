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
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-primary">{formatDateOnly(test.test_date)}</p>
          <p className="mt-0.5 text-xs text-ink-tertiary">
            {[test.source, test.timed ? "Timed" : "Untimed"].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {test.scaled_score != null && (
            <span className="font-display text-lg font-medium text-ink-primary">{test.scaled_score}</span>
          )}
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
      </div>

      {sections.length > 0 && <p className="mt-2 text-xs text-ink-secondary">{sections.join(" · ")}</p>}
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
      {test.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-ink-tertiary">{test.notes}</p>}

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
    </div>
  );
}
