"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { MilestoneForm } from "@/components/graduateLawSchool/MilestoneForm";
import { cn, formatDateOnly } from "@/lib/utils";
import type { Milestone, MilestoneStatus } from "@/types/database.types";

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_CLASS: Record<MilestoneStatus, string> = {
  upcoming: "border-border-strong text-ink-tertiary",
  in_progress: "border-seal/40 text-seal",
  completed: "border-signal/40 text-signal",
};

export function MilestoneRow({
  milestone,
  nextSortOrder,
  onSaved,
  onDeleted,
}: {
  milestone: Milestone;
  nextSortOrder: number;
  onSaved: (milestone: Milestone) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${milestone.title}"?`);
    if (!confirmed) return;
    const { error } = await supabase.from("milestones").delete().eq("id", milestone.id);
    if (error) {
      alert(error.message);
      return;
    }
    onDeleted(milestone.id);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-primary">{milestone.title}</p>
          {milestone.target_date && (
            <p className="mt-0.5 text-xs text-ink-tertiary">{formatDateOnly(milestone.target_date)}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", STATUS_CLASS[milestone.status])}>
            {STATUS_LABEL[milestone.status]}
          </span>
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit milestone"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete milestone"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-signal" style={{ width: `${milestone.progress}%` }} />
      </div>

      {milestone.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-ink-tertiary">{milestone.notes}</p>}

      {milestone.linked_href && (
        <Link
          href={milestone.linked_href}
          className="mt-2 inline-flex items-center gap-1 text-xs text-signal hover:text-signal-bright"
        >
          Go to workspace
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit milestone">
        <MilestoneForm
          milestone={milestone}
          nextSortOrder={nextSortOrder}
          onSaved={(m) => {
            onSaved(m);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
