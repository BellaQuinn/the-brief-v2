import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { GpaOverview } from "@/components/academicStanding/GpaOverview";
import { CoursePerformanceList } from "@/components/academicStanding/CoursePerformanceList";
import { HonorsProgress } from "@/components/academicStanding/HonorsProgress";
import { HonorSocietyProgress } from "@/components/academicStanding/HonorSocietyProgress";
import type { Course } from "@/types/database.types";
import type {
  CourseGradeResult,
  CumulativeGpaResult,
  GraduationHonorsForecast,
  HonorSocietyProgressResult,
  HonorsListStatusEntry,
  TermGpaResult,
} from "@/lib/academicStanding/types";
import { buildAcademicStandingWorkspaceBrief } from "@/lib/workspaceBriefs";

// No interactivity here — everything is server-computed and passed down,
// so this stays a plain (server) component rather than "use client".
export function AcademicStandingClient({
  eyebrow = "ACADEMIC STANDING",
  termGpa,
  cumulativeGpa,
  courses,
  honorsStatuses,
  graduationForecast,
  honorSocietyProgress,
}: {
  eyebrow?: string;
  termGpa: TermGpaResult | null;
  cumulativeGpa: CumulativeGpaResult;
  courses: Array<{ course: Course; grade: CourseGradeResult }>;
  honorsStatuses: HonorsListStatusEntry[];
  graduationForecast: GraduationHonorsForecast;
  honorSocietyProgress: HonorSocietyProgressResult[];
}) {
  const inProgressCount = courses.filter(({ grade }) => grade.isProvisional).length;
  const brief = buildAcademicStandingWorkspaceBrief({
    cumulativeGpa: cumulativeGpa.gpa,
    termGpa: termGpa?.gpa ?? null,
    completedCredits: cumulativeGpa.basis.completedCredits,
    inProgressCourseCount: inProgressCount,
  });

  return (
    <div>
      <WorkspaceBrief
        eyebrow={eyebrow}
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${cumulativeGpa.basis.completedCredits} completed credits`}
      />

      <div className="space-y-10 px-4 py-7 md:px-8 md:py-8">
        <WorkspaceSection eyebrow="Standing signal" title="GPA position">
          <GpaOverview termGpa={termGpa} cumulativeGpa={cumulativeGpa} />
        </WorkspaceSection>

        <WorkspaceSection eyebrow="Active evidence" title="Course performance">
          <CoursePerformanceList courses={courses} />
        </WorkspaceSection>

        <WorkspaceSection eyebrow="Recognition thresholds" title="Honors progress">
          <HonorsProgress statuses={honorsStatuses} graduationForecast={graduationForecast} />
        </WorkspaceSection>

        <WorkspaceSection eyebrow="Eligibility matrix" title="Honor society">
          <HonorSocietyProgress progress={honorSocietyProgress} />
        </WorkspaceSection>
      </div>
    </div>
  );
}
