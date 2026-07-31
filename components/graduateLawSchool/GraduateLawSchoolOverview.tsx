import Link from "next/link";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { formatDateOnly } from "@/lib/utils";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/components/graduateLawSchool/SchoolBadges";
import { remainingToGoal } from "@/lib/lsat";
import type { LawSchool, LawSchoolPriority, LawSchoolStatus, Scholarship } from "@/types/database.types";

interface DeadlineItem {
  label: string;
  date: string;
  href: string;
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-surface px-4 py-3">
      <p className="eyebrow mb-1.5">{label}</p>
      <p className="font-display text-lg font-medium text-ink-primary">{value}</p>
    </div>
  );
}

export function GraduateLawSchoolOverview({
  schools,
  scholarships,
  deadlines,
  lsatGoalScore,
  lsatLatestScore,
}: {
  schools: LawSchool[];
  scholarships: Scholarship[];
  deadlines: DeadlineItem[];
  lsatGoalScore: number | null;
  lsatLatestScore: number | null;
}) {
  const byStatus = Object.keys(STATUS_LABEL) as LawSchoolStatus[];
  const byPriority = Object.keys(PRIORITY_LABEL) as LawSchoolPriority[];
  const gap = remainingToGoal(lsatLatestScore, lsatGoalScore);

  return (
    <div>
      <WorkspaceHeader
        eyebrow="GRADUATE & LAW SCHOOL"
        title="Overview"
        hideDots
        subtitle="Schools, LSAT prep, scholarships, and the roadmap to law school — all in one place."
      />

      <div className="space-y-8 px-4 py-6 md:px-8">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBlock label="Schools tracked" value={String(schools.length)} />
          <StatBlock label="Scholarships tracked" value={String(scholarships.length)} />
          <StatBlock label="LSAT goal gap" value={gap === null ? "—" : `${gap} pts`} />
          <StatBlock label="Upcoming deadlines" value={String(deadlines.length)} />
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

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Upcoming deadlines</h2>
          {deadlines.length === 0 ? (
            <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
              <p className="text-sm text-ink-secondary">Nothing coming up.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle rounded-card border border-border bg-surface">
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
