"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { champlainUndergraduatePolicy } from "@/lib/academicPolicy/champlain";
import { computeCourseGrade, computeCumulativeGpa, solveRequiredGrade } from "@/lib/academicStanding/grades";
import type { DegreeWithFullTerms } from "@/lib/academicStanding/build";
import type { RequiredGradeResult } from "@/lib/academicStanding/types";

const policy = champlainUndergraduatePolicy;
const realGradeBands = policy.gradingScale.filter((band) => band.minPercent >= 0);

// Every override sets status to "completed" too, not just the grade —
// computeCourseGrade's isGpaBearing flag requires status === "completed",
// so an override alone on an in-progress course wouldn't count toward GPA.
function courseLabel(course: { course_code: string | null; course_name: string }): string {
  return course.course_code ? `${course.course_code} — ${course.course_name}` : course.course_name;
}

export function ScenarioPlanner({ degree }: { degree: DegreeWithFullTerms }) {
  const allCourses = useMemo(() => degree.terms.flatMap((term) => term.courses), [degree]);

  const inProgressCourses = useMemo(
    () => allCourses.filter((course) => course.status === "in_progress" || course.status === "planned"),
    [allCourses]
  );

  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [solveCourseId, setSolveCourseId] = useState(inProgressCourses[0]?.id ?? "");
  const [targetGpa, setTargetGpa] = useState("3.65");
  const [solveResult, setSolveResult] = useState<RequiredGradeResult | null>(null);

  const realCourseGrades = useMemo(
    () => allCourses.map((course) => ({ course, grade: computeCourseGrade(course, course.assignments, policy) })),
    [allCourses]
  );
  const realCumulative = useMemo(() => computeCumulativeGpa(realCourseGrades, policy), [realCourseGrades]);

  const hasOverrides = Object.values(overrides).some((grade) => grade);

  const scenarioCumulative = useMemo(() => {
    if (!hasOverrides) return realCumulative;
    const scenarioCourseGrades = realCourseGrades.map((cg) => {
      const overrideGrade = overrides[cg.course.id];
      if (!overrideGrade) return cg;
      const scenarioCourse = { ...cg.course, status: "completed" as const, final_grade_override: overrideGrade };
      return { course: scenarioCourse, grade: computeCourseGrade(scenarioCourse, [], policy) };
    });
    return computeCumulativeGpa(scenarioCourseGrades, policy);
  }, [realCourseGrades, overrides, hasOverrides, realCumulative]);

  function handleSolve() {
    const target = Number(targetGpa);
    if (!solveCourseId || Number.isNaN(target)) return;
    setSolveResult(solveRequiredGrade(target, solveCourseId, realCourseGrades, policy));
  }

  const gradeOptions = [{ value: "", label: "No change" }, ...realGradeBands.map((band) => ({ value: band.grade, label: band.grade }))];
  const solveCourseOptions = inProgressCourses.map((course) => ({ value: course.id, label: courseLabel(course) }));

  return (
    <WorkspaceSection eyebrow="What-if // no data is changed" title="Scenario planner">
      <div className="signal-field px-5 py-7 md:px-7">
        <p className="text-xs text-ink-secondary">
          Set a hypothetical final grade on any in-progress course to see the effect on cumulative GPA. Nothing here is
          saved — real grades only change when a course is actually completed.
        </p>

        {inProgressCourses.length === 0 ? (
          <p className="mt-5 text-sm text-ink-secondary">No in-progress or planned courses to run a scenario on right now.</p>
        ) : (
          <>
            <div className="mt-5 space-y-2.5">
              {inProgressCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between gap-3 border-b border-border-subtle pb-2.5 last:border-0 last:pb-0">
                  <span className="truncate text-sm text-ink-primary">{courseLabel(course)}</span>
                  <Select
                    aria-label={`Hypothetical grade for ${courseLabel(course)}`}
                    value={overrides[course.id] ?? ""}
                    onChange={(e) => setOverrides((prev) => ({ ...prev, [course.id]: e.target.value }))}
                    options={gradeOptions}
                    className="w-24 shrink-0 py-1.5 text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-baseline gap-5 border-t border-border-subtle pt-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">Current</p>
                <p className="font-mono text-3xl font-bold tabular-nums text-ink-primary">
                  {realCumulative.gpa != null ? realCumulative.gpa.toFixed(2) : "—"}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-tertiary" aria-hidden />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wide text-signal/75">Projected</p>
                <p className="font-mono text-3xl font-bold tabular-nums text-signal">
                  {scenarioCumulative.gpa != null ? scenarioCumulative.gpa.toFixed(2) : "—"}
                </p>
              </div>
              {!hasOverrides && <p className="text-xs text-ink-tertiary">Set a hypothetical grade above to see this change.</p>}
            </div>
          </>
        )}

        {inProgressCourses.length > 0 && (
          <div className="mt-6 border-t border-border-subtle pt-5">
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-signal/75">Solve for a target</p>
            <div className="mt-3 flex flex-wrap items-end gap-2.5">
              <Select label="Course" value={solveCourseId} onChange={(e) => setSolveCourseId(e.target.value)} options={solveCourseOptions} />
              <Input
                label="Target cumulative GPA"
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={targetGpa}
                onChange={(e) => setTargetGpa(e.target.value)}
                className="w-32"
              />
              <Button type="button" onClick={handleSolve} disabled={!solveCourseId}>
                Solve
              </Button>
            </div>
            {solveResult && (
              <p className="mt-3 text-sm text-ink-secondary">
                {solveResult.achievable
                  ? `A ${solveResult.grade} in this course reaches a ${solveResult.projectedGpa!.toFixed(2)} cumulative GPA.`
                  : `Even an ${solveResult.grade} in this course only reaches ${solveResult.projectedGpa!.toFixed(2)} — the ${targetGpa} target isn't reachable from this course alone.`}
              </p>
            )}
          </div>
        )}
      </div>
    </WorkspaceSection>
  );
}
