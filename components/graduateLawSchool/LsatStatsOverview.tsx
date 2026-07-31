"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LsatGoalForm, type LsatGoals } from "@/components/graduateLawSchool/LsatGoalForm";
import { daysUntilTest, highestScore, improvement, latestScore, remainingToGoal } from "@/lib/lsat";
import { formatDateOnly } from "@/lib/utils";
import type { LsatPracticeTest } from "@/types/database.types";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-surface px-4 py-3">
      <p className="eyebrow mb-1.5">{label}</p>
      <p className="font-display text-lg font-medium text-ink-primary">{value}</p>
    </div>
  );
}

export function LsatStatsOverview({
  goals,
  practiceTests,
  onGoalsSaved,
}: {
  goals: LsatGoals;
  practiceTests: LsatPracticeTest[];
  onGoalsSaved: (goals: LsatGoals) => void;
}) {
  const [editing, setEditing] = useState(false);

  const latest = latestScore(practiceTests);
  const highest = highestScore(practiceTests);
  const improvementValue = improvement(latest, goals.lsat_diagnostic_score);
  const remaining = remainingToGoal(latest, goals.lsat_goal_score);
  const daysUntil = daysUntilTest(goals.lsat_planned_test_date);

  const fmt = (n: number | null, suffix = "") => (n === null ? "—" : `${n}${suffix}`);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink-primary">LSAT Overview</h2>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit goals
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Goal score" value={fmt(goals.lsat_goal_score)} />
        <Stat label="Latest score" value={fmt(latest)} />
        <Stat label="Highest score" value={fmt(highest)} />
        <Stat label="Diagnostic score" value={fmt(goals.lsat_diagnostic_score)} />
        <Stat label="Improvement" value={improvementValue === null ? "—" : improvementValue >= 0 ? `+${improvementValue}` : String(improvementValue)} />
        <Stat label="Remaining points" value={fmt(remaining)} />
        <Stat label="Planned test date" value={goals.lsat_planned_test_date ? formatDateOnly(goals.lsat_planned_test_date) : "—"} />
        <Stat label="Days until test" value={fmt(daysUntil)} />
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit LSAT goals">
        <LsatGoalForm
          goals={goals}
          onSaved={(g) => {
            onGoalsSaved(g);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
