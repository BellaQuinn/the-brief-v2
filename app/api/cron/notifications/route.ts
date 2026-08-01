import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildCalendarEvents } from "@/lib/calendar";
import { computeDueReminders } from "@/lib/notifications";
import { sendPushNotification } from "@/lib/webpush";
import type {
  AssignmentWithDegreeContext,
  Certification,
  LawSchool,
  Milestone,
  NetworkingContact,
  NotificationLogEntry,
  PushSubscriptionRecord,
  Scholarship,
} from "@/types/database.types";

// Runs once daily (vercel.json). Nobody's browser is open when this
// fires -- that's the whole point -- so it uses the service-role client
// (bypasses RLS) and must scope every query by user_id itself. Only
// users with at least one saved push_subscriptions row are worth the
// work.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  const { data: subscriptions } = await supabase.from("push_subscriptions").select("*");
  const allSubs = (subscriptions as PushSubscriptionRecord[]) ?? [];
  const userIds = [...new Set(allSubs.map((s) => s.user_id))];

  let notificationsSent = 0;
  let expiredRemoved = 0;

  for (const userId of userIds) {
    const [
      { data: profile },
      { data: assignments },
      { data: certifications },
      { data: networking },
      { data: lawSchools },
      { data: scholarships },
      { data: milestones },
      { data: log },
    ] = await Promise.all([
      supabase.from("users").select("timezone, lsat_planned_test_date").eq("id", userId).single(),
      supabase
        .from("assignments")
        .select("*, course:courses!inner(course_code, course_name, term:terms!inner(degree:degrees!inner(user_id, degree_name)))")
        .eq("course.term.degree.user_id", userId)
        .not("due_date", "is", null)
        .returns<AssignmentWithDegreeContext[]>(),
      supabase.from("certifications").select("*").eq("user_id", userId).not("exam_date", "is", null),
      supabase.from("networking").select("*").eq("user_id", userId).not("next_follow_up", "is", null),
      supabase.from("law_schools").select("*").eq("user_id", userId).not("application_deadline", "is", null),
      supabase.from("scholarships").select("*").eq("user_id", userId).not("deadline", "is", null),
      supabase.from("milestones").select("*").eq("user_id", userId).not("target_date", "is", null),
      supabase.from("notification_log").select("*").eq("user_id", userId),
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

    const timezone = profile?.timezone ?? "UTC";
    const reminders = computeDueReminders(events, now, timezone);

    const alreadySent = new Set(
      ((log as NotificationLogEntry[]) ?? []).map((l) => `${l.source_type}:${l.source_id}:${l.window}`)
    );
    const toSend = reminders.filter((r) => !alreadySent.has(`${r.sourceType}:${r.sourceId}:${r.window}`));
    if (toSend.length === 0) continue;

    const userSubs = allSubs.filter((s) => s.user_id === userId);

    for (const reminder of toSend) {
      let deliveredToAtLeastOne = false;

      for (const sub of userSubs) {
        const result = await sendPushNotification(sub, {
          title: reminder.title,
          body: reminder.body,
          url: reminder.url,
        });
        if (result.ok) {
          deliveredToAtLeastOne = true;
        } else if (result.expired) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          expiredRemoved++;
        }
      }

      // Logged once per reminder regardless of how many devices got it —
      // the dedup key is (user, source, window), not per-device, so a
      // second device shouldn't cause a second log entry to attempt.
      if (deliveredToAtLeastOne) {
        await supabase.from("notification_log").insert({
          user_id: userId,
          source_type: reminder.sourceType,
          source_id: reminder.sourceId,
          window: reminder.window,
        });
        notificationsSent++;
      }
    }
  }

  return NextResponse.json({ ok: true, usersProcessed: userIds.length, notificationsSent, expiredRemoved });
}
