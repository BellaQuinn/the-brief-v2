import { describe, expect, it } from "vitest";
import { computeDueReminders } from "@/lib/notifications";
import type { CalendarEvent } from "@/lib/calendar";

const NOW = new Date("2026-08-01T13:00:00.000Z"); // noon-ish EDT, unambiguous day in any real timezone
const TZ = "America/New_York";

function makeEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "e1",
    date: "2026-08-01",
    type: "assignment",
    title: "CS-340 Problem Set 4",
    subtitle: "CS-340",
    href: "/academics/assignments",
    ...overrides,
  };
}

describe("computeDueReminders", () => {
  it("fires a day-of reminder when the event date is today", () => {
    const reminders = computeDueReminders([makeEvent({ date: "2026-08-01" })], NOW, TZ);
    expect(reminders).toHaveLength(1);
    expect(reminders[0]).toMatchObject({ window: "day_of", title: "CS-340 Problem Set 4" });
    expect(reminders[0]!.body).toBe("Assignment is today.");
  });

  it("fires a 1-day reminder when the event is tomorrow", () => {
    const reminders = computeDueReminders([makeEvent({ date: "2026-08-02" })], NOW, TZ);
    expect(reminders[0]!.window).toBe("1_day");
    expect(reminders[0]!.body).toBe("Assignment is tomorrow.");
  });

  it("fires a 3-day reminder exactly 3 days out", () => {
    const reminders = computeDueReminders([makeEvent({ date: "2026-08-04" })], NOW, TZ);
    expect(reminders[0]!.window).toBe("3_days");
  });

  it("does not fire for 2 or 4 days out — only the three defined windows", () => {
    expect(computeDueReminders([makeEvent({ date: "2026-08-03" })], NOW, TZ)).toHaveLength(0);
    expect(computeDueReminders([makeEvent({ date: "2026-08-05" })], NOW, TZ)).toHaveLength(0);
  });

  it("does not fire for a past-due date — a missed window, not a new one", () => {
    expect(computeDueReminders([makeEvent({ date: "2026-07-30" })], NOW, TZ)).toHaveLength(0);
  });

  it("uses a category-appropriate body per event type, not the raw subtitle", () => {
    const cert = computeDueReminders(
      [makeEvent({ date: "2026-08-01", type: "certification", subtitle: "AWS" })],
      NOW,
      TZ
    );
    expect(cert[0]!.body).toBe("Certification exam is today.");

    const lsat = computeDueReminders([makeEvent({ date: "2026-08-01", type: "lsat_test_date", subtitle: undefined })], NOW, TZ);
    expect(lsat[0]!.body).toBe("LSAT test is today.");
  });

  it("respects the operator's timezone, not the server process's", () => {
    // NOW is 13:00 UTC Aug 1 -- 9:00 AM EDT, still Aug 1 there, but this
    // exercises the same operatorDateKey path a near-midnight instant
    // would need (covered directly in lib/operatorTime.test.ts).
    const reminders = computeDueReminders([makeEvent({ date: "2026-08-01" })], NOW, "America/New_York");
    expect(reminders).toHaveLength(1);
  });

  it("carries the real event id, type, and href through for logging and linking", () => {
    const reminders = computeDueReminders(
      [makeEvent({ id: "abc-123", type: "milestone", href: "/academics/graduate-law-school/timeline" })],
      NOW,
      TZ
    );
    expect(reminders[0]).toMatchObject({
      sourceId: "abc-123",
      sourceType: "milestone",
      url: "/academics/graduate-law-school/timeline",
    });
  });

  it("returns nothing for an empty event list", () => {
    expect(computeDueReminders([], NOW, TZ)).toEqual([]);
  });
});
