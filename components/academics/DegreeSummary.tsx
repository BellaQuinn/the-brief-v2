"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { DegreeForm } from "@/components/academics/DegreeForm";
import { cn, formatDateOnly } from "@/lib/utils";
import { DEGREE_STATUS_BADGE_CLASS, DEGREE_STATUS_LABEL } from "@/lib/degreeStatus";
import type { Degree } from "@/types/database.types";

export function DegreeSummary({
  degree,
  programIndex,
  onSaved,
  onDeleted,
}: {
  degree: Degree;
  programIndex: number;
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
    <section className="relative border-b border-border-subtle pb-8">
      <div aria-hidden className="absolute -left-5 top-0 font-mono text-[44px] font-bold leading-none text-signal/[0.035] md:-left-8 md:text-[72px]">
        {String(programIndex).padStart(2, "0")}
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="min-w-0">
          <p className="eyebrow mb-3 truncate">
            Program {String(programIndex).padStart(2, "0")} // {degree.school_name}
          </p>
          <h2 className="max-w-[24ch] font-display text-2xl font-semibold leading-tight tracking-tight text-ink-primary md:text-[32px]">
            {degree.degree_name}
          </h2>
          {degree.major && <p className="mt-2 text-sm text-ink-secondary">{degree.major}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2 md:justify-end">
          <span className={cn("border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide", DEGREE_STATUS_BADGE_CLASS[degree.status])}>
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

      <div className="mt-10 grid gap-5 md:grid-cols-[140px_minmax(0,1fr)_84px] md:items-end">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">Credits secured</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold tabular-nums text-ink-primary">{degree.completed_credits}</span>
            <span className="font-mono text-[10px] text-ink-tertiary">/ {degree.total_credits ?? "—"}</span>
          </div>
        </div>
        <div className="pb-1">
          <div className="relative h-7">
            <div className="absolute inset-x-0 top-3 h-px bg-border-strong" />
            <div className="absolute left-0 top-2 h-3 w-px bg-ink-tertiary" />
            <div className="absolute right-0 top-2 h-3 w-px bg-ink-tertiary" />
            {[20, 40, 60, 80].map((mark) => (
              <span key={mark} aria-hidden className="absolute top-2.5 h-2 w-px bg-border-strong" style={{ left: `${mark}%` }} />
            ))}
            <div className="absolute left-0 top-3 h-px bg-signal shadow-[0_0_9px_rgba(16,185,129,0.7)]" style={{ width: `${pct}%` }} />
            <span
              aria-hidden
              className="absolute top-[7px] h-3 w-3 -translate-x-1/2 rotate-45 border border-signal bg-background shadow-[0_0_9px_rgba(16,185,129,0.7)]"
              style={{ left: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[8px] uppercase tracking-wide text-ink-tertiary">
            <span>Origin</span>
            <span>{degree.expected_graduation ? `ETA ${formatDateOnly(degree.expected_graduation)}` : "ETA not set"}</span>
          </div>
        </div>
        <div className="md:text-right">
          <p className="font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">Completion</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-signal">{degree.total_credits ? `${pct}%` : "—"}</p>
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
    </section>
  );
}
