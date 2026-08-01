"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Assignment, AssignmentStatus, AssignmentType, PriorityLevel } from "@/types/database.types";

const TYPE_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: "homework", label: "Homework" },
  { value: "quiz", label: "Quiz" },
  { value: "exam", label: "Exam" },
  { value: "paper", label: "Paper" },
  { value: "project", label: "Project" },
  { value: "discussion", label: "Discussion" },
  { value: "reading", label: "Reading" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS: { value: AssignmentStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "graded", label: "Graded" },
];

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface AssignmentFormProps {
  courseId: string;
  assignment?: Assignment | null;
  onSaved: (assignment: Assignment) => void;
  onCancel: () => void;
}

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function AssignmentForm({ courseId, assignment, onSaved, onCancel }: AssignmentFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState(assignment?.title ?? "");
  const [description, setDescription] = useState(assignment?.description ?? "");
  const [type, setType] = useState<AssignmentType>(assignment?.type ?? "homework");
  const [dueDate, setDueDate] = useState(toDateInputValue(assignment?.due_date ?? null));
  const [pointsPossible, setPointsPossible] = useState(String(assignment?.points_possible ?? ""));
  const [pointsEarned, setPointsEarned] = useState(String(assignment?.points_earned ?? ""));
  const [status, setStatus] = useState<AssignmentStatus>(assignment?.status ?? "not_started");
  const [priority, setPriority] = useState<PriorityLevel>(assignment?.priority ?? "medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState(String(assignment?.estimated_minutes ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title,
      description: description || null,
      type,
      // due_date is `timestamptz`, but this field only collects a plain
      // calendar date (no time). Storing it at literal UTC midnight rolls
      // back a day for any negative-UTC-offset reader (e.g. entering
      // "Jul 30" would read back as "Jul 29" in US timezones) — the exact
      // bug this project has already fixed for plain `date` columns
      // elsewhere. Anchoring at noon UTC keeps the calendar date stable
      // across every real-world offset (-12 to +14) without needing to
      // know the operator's timezone here.
      due_date: dueDate ? `${dueDate}T12:00:00.000Z` : null,
      points_possible: pointsPossible ? Number(pointsPossible) : null,
      points_earned: pointsEarned ? Number(pointsEarned) : null,
      status,
      priority,
      estimated_minutes: estimatedMinutes ? Number(estimatedMinutes) : null,
    };

    const { data, error } = assignment
      ? await supabase.from("assignments").update(payload).eq("id", assignment.id).select().single()
      : await supabase.from("assignments").insert({ ...payload, course_id: courseId }).select().single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as Assignment);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value as AssignmentType)} options={TYPE_OPTIONS} />
        <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as PriorityLevel)}
          options={PRIORITY_OPTIONS}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Points possible"
          type="number"
          min={0}
          value={pointsPossible}
          onChange={(e) => setPointsPossible(e.target.value)}
        />
        <Input
          label="Points earned"
          type="number"
          min={0}
          value={pointsEarned}
          onChange={(e) => setPointsEarned(e.target.value)}
        />
      </div>
      <div>
        <Input
          label="Estimated time (minutes)"
          type="number"
          min={0}
          step={5}
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(e.target.value)}
        />
        <p className="mt-1 text-xs text-ink-tertiary">Powers Planner's workload estimate — leave blank if unknown.</p>
      </div>
      <Textarea label="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />

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
