import { createAdminClient } from "@/lib/supabase/admin";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { ReadOnlyCertificationsList } from "@/components/shared/ReadOnlyCertifications";
import { ReadOnlyApplications } from "@/components/shared/ReadOnlyApplications";
import { ReadOnlyNetworking } from "@/components/shared/ReadOnlyNetworking";
import type { Application, Certification, NetworkingContact } from "@/types/database.types";

const PUBLIC_USER_EMAIL = "ktalley132@gmail.com";

export default async function ReviewCareerPage() {
  const supabase = createAdminClient();

  const { data: profile } = await supabase.from("users").select("id").eq("email", PUBLIC_USER_EMAIL).single();

  const [{ data: certifications }, { data: applications }, { data: networking }] = profile
    ? await Promise.all([
        supabase
          .from("certifications")
          .select("*")
          .eq("user_id", profile.id)
          .order("exam_date", { ascending: true, nullsFirst: false }),
        supabase.from("applications").select("*").eq("user_id", profile.id).order("created_at", { ascending: true }),
        supabase
          .from("networking")
          .select("*")
          .eq("user_id", profile.id)
          .order("next_follow_up", { ascending: true, nullsFirst: false }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  return (
    <div>
      <WorkspaceHeader eyebrow="REVIEW // CAREER" title="Career" />
      <div className="space-y-8 px-8 py-6">
        <ReadOnlyCertificationsList certifications={(certifications as Certification[]) ?? []} />
        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Job applications</h2>
          <ReadOnlyApplications applications={(applications as Application[]) ?? []} />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Networking</h2>
          <ReadOnlyNetworking contacts={(networking as NetworkingContact[]) ?? []} />
        </section>
      </div>
    </div>
  );
}
