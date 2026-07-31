"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { DegreeSummary } from "@/components/academics/DegreeSummary";
import { TermSection } from "@/components/academics/TermSection";
import { TermForm } from "@/components/academics/TermForm";
import { Modal } from "@/components/ui/Modal";
import type {
  Assignment,
  Course,
  CourseWithAssignments,
  DegreeWithTerms,
  Term,
  TermWithCourses,
} from "@/types/database.types";

export interface AcademicsActions {
  onTermSaved: (term: Term) => void;
  onTermDeleted: (termId: string) => void;
  onCourseSaved: (termId: string, course: Course) => void;
  onCourseDeleted: (termId: string, courseId: string) => void;
  onAssignmentsLoaded: (courseId: string, assignments: Assignment[]) => void;
  onAssignmentSaved: (courseId: string, assignment: Assignment) => void;
  onAssignmentDeleted: (courseId: string, assignmentId: string) => void;
}

function mapCourseByCourseId(
  terms: TermWithCourses[],
  courseId: string,
  update: (course: CourseWithAssignments) => CourseWithAssignments
): TermWithCourses[] {
  return terms.map((term) => ({
    ...term,
    courses: term.courses.map((c) => (c.id === courseId ? update(c) : c)),
  }));
}

export function AcademicsClient({ initialDegree }: { initialDegree: DegreeWithTerms | null }) {
  const [degree, setDegree] = useState<DegreeWithTerms | null>(initialDegree);
  const [addingTerm, setAddingTerm] = useState(false);

  const actions: AcademicsActions = {
    onTermSaved(term) {
      setDegree((prev) => {
        if (!prev) return prev;
        const exists = prev.terms.some((t) => t.id === term.id);
        const terms = exists
          ? prev.terms.map((t) => (t.id === term.id ? { ...t, ...term } : t))
          : [...prev.terms, { ...term, courses: [] }];
        return { ...prev, terms };
      });
    },
    onTermDeleted(termId) {
      setDegree((prev) => (prev ? { ...prev, terms: prev.terms.filter((t) => t.id !== termId) } : prev));
    },
    onCourseSaved(termId, course) {
      setDegree((prev) => {
        if (!prev) return prev;
        const terms = prev.terms.map((term) => {
          if (term.id !== termId) return term;
          const exists = term.courses.some((c) => c.id === course.id);
          const courses = exists
            ? term.courses.map((c) => (c.id === course.id ? { ...c, ...course } : c))
            : [...term.courses, course as CourseWithAssignments];
          return { ...term, courses };
        });
        return { ...prev, terms };
      });
    },
    onCourseDeleted(termId, courseId) {
      setDegree((prev) => {
        if (!prev) return prev;
        const terms = prev.terms.map((term) =>
          term.id === termId ? { ...term, courses: term.courses.filter((c) => c.id !== courseId) } : term
        );
        return { ...prev, terms };
      });
    },
    onAssignmentsLoaded(courseId, assignments) {
      setDegree((prev) =>
        prev ? { ...prev, terms: mapCourseByCourseId(prev.terms, courseId, (c) => ({ ...c, assignments })) } : prev
      );
    },
    onAssignmentSaved(courseId, assignment) {
      setDegree((prev) =>
        prev
          ? {
              ...prev,
              terms: mapCourseByCourseId(prev.terms, courseId, (c) => {
                const existing = c.assignments ?? [];
                const exists = existing.some((a) => a.id === assignment.id);
                return {
                  ...c,
                  assignments: exists
                    ? existing.map((a) => (a.id === assignment.id ? assignment : a))
                    : [...existing, assignment],
                };
              }),
            }
          : prev
      );
    },
    onAssignmentDeleted(courseId, assignmentId) {
      setDegree((prev) =>
        prev
          ? {
              ...prev,
              terms: mapCourseByCourseId(prev.terms, courseId, (c) => ({
                ...c,
                assignments: (c.assignments ?? []).filter((a) => a.id !== assignmentId),
              })),
            }
          : prev
      );
    },
  };

  return (
    <div>
      <WorkspaceHeader
        eyebrow="ACADEMICS"
        title="Degree plan"
        subtitle={degree ? `${degree.terms.length} terms tracked` : "Set up your degree to get started"}
      />

      <div className="space-y-6 px-4 py-6 md:px-8">
        <DegreeSummary
          degree={degree}
          onSaved={(d) => setDegree((prev) => (prev ? { ...prev, ...d } : { ...d, terms: [] }))}
        />

        {degree && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-ink-primary">Terms</h2>
              <button
                onClick={() => setAddingTerm(true)}
                className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
              >
                <Plus className="h-3.5 w-3.5" />
                Add term
              </button>
            </div>

            {degree.terms.length === 0 ? (
              <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
                <p className="text-sm text-ink-secondary">No terms yet. Add your first one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {degree.terms.map((term) => (
                  <TermSection key={term.id} term={term} actions={actions} />
                ))}
              </div>
            )}

            <Modal open={addingTerm} onClose={() => setAddingTerm(false)} title="Add term">
              <TermForm
                degreeId={degree.id}
                onSaved={(t) => {
                  actions.onTermSaved(t);
                  setAddingTerm(false);
                }}
                onCancel={() => setAddingTerm(false)}
              />
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
}
