"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { ScholarshipForm } from "@/components/graduateLawSchool/ScholarshipForm";
import { cn, formatDateOnly } from "@/lib/utils";
import type { LawSchool, Scholarship } from "@/types/database.types";

const STATUS_LABEL: Record<Scholarship["status"], string> = {
  researching: "Researching",
  eligible: "Eligible",
  applying: "Applying",
  applied: "Applied",
  awarded: "Awarded",
  declined: "Declined",
};

const STATUS_CLASS: Record<Scholarship["status"], string> = {
  researching: "border-border-strong text-ink-tertiary",
  eligible: "border-seal/40 text-seal",
  applying: "border-seal/40 text-seal",
  applied: "border-seal/40 text-seal",
  awarded: "border-signal/40 text-signal",
  declined: "border-status-atRisk/40 text-status-atRisk",
};

export function ScholarshipCard({
  scholarship,
  schools,
  onSaved,
  onDeleted,
}: {
  scholarship: Scholarship;
  schools: LawSchool[];
  onSaved: (scholarship: Scholarship) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const linkedSchool = schools.find((s) => s.id === scholarship.law_school_id);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${scholarship.name}"?`);
    if (!confirmed) return;
    const { error } = await supabase.from("scholarships").delete().eq("id", scholarship.id);
    if (error) {
      alert(error.message);
      return;
    }
    onDeleted(scholarship.id);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-primary">{scholarship.name}</p>
          {linkedSchool && <p className="mt-0.5 truncate text-xs text-ink-tertiary">{linkedSchool.school_name}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", STATUS_CLASS[scholarship.status])}>
            {STATUS_LABEL[scholarship.status]}
          </span>
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit scholarship"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete scholarship"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink-secondary">
        {scholarship.amount != null && <span>${scholarship.amount.toLocaleString()}</span>}
        {scholarship.deadline && <span>Due {formatDateOnly(scholarship.deadline)}</span>}
      </div>
      {scholarship.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-ink-tertiary">{scholarship.notes}</p>}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit scholarship">
        <ScholarshipForm
          scholarship={scholarship}
          schools={schools}
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
