import { createClient } from "@/lib/supabase/server";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { champlainUndergraduatePolicy } from "@/lib/academicPolicy/champlain";
import { buildAcademicStandingData, type DegreeWithFullTerms } from "@/lib/academicStanding/build";
import { AcademicStandingClient } from "@/components/academicStanding/AcademicStandingClient";

export default async function AcademicStandingPage() {
  const supabase = await createClient();

  // Active-degree only, same rule as the Brief dashboard — Academic
  // Standing answers "am I on track right now," not a full-timeline view.
  const { data: degree } = await supabase
    .from("degrees")
    .select("*, terms(*, courses(*, assignments(*)))")
    .eq("status", "active")
    .order("created_at", { ascending: true, referencedTable: "terms" })
    .order("created_at", { ascending: true, referencedTable: "terms.courses" })
    .limit(1)
    .maybeSingle();

  const typedDegree = degree as DegreeWithFullTerms | null;

  if (!typedDegree) {
    return (
      <div>
        <WorkspaceHeader eyebrow="ACADEMIC STANDING" title="Academic Standing" hideDots />
        <div className="px-4 py-6 md:px-8">
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">No active degree yet — add one in Academics to see your standing here.</p>
          </div>
        </div>
      </div>
    );
  }

  const data = buildAcademicStandingData(typedDegree, champlainUndergraduatePolicy);

  return (
    <AcademicStandingClient
      termGpa={data.termGpa}
      cumulativeGpa={data.cumulativeGpa}
      courses={data.courseGrades}
      honorsStatuses={data.honorsStatuses}
      graduationForecast={data.graduationForecast}
      honorSocietyProgress={data.honorSocietyProgress}
    />
  );
}
