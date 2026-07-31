import { addDays, endOfDay } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { FocusList } from "@/components/brief/FocusList";
import { StatTile } from "@/components/brief/StatTile";
import type { AssignmentWithContext } from "@/types/database.types";

// Single-tenant for now (see components/public/PublicProgress.tsx) — no
// per-user filter needed on assignments since there's only one account's
// data in the project.
const PUBLIC_USER_EMAIL = "ktalley132@gmail.com";

export default async function ReviewBriefPage() {
  const supabase = createAdminClient();
  const now = new Date();
  const weekOut = addDays(now, 7);

  const { data: profile } = await supabase.from("users").select("id").eq("email", PUBLIC_USER_EMAIL).single();

  const { data: dueAssignments } = await supabase
    .from("assignments")
    .select("*, course:courses(id, course_code, course_name)")
    .not("status", "in", "(submitted,graded)")
    .lte("due_date", weekOut.toISOString())
    .order("due_date", { ascending: true })
    .returns<AssignmentWithContext[]>();

  const today = (dueAssignments ?? []).filter((a) => a.due_date && new Date(a.due_date) <= endOfDay(now));
  const upcoming = (dueAssignments ?? []).filter((a) => a.due_date && new Date(a.due_date) > endOfDay(now));

  const [{ count: openApplications }, { count: activeCerts }] = await Promise.all([
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile?.id ?? "")
      .in("status", ["applied", "phone_screen", "interviewing"]),
    supabase
      .from("certifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile?.id ?? "")
      .in("status", ["studying", "scheduled"]),
  ]);

  return (
    <div>
      <WorkspaceHeader eyebrow="REVIEW // BRIEF" title="What deserves attention" />

      <div className="grid grid-cols-3 gap-4 px-8 pt-6">
        <StatTile
          label="Due today"
          value={String(today.length)}
          tone={today.length > 0 ? "atRisk" : "onTrack"}
        />
        <StatTile label="Open applications" value={String(openApplications ?? 0)} />
        <StatTile label="Certifications in motion" value={String(activeCerts ?? 0)} />
      </div>

      <section className="px-8 pt-8">
        <h2 className="mb-3 text-sm font-medium text-ink-primary">Today&apos;s focus</h2>
        <FocusList items={today} />
      </section>

      <section className="px-8 pb-8 pt-8">
        <h2 className="mb-3 text-sm font-medium text-ink-primary">On the horizon — next 7 days</h2>
        <FocusList items={upcoming} />
      </section>
    </div>
  );
}
