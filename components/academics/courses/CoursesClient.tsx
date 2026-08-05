"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { AssignmentRow } from "@/components/academics/AssignmentRow";
import { AssignmentForm } from "@/components/academics/AssignmentForm";
import { CourseForm } from "@/components/academics/CourseForm";
import { CourseDocumentsSection } from "@/components/documents/CourseDocumentsSection";
import type { EntityOptionMap } from "@/components/documents/DocumentRelationshipPicker";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { champlainUndergraduatePolicy } from "@/lib/academicPolicy/champlain";
import { computeCourseGrade } from "@/lib/academicStanding/grades";
import { buildCoursesWorkspaceBrief } from "@/lib/workspaceBriefs";
import { cn } from "@/lib/utils";
import type { AcademicsActions } from "@/components/academics/AcademicsClient";
import type { Assignment, Course, DocumentWithRelationships } from "@/types/database.types";
import type { CourseWithFullContext } from "@/app/(dashboard)/academics/courses/page";

const ALL = "all";

function updateAssignmentsForCourse(
  courses: CourseWithFullContext[],
  courseId: string,
  update: (assignments: Assignment[]) => Assignment[]
): CourseWithFullContext[] {
  return courses.map((c) => (c.id === courseId ? { ...c, assignments: update(c.assignments) } : c));
}

export function CoursesClient({
  initialCourses,
  initialDocuments,
  entityOptions,
}: {
  initialCourses: CourseWithFullContext[];
  initialDocuments: DocumentWithRelationships[];
  entityOptions: EntityOptionMap;
}) {
  const [courses, setCourses] = useState<CourseWithFullContext[]>(initialCourses);
  const [documents, setDocuments] = useState<DocumentWithRelationships[]>(initialDocuments);
  const [degreeFilter, setDegreeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState<string>("in_progress");
  const [selectedId, setSelectedId] = useState<string | null>(initialCourses[0]?.id ?? null);
  const [editingCourse, setEditingCourse] = useState(false);
  const [addingAssignment, setAddingAssignment] = useState(false);

  const degreeOptions = useMemo(() => {
    const names = new Set(courses.map((c) => c.term.degree.degree_name));
    return [{ value: ALL, label: "All degrees" }, ...[...names].sort().map((name) => ({ value: name, label: name }))];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (degreeFilter !== ALL && c.term.degree.degree_name !== degreeFilter) return false;
      if (statusFilter !== ALL && c.status !== statusFilter) return false;
      return true;
    });
  }, [courses, degreeFilter, statusFilter]);

  const grouped = useMemo(() => {
    const byTerm = new Map<string, { label: string; courses: CourseWithFullContext[]; active: boolean }>();
    for (const course of filtered) {
      const key = course.term.id;
      const existing = byTerm.get(key);
      if (existing) {
        existing.courses.push(course);
      } else {
        byTerm.set(key, {
          label: `${course.term.degree.degree_name} — ${course.term.name}`,
          courses: [course],
          active: course.term.status === "active",
        });
      }
    }
    return [...byTerm.values()].sort((a, b) => Number(b.active) - Number(a.active));
  }, [filtered]);

  const selected = courses.find((c) => c.id === selectedId) ?? null;
  const grade = selected ? computeCourseGrade(selected, selected.assignments, champlainUndergraduatePolicy) : null;

  const inProgress = courses.filter((c) => c.status === "in_progress");
  const gradedStanding = inProgress
    .map((c) => ({ course: c, result: computeCourseGrade(c, c.assignments, champlainUndergraduatePolicy) }))
    .filter((r) => r.result.percentage != null)
    .sort((a, b) => a.result.percentage! - b.result.percentage!);
  const lowest = gradedStanding[0] ?? null;

  const brief = buildCoursesWorkspaceBrief({
    courseCount: courses.length,
    inProgressCount: inProgress.length,
    lowestGradeCourseName: lowest ? lowest.course.course_code ?? lowest.course.course_name : null,
    lowestGradePercentage: lowest ? lowest.result.percentage : null,
  });

  const actions: AcademicsActions = {
    onTermSaved() {},
    onTermDeleted() {},
    onCourseSaved() {},
    onCourseDeleted() {},
    onAssignmentsLoaded() {},
    onAssignmentSaved(courseId, assignment) {
      setCourses((prev) =>
        updateAssignmentsForCourse(prev, courseId, (existing) => {
          const exists = existing.some((a) => a.id === assignment.id);
          return exists ? existing.map((a) => (a.id === assignment.id ? assignment : a)) : [...existing, assignment];
        })
      );
    },
    onAssignmentDeleted(courseId, assignmentId) {
      setCourses((prev) => updateAssignmentsForCourse(prev, courseId, (existing) => existing.filter((a) => a.id !== assignmentId)));
    },
  };

  function handleCourseSaved(course: Course) {
    setCourses((prev) => prev.map((c) => (c.id === course.id ? { ...c, ...course } : c)));
    setEditingCourse(false);
  }

  return (
    <div>
      <WorkspaceBrief
        eyebrow="Academics // Coursework"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${courses.length} course${courses.length === 1 ? "" : "s"} on record`}
      />

      <div className="px-4 py-6 md:px-8">
        <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-md">
          <Select label="Degree" value={degreeFilter} onChange={(e) => setDegreeFilter(e.target.value)} options={degreeOptions} />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: ALL, label: "Any status" },
              { value: "in_progress", label: "In progress" },
              { value: "planned", label: "Planned" },
              { value: "completed", label: "Completed" },
              { value: "withdrawn", label: "Withdrawn" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="space-y-6">
            {grouped.length === 0 && <p className="text-sm text-ink-tertiary">No courses match these filters.</p>}
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="eyebrow mb-2">{group.label}</p>
                <div className="space-y-1">
                  {group.courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedId(course.id)}
                      className={cn(
                        "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        selectedId === course.id
                          ? "bg-surface-raised text-ink-primary"
                          : "text-ink-secondary hover:bg-surface-raised/60"
                      )}
                    >
                      <span className="block truncate">{course.course_name}</span>
                      {course.course_code && <span className="font-mono text-[11px] text-ink-tertiary">{course.course_code}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="signal-field-accent signal-field min-h-[240px] p-5">
            {!selected ? (
              <p className="text-sm text-ink-tertiary">Select a course to see its standing and assignments.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">{selected.term.degree.degree_name} — {selected.term.name}</p>
                    <h2 className="mt-1 text-xl font-semibold text-ink-primary">{selected.course_name}</h2>
                    <p className="mt-0.5 font-mono text-xs text-ink-tertiary">
                      {[selected.course_code, selected.professor, selected.credits != null ? `${selected.credits} cr` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingCourse(true)}
                    className="flex items-center gap-1.5 rounded-md border border-border-strong px-2.5 py-1.5 text-xs text-ink-secondary hover:text-ink-primary"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-baseline gap-4 border-t border-border-subtle pt-4">
                  <div>
                    <p className="eyebrow">Standing</p>
                    <p className="mt-1 text-2xl font-semibold text-ink-primary">
                      {grade?.percentage != null ? `${grade.percentage.toFixed(1)}%` : "—"}
                      {grade?.grade && <span className="ml-2 text-base text-ink-secondary">{grade.grade}</span>}
                    </p>
                  </div>
                  <p className="text-xs text-ink-tertiary">
                    {grade?.percentage == null
                      ? "No graded work yet."
                      : grade.isProvisional
                        ? `Provisional — based on ${selected.assignments.filter((a) => a.points_possible != null && a.points_earned != null).length} graded item(s), ${grade.missingAssignmentCount} still ungraded.`
                        : "Final."}
                  </p>
                </div>

                <WorkspaceSection
                  eyebrow="Assignments"
                  title="What's left in this course"
                  className="mt-6"
                  action={
                    <button onClick={() => setAddingAssignment(true)} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright">
                      <Plus className="h-3 w-3" />
                      Add assignment
                    </button>
                  }
                >
                  {selected.assignments.length === 0 ? (
                    <p className="text-sm text-ink-tertiary">No assignments recorded for this course yet.</p>
                  ) : (
                    <div className="divide-y divide-border-subtle">
                      {selected.assignments.map((a) => (
                        <AssignmentRow key={a.id} assignment={a} courseId={selected.id} actions={actions} />
                      ))}
                    </div>
                  )}
                </WorkspaceSection>

                {selected.notes && (
                  <WorkspaceSection eyebrow="Notes" title="Course notes" className="mt-6">
                    <p className="text-sm text-ink-secondary">{selected.notes}</p>
                  </WorkspaceSection>
                )}

                <CourseDocumentsSection
                  courseId={selected.id}
                  courseLabel={selected.course_code ?? selected.course_name}
                  documents={documents}
                  entityOptions={entityOptions}
                  onChange={setDocuments}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <>
          <Modal open={editingCourse} onClose={() => setEditingCourse(false)} title="Edit course">
            <CourseForm termId={selected.term_id} course={selected} onSaved={handleCourseSaved} onCancel={() => setEditingCourse(false)} />
          </Modal>
          <Modal open={addingAssignment} onClose={() => setAddingAssignment(false)} title="Add assignment">
            <AssignmentForm
              courseId={selected.id}
              onSaved={(a) => {
                actions.onAssignmentSaved(selected.id, a);
                setAddingAssignment(false);
              }}
              onCancel={() => setAddingAssignment(false)}
            />
          </Modal>
        </>
      )}
    </div>
  );
}
