"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { LsatCheckpointForm } from "@/components/graduateLawSchool/LsatCheckpointForm";
import { sortCheckpoints } from "@/lib/lsat";
import { formatDateOnly } from "@/lib/utils";
import type { LsatGoalCheckpoint } from "@/types/database.types";

// Checkpoints are managed here; LsatStatsOverview only reads them to plot
// the planned-path line -- one owner of the CRUD, one read-only consumer,
// same split already used between LsatClient and the goal chart.
export function LsatCheckpointList({
  checkpoints,
  onChange,
}: {
  checkpoints: LsatGoalCheckpoint[];
  onChange: (next: LsatGoalCheckpoint[]) => void;
}) {
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function upsert(row: LsatGoalCheckpoint) {
    const exists = checkpoints.some((c) => c.id === row.id);
    onChange(exists ? checkpoints.map((c) => (c.id === row.id ? row : c)) : [...checkpoints, row]);
  }

  async function handleDelete(checkpoint: LsatGoalCheckpoint) {
    const confirmed = window.confirm(
      `Delete the ${checkpoint.target_score} checkpoint for ${formatDateOnly(checkpoint.target_date)}?`
    );
    if (!confirmed) return;
    const { error } = await supabase.from("lsat_goal_checkpoints").delete().eq("id", checkpoint.id);
    if (error) {
      alert(error.message);
      return;
    }
    onChange(checkpoints.filter((c) => c.id !== checkpoint.id));
  }

  const sorted = sortCheckpoints(checkpoints);
  const editing = sorted.find((c) => c.id === editingId) ?? null;

  return (
    <WorkspaceSection
      eyebrow="Goal-gap plan"
      title="Checkpoints toward the goal"
      action={
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright"
        >
          <Plus className="h-3.5 w-3.5" />
          Add checkpoint
        </button>
      }
    >
      {sorted.length === 0 ? (
        <div className="border-y border-border-subtle px-6 py-8 text-center">
          <p className="text-sm text-ink-secondary">No checkpoints planned yet.</p>
          <p className="mt-1 text-xs text-ink-tertiary">
            Break the goal into dated targets (e.g. "158 by September 15") to see a planned path on the chart above.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle border-y border-border-subtle">
          {sorted.map((checkpoint) => (
            <div key={checkpoint.id} className="group flex items-center justify-between gap-4 px-1 py-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold tabular-nums text-ink-primary">
                  {checkpoint.target_score} <span className="text-ink-tertiary">by {formatDateOnly(checkpoint.target_date)}</span>
                </p>
                {checkpoint.label && <p className="mt-0.5 text-xs text-ink-tertiary">{checkpoint.label}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  onClick={() => setEditingId(checkpoint.id)}
                  aria-label="Edit checkpoint"
                  className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(checkpoint)}
                  aria-label="Delete checkpoint"
                  className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add checkpoint">
        <LsatCheckpointForm
          onSaved={(c) => {
            upsert(c);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
      <Modal open={editing != null} onClose={() => setEditingId(null)} title="Edit checkpoint">
        {editing && (
          <LsatCheckpointForm
            checkpoint={editing}
            onSaved={(c) => {
              upsert(c);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Modal>
    </WorkspaceSection>
  );
}
