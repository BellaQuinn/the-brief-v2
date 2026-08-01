import { describe, expect, it } from "vitest";
import { operatorDayLabel, operatorGreeting } from "@/lib/operatorTime";

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
});
