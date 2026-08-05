import { describe, expect, it } from "vitest";
import { buildCalendarEvents } from "@/lib/calendar";
import type { LawSchool, Milestone, Scholarship } from "@/types/database.types";

function makeLawSchool(overrides: Partial<LawSchool> = {}): LawSchool {
  return {
    id: "s1",
    user_id: "u1",
    school_name: "Fordham",
    status: "applying",
    priority: null,
    application_deadline: "2026-09-01",
    lsat_requirement: null,
    median_gpa: null,
    median_lsat: null,
    essays_status: null,
    recommendations_status: null,
    why_this_school: null,
    personal_notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeScholarship(overrides: Partial<Scholarship> = {}): Scholarship {
  return {
    id: "sc1",
    user_id: "u1",
    law_school_id: null,
    name: "Diversity Scholarship",
    amount: null,
    deadline: "2026-09-10",
    status: "researching",
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: "m1",
    user_id: "u1",
    title: "Register for the LSAT",
    target_date: "2026-08-15",
    status: "upcoming",
    progress: 0,
    notes: null,
    linked_href: null,
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const EMPTY_BASE = { assignments: [], certifications: [], networking: [] };

describe("buildCalendarEvents — Graduate & Law School additions", () => {
  it("includes a law school's application deadline", () => {
    const events = buildCalendarEvents({ ...EMPTY_BASE, lawSchools: [makeLawSchool()] }, "");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "law_school", date: "2026-09-01", title: "Fordham" });
  });

  it("excludes law schools that are rejected or already enrolled — the deadline is moot", () => {
    const events = buildCalendarEvents(
      {
        ...EMPTY_BASE,
        lawSchools: [makeLawSchool({ status: "rejected" }), makeLawSchool({ id: "s2", status: "enrolled" })],
      },
      ""
    );
    expect(events).toHaveLength(0);
  });

  it("includes a scholarship deadline", () => {
    const events = buildCalendarEvents({ ...EMPTY_BASE, scholarships: [makeScholarship()] }, "");
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "scholarship", date: "2026-09-10" });
  });

  it("excludes scholarships already declined or awarded", () => {
    const events = buildCalendarEvents(
      {
        ...EMPTY_BASE,
        scholarships: [makeScholarship({ status: "declined" }), makeScholarship({ id: "sc2", status: "awarded" })],
      },
      ""
    );
    expect(events).toHaveLength(0);
  });

  it("includes an upcoming milestone but excludes completed ones", () => {
    const events = buildCalendarEvents(
      {
        ...EMPTY_BASE,
        milestones: [makeMilestone(), makeMilestone({ id: "m2", status: "completed" })],
      },
      ""
    );
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: "milestone", date: "2026-08-15" });
  });

  it("includes the LSAT planned test date only when one is set", () => {
    const withDate = buildCalendarEvents({ ...EMPTY_BASE, lsatPlannedTestDate: "2026-10-04" }, "");
    expect(withDate).toHaveLength(1);
    expect(withDate[0]).toMatchObject({ type: "lsat_test_date", date: "2026-10-04" });

    const withoutDate = buildCalendarEvents({ ...EMPTY_BASE, lsatPlannedTestDate: null }, "");
    expect(withoutDate).toHaveLength(0);
  });

  it("still works with none of the optional Graduate & Law School fields passed at all", () => {
    expect(buildCalendarEvents(EMPTY_BASE, "")).toEqual([]);
  });

  it("sorts every category together by date", () => {
    const events = buildCalendarEvents(
      {
        ...EMPTY_BASE,
        lawSchools: [makeLawSchool({ application_deadline: "2026-09-05" })],
        milestones: [makeMilestone({ target_date: "2026-08-01" })],
        scholarships: [makeScholarship({ deadline: "2026-08-20" })],
      },
      ""
    );
    expect(events.map((e) => e.date)).toEqual(["2026-08-01", "2026-08-20", "2026-09-05"]);
  });
});
