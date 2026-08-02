import { createClient } from "@/lib/supabase/server";
import { buildCalendarEvents } from "@/lib/calendar";
import { CalendarClient } from "@/components/calendar/CalendarClient";
import type {
  AssignmentWithDegreeContext,
  Certification,
  LawSchool,
  Milestone,
  NetworkingContact,
  Scholarship,
} from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [
    { data: assignments },
    { data: certifications },
    { data: networking },
    { data: lawSchools },
    { data: scholarships },
    { data: milestones },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("assignments")
      .select("*, course:courses(course_code, course_name, term:terms(degree:degrees(degree_name)))")
      .not("due_date", "is", null)
      .returns<AssignmentWithDegreeContext[]>(),
    supabase.from("certifications").select("*").not("exam_date", "is", null),
    supabase.from("networking").select("*").not("next_follow_up", "is", null),
    supabase.from("law_schools").select("*").not("application_deadline", "is", null),
    supabase.from("scholarships").select("*").not("deadline", "is", null),
    supabase.from("milestones").select("*").not("target_date", "is", null),
    authUser
      ? supabase.from("users").select("lsat_planned_test_date").eq("id", authUser.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const events = buildCalendarEvents(
    {
      assignments: assignments ?? [],
      certifications: (certifications as Certification[]) ?? [],
      networking: (networking as NetworkingContact[]) ?? [],
      lawSchools: (lawSchools as LawSchool[]) ?? [],
      scholarships: (scholarships as Scholarship[]) ?? [],
      milestones: (milestones as Milestone[]) ?? [],
      lsatPlannedTestDate: profile?.lsat_planned_test_date ?? null,
    },
    ""
  );

  return <CalendarClient events={events} />;
}
