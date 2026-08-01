import Link from "next/link";
import { Calendar, CircleDollarSign, School, Target } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { cn, formatDateOnly } from "@/lib/utils";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/components/graduateLawSchool/SchoolBadges";
import { remainingToGoal } from "@/lib/lsat";
import { buildLawSchoolOverviewWorkspaceBrief } from "@/lib/workspaceBriefs";
import type { LawSchool, LawSchoolPriority, LawSchoolStatus, Milestone, Scholarship } from "@/types/database.types";

interface DeadlineItem {
  label: string;
  date: string;
  href: string;
}

function StatBlock({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-card border border-border bg-surface px-4 py-3 shadow-card transition-shadow hover:shadow-elevated">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="eyebrow">{label}</p>
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-raised text-ink-tertiary">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="font-display text-lg font-semibold text-ink-primary">{value}</p>
    </div>
  );
}

// Compact, read-only roadmap preview — the full editable version with
// add/edit/delete lives on the Timeline tab (MilestoneRoadmap.tsx).
function MilestoneStepper({ milestones }: { milestones: Milestone[] }) {
  const preview = milestones.slice(0, 6);

  if (preview.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
        <p className="text-sm text-ink-secondary">No milestones yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <ol>
        {preview.map((m, i) => {
          const isLast = i === preview.length - 1;
          const isCompleted = m.status === "completed";
          const isCurrent = m.status === "in_progress";
          return (
            <li key={m.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    isCompleted && "border-signal bg-signal",
                    isCurrent && "border-accent bg-background",
                    !isCompleted && !isCurrent && "border-border-strong bg-background"
                  )}
                />
                {!isLast && <span className={cn("w-px flex-1", isCompleted ? "bg-signal/40" : "bg-border-strong")} />}
              </div>
              <div className={cn("min-w-0 pb-4", isLast && "pb-0")}>
                <p className={cn("truncate text-sm", isCurrent ? "font-medium text-ink-primary" : "text-ink-secondary")}>
                  {m.title}
                </p>
                {isCurrent && <p className="text-xs text-accent">In progress</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function GraduateLawSchoolOverview({
  schools,
  scholarships,
  deadlines,
  milestones,
  lsatGoalScore,
  lsatLatestScore,
}: {
  schools: LawSchool[];
  scholarships: Scholarship[];
  deadlines: DeadlineItem[];
  milestones: Milestone[];
  lsatGoalScore: number | null;
  lsatLatestScore: number | null;
}) {
  const byStatus = Object.keys(STATUS_LABEL) as LawSchoolStatus[];
  const byPriority = Object.keys(PRIORITY_LABEL) as LawSchoolPriority[];
  const gap = remainingToGoal(lsatLatestScore, lsatGoalScore);
  const brief = buildLawSchoolOverviewWorkspaceBrief({
    schoolCount: schools.length,
    scholarshipCount: scholarships.length,
    milestoneCount: milestones.length,
    nextDeadlineLabel: deadlines[0]?.label ?? null,
  });

  return (
    <div>
      <WorkspaceBrief
        eyebrow="GRADUATE & LAW SCHOOL"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${schools.length} schools · ${milestones.length} milestones`}
      />

      <div className="space-y-8 px-4 py-6 md:px-8">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBlock label="Schools tracked" value={String(schools.length)} icon={School} />
          <StatBlock label="Scholarships tracked" value={String(scholarships.length)} icon={CircleDollarSign} />
          <StatBlock label="LSAT goal gap" value={gap === null ? "—" : `${gap} pts`} icon={Target} />
          <StatBlock label="Upcoming deadlines" value={String(deadlines.length)} icon={Calendar} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Schools by status</h2>
          <div className="flex flex-wrap gap-2">
            {byStatus.map((status) => {
              const count = schools.filter((s) => s.status === status).length;
              if (count === 0) return null;
              return (
                <span key={status} className="rounded-full border border-border px-3 py-1 text-xs text-ink-secondary">
                  {STATUS_LABEL[status]} <span className="text-ink-primary">{count}</span>
                </span>
              );
            })}
            {schools.length === 0 && <p className="text-sm text-ink-tertiary">No schools tracked yet.</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Schools by priority</h2>
          <div className="flex flex-wrap gap-2">
            {byPriority.map((priority) => {
              const count = schools.filter((s) => s.priority === priority).length;
              if (count === 0) return null;
              return (
                <span key={priority} className="rounded-full border border-border px-3 py-1 text-xs text-ink-secondary">
                  {PRIORITY_LABEL[priority]} <span className="text-ink-primary">{count}</span>
                </span>
              );
            })}
            {schools.filter((s) => s.priority).length === 0 && (
              <p className="text-sm text-ink-tertiary">No priority tiers set yet.</p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-medium text-ink-primary">Upcoming deadlines</h2>
            {deadlines.length === 0 ? (
              <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
                <p className="text-sm text-ink-secondary">Nothing coming up.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle rounded-card border border-border bg-surface shadow-card">
                {deadlines.slice(0, 5).map((d, i) => (
                  <li key={i}>
                    <Link href={d.href} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface-raised">
                      <span className="text-sm text-ink-primary">{d.label}</span>
                      <span className="font-mono text-xs text-ink-tertiary">{formatDateOnly(d.date)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-ink-primary">Milestone roadmap</h2>
              <Link href="/academics/graduate-law-school/timeline" className="text-xs text-accent hover:text-accent-bright">
                View full timeline
              </Link>
            </div>
            <MilestoneStepper milestones={milestones} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Jump to</h2>
          <div className="flex flex-wrap gap-2">
            {[
              ["Schools", "/academics/graduate-law-school/schools"],
              ["LSAT", "/academics/graduate-law-school/lsat"],
              ["Applications", "/academics/graduate-law-school/applications"],
              ["Scholarships", "/academics/graduate-law-school/scholarships"],
              ["Timeline", "/academics/graduate-law-school/timeline"],
              ["Documents", "/academics/graduate-law-school/documents"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href!}
                className="rounded-full border border-border px-3 py-1 text-xs text-ink-secondary transition-colors hover:border-border-strong hover:text-ink-primary"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
