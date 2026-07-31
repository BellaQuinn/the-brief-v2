import { cn } from "@/lib/utils";
import { DEGREE_STATUS_BADGE_CLASS, DEGREE_STATUS_LABEL } from "@/lib/degreeStatus";
import type { DegreeWithTerms } from "@/types/database.types";

/**
 * Pure display — no mutation logic anywhere in this file. Shared by the
 * public root page and the unlisted review link, both of which render
 * real data to visitors who never have an authenticated session.
 */
export function ReadOnlyDegreeCard({ degree }: { degree: DegreeWithTerms }) {
  const pct =
    degree.total_credits && degree.total_credits > 0
      ? Math.min(100, Math.round((degree.completed_credits / degree.total_credits) * 100))
      : 0;

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow mb-1 truncate">{degree.school_name}</p>
          <h2 className="truncate font-display text-lg font-medium text-ink-primary">{degree.degree_name}</h2>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-xs",
            DEGREE_STATUS_BADGE_CLASS[degree.status]
          )}
        >
          {DEGREE_STATUS_LABEL[degree.status]}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-ink-secondary">
          <span>
            {degree.completed_credits} / {degree.total_credits ?? "—"} credits
          </span>
          {degree.expected_graduation && (
            <span>Expected {new Date(degree.expected_graduation).toLocaleDateString()}</span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-signal" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

export function ReadOnlyTermsList({ terms }: { terms: DegreeWithTerms["terms"] }) {
  if (terms.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium text-ink-primary">Terms</h2>
      <div className="space-y-2">
        {terms.map((term) => (
          <div key={term.id} className="rounded-lg border border-border-subtle bg-surface-raised p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-primary">{term.name}</span>
              <span className="font-mono text-xs text-ink-tertiary">{term.courses.length} courses</span>
            </div>
            {term.courses.length > 0 && (
              <ul className="mt-2 space-y-1">
                {term.courses.map((course) => (
                  <li key={course.id} className="flex items-center justify-between text-xs">
                    <span className="text-ink-secondary">
                      {course.course_code && (
                        <span className="font-mono text-ink-tertiary">{course.course_code} </span>
                      )}
                      {course.course_name}
                    </span>
                    <span className="font-mono text-ink-tertiary">{course.credits ?? "—"} cr</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
