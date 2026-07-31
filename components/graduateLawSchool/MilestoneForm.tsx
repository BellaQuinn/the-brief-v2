"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Milestone, MilestoneStatus } from "@/types/database.types";

const STATUS_OPTIONS: { value: MilestoneStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

interface MilestoneFormProps {
  milestone?: Milestone | null;
  nextSortOrder: number;
  onSaved: (milestone: Milestone) => void;
  onCancel: () => void;
}

export function MilestoneForm({ milestone, nextSortOrder, onSaved, onCancel }: MilestoneFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState(milestone?.title ?? "");
  const [targetDate, setTargetDate] = useState(milestone?.target_date ?? "");
  const [status, setStatus] = useState<MilestoneStatus>(milestone?.status ?? "upcoming");
  const [progress, setProgress] = useState(String(milestone?.progress ?? "0"));
  const [notes, setNotes] = useState(milestone?.notes ?? "");
  const [linkedHref, setLinkedHref] = useState(milestone?.linked_href ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const payload = {
      title,
      target_date: targetDate || null,
      status,
      progress: Number(progress) || 0,
      notes: notes || null,
      linked_href: linkedHref || null,
    };

    const { data, error } = milestone
      ? await supabase.from("milestones").update(payload).eq("id", milestone.id).select().single()
      : await supabase
          .from("milestones")
          .insert({ ...payload, sort_order: nextSortOrder, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as Milestone);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Milestone" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Target date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
          options={STATUS_OPTIONS}
        />
      </div>
      <Input
        label="Progress (%)"
        type="number"
        min={0}
        max={100}
        value={progress}
        onChange={(e) => setProgress(e.target.value)}
      />
      <Input
        label="Link (optional)"
        placeholder="/academics/graduate-law-school/lsat"
        value={linkedHref}
        onChange={(e) => setLinkedHref(e.target.value)}
      />
      <Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

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
