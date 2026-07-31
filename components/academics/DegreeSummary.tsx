"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { DegreeForm } from "@/components/academics/DegreeForm";
import { cn } from "@/lib/utils";
import { DEGREE_STATUS_BADGE_CLASS, DEGREE_STATUS_LABEL } from "@/lib/degreeStatus";
import type { Degree } from "@/types/database.types";

export function DegreeSummary({
  degree,
  onSaved,
  onDeleted,
}: {
  degree: Degree;
  onSaved: (degree: Degree) => void;
  onDeleted: (degreeId: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pct =
    degree.total_credits && degree.total_credits > 0
      ? Math.min(100, Math.round((degree.completed_credits / degree.total_credits) * 100))
      : 0;

  async function handleDelete() {
    if (deleting) return;

    const confirmed = window.confirm(
      `Delete "${degree.degree_name}"? This removes all its terms, courses, and assignments too.`
    );
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabase.from("degrees").delete().eq("id", degree.id);
    if (error) {
      setDeleting(false);
      alert(error.message);
      return;
    }
    onDeleted(degree.id);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow mb-1 truncate">{degree.school_name}</p>
          <h2 className="truncate font-display text-lg font-medium text-ink-primary">{degree.degree_name}</h2>
          {degree.major && <p className="mt-0.5 truncate text-sm text-ink-secondary">{degree.major}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs", DEGREE_STATUS_BADGE_CLASS[degree.status])}>
            {DEGREE_STATUS_LABEL[degree.status]}
          </span>
          <button
            onClick={() => setEditing(true)}
            disabled={deleting}
            aria-label="Edit degree"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary disabled:pointer-events-none disabled:opacity-40"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete degree"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-xs text-ink-secondary">
          <span>
            {degree.completed_credits} / {degree.total_credits ?? "—"} credits
          </span>
          {degree.expected_graduation && (
            <span>Expected {new Date(degree.expected_graduation).toLocaleDateString()}</span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-signal" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit degree plan">
        <DegreeForm
          degree={degree}
          onSaved={(d) => {
            onSaved(d);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
