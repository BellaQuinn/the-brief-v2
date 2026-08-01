"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { CertificationForm } from "@/components/career/CertificationForm";
import { cn } from "@/lib/utils";
import type { Certification } from "@/types/database.types";

const STATUS_STYLE: Record<Certification["status"], string> = {
  planned: "text-ink-tertiary",
  studying: "text-signal",
  scheduled: "text-seal",
  passed: "text-status-onTrack",
  failed: "text-status-atRisk",
  expired: "text-status-atRisk",
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
  index,
  onSaved,
  onDeleted,
}: {
  certification: Certification;
  index: number;
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
    <div className="relative py-4 pl-9">
      <span aria-hidden className="trace-node" />
      <span aria-hidden className="trace-connector" />
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)] md:items-center">
        <div className="flex items-start gap-3">
          <span className="font-mono text-[8px] text-accent/80">{String(index).padStart(2, "0")}</span>
          <div>
          <p className="text-sm font-medium text-ink-primary">{certification.name}</p>
          {certification.provider && <p className="mt-0.5 text-xs text-ink-tertiary">{certification.provider}</p>}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
          <span className={cn("font-mono text-[9px] uppercase tracking-wide", STATUS_STYLE[certification.status])}>
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
        <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary">
          <span>{certification.progress}% complete</span>
          {certification.exam_date && <span>Exam {new Date(certification.exam_date).toLocaleDateString()}</span>}
        </div>
        <div className="relative mt-2 h-3">
          <div className="absolute inset-x-0 top-1.5 h-px bg-border-strong" />
          <div
            aria-hidden
            className="absolute left-0 top-1.5 h-px bg-signal shadow-[0_0_8px_rgba(16,185,129,0.35)]"
            style={{ width: `${certification.progress}%` }}
          />
          <div
            aria-hidden
            className="absolute top-0 h-3 w-px -translate-x-1/2 bg-signal"
            style={{ left: `${certification.progress}%` }}
          />
        </div>
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
