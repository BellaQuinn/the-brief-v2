"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { DegreeSection } from "@/components/academics/DegreeSection";
import { DegreeForm } from "@/components/academics/DegreeForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { sortDegrees } from "@/lib/utils";
import type {
  Assignment,
  Course,
  CourseWithAssignments,
  Degree,
  DegreeWithTerms,
  Term,
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

// Every handler below searches across all degrees' terms/courses by ID
// rather than requiring a degreeId param — keeps AcademicsActions (already
// consumed by TermSection/CourseRow/AssignmentRow) unchanged now that a
// user can have more than one degree.

function upsertTermAcrossDegrees(degrees: DegreeWithTerms[], term: Term): DegreeWithTerms[] {
  const existsSomewhere = degrees.some((d) => d.terms.some((t) => t.id === term.id));
  if (existsSomewhere) {
    return degrees.map((d) => ({
      ...d,
      terms: d.terms.map((t) => (t.id === term.id ? { ...t, ...term } : t)),
    }));
  }
  return degrees.map((d) =>
    d.id === term.degree_id ? { ...d, terms: [...d.terms, { ...term, courses: [] }] } : d
  );
}

function removeTermAcrossDegrees(degrees: DegreeWithTerms[], termId: string): DegreeWithTerms[] {
  return degrees.map((d) => ({ ...d, terms: d.terms.filter((t) => t.id !== termId) }));
}

function upsertCourseAcrossDegrees(degrees: DegreeWithTerms[], termId: string, course: Course): DegreeWithTerms[] {
  return degrees.map((d) => ({
    ...d,
    terms: d.terms.map((term) => {
      if (term.id !== termId) return term;
      const exists = term.courses.some((c) => c.id === course.id);
      const courses = exists
        ? term.courses.map((c) => (c.id === course.id ? { ...c, ...course } : c))
        : [...term.courses, course as CourseWithAssignments];
      return { ...term, courses };
    }),
  }));
}

function removeCourseAcrossDegrees(degrees: DegreeWithTerms[], termId: string, courseId: string): DegreeWithTerms[] {
  return degrees.map((d) => ({
    ...d,
    terms: d.terms.map((term) =>
      term.id === termId ? { ...term, courses: term.courses.filter((c) => c.id !== courseId) } : term
    ),
  }));
}

function mapCourseByCourseIdAcrossDegrees(
  degrees: DegreeWithTerms[],
  courseId: string,
  update: (course: CourseWithAssignments) => CourseWithAssignments
): DegreeWithTerms[] {
  return degrees.map((d) => ({
    ...d,
    terms: d.terms.map((term) => ({
      ...term,
      courses: term.courses.map((c) => (c.id === courseId ? update(c) : c)),
    })),
  }));
}

export function AcademicsClient({ initialDegrees }: { initialDegrees: DegreeWithTerms[] }) {
  const [degrees, setDegrees] = useState<DegreeWithTerms[]>(initialDegrees);
  const [addingDegree, setAddingDegree] = useState(false);
  const [focusDegreeId, setFocusDegreeId] = useState<string | null>(null);

  // Runs after the newly added degree's section has actually rendered, so
  // the user lands on it and can keep going straight into adding terms.
  useEffect(() => {
    if (!focusDegreeId) return;
    const el = document.getElementById(`degree-${focusDegreeId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.focus({ preventScroll: true });
    }
    setFocusDegreeId(null);
  }, [focusDegreeId, degrees]);

  const actions: AcademicsActions = {
    onTermSaved(term) {
      setDegrees((prev) => upsertTermAcrossDegrees(prev, term));
    },
    onTermDeleted(termId) {
      setDegrees((prev) => removeTermAcrossDegrees(prev, termId));
    },
    onCourseSaved(termId, course) {
      setDegrees((prev) => upsertCourseAcrossDegrees(prev, termId, course));
    },
    onCourseDeleted(termId, courseId) {
      setDegrees((prev) => removeCourseAcrossDegrees(prev, termId, courseId));
    },
    onAssignmentsLoaded(courseId, assignments) {
      setDegrees((prev) => mapCourseByCourseIdAcrossDegrees(prev, courseId, (c) => ({ ...c, assignments })));
    },
    onAssignmentSaved(courseId, assignment) {
      setDegrees((prev) =>
        mapCourseByCourseIdAcrossDegrees(prev, courseId, (c) => {
          const existing = c.assignments ?? [];
          const exists = existing.some((a) => a.id === assignment.id);
          return {
            ...c,
            assignments: exists
              ? existing.map((a) => (a.id === assignment.id ? assignment : a))
              : [...existing, assignment],
          };
        })
      );
    },
    onAssignmentDeleted(courseId, assignmentId) {
      setDegrees((prev) =>
        mapCourseByCourseIdAcrossDegrees(prev, courseId, (c) => ({
          ...c,
          assignments: (c.assignments ?? []).filter((a) => a.id !== assignmentId),
        }))
      );
    },
  };

  function handleDegreeSaved(d: Degree) {
    setDegrees((prev) => sortDegrees(prev.map((deg) => (deg.id === d.id ? { ...deg, ...d } : deg))));
  }

  function handleDegreeDeleted(degreeId: string) {
    setDegrees((prev) => prev.filter((deg) => deg.id !== degreeId));
  }

  return (
    <div>
      <WorkspaceHeader
        eyebrow="ACADEMICS"
        title="Overview"
        hideDots
        subtitle={
          degrees.length > 0
            ? `${degrees.length} degree${degrees.length === 1 ? "" : "s"} tracked`
            : "Add your first degree to get started"
        }
        action={
          <button
            onClick={() => setAddingDegree(true)}
            className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
          >
            <Plus className="h-3.5 w-3.5" />
            Add degree
          </button>
        }
      />

      <div className="space-y-8 px-4 py-6 md:px-8">
        {degrees.length === 0 ? (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="mb-4 text-sm text-ink-secondary">No degree plans set up yet.</p>
            <Button onClick={() => setAddingDegree(true)} className="mx-auto">
              Set up your first degree
            </Button>
          </div>
        ) : (
          degrees.map((degree) => (
            <DegreeSection
              key={degree.id}
              degree={degree}
              actions={actions}
              onDegreeSaved={handleDegreeSaved}
              onDegreeDeleted={handleDegreeDeleted}
            />
          ))
        )}
      </div>

      <Modal open={addingDegree} onClose={() => setAddingDegree(false)} title="Add degree">
        <DegreeForm
          onSaved={(d) => {
            setDegrees((prev) => sortDegrees([...prev, { ...d, terms: [] }]));
            setAddingDegree(false);
            setFocusDegreeId(d.id);
          }}
          onCancel={() => setAddingDegree(false)}
        />
      </Modal>
    </div>
  );
}
