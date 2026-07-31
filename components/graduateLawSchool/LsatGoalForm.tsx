"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface LsatGoals {
  lsat_goal_score: number | null;
  lsat_diagnostic_score: number | null;
  lsat_planned_test_date: string | null;
}

export function LsatGoalForm({
  goals,
  onSaved,
  onCancel,
}: {
  goals: LsatGoals;
  onSaved: (goals: LsatGoals) => void;
  onCancel: () => void;
}) {
  const supabase = createClient();
  const [goalScore, setGoalScore] = useState(String(goals.lsat_goal_score ?? ""));
  const [diagnosticScore, setDiagnosticScore] = useState(String(goals.lsat_diagnostic_score ?? ""));
  const [plannedTestDate, setPlannedTestDate] = useState(goals.lsat_planned_test_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const payload = {
      lsat_goal_score: goalScore ? Number(goalScore) : null,
      lsat_diagnostic_score: diagnosticScore ? Number(diagnosticScore) : null,
      lsat_planned_test_date: plannedTestDate || null,
    };

    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", userData.user!.id)
      .select("lsat_goal_score, lsat_diagnostic_score, lsat_planned_test_date")
      .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as LsatGoals);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Goal score" type="number" min={120} max={180} value={goalScore} onChange={(e) => setGoalScore(e.target.value)} />
        <Input
          label="Diagnostic score"
          type="number"
          min={120}
          max={180}
          value={diagnosticScore}
          onChange={(e) => setDiagnosticScore(e.target.value)}
        />
      </div>
      <Input
        label="Planned test date"
        type="date"
        value={plannedTestDate}
        onChange={(e) => setPlannedTestDate(e.target.value)}
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
