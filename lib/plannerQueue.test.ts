import { describe, expect, it } from "vitest";
import { buildWorkQueue, formatEstimatedMinutes, sumEstimatedMinutes } from "@/lib/plannerQueue";
import type { AssignmentWithDegreeContext } from "@/types/database.types";

const NOW = new Date("2026-08-10T12:00:00.000Z");

function daysFromNow(n: number): string {
  return new Date(NOW.getTime() + n * 24 * 60 * 60 * 1000).toISOString();
}

function makeAssignment(overrides: Partial<AssignmentWithDegreeContext> = {}): AssignmentWithDegreeContext {
  return {
    id: `a-${Math.random()}`,
    course_id: "c1",
    title: "Assignment",
    description: null,
    type: "homework",
    due_date: daysFromNow(3),
    points_possible: null,
    points_earned: null,
    status: "not_started",
    priority: "medium",
    estimated_minutes: null,
    weight_percent: null,
    grade_excluded: false,
    created_at: daysFromNow(-7),
    updated_at: daysFromNow(-7),
    course: { course_code: "CS-340", course_name: "Applied Algorithms", term: { degree: { degree_name: "B.S. Cybersecurity" } } },
    ...overrides,
  } as AssignmentWithDegreeContext;
}

describe("buildWorkQueue", () => {
  it("tiers a past-due item as Overdue with a real day count", () => {
    const queue = buildWorkQueue([makeAssignment({ due_date: daysFromNow(-2) })], NOW);
    expect(queue[0]!.tier).toBe("Overdue");
    expect(queue[0]!.reason).toBe("Overdue by 2 days.");
  });

  it("tiers something due tomorrow as Do now even at medium priority", () => {
    const queue = buildWorkQueue([makeAssignment({ due_date: daysFromNow(1) })], NOW);
    expect(queue[0]!.tier).toBe("Do now");
  });

  it("tiers an urgent item as Do now even if due date is far out", () => {
    const queue = buildWorkQueue([makeAssignment({ due_date: daysFromNow(20), priority: "urgent" })], NOW);
    expect(queue[0]!.tier).toBe("Do now");
    expect(queue[0]!.reason).toBe("Marked urgent.");
  });

  it("tiers something due this week as Do next", () => {
    const queue = buildWorkQueue([makeAssignment({ due_date: daysFromNow(5) })], NOW);
    expect(queue[0]!.tier).toBe("Do next");
  });

  it("tiers a high-priority item with a far due date as Do next", () => {
    const queue = buildWorkQueue([makeAssignment({ due_date: daysFromNow(30), priority: "high" })], NOW);
    expect(queue[0]!.tier).toBe("Do next");
  });

  it("tiers far-future and no-due-date items as On deck", () => {
    const queue = buildWorkQueue(
      [makeAssignment({ due_date: daysFromNow(30) }), makeAssignment({ due_date: null })],
      NOW
    );
    expect(queue.every((item) => item.tier === "On deck")).toBe(true);
    expect(queue.find((item) => item.assignment.due_date === null)!.reason).toBe("No due date set.");
  });

  it("excludes submitted and graded work entirely", () => {
    const queue = buildWorkQueue(
      [makeAssignment({ status: "submitted", due_date: daysFromNow(-5) }), makeAssignment({ status: "graded" })],
      NOW
    );
    expect(queue).toHaveLength(0);
  });

  it("orders Overdue before Do now before Do next before On deck", () => {
    const overdue = makeAssignment({ title: "overdue", due_date: daysFromNow(-1) });
    const doNow = makeAssignment({ title: "do now", due_date: daysFromNow(1) });
    const doNext = makeAssignment({ title: "do next", due_date: daysFromNow(5) });
    const onDeck = makeAssignment({ title: "on deck", due_date: daysFromNow(30) });
    const queue = buildWorkQueue([onDeck, doNext, doNow, overdue], NOW);
    expect(queue.map((item) => item.assignment.title)).toEqual(["overdue", "do now", "do next", "on deck"]);
  });

  it("breaks ties within a tier by soonest due date, then priority", () => {
    const later = makeAssignment({ title: "later", due_date: daysFromNow(6), priority: "medium" });
    const sooner = makeAssignment({ title: "sooner", due_date: daysFromNow(4), priority: "low" });
    const queue = buildWorkQueue([later, sooner], NOW);
    expect(queue.map((item) => item.assignment.title)).toEqual(["sooner", "later"]);
  });

  it("returns an empty queue, not an error, when everything is done", () => {
    expect(buildWorkQueue([], NOW)).toEqual([]);
  });
});

describe("sumEstimatedMinutes", () => {
  it("returns null when nothing in the slice has an estimate", () => {
    const queue = buildWorkQueue([makeAssignment({ estimated_minutes: null })], NOW);
    expect(sumEstimatedMinutes(queue)).toBeNull();
  });

  it("sums only the items that actually have an estimate", () => {
    const queue = buildWorkQueue(
      [
        makeAssignment({ due_date: daysFromNow(1), estimated_minutes: 30 }),
        makeAssignment({ due_date: daysFromNow(1), estimated_minutes: null }),
        makeAssignment({ due_date: daysFromNow(1), estimated_minutes: 45 }),
      ],
      NOW
    );
    expect(sumEstimatedMinutes(queue)).toBe(75);
  });
});

describe("formatEstimatedMinutes", () => {
  it("shows minutes only under an hour", () => {
    expect(formatEstimatedMinutes(45)).toBe("45m");
  });

  it("shows whole hours without a minutes remainder", () => {
    expect(formatEstimatedMinutes(120)).toBe("2h");
  });

  it("shows hours and minutes together", () => {
    expect(formatEstimatedMinutes(105)).toBe("1h 45m");
  });
});
