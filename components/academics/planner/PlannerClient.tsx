"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Pencil } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { AssignmentForm } from "@/components/academics/AssignmentForm";
import { Modal } from "@/components/ui/Modal";
import { buildWorkQueue, formatEstimatedMinutes, sumEstimatedMinutes, type QueueItem, type QueueTier } from "@/lib/plannerQueue";
import { buildPlannerWorkspaceBrief } from "@/lib/workspaceBriefs";
import { cn } from "@/lib/utils";
import type { AcademicsActions } from "@/components/academics/AcademicsClient";
import type { Assignment, AssignmentWithDegreeContext } from "@/types/database.types";

const TIER_ACCENT: Record<QueueTier, string> = {
  Overdue: "border-status-atRisk",
  "Do now": "border-seal",
  "Do next": "border-accent",
  "On deck": "border-border-strong",
};

export function PlannerClient({ initialAssignments }: { initialAssignments: AssignmentWithDegreeContext[] }) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const queue = useMemo(() => buildWorkQueue(assignments), [assignments]);
  const [top, ...rest] = queue;
  const overdueCount = queue.filter((item) => item.tier === "Overdue").length;
  const nextThreeEstimate = sumEstimatedMinutes(queue.slice(0, 3));

  const brief = buildPlannerWorkspaceBrief({
    openCount: queue.length,
    overdueCount,
    topItemTitle: top?.assignment.title ?? null,
    topItemReason: top?.reason ?? null,
  });

  const actions: AcademicsActions = {
    onTermSaved() {},
    onTermDeleted() {},
    onCourseSaved() {},
    onCourseDeleted() {},
    onAssignmentsLoaded() {},
    onAssignmentSaved(_courseId, assignment) {
      setAssignments((prev) => prev.map((a) => (a.id === assignment.id ? { ...a, ...assignment } : a)));
    },
    onAssignmentDeleted(_courseId, assignmentId) {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    },
  };

  const tierGroups: { tier: QueueTier; items: QueueItem[] }[] = [];
  for (const item of rest) {
    const lastGroup = tierGroups[tierGroups.length - 1];
    if (lastGroup && lastGroup.tier === item.tier) {
      lastGroup.items.push(item);
    } else {
      tierGroups.push({ tier: item.tier, items: [item] });
    }
  }

  return (
    <div>
      <WorkspaceBrief eyebrow="Academics // Planner" status={brief.status} situation={brief.situation} directive={brief.directive} />

      <div className="px-4 py-6 md:px-8">
        {!top ? (
          <div className="border-y border-border-subtle px-6 py-14 text-center">
            <p className="text-sm text-ink-secondary">Nothing open needs prioritizing right now.</p>
            <p className="mt-1 text-xs text-ink-tertiary">Check back once new work is assigned.</p>
          </div>
        ) : (
          <>
            {/* The #1 item — deliberately not boxed, deliberately the biggest thing
                on the page, the same "unquestioned focal point" move the Brief
                dashboard's Mission Brief already established. */}
            <section className="relative border-b border-border-subtle pb-8">
              <div className="absolute left-0 top-0 h-0.5 w-16 bg-signal" />
              <p className="eyebrow pt-6">Next up</p>
              <h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-snug text-ink-primary md:text-[28px]">
                {top.assignment.title}
              </h2>
              <p className="mt-2 font-mono text-xs text-ink-tertiary">
                {top.assignment.course.course_code ?? top.assignment.course.course_name} · {top.assignment.course.term.degree.degree_name}
              </p>
              <p className={cn("mt-4 flex items-start gap-2 border-l-2 pl-3 text-[15px] font-medium", TIER_ACCENT[top.tier], "text-ink-primary")}>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright" aria-hidden />
                <span>{top.reason}</span>
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setEditing(top.assignment)}
                  className="flex items-center gap-1.5 rounded-md border border-border-strong px-3 py-1.5 text-xs text-ink-secondary hover:text-ink-primary"
                >
                  <Pencil className="h-3 w-3" />
                  Update status
                </button>
                {top.assignment.estimated_minutes != null && (
                  <span className="font-mono text-xs text-ink-tertiary">≈ {formatEstimatedMinutes(top.assignment.estimated_minutes)}</span>
                )}
              </div>
            </section>

            {nextThreeEstimate != null && (
              <p className="mt-4 font-mono text-xs text-ink-tertiary">
                Your next {Math.min(3, queue.length)} item{Math.min(3, queue.length) === 1 ? "" : "s"} ≈ {formatEstimatedMinutes(nextThreeEstimate)}.
              </p>
            )}

            {/* Everything else — compact, in ranked order, supporting the call above rather than competing with it. */}
            <div className="trace-rail mt-8 space-y-0">
              {tierGroups.map((group) => (
                <div key={group.tier}>
                  <p className="eyebrow relative mb-2 mt-6 pl-8 first:mt-0">{group.tier}</p>
                  {group.items.map((item) => (
                    <button
                      key={item.assignment.id}
                      onClick={() => setEditing(item.assignment)}
                      className="group relative block w-full py-3 pl-8 pr-2 text-left"
                    >
                      <span className="trace-node" aria-hidden />
                      <span className="trace-connector" aria-hidden />
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="truncate text-sm text-ink-primary group-hover:text-white">{item.assignment.title}</span>
                        <span className="font-mono text-[11px] text-ink-tertiary">{item.reason}</span>
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-ink-tertiary">
                        {item.assignment.course.course_code ?? item.assignment.course.course_name}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Update assignment">
        {editing && (
          <AssignmentForm
            courseId={editing.course_id}
            assignment={editing}
            onSaved={(a) => {
              actions.onAssignmentSaved(editing.course_id, a);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
