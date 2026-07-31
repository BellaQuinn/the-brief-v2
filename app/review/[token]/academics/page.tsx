import { createAdminClient } from "@/lib/supabase/admin";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { ReadOnlyDegreeCard, ReadOnlyTermsList } from "@/components/shared/ReadOnlyAcademics";
import { sortDegrees } from "@/lib/utils";
import type { DegreeWithTerms } from "@/types/database.types";

const PUBLIC_USER_EMAIL = "ktalley132@gmail.com";

export default async function ReviewAcademicsPage() {
  const supabase = createAdminClient();

  const { data: profile } = await supabase.from("users").select("id").eq("email", PUBLIC_USER_EMAIL).single();

  const { data: degrees } = profile
    ? await supabase
        .from("degrees")
        .select("*, terms(*, courses(*))")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: true })
        .order("created_at", { ascending: true, referencedTable: "terms" })
        .order("created_at", { ascending: true, referencedTable: "terms.courses" })
    : { data: [] };

  const typedDegrees = sortDegrees((degrees as DegreeWithTerms[]) ?? []);

  return (
    <div>
      <WorkspaceHeader eyebrow="PORTFOLIO PREVIEW // ACADEMICS" title="Overview" hideDots />
      <div className="space-y-6 px-4 py-6 md:px-8">
        {typedDegrees.length > 0 ? (
          <div className="space-y-8">
            {typedDegrees.map((degree) => (
              <div key={degree.id}>
                <ReadOnlyDegreeCard degree={degree} />
                <ReadOnlyTermsList terms={degree.terms} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">No degree plan yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
