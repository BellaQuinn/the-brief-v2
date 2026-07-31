import { createAdminClient } from "@/lib/supabase/admin";
import { buildCalendarEvents } from "@/lib/calendar";
import { CalendarClient } from "@/components/calendar/CalendarClient";
import type { AssignmentWithDegreeContext, Certification, NetworkingContact } from "@/types/database.types";

const PUBLIC_USER_EMAIL = "ktalley132@gmail.com";

export default async function ReviewCalendarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase.from("users").select("id").eq("email", PUBLIC_USER_EMAIL).single();

  const [{ data: assignments }, { data: certifications }, { data: networking }] = profile
    ? await Promise.all([
        supabase
          .from("assignments")
          .select(
            "*, course:courses!inner(course_code, course_name, term:terms!inner(degree:degrees!inner(degree_name, user_id)))"
          )
          .eq("course.term.degree.user_id", profile.id)
          .not("due_date", "is", null)
          .returns<AssignmentWithDegreeContext[]>(),
        supabase.from("certifications").select("*").eq("user_id", profile.id).not("exam_date", "is", null),
        supabase.from("networking").select("*").eq("user_id", profile.id).not("next_follow_up", "is", null),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const events = buildCalendarEvents(
    {
      assignments: (assignments as AssignmentWithDegreeContext[]) ?? [],
      certifications: (certifications as Certification[]) ?? [],
      networking: (networking as NetworkingContact[]) ?? [],
    },
    `/review/${token}`
  );

  return <CalendarClient events={events} eyebrow="PORTFOLIO PREVIEW // CALENDAR" />;
}
