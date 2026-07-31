import { cn } from "@/lib/utils";
import type { CourseGradeResult } from "@/lib/academicStanding/types";
import type { Course } from "@/types/database.types";

const AT_RISK_THRESHOLD = 70; // below a C-

export function CoursePerformanceList({ courses }: { courses: Array<{ course: Course; grade: CourseGradeResult }> }) {
  const inProgress = courses.filter(({ grade }) => grade.isProvisional);

  if (inProgress.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
        <p className="text-sm text-ink-secondary">No courses in progress right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {inProgress.map(({ course, grade }) => {
        const isAtRisk = grade.percentage !== null && grade.percentage < AT_RISK_THRESHOLD;
        return (
          <div key={course.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-primary">
                  {course.course_code && <span className="font-mono text-ink-tertiary">{course.course_code} </span>}
                  {course.course_name}
                </p>
                <p className="mt-0.5 text-xs text-ink-tertiary">
                  {grade.gradedWeight.toFixed(0)}% graded
                  {grade.missingAssignmentCount > 0 &&
                    ` · ${grade.missingAssignmentCount} assignment${grade.missingAssignmentCount === 1 ? "" : "s"} not yet graded`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {grade.grade ? (
                  <p className={cn("text-sm font-medium", isAtRisk ? "text-status-atRisk" : "text-ink-primary")}>
                    {grade.grade}
                    {grade.percentage !== null && (
                      <span className="ml-1 font-mono text-xs text-ink-tertiary">{grade.percentage.toFixed(1)}%</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-ink-tertiary">No grades yet</p>
                )}
                <p className="text-[10px] uppercase tracking-wide text-ink-tertiary">Projected</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
