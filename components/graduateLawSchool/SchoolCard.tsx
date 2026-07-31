"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { SchoolForm } from "@/components/graduateLawSchool/SchoolForm";
import { PriorityBadge, StatusBadge } from "@/components/graduateLawSchool/SchoolBadges";
import { formatDateOnly } from "@/lib/utils";
import type { LawSchool } from "@/types/database.types";

export function SchoolCard({
  school,
  onSaved,
  onDeleted,
}: {
  school: LawSchool;
  onSaved: (school: LawSchool) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    const confirmed = window.confirm(`Delete "${school.school_name}"? This also removes its linked scholarships and documents.`);
    if (!confirmed) return;

    setDeleting(true);
    const { error } = await supabase.from("law_schools").delete().eq("id", school.id);
    if (error) {
      setDeleting(false);
      alert(error.message);
      return;
    }
    onDeleted(school.id);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-primary">{school.school_name}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={school.status} />
            <PriorityBadge priority={school.priority} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            disabled={deleting}
            aria-label="Edit school"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary disabled:pointer-events-none disabled:opacity-40"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete school"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk disabled:pointer-events-none disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-secondary sm:grid-cols-4">
        {school.application_deadline && (
          <div>
            <p className="text-ink-tertiary">Deadline</p>
            <p className="text-ink-primary">{formatDateOnly(school.application_deadline)}</p>
          </div>
        )}
        {school.lsat_requirement != null && (
          <div>
            <p className="text-ink-tertiary">LSAT req.</p>
            <p className="text-ink-primary">{school.lsat_requirement}</p>
          </div>
        )}
        {school.median_gpa != null && (
          <div>
            <p className="text-ink-tertiary">Median GPA</p>
            <p className="text-ink-primary">{school.median_gpa}</p>
          </div>
        )}
        {school.median_lsat != null && (
          <div>
            <p className="text-ink-tertiary">Median LSAT</p>
            <p className="text-ink-primary">{school.median_lsat}</p>
          </div>
        )}
      </div>

      {(school.essays_status || school.recommendations_status) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary">
          {school.essays_status && <span>Essays: {school.essays_status}</span>}
          {school.recommendations_status && <span>Recs: {school.recommendations_status}</span>}
        </div>
      )}

      {school.why_this_school && (
        <div className="mt-3 rounded-lg border border-seal/20 bg-seal/5 p-3">
          <p className="eyebrow mb-1 !text-seal">Why this school</p>
          <p className="whitespace-pre-wrap text-sm text-ink-primary">{school.why_this_school}</p>
        </div>
      )}

      {school.personal_notes && <p className="mt-3 whitespace-pre-wrap text-xs text-ink-tertiary">{school.personal_notes}</p>}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit school">
        <SchoolForm
          school={school}
          onSaved={(s) => {
            onSaved(s);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
