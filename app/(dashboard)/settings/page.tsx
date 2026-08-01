import { createClient } from "@/lib/supabase/server";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { buildSettingsWorkspaceBrief } from "@/lib/workspaceBriefs";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, last_name, email, timezone")
    .eq("id", authUser!.id)
    .single();
  const brief = buildSettingsWorkspaceBrief({
    hasName: Boolean(profile?.first_name || profile?.last_name),
    hasTimezone: Boolean(profile?.timezone),
  });

  return (
    <div>
      <WorkspaceBrief
        eyebrow="Settings // System configuration"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={profile?.timezone ?? "timezone not set"}
      />
      <div className="space-y-10 px-4 py-7 md:px-8 md:py-8">
        <WorkspaceSection eyebrow="Identity record" title="Operator profile">
          <ProfileForm profile={profile!} />
        </WorkspaceSection>
        <WorkspaceSection eyebrow="Security protocol" title="Credential rotation">
          <PasswordForm />
        </WorkspaceSection>
      </div>
    </div>
  );
}
