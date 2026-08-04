"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { LsatStudyPlanSuggestion, SuggestedMilestone } from "@/types/database.types";

const CONFIDENCE_COLOR: Record<LsatStudyPlanSuggestion["confidence"], string> = {
  high: "text-status-onTrack",
  medium: "text-seal",
  low: "text-status-atRisk",
};

// Same review discipline as Syllabus Intelligence: every item is
// accepted, edited-then-accepted, or dismissed individually. There's no
// "accept all" and nothing is ever written to milestones automatically --
// this modal's own generation call already ran by the time it opens
// (triggered from LsatClient), it only handles the review step.
export function LsatStudyPlanReviewModal({
  open,
  onClose,
  loading,
  error,
  initialSuggestions,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string | null;
  initialSuggestions: LsatStudyPlanSuggestion[];
}) {
  const supabase = createClient();
  const [suggestions, setSuggestions] = useState<LsatStudyPlanSuggestion[]>(initialSuggestions);
  const [edits, setEdits] = useState<Record<string, SuggestedMilestone>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setSuggestions(initialSuggestions);
    setEdits({});
  }, [initialSuggestions]);

  function getFields(s: LsatStudyPlanSuggestion): SuggestedMilestone {
    return edits[s.id] ?? s.recommendation;
  }

  function updateField(s: LsatStudyPlanSuggestion, patch: Partial<SuggestedMilestone>) {
    setEdits((prev) => ({ ...prev, [s.id]: { ...getFields(s), ...patch } }));
  }

  async function handleAccept(s: LsatStudyPlanSuggestion) {
    const fields = getFields(s);
    const wasEdited =
      fields.title !== s.recommendation.title ||
      fields.target_date !== s.recommendation.target_date ||
      fields.notes !== s.recommendation.notes;

    const { error: insertError } = await supabase.from("milestones").insert({
      title: fields.title,
      target_date: fields.target_date || null,
      notes: fields.notes || null,
      status: "upcoming",
      progress: 0,
      linked_href: "/academics/graduate-law-school/lsat",
    });
    if (insertError) {
      setLocalError(insertError.message);
      return;
    }

    await supabase
      .from("lsat_study_plan_suggestions")
      .update({ status: wasEdited ? "edited_and_accepted" : "accepted", resolved_at: new Date().toISOString() })
      .eq("id", s.id);

    setSuggestions((prev) => prev.filter((item) => item.id !== s.id));
  }

  async function handleDismiss(s: LsatStudyPlanSuggestion) {
    await supabase
      .from("lsat_study_plan_suggestions")
      .update({ status: "dismissed", resolved_at: new Date().toISOString() })
      .eq("id", s.id);
    setSuggestions((prev) => prev.filter((item) => item.id !== s.id));
  }

  return (
    <Modal open={open} onClose={onClose} title="Review study plan">
      {loading && <p className="py-8 text-center text-sm text-ink-tertiary">Building a plan from your practice history…</p>}

      {!loading && (error || localError) && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error ?? localError}
        </p>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-secondary">
          Nothing left to review — every proposed task has been accepted or dismissed.
        </p>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-ink-tertiary">
            Nothing here is added to your milestones until you accept it. Edit any field first if a task needs adjusting.
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
                  <Input label="Task" value={fields.title} onChange={(e) => updateField(s, { title: e.target.value })} />
                  <Input
                    label="Target date"
                    type="date"
                    value={fields.target_date ?? ""}
                    onChange={(e) => updateField(s, { target_date: e.target.value || null })}
                  />
                </div>
                <div className="mt-3">
                  <Input
                    label="Notes (optional)"
                    value={fields.notes ?? ""}
                    onChange={(e) => updateField(s, { notes: e.target.value || null })}
                  />
                </div>

                <p className="mt-3 text-xs text-ink-secondary">{s.reason}</p>

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
