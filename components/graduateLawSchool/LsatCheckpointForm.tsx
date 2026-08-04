"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { LsatGoalCheckpoint } from "@/types/database.types";

export function LsatCheckpointForm({
  checkpoint,
  onSaved,
  onCancel,
}: {
  checkpoint?: LsatGoalCheckpoint | null;
  onSaved: (checkpoint: LsatGoalCheckpoint) => void;
  onCancel: () => void;
}) {
  const supabase = createClient();
  const [targetDate, setTargetDate] = useState(checkpoint?.target_date ?? "");
  const [targetScore, setTargetScore] = useState(String(checkpoint?.target_score ?? ""));
  const [label, setLabel] = useState(checkpoint?.label ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const payload = {
      target_date: targetDate,
      target_score: Number(targetScore),
      label: label || null,
    };

    const { data, error } = checkpoint
      ? await supabase.from("lsat_goal_checkpoints").update(payload).eq("id", checkpoint.id).select().single()
      : await supabase
          .from("lsat_goal_checkpoints")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as LsatGoalCheckpoint);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Target date" type="date" required value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        <Input
          label="Target score"
          type="number"
          required
          min={120}
          max={180}
          value={targetScore}
          onChange={(e) => setTargetScore(e.target.value)}
        />
      </div>
      <Input
        label="Label (optional)"
        placeholder="e.g. After the logic games drilling block"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      {error && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
