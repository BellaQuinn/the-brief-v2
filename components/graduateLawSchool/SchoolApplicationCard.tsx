"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { SchoolForm } from "@/components/graduateLawSchool/SchoolForm";
import { PriorityBadge, STATUS_LABEL } from "@/components/graduateLawSchool/SchoolBadges";
import { formatDateOnly } from "@/lib/utils";
import type { LawSchool, LawSchoolStatus } from "@/types/database.types";

const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));

export function SchoolApplicationCard({
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
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function handleStatusChange(status: LawSchoolStatus) {
    setUpdatingStatus(true);
    const { data, error } = await supabase.from("law_schools").update({ status }).eq("id", school.id).select().single();
    setUpdatingStatus(false);
    if (error) {
      alert(error.message);
      return;
    }
    onSaved(data as LawSchool);
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${school.school_name}"?`);
    if (!confirmed) return;
    const { error } = await supabase.from("law_schools").delete().eq("id", school.id);
    if (error) {
      alert(error.message);
      return;
    }
    onDeleted(school.id);
  }

  return (
    <div className="w-64 shrink-0 rounded-lg border border-border-subtle bg-surface-raised p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-primary">{school.school_name}</p>
          <div className="mt-1">
            <PriorityBadge priority={school.priority} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit school"
            className="rounded-md p-1 text-ink-tertiary transition-colors hover:bg-surface-overlay hover:text-ink-primary"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete school"
            className="rounded-md p-1 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {school.application_deadline && (
        <p className="mt-1.5 font-mono text-[11px] text-ink-tertiary">
          Due {formatDateOnly(school.application_deadline)}
        </p>
      )}

      <Select
        value={school.status}
        onChange={(e) => handleStatusChange(e.target.value as LawSchoolStatus)}
        options={STATUS_OPTIONS}
        disabled={updatingStatus}
        className="mt-2.5 !py-1.5 text-xs"
      />

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
