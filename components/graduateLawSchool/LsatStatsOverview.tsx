"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { LsatGoalForm, type LsatGoals } from "@/components/graduateLawSchool/LsatGoalForm";
import { daysUntilTest, highestScore, improvement, latestScore, remainingToGoal } from "@/lib/lsat";
import { formatDateOnly } from "@/lib/utils";
import type { LsatPracticeTest } from "@/types/database.types";

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

  const scoredTests = [...practiceTests]
    .filter((test): test is LsatPracticeTest & { scaled_score: number } => test.scaled_score != null)
    .sort((a, b) => a.test_date.localeCompare(b.test_date));
  const chartPoints = scoredTests.map((test, index) => ({
    test,
    x: scoredTests.length === 1 ? 360 : 48 + (index / (scoredTests.length - 1)) * 624,
    y: 20 + (1 - (test.scaled_score - 120) / 60) * 132,
  }));
  const pathData = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const goalY = goals.lsat_goal_score == null ? null : 20 + (1 - (goals.lsat_goal_score - 120) / 60) * 132;

  return (
    <WorkspaceSection
      eyebrow="Score trajectory"
      title="Current position and test window"
      action={
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit goals
        </button>
      }
    >
      <div className="signal-field">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_230px]">
          <div className="relative px-1 py-6 md:px-6 md:py-7">
            <div className="flex flex-wrap items-end justify-between gap-6 px-4 md:px-0">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-eyebrow text-signal/75">Latest logged score</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-6xl font-bold leading-none tabular-nums text-ink-primary">{latest ?? "—"}</span>
                  {goals.lsat_goal_score != null && (
                    <span className="font-mono text-xs text-ink-tertiary">/ {goals.lsat_goal_score} goal</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-ink-secondary">
                  {latest == null
                    ? "No scored practice test is available yet."
                    : remaining === 0
                      ? "The latest result meets the current goal."
                      : goals.lsat_goal_score == null
                        ? "Set a goal to measure what this score means."
                        : `${remaining} point${remaining === 1 ? "" : "s"} between the latest result and the goal.`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-right">
                <Metric label="Highest" value={highest} />
                <Metric label="Diagnostic" value={goals.lsat_diagnostic_score} />
                <Metric
                  label="Change"
                  value={improvementValue == null ? null : improvementValue >= 0 ? `+${improvementValue}` : improvementValue}
                />
                <Metric label="Tests" value={practiceTests.length} />
              </div>
            </div>

            <div className="relative mt-6 overflow-hidden px-1">
              {chartPoints.length > 0 ? (
                <svg
                  viewBox="0 0 720 190"
                  className="h-auto w-full min-w-[320px]"
                  role="img"
                  aria-label={`Practice test score trajectory from ${scoredTests[0]?.scaled_score} to ${latest}`}
                >
                  {[20, 86, 152].map((y) => (
                    <line key={y} x1="48" x2="672" y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                  ))}
                  <text x="8" y="24" className="fill-ink-tertiary font-mono text-[9px]">180</text>
                  <text x="8" y="90" className="fill-ink-tertiary font-mono text-[9px]">150</text>
                  <text x="8" y="156" className="fill-ink-tertiary font-mono text-[9px]">120</text>
                  {goalY != null && (
                    <>
                      <line x1="48" x2="672" y1={goalY} y2={goalY} stroke="currentColor" className="text-accent" strokeWidth="1" strokeDasharray="5 7" />
                      <text x="668" y={goalY - 7} textAnchor="end" className="fill-accent font-mono text-[9px] uppercase">Goal {goals.lsat_goal_score}</text>
                    </>
                  )}
                  {pathData && <path d={pathData} fill="none" stroke="currentColor" className="text-signal" strokeWidth="2" />}
                  {chartPoints.map((point, index) => {
                    const isLatest = index === chartPoints.length - 1;
                    return (
                      <g key={point.test.id}>
                        {isLatest && <circle cx={point.x} cy={point.y} r="11" fill="rgba(16,185,129,0.12)" />}
                        <circle cx={point.x} cy={point.y} r={isLatest ? 5 : 3.5} className={isLatest ? "fill-signal" : "fill-ink-secondary"} />
                        <text x={point.x} y={point.y - 11} textAnchor="middle" className="fill-ink-primary font-mono text-[10px] font-semibold">
                          {point.test.scaled_score}
                        </text>
                      </g>
                    );
                  })}
                  <text x="48" y="184" className="fill-ink-tertiary font-mono text-[9px]">{formatDateOnly(scoredTests[0]!.test_date)}</text>
                  <text x="672" y="184" textAnchor="end" className="fill-ink-tertiary font-mono text-[9px]">
                    {formatDateOnly(scoredTests[scoredTests.length - 1]!.test_date)}
                  </text>
                </svg>
              ) : (
                <div className="flex h-40 items-center justify-center border-y border-border-subtle text-xs text-ink-tertiary">
                  No scored tests to plot.
                </div>
              )}
            </div>
          </div>

          <aside className="relative flex min-h-[260px] flex-col justify-between border-t border-border-subtle px-6 py-7 lg:border-l lg:border-t-0">
            <div aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-accent via-accent/20 to-transparent" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent/80">Test window</p>
              <p className="mt-8 font-mono text-6xl font-bold leading-none tabular-nums text-ink-primary">
                {daysUntil == null ? "—" : Math.abs(daysUntil)}
              </p>
              <p className="mt-2 text-xs text-ink-secondary">
                {daysUntil == null
                  ? "No planned test date"
                  : daysUntil < 0
                    ? `day${Math.abs(daysUntil) === 1 ? "" : "s"} elapsed since the planned date`
                    : daysUntil === 0
                      ? "Test day"
                      : `day${daysUntil === 1 ? "" : "s"} remaining`}
              </p>
            </div>
            <div className="border-t border-border-subtle pt-4">
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink-tertiary">Scheduled</p>
              <p className="mt-1 text-sm text-ink-primary">
                {goals.lsat_planned_test_date ? formatDateOnly(goals.lsat_planned_test_date) : "Not scheduled"}
              </p>
            </div>
          </aside>
          </div>
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
    </WorkspaceSection>
  );
}

function Metric({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">{label}</p>
      <p className="mt-1 font-mono text-base font-semibold tabular-nums text-ink-primary">{value ?? "—"}</p>
    </div>
  );
}
