"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { AssignmentType, DocumentSuggestion, PriorityLevel, SuggestedAssignment } from "@/types/database.types";

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

const PRIORITY_OPTIONS: { value: PriorityLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const CONFIDENCE_COLOR: Record<DocumentSuggestion["confidence"], string> = {
  high: "text-status-onTrack",
  medium: "text-seal",
  low: "text-status-atRisk",
};

function recommendationsEqual(a: SuggestedAssignment, b: SuggestedAssignment): boolean {
  return (
    a.title === b.title &&
    a.type === b.type &&
    a.due_date === b.due_date &&
    a.points_possible === b.points_possible &&
    a.weight_percent === b.weight_percent &&
    a.priority === b.priority
  );
}

// Every suggestion is reviewed one at a time -- Accept always commits
// whatever's currently in the fields (edited or not), Dismiss discards it.
// There's no "accept all": the Bible's AI Trust Controls require individual
// user approval, not a bulk shortcut that defeats the point of review.
export function SuggestionReviewModal({
  documentId,
  courseId,
  onClose,
}: {
  documentId: string | null;
  courseId: string | null;
  onClose: () => void;
}) {
  const supabase = createClient();
  const [suggestions, setSuggestions] = useState<DocumentSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, SuggestedAssignment>>({});

  useEffect(() => {
    if (!documentId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const { data: existing } = await supabase
        .from("document_suggestions")
        .select("*")
        .eq("document_id", documentId)
        .eq("status", "pending");

      if (existing && existing.length > 0) {
        if (!cancelled) {
          setSuggestions(existing);
          setLoading(false);
        }
        return;
      }

      const res = await fetch("/api/documents/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const body = await res.json();
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setError(body.error ?? "Extraction failed.");
        return;
      }
      setSuggestions(body.suggestions ?? []);
    })();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  function getFields(s: DocumentSuggestion): SuggestedAssignment {
    return edits[s.id] ?? s.recommendation;
  }

  function updateField(s: DocumentSuggestion, patch: Partial<SuggestedAssignment>) {
    setEdits((prev) => ({ ...prev, [s.id]: { ...getFields(s), ...patch } }));
  }

  async function handleAccept(s: DocumentSuggestion) {
    if (!courseId) return;
    const fields = getFields(s);
    const wasEdited = !recommendationsEqual(fields, s.recommendation);

    const { error: insertError } = await supabase.from("assignments").insert({
      course_id: courseId,
      title: fields.title,
      type: fields.type,
      // due_date is timestamptz; anchor at noon UTC so a plain YYYY-MM-DD
      // pick never rolls back a day for a negative-UTC-offset reader (the
      // exact bug AssignmentForm.tsx already had to fix once).
      due_date: fields.due_date ? `${fields.due_date}T12:00:00.000Z` : null,
      points_possible: fields.points_possible,
      weight_percent: fields.weight_percent,
      priority: fields.priority,
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }

    await supabase
      .from("document_suggestions")
      .update({ status: wasEdited ? "edited_and_accepted" : "accepted", resolved_at: new Date().toISOString() })
      .eq("id", s.id);

    setSuggestions((prev) => prev.filter((item) => item.id !== s.id));
  }

  async function handleDismiss(s: DocumentSuggestion) {
    await supabase
      .from("document_suggestions")
      .update({ status: "dismissed", resolved_at: new Date().toISOString() })
      .eq("id", s.id);
    setSuggestions((prev) => prev.filter((item) => item.id !== s.id));
  }

  return (
    <Modal open={Boolean(documentId)} onClose={onClose} title="Review extracted assignments">
      {loading && <p className="py-8 text-center text-sm text-ink-tertiary">Reading the syllabus…</p>}

      {!loading && error && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error}
        </p>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-secondary">
          Nothing to review — no assignments were confidently identified in this document.
        </p>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-ink-tertiary">
            Nothing here is added until you accept it. Edit any field before accepting if the extraction got something
            wrong.
          </p>
          {suggestions.map((s) => {
            const fields = getFields(s);
            return (
              <div key={s.id} className="rounded-card border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className={cn("font-mono text-[10px] uppercase tracking-wide", CONFIDENCE_COLOR[s.confidence])}>
                    {s.confidence} confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input label="Title" value={fields.title} onChange={(e) => updateField(s, { title: e.target.value })} />
                  <Select
                    label="Type"
                    value={fields.type}
                    onChange={(e) => updateField(s, { type: e.target.value as AssignmentType })}
                    options={TYPE_OPTIONS}
                  />
                  <Input
                    label="Due date"
                    type="date"
                    value={fields.due_date ?? ""}
                    onChange={(e) => updateField(s, { due_date: e.target.value || null })}
                  />
                  <Select
                    label="Priority"
                    value={fields.priority}
                    onChange={(e) => updateField(s, { priority: e.target.value as PriorityLevel })}
                    options={PRIORITY_OPTIONS}
                  />
                  <Input
                    label="Points possible"
                    type="number"
                    value={fields.points_possible ?? ""}
                    onChange={(e) => updateField(s, { points_possible: e.target.value ? Number(e.target.value) : null })}
                  />
                  <Input
                    label="Weight %"
                    type="number"
                    value={fields.weight_percent ?? ""}
                    onChange={(e) => updateField(s, { weight_percent: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>

                <p className="mt-3 text-xs text-ink-secondary">{s.reason}</p>
                {s.evidence && (
                  <p className="mt-1.5 border-l-2 border-border-subtle pl-2.5 text-xs italic text-ink-tertiary">
                    "{s.evidence}"
                  </p>
                )}

                <div className="mt-3 flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => handleDismiss(s)}>
                    Dismiss
                  </Button>
                  <Button type="button" onClick={() => handleAccept(s)}>
                    Accept
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
