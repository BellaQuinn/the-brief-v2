import { createAdminClient } from "@/lib/supabase/admin";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { ReadOnlyResources } from "@/components/shared/ReadOnlyResources";
import type { Resource } from "@/types/database.types";

const PUBLIC_USER_EMAIL = "ktalley132@gmail.com";

export default async function ReviewResourcesPage() {
  const supabase = createAdminClient();

  const { data: profile } = await supabase.from("users").select("id").eq("email", PUBLIC_USER_EMAIL).single();

  const { data: resources } = profile
    ? await supabase
        .from("resources")
        .select("*")
        .eq("user_id", profile.id)
        .order("favorite", { ascending: false })
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <WorkspaceHeader eyebrow="PORTFOLIO PREVIEW // RESOURCES" title="Resource library" />
      <div className="px-4 py-6 md:px-8">
        <ReadOnlyResources resources={(resources as Resource[]) ?? []} />
      </div>
    </div>
  );
}
