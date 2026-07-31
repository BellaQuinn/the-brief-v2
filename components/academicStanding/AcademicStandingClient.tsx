import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
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
  return (
    <div>
      <WorkspaceHeader
        eyebrow={eyebrow}
        title="Academic Standing"
        hideDots
        subtitle="Academic Standing automatically calculates your GPA, honors, and academic progress from your coursework. No manual GPA tracking required."
      />

      <div className="space-y-8 px-4 py-6 md:px-8">
        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">GPA Overview</h2>
          <GpaOverview termGpa={termGpa} cumulativeGpa={cumulativeGpa} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Course Performance</h2>
          <CoursePerformanceList courses={courses} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Honors Progress</h2>
          <HonorsProgress statuses={honorsStatuses} graduationForecast={graduationForecast} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Honor Society</h2>
          <HonorSocietyProgress progress={honorSocietyProgress} />
        </section>
      </div>
    </div>
  );
}
