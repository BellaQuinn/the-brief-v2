import { operatorDateKey } from "@/lib/operatorTime";
import type { CalendarEvent } from "@/lib/calendar";

export type ReminderWindow = "3_days" | "1_day" | "day_of";

export interface Reminder {
  sourceType: CalendarEvent["type"];
  sourceId: string;
  window: ReminderWindow;
  title: string;
  body: string;
  url: string;
}

const WINDOW_DAYS_OUT: Record<ReminderWindow, number> = { "3_days": 3, "1_day": 1, day_of: 0 };

const WINDOW_LABEL: Record<ReminderWindow, string> = {
  "3_days": "in 3 days",
  "1_day": "tomorrow",
  day_of: "today",
};

// A fixed noun per category, not `event.subtitle` (that field carries
// different things per type — a course code, a provider, a company —
// none of which read naturally in "X is due tomorrow.").
const CATEGORY_LABEL: Record<CalendarEvent["type"], string> = {
  assignment: "Assignment",
  certification: "Certification exam",
  networking: "Follow-up",
  law_school: "Application deadline",
  scholarship: "Scholarship deadline",
  milestone: "Milestone",
  lsat_test_date: "LSAT test",
};

function daysBetweenDateKeys(fromKey: string, toKey: string): number {
  // Both are yyyy-MM-dd — parse as local dates (not UTC midnight) so a
  // fixed 24h-per-day assumption never drifts across a DST boundary.
  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);
  const from = new Date(fy!, fm! - 1, fd!);
  const to = new Date(ty!, tm! - 1, td!);
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

// One reminder per event per window, computed fresh every run — the
// caller (the cron route) is responsible for skipping anything already
// recorded in notification_log so a daily check never re-sends the same
// window twice. The notification's title is always the real event name;
// nothing here is invented, same voice rule as everywhere else in this
// app.
export function computeDueReminders(events: CalendarEvent[], now: Date, operatorTimeZone: string): Reminder[] {
  const todayKey = operatorDateKey(now, operatorTimeZone);
  const reminders: Reminder[] = [];

  for (const event of events) {
    const daysOut = daysBetweenDateKeys(todayKey, event.date);
    const window = (Object.keys(WINDOW_DAYS_OUT) as ReminderWindow[]).find((w) => WINDOW_DAYS_OUT[w] === daysOut);
    if (!window) continue;

    reminders.push({
      sourceType: event.type,
      sourceId: event.id,
      window,
      title: event.title,
      body: `${CATEGORY_LABEL[event.type]} is ${WINDOW_LABEL[window]}.`,
      url: event.href,
    });
  }

  return reminders;
}
