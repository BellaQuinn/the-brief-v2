"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { LsatGoalForm, type LsatGoals } from "@/components/graduateLawSchool/LsatGoalForm";
import { daysUntilTest, highestScore, improvement, latestScore, remainingToGoal, sectionAverages } from "@/lib/lsat";
import { formatDateOnly, cn } from "@/lib/utils";
import type { LsatGoalCheckpoint, LsatPracticeTest } from "@/types/database.types";

// Shared date-based x-axis so real test results and planned checkpoints
// plot on one honest timeline -- the previous version spaced test points
// by index, which silently misrepresented uneven gaps between sittings.
function xForDate(dateStr: string, range: { min: number; max: number } | null): number {
  if (!range || range.min === range.max) return 360;
  const t = new Date(dateStr).getTime();
  return 48 + ((t - range.min) / (range.max - range.min)) * 624;
}

function yForScore(score: number): number {
  return 20 + (1 - (score - 120) / 60) * 132;
}

const SECTION_LABEL: Record<"logicalReasoning" | "readingComprehension" | "analyticalReasoning", string> = {
  logicalReasoning: "Logical Reasoning",
  readingComprehension: "Reading Comprehension",
  analyticalReasoning: "Analytical Reasoning",
};

export function LsatStatsOverview({
  goals,
  practiceTests,
  checkpoints,
  onGoalsSaved,
}: {
  goals: LsatGoals;
  practiceTests: LsatPracticeTest[];
  checkpoints: LsatGoalCheckpoint[];
  onGoalsSaved: (goals: LsatGoals) => void;
}) {
  const [editing, setEditing] = useState(false);

  const latest = latestScore(practiceTests);
  const highest = highestScore(practiceTests);
  const improvementValue = improvement(latest, goals.lsat_diagnostic_score);
  const remaining = remainingToGoal(latest, goals.lsat_goal_score);
  const daysUntil = daysUntilTest(goals.lsat_planned_test_date);
  const sections = sectionAverages(practiceTests);
  const hasSectionData =
    sections.logicalReasoning.average != null ||
    sections.readingComprehension.average != null ||
    sections.analyticalReasoning.average != null;

  const scoredTests = [...practiceTests]
    .filter((test): test is LsatPracticeTest & { scaled_score: number } => test.scaled_score != null)
    .sort((a, b) => a.test_date.localeCompare(b.test_date));

  const allDates = [...scoredTests.map((t) => t.test_date), ...checkpoints.map((c) => c.target_date)];
  const dateRange =
    allDates.length > 0
      ? { min: Math.min(...allDates.map((d) => new Date(d).getTime())), max: Math.max(...allDates.map((d) => new Date(d).getTime())) }
      : null;

  const chartPoints = scoredTests.map((test) => ({ test, x: xForDate(test.test_date, dateRange), y: yForScore(test.scaled_score) }));
  const pathData = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const goalY = goals.lsat_goal_score == null ? null : yForScore(goals.lsat_goal_score);

  const sortedCheckpoints = [...checkpoints].sort((a, b) => a.target_date.localeCompare(b.target_date));
  const checkpointPoints = sortedCheckpoints.map((c) => ({ checkpoint: c, x: xForDate(c.target_date, dateRange), y: yForScore(c.target_score) }));
  // The planned path starts from the latest real result (where you
  // actually are) and runs through each future checkpoint -- "here's the
  // path from where you are to where you're aiming," not just floating
  // targets with no connection to the real trajectory.
  const latestRealPoint = chartPoints[chartPoints.length - 1];
  const plannedPathPoints = latestRealPoint ? [{ x: latestRealPoint.x, y: latestRealPoint.y }, ...checkpointPoints] : checkpointPoints;
  const plannedPathData =
    plannedPathPoints.length > 1
      ? plannedPathPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
      : "";

  const hasAnyChartData = chartPoints.length > 0 || checkpointPoints.length > 0;
  const sortedDates = allDates.slice().sort();
  const leftLabelDate = sortedDates[0] ?? null;
  const rightLabelDate = sortedDates[sortedDates.length - 1] ?? null;

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

            {hasSectionData && (
              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-border-subtle px-4 pt-4 md:px-0">
                {(Object.keys(SECTION_LABEL) as (keyof typeof SECTION_LABEL)[]).map((key) => {
                  const stats = sections[key];
                  if (stats.average == null) return null;
                  return (
                    <div key={key}>
                      <p className="font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">{SECTION_LABEL[key]}</p>
                      <p className="mt-1 flex items-baseline gap-1.5">
                        <span className="font-mono text-base font-semibold tabular-nums text-ink-primary">{stats.average.toFixed(1)}</span>
                        {stats.trend && (
                          <span
                            className={cn(
                              "text-[10px] font-mono",
                              stats.trend === "improving" && "text-status-onTrack",
                              stats.trend === "declining" && "text-status-atRisk",
                              stats.trend === "flat" && "text-ink-tertiary"
                            )}
                          >
                            {stats.trend === "improving" ? "↑" : stats.trend === "declining" ? "↓" : "flat"}
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="relative mt-6 overflow-hidden px-1">
              {hasAnyChartData ? (
                <svg
                  viewBox="0 0 720 190"
                  className="h-auto w-full min-w-[320px]"
                  role="img"
                  aria-label="Practice test score trajectory with planned goal checkpoints"
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
                  {plannedPathData && (
                    <path d={plannedPathData} fill="none" stroke="currentColor" className="text-seal" strokeWidth="1.5" strokeDasharray="4 4" />
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
                  {checkpointPoints.map((point) => (
                    <g key={point.checkpoint.id}>
                      <rect x={point.x - 4} y={point.y - 4} width="8" height="8" transform={`rotate(45 ${point.x} ${point.y})`} className="fill-seal" />
                      <text x={point.x} y={point.y - 11} textAnchor="middle" className="fill-seal font-mono text-[10px] font-semibold">
                        {point.checkpoint.target_score}
                      </text>
                    </g>
                  ))}
                  {leftLabelDate && (
                    <text x="48" y="184" className="fill-ink-tertiary font-mono text-[9px]">{formatDateOnly(leftLabelDate)}</text>
                  )}
                  {rightLabelDate && (
                    <text x="672" y="184" textAnchor="end" className="fill-ink-tertiary font-mono text-[9px]">
                      {formatDateOnly(rightLabelDate)}
                    </text>
                  )}
                </svg>
              ) : (
                <div className="flex h-40 items-center justify-center border-y border-border-subtle text-xs text-ink-tertiary">
                  No scored tests or planned checkpoints to plot yet.
                </div>
              )}
            </div>
            {checkpointPoints.length > 0 && (
              <p className="mt-2 px-4 text-[11px] text-ink-tertiary md:px-0">
                <span className="mr-1.5 inline-block h-2 w-2 rotate-45 bg-seal align-middle" /> Planned checkpoint — dashed line runs from your latest result to your next planned target, not a prediction.
              </p>
            )}
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
