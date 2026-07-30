"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { CertificationForm } from "@/components/career/CertificationForm";
import { cn } from "@/lib/utils";
import type { Certification } from "@/types/database.types";

const STATUS_STYLE: Record<Certification["status"], string> = {
  planned: "border-border-strong text-ink-tertiary",
  studying: "border-signal/40 text-signal",
  scheduled: "border-seal/40 text-seal",
  passed: "border-status-onTrack/40 text-status-onTrack",
  failed: "border-status-atRisk/40 text-status-atRisk",
  expired: "border-status-atRisk/40 text-status-atRisk",
};

const STATUS_LABEL: Record<Certification["status"], string> = {
  planned: "Planned",
  studying: "Studying",
  scheduled: "Scheduled",
  passed: "Passed",
  failed: "Failed",
  expired: "Expired",
};

export function CertificationCard({
  certification,
  onSaved,
  onDeleted,
}: {
  certification: Certification;
  onSaved: (c: Certification) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${certification.name}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("certifications").delete().eq("id", certification.id);
    if (error) {
      alert(error.message);
      return;
    }
    onDeleted(certification.id);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-primary">{certification.name}</p>
          {certification.provider && <p className="mt-0.5 text-xs text-ink-tertiary">{certification.provider}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", STATUS_STYLE[certification.status])}>
            {STATUS_LABEL[certification.status]}
          </span>
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit certification"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete certification"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-xs text-ink-secondary">
          <span>{certification.progress}% complete</span>
          {certification.exam_date && <span>Exam {new Date(certification.exam_date).toLocaleDateString()}</span>}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-signal" style={{ width: `${certification.progress}%` }} />
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit certification">
        <CertificationForm
          certification={certification}
          onSaved={(c) => {
            onSaved(c);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
