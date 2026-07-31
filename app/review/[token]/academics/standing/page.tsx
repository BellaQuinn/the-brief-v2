import { createAdminClient } from "@/lib/supabase/admin";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { GpaOverview } from "@/components/academicStanding/GpaOverview";
import { HonorsProgress } from "@/components/academicStanding/HonorsProgress";
import { HonorSocietyProgress } from "@/components/academicStanding/HonorSocietyProgress";
import { champlainUndergraduatePolicy } from "@/lib/academicPolicy/champlain";
import { buildAcademicStandingData, type DegreeWithFullTerms } from "@/lib/academicStanding/build";

const PUBLIC_USER_EMAIL = "ktalley132@gmail.com";

export default async function ReviewAcademicStandingPage() {
  const supabase = createAdminClient();

  const { data: profile } = await supabase.from("users").select("id").eq("email", PUBLIC_USER_EMAIL).single();

  const { data: degree } = profile
    ? await supabase
        .from("degrees")
        .select("*, terms(*, courses(*, assignments(*)))")
        .eq("user_id", profile.id)
        .eq("status", "active")
        .order("created_at", { ascending: true, referencedTable: "terms" })
        .order("created_at", { ascending: true, referencedTable: "terms.courses" })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const typedDegree = degree as DegreeWithFullTerms | null;
  // GPA and honors only — no course-by-course assignment detail on the
  // most public surface this data appears on.
  const data = typedDegree ? buildAcademicStandingData(typedDegree, champlainUndergraduatePolicy) : null;

  return (
    <div>
      <WorkspaceHeader
        eyebrow="PORTFOLIO PREVIEW // ACADEMIC STANDING"
        title="Academic Standing"
        hideDots
        subtitle="GPA and honors progress, calculated automatically from coursework."
      />
      <div className="space-y-8 px-4 py-6 md:px-8">
        {!data ? (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">No active degree yet.</p>
          </div>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-sm font-medium text-ink-primary">GPA Overview</h2>
              <GpaOverview termGpa={data.termGpa} cumulativeGpa={data.cumulativeGpa} />
            </section>
            <section>
              <h2 className="mb-3 text-sm font-medium text-ink-primary">Honors Progress</h2>
              <HonorsProgress statuses={data.honorsStatuses} graduationForecast={data.graduationForecast} />
            </section>
            <section>
              <h2 className="mb-3 text-sm font-medium text-ink-primary">Honor Society</h2>
              <HonorSocietyProgress progress={data.honorSocietyProgress} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
