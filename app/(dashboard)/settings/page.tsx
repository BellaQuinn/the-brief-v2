import { createClient } from "@/lib/supabase/server";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PasswordForm } from "@/components/settings/PasswordForm";

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

  return (
    <div>
      <WorkspaceHeader eyebrow="SETTINGS" title="Settings" />
      <div className="space-y-6 px-8 py-6">
        <ProfileForm profile={profile!} />
        <PasswordForm />
      </div>
    </div>
  );
}
