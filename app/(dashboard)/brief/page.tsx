import { addDays, endOfDay, format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { MissionBrief } from "@/components/brief/MissionBrief";
import { FocusList } from "@/components/brief/FocusList";
import { TicketModule } from "@/components/brief/instruments/TicketModule";
import { TrackerModule } from "@/components/brief/instruments/TrackerModule";
import { GaugeModule } from "@/components/brief/instruments/GaugeModule";
import { honorsRangeLabel } from "@/components/brief/GpaCard";
import { champlainUndergraduatePolicy } from "@/lib/academicPolicy/champlain";
import { buildAcademicStandingData, type DegreeWithFullTerms } from "@/lib/academicStanding/build";
import { buildMissionBrief } from "@/lib/missionBrief";
import { groupApplicationPipeline } from "@/lib/applicationPipeline";
import { nextCertificationExam } from "@/lib/certifications";
import type { Application, AssignmentWithContext, Certification } from "@/types/database.types";

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

  // Full rows, not just counts — the instrument row groups applications
  // into a real pipeline and reads the nearest certification exam date,
  // neither of which a head-count query can answer.
  const [{ data: applications }, { data: certifications }, { data: activeDegree }] = await Promise.all([
    supabase.from("applications").select("*").in("status", ["saved", "applied", "phone_screen", "interviewing", "offer"]),
    supabase.from("certifications").select("*").in("status", ["studying", "scheduled"]),
    // Same active-degree rule as the due-today query above — the GPA
    // gauge reflects "am I on track right now," not every degree on file.
    supabase
      .from("degrees")
      .select("*, terms(*, courses(*, assignments(*)))")
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ]);

  const typedApplications = (applications as Application[]) ?? [];
  const typedCertifications = (certifications as Certification[]) ?? [];
  const pipeline = groupApplicationPipeline(typedApplications);
  const openApplications = pipeline.saved + pipeline.applied + pipeline.interviewing + pipeline.offer;
  const nextExam = nextCertificationExam(typedCertifications);

  const typedActiveDegree = activeDegree as DegreeWithFullTerms | null;
  const standing = typedActiveDegree ? buildAcademicStandingData(typedActiveDegree, champlainUndergraduatePolicy) : null;
  const cumulativeGpa = standing?.cumulativeGpa.gpa ?? null;
  const gpaCaption = standing ? honorsRangeLabel(standing.termGpa?.gpa ?? null) ?? "Cumulative GPA" : null;

  const firstName = profile?.first_name ?? null;
  const missionBrief = buildMissionBrief(today, upcoming, openApplications, typedCertifications.length);

  return (
    <div>
      <div className="px-4 pt-8 md:px-8">
        <MissionBrief
          data={missionBrief}
          dayLabel={format(now, "EEEE, MMMM d")}
          greeting={firstName ? `${greeting(now.getHours())}, ${firstName}.` : `${greeting(now.getHours())}.`}
        />
      </div>

      <div className="flex flex-wrap items-stretch gap-4 px-4 pt-8 md:px-8">
        <TicketModule
          label="Due today"
          value={today.length}
          unit="due"
          caption={today.length === 0 ? "Nothing due today." : "See today's focus below."}
          attention={today.length > 0}
        />
        <TrackerModule pipeline={pipeline} />
        {standing && (
          <GaugeModule
            label="Standing"
            value={cumulativeGpa !== null ? cumulativeGpa.toFixed(2) : "—"}
            unit="gpa"
            caption={gpaCaption ?? "Not available yet"}
            fraction={cumulativeGpa !== null ? cumulativeGpa / 4 : 0}
            color="signal"
            empty={cumulativeGpa === null}
          />
        )}
        <GaugeModule
          label="Monitoring"
          value={nextExam ? String(nextExam.daysUntil) : "—"}
          unit="days"
          caption={nextExam ? nextExam.name : "No exam scheduled"}
          fraction={nextExam ? Math.max(0, 1 - nextExam.daysUntil / 90) : 0}
          color="accent"
          empty={!nextExam}
        />
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
