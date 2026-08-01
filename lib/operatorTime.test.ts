import { describe, expect, it } from "vitest";
import { operatorDateKey, operatorDayLabel, operatorGreeting } from "@/lib/operatorTime";

describe("operator time", () => {
  it("uses the operator timezone for the greeting", () => {
    const instant = new Date("2026-08-01T13:00:00.000Z");

    expect(operatorGreeting(instant, "America/New_York")).toBe("Good morning");
    expect(operatorGreeting(instant, "Europe/London")).toBe("Good afternoon");
  });

  it("uses the operator timezone for the displayed day", () => {
    const instant = new Date("2026-08-01T01:00:00.000Z");

    expect(operatorDayLabel(instant, "America/New_York")).toBe("Friday, July 31");
    expect(operatorDayLabel(instant, "UTC")).toBe("Saturday, August 1");
  });

  it("falls back safely when a stored timezone is invalid", () => {
    const instant = new Date("2026-08-01T13:00:00.000Z");
    expect(operatorGreeting(instant, "not/a-timezone")).toBe("Good afternoon");
  });

  it("keys the operator's actual calendar day, independent of server system timezone", () => {
    // Same instant that already proves the day differs by timezone above —
    // this is exactly the case a server running in UTC (Vercel's default)
    // would get wrong for a reminder cron without using operatorDateKey.
    const instant = new Date("2026-08-01T01:00:00.000Z");
    expect(operatorDateKey(instant, "America/New_York")).toBe("2026-07-31");
    expect(operatorDateKey(instant, "UTC")).toBe("2026-08-01");
  });
});
