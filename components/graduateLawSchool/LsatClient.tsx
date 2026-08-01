"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { Modal } from "@/components/ui/Modal";
import { LsatStatsOverview } from "@/components/graduateLawSchool/LsatStatsOverview";
import { LsatPracticeTestCard } from "@/components/graduateLawSchool/LsatPracticeTestCard";
import { LsatPracticeTestForm } from "@/components/graduateLawSchool/LsatPracticeTestForm";
import type { LsatGoals } from "@/components/graduateLawSchool/LsatGoalForm";
import type { LsatPracticeTest } from "@/types/database.types";
import { latestScore, remainingToGoal } from "@/lib/lsat";
import { buildLsatWorkspaceBrief } from "@/lib/workspaceBriefs";

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

export function LsatClient({
  initialGoals,
  initialPracticeTests,
}: {
  initialGoals: LsatGoals;
  initialPracticeTests: LsatPracticeTest[];
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [practiceTests, setPracticeTests] = useState(
    [...initialPracticeTests].sort((a, b) => b.test_date.localeCompare(a.test_date))
  );
  const [adding, setAdding] = useState(false);

  function handleTestSaved(test: LsatPracticeTest) {
    setPracticeTests((prev) => upsertById(prev, test).sort((a, b) => b.test_date.localeCompare(a.test_date)));
  }

  const latest = latestScore(practiceTests);
  const remaining = remainingToGoal(latest, goals.lsat_goal_score);
  const brief = buildLsatWorkspaceBrief({
    goal: goals.lsat_goal_score,
    latest,
    remaining,
    testCount: practiceTests.length,
    hasPlannedDate: goals.lsat_planned_test_date != null,
  });

  return (
    <div>
      <WorkspaceBrief
        eyebrow="Graduate & Law School // LSAT"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${practiceTests.length} test${practiceTests.length === 1 ? "" : "s"} logged`}
        action={
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 border border-accent/30 bg-accent-dim/50 px-3 py-2 text-xs font-medium text-accent-bright transition-colors hover:border-accent/60 hover:bg-accent-dim"
          >
            <Plus className="h-3.5 w-3.5" />
            Log practice test
          </button>
        }
      />

      <div className="space-y-8 px-4 py-6 md:px-8">
        <LsatStatsOverview goals={goals} practiceTests={practiceTests} onGoalsSaved={setGoals} />

        <WorkspaceSection eyebrow="Performance record" title="Practice test history">
          {practiceTests.length === 0 ? (
            <div className="border-y border-border-subtle px-6 py-10 text-center">
              <p className="text-sm text-ink-secondary">No practice tests logged.</p>
              <p className="mt-1 text-xs text-ink-tertiary">Log a scored test when you have one; no trend is inferred without data.</p>
            </div>
          ) : (
            <div className="border-y border-border-subtle">
              {practiceTests.map((t) => (
                <LsatPracticeTestCard
                  key={t.id}
                  test={t}
                  onSaved={handleTestSaved}
                  onDeleted={(id) => setPracticeTests((prev) => prev.filter((item) => item.id !== id))}
                />
              ))}
            </div>
          )}
          <Modal open={adding} onClose={() => setAdding(false)} title="Log practice test">
            <LsatPracticeTestForm
              onSaved={(t) => {
                handleTestSaved(t);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          </Modal>
        </WorkspaceSection>
      </div>
    </div>
  );
}
