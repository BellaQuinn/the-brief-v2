import { createClient } from "@/lib/supabase/server";
import { buildCalendarEvents } from "@/lib/calendar";
import { CalendarClient } from "@/components/calendar/CalendarClient";
import type { AssignmentWithDegreeContext, Certification, NetworkingContact } from "@/types/database.types";

export default async function CalendarPage() {
  const supabase = await createClient();

  const [{ data: assignments }, { data: certifications }, { data: networking }] = await Promise.all([
    supabase
      .from("assignments")
      .select("*, course:courses(course_code, course_name, term:terms(degree:degrees(degree_name)))")
      .not("due_date", "is", null)
      .returns<AssignmentWithDegreeContext[]>(),
    supabase.from("certifications").select("*").not("exam_date", "is", null),
    supabase.from("networking").select("*").not("next_follow_up", "is", null),
  ]);

  const events = buildCalendarEvents(
    {
      assignments: assignments ?? [],
      certifications: (certifications as Certification[]) ?? [],
      networking: (networking as NetworkingContact[]) ?? [],
    },
    ""
  );

  return <CalendarClient events={events} />;
}
