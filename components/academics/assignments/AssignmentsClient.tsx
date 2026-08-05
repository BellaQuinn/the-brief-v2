"use client";

import { useMemo, useState } from "react";
import { addDays, isPast, isToday } from "date-fns";
import { ChevronDown } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { AssignmentRow } from "@/components/academics/AssignmentRow";
import { Select } from "@/components/ui/Select";
import { buildAssignmentsWorkspaceBrief } from "@/lib/workspaceBriefs";
import { cn } from "@/lib/utils";
import type { AcademicsActions } from "@/components/academics/AcademicsClient";
import type { Assignment, AssignmentWithDegreeContext } from "@/types/database.types";

const ALL = "all";

function isOpen(a: Assignment): boolean {
  return a.status !== "submitted" && a.status !== "graded";
}

function isOverdue(a: Assignment): boolean {
  if (!a.due_date || !isOpen(a)) return false;
  const due = new Date(a.due_date);
  return isPast(due) && !isToday(due);
}

interface Group {
  key: string;
  label: string;
  items: AssignmentWithDegreeContext[];
  defaultOpen: boolean;
}

export function AssignmentsClient({ initialAssignments }: { initialAssignments: AssignmentWithDegreeContext[] }) {
  const [assignments, setAssignments] = useState<AssignmentWithDegreeContext[]>(initialAssignments);
  const [degreeFilter, setDegreeFilter] = useState(ALL);
  const [courseFilter, setCourseFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [priorityFilter, setPriorityFilter] = useState(ALL);

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

  const degreeOptions = useMemo(() => {
    const names = new Set(assignments.map((a) => a.course.term.degree.degree_name));
    return [{ value: ALL, label: "All degrees" }, ...[...names].sort().map((name) => ({ value: name, label: name }))];
  }, [assignments]);

  const courseOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const a of assignments) {
      if (degreeFilter !== ALL && a.course.term.degree.degree_name !== degreeFilter) continue;
      seen.set(a.course_id, a.course.course_code ?? a.course.course_name);
    }
    return [{ value: ALL, label: "All courses" }, ...[...seen.entries()].map(([id, label]) => ({ value: id, label }))];
  }, [assignments, degreeFilter]);

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      if (degreeFilter !== ALL && a.course.term.degree.degree_name !== degreeFilter) return false;
      if (courseFilter !== ALL && a.course_id !== courseFilter) return false;
      if (statusFilter !== ALL && a.status !== statusFilter) return false;
      if (priorityFilter !== ALL && a.priority !== priorityFilter) return false;
      return true;
    });
  }, [assignments, degreeFilter, courseFilter, statusFilter, priorityFilter]);

  const groups: Group[] = useMemo(() => {
    const weekOut = addDays(new Date(), 7);
    const overdue = filtered.filter(isOverdue);
    const dueThisWeek = filtered.filter(
      (a) => isOpen(a) && !isOverdue(a) && a.due_date && new Date(a.due_date) <= weekOut
    );
    const later = filtered.filter(
      (a) => isOpen(a) && !isOverdue(a) && a.due_date && new Date(a.due_date) > weekOut
    );
    const noDueDate = filtered.filter((a) => isOpen(a) && !a.due_date);
    const done = filtered.filter((a) => !isOpen(a));

    return [
      { key: "overdue", label: "Overdue", items: overdue, defaultOpen: true },
      { key: "week", label: "Due this week", items: dueThisWeek, defaultOpen: true },
      { key: "later", label: "Later", items: later, defaultOpen: true },
      { key: "no-date", label: "No due date", items: noDueDate, defaultOpen: true },
      { key: "done", label: "Done", items: done, defaultOpen: false },
    ].filter((g) => g.items.length > 0);
  }, [filtered]);

  const totalCount = assignments.length;
  const openCount = assignments.filter(isOpen).length;
  const overdueCount = assignments.filter(isOverdue).length;
  const brief = buildAssignmentsWorkspaceBrief({ totalCount, openCount, overdueCount });

  return (
    <div>
      <WorkspaceBrief
        eyebrow="Academics // Ledger"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${totalCount} assignment${totalCount === 1 ? "" : "s"} on record`}
      />

      <div className="px-4 py-6 md:px-8">
        <WorkspaceSection eyebrow="Filter" title="Narrow the ledger">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Select
              label="Degree"
              value={degreeFilter}
              onChange={(e) => {
                setDegreeFilter(e.target.value);
                setCourseFilter(ALL);
              }}
              options={degreeOptions}
            />
            <Select label="Course" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} options={courseOptions} />
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: ALL, label: "Any status" },
                { value: "not_started", label: "Not started" },
                { value: "in_progress", label: "In progress" },
                { value: "submitted", label: "Submitted" },
                { value: "graded", label: "Graded" },
              ]}
            />
            <Select
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: ALL, label: "Any priority" },
                { value: "urgent", label: "Urgent" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
          </div>
        </WorkspaceSection>

        <div className="mt-8 space-y-6">
          {groups.length === 0 ? (
            <div className="border-y border-border-subtle px-6 py-10 text-center">
              <p className="text-sm text-ink-secondary">Nothing matches these filters.</p>
            </div>
          ) : (
            groups.map((group) => <AssignmentGroup key={group.key} group={group} actions={actions} />)
          )}
        </div>
      </div>
    </div>
  );
}

function AssignmentGroup({ group, actions }: { group: Group; actions: AcademicsActions }) {
  const [open, setOpen] = useState(group.defaultOpen);
  return (
    <section>
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 py-1" aria-expanded={open}>
        <ChevronDown className={cn("h-3.5 w-3.5 text-ink-tertiary transition-transform", !open && "-rotate-90")} />
        <p className="eyebrow">
          {group.label} <span className="text-ink-secondary">· {group.items.length}</span>
        </p>
      </button>
      {open && (
        <div className="relative ml-5 mt-2 divide-y divide-border-subtle border-l border-border-subtle pl-5">
          {group.items.map((a) => (
            <AssignmentRowWithContext key={a.id} assignment={a} actions={actions} />
          ))}
        </div>
      )}
    </section>
  );
}

function AssignmentRowWithContext({ assignment, actions }: { assignment: AssignmentWithDegreeContext; actions: AcademicsActions }) {
  return (
    <div>
      <p className="pt-2.5 font-mono text-[10px] text-ink-tertiary">
        {assignment.course.course_code ?? assignment.course.course_name} · {assignment.course.term.degree.degree_name}
      </p>
      <AssignmentRow assignment={assignment} courseId={assignment.course_id} actions={actions} />
    </div>
  );
}
