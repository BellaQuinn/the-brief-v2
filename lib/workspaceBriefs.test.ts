import { describe, expect, it } from "vitest";
import {
  buildAcademicsWorkspaceBrief,
  buildAcademicStandingWorkspaceBrief,
  buildCareerWorkspaceBrief,
  buildCalendarWorkspaceBrief,
  buildDocumentsWorkspaceBrief,
  buildLawSchoolOverviewWorkspaceBrief,
  buildLsatWorkspaceBrief,
  buildResourcesWorkspaceBrief,
  buildScholarshipsWorkspaceBrief,
  buildSchoolApplicationsWorkspaceBrief,
  buildSchoolsWorkspaceBrief,
  buildSettingsWorkspaceBrief,
  buildTimelineWorkspaceBrief,
} from "@/lib/workspaceBriefs";

describe("buildLsatWorkspaceBrief", () => {
  it("does not infer progress without a goal", () => {
    const brief = buildLsatWorkspaceBrief({
      goal: null,
      latest: 158,
      remaining: null,
      testCount: 2,
      hasPlannedDate: false,
    });
    expect(brief.status).toBe("Target not set.");
    expect(brief.situation).toContain("2 practice tests");
  });

  it("calls the target reached only when remaining is zero", () => {
    const brief = buildLsatWorkspaceBrief({
      goal: 165,
      latest: 166,
      remaining: 0,
      testCount: 3,
      hasPlannedDate: true,
    });
    expect(brief.status).toBe("Target reached.");
    expect(brief.situation).toContain("latest logged test");
  });

  it("reports the exact gap and names the missing date as the next action", () => {
    const brief = buildLsatWorkspaceBrief({
      goal: 165,
      latest: 159,
      remaining: 6,
      testCount: 2,
      hasPlannedDate: false,
    });
    expect(brief.situation).toContain("6 points remain");
    expect(brief.directive).toContain("planned test date");
  });
});

describe("buildCareerWorkspaceBrief", () => {
  it("prioritizes a real follow-up over other pipeline activity", () => {
    const brief = buildCareerWorkspaceBrief({
      certificationCount: 2,
      activeCertificationCount: 1,
      activeApplicationCount: 3,
      dueFollowUpCount: 1,
    });
    expect(brief.status).toBe("Relationships need a follow-through.");
    expect(brief.situation).toContain("1 contact has a follow-up due");
  });

  it("keeps a quiet workspace calm", () => {
    const brief = buildCareerWorkspaceBrief({
      certificationCount: 0,
      activeCertificationCount: 0,
      activeApplicationCount: 0,
      dueFollowUpCount: 0,
    });
    expect(brief.status).toBe("Career workspace ready.");
  });
});

describe("buildResourcesWorkspaceBrief", () => {
  it("does not manufacture activity for an empty archive", () => {
    const brief = buildResourcesWorkspaceBrief({ resourceCount: 0, favoriteCount: 0 });
    expect(brief.status).toBe("Archive clear.");
  });

  it("backs the index reading with saved and favorite counts", () => {
    const brief = buildResourcesWorkspaceBrief({ resourceCount: 5, favoriteCount: 2 });
    expect(brief.situation).toContain("5 resources");
    expect(brief.situation).toContain("2 are marked");
  });
});

describe("buildSettingsWorkspaceBrief", () => {
  it("names an incomplete identity field", () => {
    const brief = buildSettingsWorkspaceBrief({ hasName: false, hasTimezone: true });
    expect(brief.situation).toContain("operator name");
  });

  it("only calls configuration current when both fields exist", () => {
    const brief = buildSettingsWorkspaceBrief({ hasName: true, hasTimezone: true });
    expect(brief.status).toBe("Configuration current.");
  });
});

describe("buildAcademicsWorkspaceBrief", () => {
  it("does not describe coursework when no degree exists", () => {
    const brief = buildAcademicsWorkspaceBrief({ degreeCount: 0, activeTermCount: 0, activeCourseCount: 0 });
    expect(brief.status).toBe("Academic plan not configured.");
  });

  it("distinguishes a mapped plan from an active term", () => {
    const brief = buildAcademicsWorkspaceBrief({ degreeCount: 2, activeTermCount: 0, activeCourseCount: 0 });
    expect(brief.situation).toContain("2 degree plans are");
    expect(brief.situation).toContain("no term is marked active");
  });

  it("backs the active reading with exact term and course counts", () => {
    const brief = buildAcademicsWorkspaceBrief({ degreeCount: 1, activeTermCount: 1, activeCourseCount: 4 });
    expect(brief.status).toBe("Academic plan in motion.");
    expect(brief.situation).toContain("1 active term with 4 courses in progress");
  });
});

describe("buildAcademicStandingWorkspaceBrief", () => {
  it("does not invent a standing without completed GPA-bearing work", () => {
    const brief = buildAcademicStandingWorkspaceBrief({
      cumulativeGpa: null,
      termGpa: null,
      completedCredits: 0,
      inProgressCourseCount: 3,
    });
    expect(brief.status).toBe("Standing not established.");
  });

  it("reports both real readings and names projected courses as the next review", () => {
    const brief = buildAcademicStandingWorkspaceBrief({
      cumulativeGpa: 3.72,
      termGpa: 3.81,
      completedCredits: 45,
      inProgressCourseCount: 3,
    });
    expect(brief.situation).toContain("3.72");
    expect(brief.situation).toContain("3.81");
    expect(brief.directive).toContain("3 projected course outcomes");
  });
});

describe("remaining workspace briefs", () => {
  it("keeps a genuinely empty calendar calm", () => {
    const brief = buildCalendarWorkspaceBrief({
      selectedLabel: "Today",
      selectedEventCount: 0,
      totalEventCount: 0,
      overdueCount: 0,
    });
    expect(brief.status).toBe("Today is clear.");
    expect(brief.situation).toContain("No dated assignments");
  });

  it("prioritizes past-due calendar evidence", () => {
    const brief = buildCalendarWorkspaceBrief({
      selectedLabel: "Today",
      selectedEventCount: 1,
      totalEventCount: 4,
      overdueCount: 2,
    });
    expect(brief.status).toContain("recovery move");
    expect(brief.situation).toContain("2 past-due assignments");
  });

  it("orients the law school overview around the nearest deadline", () => {
    const brief = buildLawSchoolOverviewWorkspaceBrief({
      schoolCount: 3,
      scholarshipCount: 2,
      milestoneCount: 4,
      nextDeadlineLabel: "State Law — application due",
    });
    expect(brief.status).toBe("Next deadline identified.");
    expect(brief.situation).toContain("State Law");
  });

  it("omits empty overview categories without breaking count grammar", () => {
    const brief = buildLawSchoolOverviewWorkspaceBrief({
      schoolCount: 0,
      scholarshipCount: 0,
      milestoneCount: 12,
      nextDeadlineLabel: null,
    });
    expect(brief.situation).toBe("12 milestones are on record, with no upcoming deadline identified.");
  });

  it("does not claim a school field exists without schools", () => {
    expect(buildSchoolsWorkspaceBrief({ schoolCount: 0, prioritizedCount: 0, activeCount: 0 }).status)
      .toBe("School field not established.");
  });

  it("distinguishes a research queue from active applications", () => {
    const brief = buildSchoolApplicationsWorkspaceBrief({ schoolCount: 3, activeApplicationCount: 0, decisionCount: 0 });
    expect(brief.status).toBe("Research queue established.");
  });

  it("backs scholarship urgency with real upcoming deadlines", () => {
    const brief = buildScholarshipsWorkspaceBrief({ scholarshipCount: 4, activeCount: 2, upcomingDeadlineCount: 1 });
    expect(brief.status).toBe("Funding deadlines are active.");
    expect(brief.situation).toContain("1 upcoming deadline");
  });

  it("names the missing current step on a mapped timeline", () => {
    const brief = buildTimelineWorkspaceBrief({ milestoneCount: 5, inProgressCount: 0, completedCount: 2 });
    expect(brief.status).toBe("Roadmap mapped. Current step unassigned.");
  });

  it("does not call a document record retrievable without source links", () => {
    const brief = buildDocumentsWorkspaceBrief({ documentCount: 3, linkedSourceCount: 1, schoolLinkedCount: 2 });
    expect(brief.status).toBe("Dossier in assembly.");
    expect(brief.situation).toContain("2 do not yet have a source link");
  });
});
