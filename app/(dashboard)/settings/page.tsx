import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { NotificationsForm } from "@/components/settings/NotificationsForm";
import { PortfolioPreviewCard } from "@/components/settings/PortfolioPreviewCard";
import { buildSettingsWorkspaceBrief } from "@/lib/workspaceBriefs";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

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

  // Built from the real request host rather than a hardcoded env var, so
  // this stays correct whether she's on the preview URL, a future
  // production domain, or localhost.
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const reviewToken = process.env.REVIEW_ACCESS_TOKEN;
  const portfolioPreviewUrl = reviewToken && host ? `${protocol}://${host}/review/${reviewToken}/brief` : null;

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
        <WorkspaceSection eyebrow="Reminders" title="Push notifications">
          <NotificationsForm />
        </WorkspaceSection>
        {portfolioPreviewUrl && (
          <WorkspaceSection eyebrow="Shareable record" title="Portfolio Preview">
            <PortfolioPreviewCard url={portfolioPreviewUrl} />
          </WorkspaceSection>
        )}
      </div>
    </div>
  );
}
