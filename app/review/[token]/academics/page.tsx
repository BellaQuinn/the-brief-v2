import { createAdminClient } from "@/lib/supabase/admin";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { ReadOnlyDegreeCard, ReadOnlyTermsList } from "@/components/shared/ReadOnlyAcademics";
import type { DegreeWithTerms } from "@/types/database.types";

const PUBLIC_USER_EMAIL = "ktalley132@gmail.com";

export default async function ReviewAcademicsPage() {
  const supabase = createAdminClient();

  const { data: profile } = await supabase.from("users").select("id").eq("email", PUBLIC_USER_EMAIL).single();

  const { data: degree } = profile
    ? await supabase
        .from("degrees")
        .select("*, terms(*, courses(*))")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: true, referencedTable: "terms" })
        .order("created_at", { ascending: true, referencedTable: "terms.courses" })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const typedDegree = degree as DegreeWithTerms | null;

  return (
    <div>
      <WorkspaceHeader eyebrow="REVIEW // ACADEMICS" title="Degree plan" />
      <div className="space-y-6 px-8 py-6">
        {typedDegree ? (
          <ReadOnlyDegreeCard degree={typedDegree} />
        ) : (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">No degree plan yet.</p>
          </div>
        )}
        {typedDegree && <ReadOnlyTermsList terms={typedDegree.terms} />}
      </div>
    </div>
  );
}
