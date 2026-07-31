"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { Modal } from "@/components/ui/Modal";
import { LsatStatsOverview } from "@/components/graduateLawSchool/LsatStatsOverview";
import { LsatPracticeTestCard } from "@/components/graduateLawSchool/LsatPracticeTestCard";
import { LsatPracticeTestForm } from "@/components/graduateLawSchool/LsatPracticeTestForm";
import type { LsatGoals } from "@/components/graduateLawSchool/LsatGoalForm";
import type { LsatPracticeTest } from "@/types/database.types";

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

  return (
    <div>
      <WorkspaceHeader
        eyebrow="GRADUATE & LAW SCHOOL // LSAT"
        title="LSAT"
        hideDots
        subtitle="Goal tracking and a practice test log — no manual score averaging required."
      />

      <div className="space-y-8 px-4 py-6 md:px-8">
        <LsatStatsOverview goals={goals} practiceTests={practiceTests} onGoalsSaved={setGoals} />

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-primary">Practice Tests</h2>
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
            >
              <Plus className="h-3.5 w-3.5" />
              Log practice test
            </button>
          </div>
          {practiceTests.length === 0 ? (
            <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
              <p className="text-sm text-ink-secondary">No practice tests logged yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
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
        </section>
      </div>
    </div>
  );
}
