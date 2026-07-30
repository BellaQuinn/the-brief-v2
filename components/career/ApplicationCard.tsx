"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ApplicationForm } from "@/components/career/ApplicationForm";
import type { Application, ApplicationStatus } from "@/types/database.types";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone screen" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export function ApplicationCard({
  application,
  onSaved,
  onDeleted,
}: {
  application: Application;
  onSaved: (a: Application) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function handleStatusChange(status: ApplicationStatus) {
    setUpdatingStatus(true);
    const { data, error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", application.id)
      .select()
      .single();
    setUpdatingStatus(false);
    if (error) {
      alert(error.message);
      return;
    }
    onSaved(data as Application);
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${application.position}" at "${application.company}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("applications").delete().eq("id", application.id);
    if (error) {
      alert(error.message);
      return;
    }
    onDeleted(application.id);
  }

  return (
    <div className="w-64 shrink-0 rounded-lg border border-border-subtle bg-surface-raised p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-primary">{application.position}</p>
          <p className="truncate text-xs text-ink-tertiary">{application.company}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit application"
            className="rounded-md p-1 text-ink-tertiary transition-colors hover:bg-surface-overlay hover:text-ink-primary"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete application"
            className="rounded-md p-1 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {(application.location || application.salary) && (
        <p className="mt-1.5 font-mono text-[11px] text-ink-tertiary">
          {[application.location, application.salary].filter(Boolean).join(" · ")}
        </p>
      )}
      {application.next_action && (
        <p className="mt-1.5 text-xs text-ink-secondary">→ {application.next_action}</p>
      )}

      <Select
        value={application.status}
        onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
        options={STATUS_OPTIONS}
        disabled={updatingStatus}
        className="mt-2.5 !py-1.5 text-xs"
      />

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit application">
        <ApplicationForm
          application={application}
          onSaved={(a) => {
            onSaved(a);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
