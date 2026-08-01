import { cn } from "@/lib/utils";
import type { CourseGradeResult } from "@/lib/academicStanding/types";
import type { Course } from "@/types/database.types";

const AT_RISK_THRESHOLD = 70; // below a C-

export function CoursePerformanceList({ courses }: { courses: Array<{ course: Course; grade: CourseGradeResult }> }) {
  const inProgress = courses.filter(({ grade }) => grade.isProvisional);

  if (inProgress.length === 0) {
    return (
      <div className="border-y border-border-subtle px-6 py-8 text-center">
        <p className="text-sm text-ink-secondary">No courses in progress right now.</p>
      </div>
    );
  }

  return (
    <div className="trace-rail border-y border-border-subtle py-2">
      {inProgress.map(({ course, grade }, index) => {
        const isAtRisk = grade.percentage !== null && grade.percentage < AT_RISK_THRESHOLD;
        const position = grade.percentage == null ? 0 : Math.max(0, Math.min(100, grade.percentage));
        return (
          <div key={course.id} className="relative grid gap-3 py-4 pl-9 md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
            <span aria-hidden className="trace-node" />
            <span aria-hidden className="trace-connector" />
            <div className="flex items-start gap-3">
              <span className="font-mono text-[8px] text-accent/80">{String(index + 1).padStart(2, "0")}</span>
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
            </div>
            <div className="md:text-right">
              <div className="flex items-baseline justify-between gap-3 md:justify-end">
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
              <div className="relative mt-2 h-3">
                <div className="absolute inset-x-0 top-1.5 h-px bg-border-strong" />
                {grade.percentage != null && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-0 h-3 w-px",
                      isAtRisk ? "bg-status-atRisk" : "bg-signal"
                    )}
                    style={{ left: `${position}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
