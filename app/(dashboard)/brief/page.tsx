import { addDays, endOfDay, format } from "date-fns";
import { AlertCircle, Award, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { FocusList } from "@/components/brief/FocusList";
import { StatTile } from "@/components/brief/StatTile";
import { GpaCard } from "@/components/brief/GpaCard";
import { champlainUndergraduatePolicy } from "@/lib/academicPolicy/champlain";
import { buildAcademicStandingData, type DegreeWithFullTerms } from "@/lib/academicStanding/build";
import type { AssignmentWithContext } from "@/types/database.types";

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function BriefPage() {
  const supabase = await createClient();
  const now = new Date();
  const weekOut = addDays(now, 7);

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const { data: profile } = authUser
    ? await supabase.from("users").select("first_name").eq("id", authUser.id).single()
    : { data: null };

  // Assignments are queried directly here — never duplicated or cached
  // separately. Academics and any future calendar view read from the same
  // table, so "today's focus" is always in sync with what's on a course page.
  // Scoped to the active degree via inner joins: a planned degree (e.g. a
  // Master's not started yet) can carry its own future terms/courses, and
  // those shouldn't surface here until that degree actually becomes active.
  const { data: dueAssignments } = await supabase
    .from("assignments")
    .select(
      "*, course:courses!inner(id, course_code, course_name, term:terms!inner(degree:degrees!inner(status)))"
    )
    .not("status", "in", "(submitted,graded)")
    .lte("due_date", weekOut.toISOString())
    .eq("course.term.degree.status", "active")
    .order("due_date", { ascending: true })
    .returns<AssignmentWithContext[]>();

  const today = (dueAssignments ?? []).filter(
    (a) => a.due_date && new Date(a.due_date) <= endOfDay(now)
  );
  const upcoming = (dueAssignments ?? []).filter(
    (a) => a.due_date && new Date(a.due_date) > endOfDay(now)
  );

  const [{ count: openApplications }, { count: activeCerts }, { data: activeDegree }] = await Promise.all([
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["applied", "phone_screen", "interviewing"]),
    supabase
      .from("certifications")
      .select("*", { count: "exact", head: true })
      .in("status", ["studying", "scheduled"]),
    // Same active-degree rule as the due-today query above — the GPA card
    // reflects "am I on track right now," not every degree on file.
    supabase
      .from("degrees")
      .select("*, terms(*, courses(*, assignments(*)))")
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ]);

  const typedActiveDegree = activeDegree as DegreeWithFullTerms | null;
  const standing = typedActiveDegree ? buildAcademicStandingData(typedActiveDegree, champlainUndergraduatePolicy) : null;

  const firstName = profile?.first_name ?? null;

  return (
    <div>
      <WorkspaceHeader
        eyebrow={format(now, "EEEE, MMMM d")}
        title={firstName ? `${greeting(now.getHours())}, ${firstName}.` : `${greeting(now.getHours())}.`}
        subtitle="Here's what deserves your attention today."
      />

      <div className="grid grid-cols-1 gap-4 px-4 pt-6 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
        <StatTile
          label="Due today"
          value={String(today.length)}
          tone={today.length > 0 ? "atRisk" : "onTrack"}
          icon={AlertCircle}
        />
        <StatTile label="Open applications" value={String(openApplications ?? 0)} icon={Briefcase} />
        <StatTile label="Certifications in motion" value={String(activeCerts ?? 0)} icon={Award} />
        {standing && (
          <GpaCard
            cumulativeGpa={standing.cumulativeGpa.gpa}
            termGpa={standing.termGpa?.gpa ?? null}
            graduationForecast={standing.graduationForecast}
          />
        )}
      </div>

      <section className="px-4 pt-8 md:px-8">
        <h2 className="mb-3 text-sm font-medium text-ink-primary">Today&apos;s focus</h2>
        <FocusList items={today} />
      </section>

      <section className="px-4 pb-8 pt-8 md:px-8">
        <h2 className="mb-3 text-sm font-medium text-ink-primary">On the horizon — next 7 days</h2>
        <FocusList items={upcoming} />
      </section>
    </div>
  );
}
