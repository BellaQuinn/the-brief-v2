import { addDays, format, startOfDay, endOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { FocusList } from "@/components/brief/FocusList";
import { StatTile } from "@/components/brief/StatTile";
import type { AssignmentWithContext } from "@/types/database.types";

export default async function BriefPage() {
  const supabase = await createClient();
  const now = new Date();
  const weekOut = addDays(now, 7);

  // Assignments are queried directly here — never duplicated or cached
  // separately. Academics and any future calendar view read from the same
  // table, so "today's focus" is always in sync with what's on a course page.
  const { data: dueAssignments } = await supabase
    .from("assignments")
    .select("*, course:courses(id, course_code, course_name)")
    .not("status", "in", "(submitted,graded)")
    .lte("due_date", weekOut.toISOString())
    .order("due_date", { ascending: true })
    .returns<AssignmentWithContext[]>();

  const today = (dueAssignments ?? []).filter(
    (a) => a.due_date && new Date(a.due_date) <= endOfDay(now)
  );
  const upcoming = (dueAssignments ?? []).filter(
    (a) => a.due_date && new Date(a.due_date) > endOfDay(now)
  );

  const [{ count: openApplications }, { count: activeCerts }] = await Promise.all([
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["applied", "phone_screen", "interviewing"]),
    supabase
      .from("certifications")
      .select("*", { count: "exact", head: true })
      .in("status", ["studying", "scheduled"]),
  ]);

  return (
    <div>
      <WorkspaceHeader
        eyebrow={`Briefing // ${format(now, "EEEE, MMMM d")}`}
        title="What deserves your attention today"
      />

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
