import { describe, expect, it } from "vitest";
import { computeMomentum } from "@/lib/momentum";
import type { Assignment, AssignmentStatus } from "@/types/database.types";

const NOW = new Date("2026-08-01T12:00:00.000Z");

function daysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
}

function makeAssignment(status: AssignmentStatus, dueDaysAgo: number): Assignment {
  return {
    id: `a-${Math.random()}`,
    course_id: "c1",
    title: "Assignment",
    description: null,
    type: "homework",
    due_date: daysAgo(dueDaysAgo),
    points_possible: null,
    points_earned: null,
    status,
    priority: "medium",
    estimated_minutes: null,
    weight_percent: null,
    grade_excluded: false,
    created_at: daysAgo(dueDaysAgo + 7),
    updated_at: daysAgo(dueDaysAgo),
  };
}

describe("computeMomentum", () => {
  it("returns null when nothing came due in the window", () => {
    expect(computeMomentum([], NOW)).toBeNull();
  });

  it("returns null when the only assignments are outside the 14-day window", () => {
    const assignments = [makeAssignment("graded", 20), makeAssignment("not_started", 30)];
    expect(computeMomentum(assignments, NOW)).toBeNull();
  });

  it("ignores assignments due in the future even if due_date is set", () => {
    const future: Assignment = { ...makeAssignment("not_started", 5), due_date: daysAgo(-3) };
    expect(computeMomentum([future], NOW)).toBeNull();
  });

  it("returns Excellent when everything in the window was completed", () => {
    const assignments = [makeAssignment("submitted", 2), makeAssignment("graded", 5), makeAssignment("graded", 10)];
    expect(computeMomentum(assignments, NOW)).toBe("Excellent");
  });

  it("returns Losing ground when most of the window was missed", () => {
    const assignments = [
      makeAssignment("not_started", 1),
      makeAssignment("not_started", 3),
      makeAssignment("in_progress", 6),
      makeAssignment("submitted", 9),
    ];
    expect(computeMomentum(assignments, NOW)).toBe("Losing ground");
  });

  it("returns Steady for a high but not perfect completion rate", () => {
    const assignments = [
      makeAssignment("graded", 1),
      makeAssignment("graded", 3),
      makeAssignment("graded", 6),
      makeAssignment("not_started", 9),
    ];
    expect(computeMomentum(assignments, NOW)).toBe("Steady");
  });

  it("returns Building for a roughly even split", () => {
    const assignments = [
      makeAssignment("graded", 1),
      makeAssignment("not_started", 4),
      makeAssignment("submitted", 8),
      makeAssignment("not_started", 11),
    ];
    expect(computeMomentum(assignments, NOW)).toBe("Building");
  });
});
