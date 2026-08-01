import { describe, expect, it } from "vitest";
import { buildMissionBrief } from "@/lib/missionBrief";
import type { AssignmentWithContext } from "@/types/database.types";

function makeAssignment(overrides: Partial<AssignmentWithContext> = {}): AssignmentWithContext {
  return {
    id: "a1",
    title: "Problem Set 4",
    priority: "medium",
    due_date: "2026-08-03T23:59:00.000Z",
    status: "not_started",
    course: { id: "c1", course_code: "CS-340", course_name: "Applied Algorithms" },
    ...overrides,
  } as AssignmentWithContext;
}

describe("buildMissionBrief", () => {
  it("reports All clear with no due-today items and a real fallback directive", () => {
    const brief = buildMissionBrief([], [], 0, 0);
    expect(brief.status).toBe("All clear");
    expect(brief.situation).toMatch(/nothing needs you today/i);
    expect(brief.directive).toBe("Nothing on the horizon this week.");
  });

  it("names open applications as the directive when nothing is upcoming", () => {
    const brief = buildMissionBrief([], [], 2, 0);
    expect(brief.directive).toMatch(/open applications/i);
  });

  it("falls back to certifications only when there are no open applications", () => {
    const brief = buildMissionBrief([], [], 0, 1);
    expect(brief.directive).toMatch(/certification/i);
  });

  it("reports On track with a due-today item and no urgency qualifier when nothing is urgent", () => {
    const today = [makeAssignment({ priority: "medium" })];
    const brief = buildMissionBrief(today, [], 0, 0);
    expect(brief.status).toBe("On track");
    expect(brief.situation).toBe("One item is due today — nothing urgent.");
  });

  it("spells multiple counts and omits the urgency qualifier when something is urgent", () => {
    const today = [makeAssignment({ id: "a1", priority: "urgent" }), makeAssignment({ id: "a2", priority: "low" })];
    const brief = buildMissionBrief(today, [], 0, 0);
    expect(brief.situation).toBe("Two items are due today.");
  });

  it("directs to the nearest upcoming item by title and weekday", () => {
    const upcoming = [makeAssignment({ title: "Torts — Reading Ch. 6", due_date: "2026-08-03T23:59:00.000Z" })];
    const brief = buildMissionBrief([], upcoming, 0, 0);
    expect(brief.directive).toBe("Get ahead on Torts — Reading Ch. 6 before Monday.");
  });
});
