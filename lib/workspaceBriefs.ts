export interface WorkspaceBriefData {
  status: string;
  situation: string;
  directive: string;
}

export function buildLsatWorkspaceBrief({
  goal,
  latest,
  remaining,
  testCount,
  hasPlannedDate,
}: {
  goal: number | null;
  latest: number | null;
  remaining: number | null;
  testCount: number;
  hasPlannedDate: boolean;
}): WorkspaceBriefData {
  if (goal == null) {
    return {
      status: "Target not set.",
      situation:
        testCount > 0
          ? `${testCount} practice test${testCount === 1 ? " is" : "s are"} on record, but there is no goal score to measure against.`
          : "There is no goal score or test evidence to measure yet.",
      directive: "Set a goal score to give the preparation plan a destination.",
    };
  }
  if (latest == null) {
    return {
      status: `Target ${goal}. Baseline needed.`,
      situation: "The goal is defined, but no scored practice test is available to establish current position.",
      directive: "Log a scored practice test to establish the baseline.",
    };
  }
  if (remaining === 0) {
    return {
      status: "Target reached.",
      situation: `The latest score is ${latest}, meeting the ${goal} goal. This reflects the latest logged test, not a prediction of test-day performance.`,
      directive: "Log the next practice test to confirm the result holds.",
    };
  }
  return {
    status: "Preparation in motion.",
    situation: `The latest score is ${latest}. ${remaining} point${remaining === 1 ? " remains" : "s remain"} to the ${goal} goal.`,
    directive: hasPlannedDate
      ? "Log the next practice test and keep the trajectory current."
      : "Set a planned test date to anchor the preparation window.",
  };
}

export function buildAcademicsWorkspaceBrief({
  degreeCount,
  activeTermCount,
  activeCourseCount,
}: {
  degreeCount: number;
  activeTermCount: number;
  activeCourseCount: number;
}): WorkspaceBriefData {
  if (degreeCount === 0) {
    return {
      status: "Academic plan not configured.",
      situation: "There is no degree plan on record yet, so progress and current coursework cannot be assessed.",
      directive: "Add your first degree to establish the plan.",
    };
  }
  if (activeTermCount === 0) {
    return {
      status: "Plan mapped. Current term unassigned.",
      situation: `${degreeCount} degree plan${degreeCount === 1 ? " is" : "s are"} on record, but no term is marked active.`,
      directive: "Mark the current term active, or add it if it is not on the plan.",
    };
  }
  if (activeCourseCount === 0) {
    return {
      status: "Term active. Courses needed.",
      situation: `${activeTermCount} term${activeTermCount === 1 ? " is" : "s are"} active, with no courses currently marked in progress.`,
      directive: "Add the current courses or update their status.",
    };
  }
  return {
    status: "Academic plan in motion.",
    situation: `${activeTermCount} active term${activeTermCount === 1 ? "" : "s"} with ${activeCourseCount} course${activeCourseCount === 1 ? "" : "s"} in progress.`,
    directive: "Open a course to review its assignments and record the next move.",
  };
}

export function buildAcademicStandingWorkspaceBrief({
  cumulativeGpa,
  termGpa,
  completedCredits,
  inProgressCourseCount,
}: {
  cumulativeGpa: number | null;
  termGpa: number | null;
  completedCredits: number;
  inProgressCourseCount: number;
}): WorkspaceBriefData {
  if (cumulativeGpa == null) {
    return {
      status: "Standing not established.",
      situation: "No completed GPA-bearing coursework is available yet, so a cumulative reading cannot be calculated.",
      directive: "Record completed coursework to establish academic standing.",
    };
  }
  if (termGpa == null) {
    return {
      status: "Cumulative standing calculated.",
      situation: `The cumulative GPA is ${cumulativeGpa.toFixed(2)}, based on ${completedCredits} completed credit${completedCredits === 1 ? "" : "s"}. No current-term GPA is available.`,
      directive: "Keep current course grades updated to add a term reading.",
    };
  }
  return {
    status: "Academic standing calculated.",
    situation: `Cumulative GPA is ${cumulativeGpa.toFixed(2)}; the current-term reading is ${termGpa.toFixed(2)}.`,
    directive:
      inProgressCourseCount > 0
        ? `Review the ${inProgressCourseCount} projected course outcome${inProgressCourseCount === 1 ? "" : "s"} below.`
        : "Keep final grades current as coursework closes.",
  };
}

export function buildCareerWorkspaceBrief({
  certificationCount,
  activeCertificationCount,
  activeApplicationCount,
  dueFollowUpCount,
}: {
  certificationCount: number;
  activeCertificationCount: number;
  activeApplicationCount: number;
  dueFollowUpCount: number;
}): WorkspaceBriefData {
  if (dueFollowUpCount > 0) {
    return {
      status: "Relationships need a follow-through.",
      situation: `${dueFollowUpCount} contact${dueFollowUpCount === 1 ? " has" : "s have"} a follow-up due. ${activeApplicationCount} application${activeApplicationCount === 1 ? " is" : "s are"} currently active.`,
      directive: "Open the relationship trace and complete the next follow-up.",
    };
  }
  if (activeApplicationCount > 0) {
    return {
      status: "Career pipeline in motion.",
      situation: `${activeApplicationCount} application${activeApplicationCount === 1 ? " is" : "s are"} active across the pipeline; no contact follow-up is currently due.`,
      directive: "Advance the application with the clearest recorded next action.",
    };
  }
  if (activeCertificationCount > 0) {
    return {
      status: "Credentials in progress. Pipeline open.",
      situation: `${activeCertificationCount} of ${certificationCount} tracked certification${certificationCount === 1 ? " is" : "s are"} currently underway. No job application is active.`,
      directive: "Record the next certification milestone or add a target role.",
    };
  }
  return {
    status: "Career workspace ready.",
    situation: "No application, certification, or relationship currently requires attention.",
    directive: "Add the next real career objective when one is ready to track.",
  };
}

export function buildResourcesWorkspaceBrief({
  resourceCount,
  favoriteCount,
}: {
  resourceCount: number;
  favoriteCount: number;
}): WorkspaceBriefData {
  if (resourceCount === 0) {
    return {
      status: "Archive clear.",
      situation: "No resources are saved, so there is nothing to sort or review.",
      directive: "Add a resource when it is useful enough to retrieve again.",
    };
  }
  return {
    status: "Archive indexed.",
    situation: `${resourceCount} resource${resourceCount === 1 ? " is" : "s are"} saved${favoriteCount > 0 ? `; ${favoriteCount} ${favoriteCount === 1 ? "is" : "are"} marked for priority access` : "; none is marked for priority access"}.`,
    directive: favoriteCount > 0 ? "Open a priority resource or query the archive below." : "Mark the most reusable item for priority access.",
  };
}

export function buildSettingsWorkspaceBrief({
  hasName,
  hasTimezone,
}: {
  hasName: boolean;
  hasTimezone: boolean;
}): WorkspaceBriefData {
  if (!hasName || !hasTimezone) {
    const missing = [!hasName && "operator name", !hasTimezone && "timezone"].filter(Boolean).join(" and ");
    return {
      status: "Configuration needs one update.",
      situation: `The account is active, but the ${missing} ${missing.includes(" and ") ? "are" : "is"} not configured.`,
      directive: "Complete the missing identity setting below.",
    };
  }
  return {
    status: "Configuration current.",
    situation: "Operator identity and timezone are configured. Password details remain private and are never displayed here.",
    directive: "Update a setting only when your operating context changes.",
  };
}

export function buildCalendarWorkspaceBrief({
  selectedLabel,
  selectedEventCount,
  totalEventCount,
  overdueCount,
}: {
  selectedLabel: string;
  selectedEventCount: number;
  totalEventCount: number;
  overdueCount: number;
}): WorkspaceBriefData {
  if (overdueCount > 0) {
    return {
      status: "Schedule needs a recovery move.",
      situation: `${overdueCount} past-due assignment${overdueCount === 1 ? " remains" : "s remain"} on the timeline. ${selectedLabel} has ${selectedEventCount} scheduled item${selectedEventCount === 1 ? "" : "s"}.`,
      directive: "Open the oldest past-due assignment and record the next move.",
    };
  }
  if (selectedEventCount > 0) {
    return {
      status: `${selectedLabel} is scheduled.`,
      situation: `${selectedEventCount} item${selectedEventCount === 1 ? " is" : "s are"} attached to the selected day; ${totalEventCount} dated item${totalEventCount === 1 ? " is" : "s are"} visible across the timeline.`,
      directive: "Review the selected-day detail before moving to the next date.",
    };
  }
  return {
    status: `${selectedLabel} is clear.`,
    situation:
      totalEventCount === 0
        ? "No dated assignments, certification exams, or networking follow-ups are on the timeline."
        : `Nothing is scheduled for the selected day; ${totalEventCount} dated item${totalEventCount === 1 ? " remains" : "s remain"} elsewhere on the timeline.`,
    directive:
      totalEventCount === 0
        ? "Add dates in the source workspace when a real commitment is established."
        : "Select a marked date to review its commitments.",
  };
}

export function buildLawSchoolOverviewWorkspaceBrief({
  schoolCount,
  scholarshipCount,
  milestoneCount,
  nextDeadlineLabel,
}: {
  schoolCount: number;
  scholarshipCount: number;
  milestoneCount: number;
  nextDeadlineLabel: string | null;
}): WorkspaceBriefData {
  if (schoolCount === 0 && scholarshipCount === 0 && milestoneCount === 0) {
    return {
      status: "Law school plan not established.",
      situation: "No schools, scholarships, or roadmap milestones are on record yet.",
      directive: "Add the first school to give the pathway a destination.",
    };
  }
  if (nextDeadlineLabel) {
    return {
      status: "Next deadline identified.",
      situation: `${nextDeadlineLabel} is the nearest dated commitment. ${schoolCount} school${schoolCount === 1 ? " is" : "s are"} and ${scholarshipCount} scholarship${scholarshipCount === 1 ? " is" : "s are"} currently tracked.`,
      directive: "Review the nearest deadline and confirm its supporting milestone is current.",
    };
  }
  const trackedSignals = [
    schoolCount > 0 ? `${schoolCount} school${schoolCount === 1 ? "" : "s"}` : null,
    scholarshipCount > 0 ? `${scholarshipCount} scholarship${scholarshipCount === 1 ? "" : "s"}` : null,
    milestoneCount > 0 ? `${milestoneCount} milestone${milestoneCount === 1 ? "" : "s"}` : null,
  ].filter(Boolean);
  const trackedItemCount = schoolCount + scholarshipCount + milestoneCount;
  return {
    status: "Pathway mapped. Dates still open.",
    situation: `${trackedSignals.join(", ")} ${trackedItemCount === 1 ? "is" : "are"} on record, with no upcoming deadline identified.`,
    directive: "Add the next known deadline or target date to anchor the roadmap.",
  };
}

export function buildSchoolsWorkspaceBrief({
  schoolCount,
  prioritizedCount,
  activeCount,
}: {
  schoolCount: number;
  prioritizedCount: number;
  activeCount: number;
}): WorkspaceBriefData {
  if (schoolCount === 0) {
    return {
      status: "School field not established.",
      situation: "No schools are tracked, so comparison and application position cannot be assessed.",
      directive: "Add the first school you are seriously considering.",
    };
  }
  if (prioritizedCount < schoolCount) {
    return {
      status: "School field built. Priorities incomplete.",
      situation: `${schoolCount} school${schoolCount === 1 ? " is" : "s are"} tracked; ${schoolCount - prioritizedCount} still ${schoolCount - prioritizedCount === 1 ? "needs" : "need"} a priority tier.`,
      directive: "Assign the next missing priority so the field can be compared clearly.",
    };
  }
  return {
    status: "School field mapped.",
    situation: `${schoolCount} school${schoolCount === 1 ? " is" : "s are"} prioritized; ${activeCount} ${activeCount === 1 ? "has" : "have"} moved beyond research.` ,
    directive: activeCount > 0 ? "Open the most advanced school and verify its next requirement." : "Move the strongest candidate beyond research when the evidence supports it.",
  };
}

export function buildSchoolApplicationsWorkspaceBrief({
  schoolCount,
  activeApplicationCount,
  decisionCount,
}: {
  schoolCount: number;
  activeApplicationCount: number;
  decisionCount: number;
}): WorkspaceBriefData {
  if (schoolCount === 0) {
    return {
      status: "Application pipeline not established.",
      situation: "No schools are available to move through the application cycle.",
      directive: "Add a school before opening an application track.",
    };
  }
  if (activeApplicationCount === 0 && decisionCount === 0) {
    return {
      status: "Research queue established.",
      situation: `${schoolCount} school${schoolCount === 1 ? " is" : "s are"} tracked, but no application has entered an active stage.`,
      directive: "Move the next qualified school into planning when you are ready to act.",
    };
  }
  return {
    status: "Application cycle in motion.",
    situation: `${activeApplicationCount} application${activeApplicationCount === 1 ? " is" : "s are"} active; ${decisionCount} decision${decisionCount === 1 ? " is" : "s are"} recorded.`,
    directive: activeApplicationCount > 0 ? "Advance the active application with the nearest requirement." : "Review the recorded decisions before choosing the next move.",
  };
}

export function buildScholarshipsWorkspaceBrief({
  scholarshipCount,
  activeCount,
  upcomingDeadlineCount,
}: {
  scholarshipCount: number;
  activeCount: number;
  upcomingDeadlineCount: number;
}): WorkspaceBriefData {
  if (scholarshipCount === 0) {
    return {
      status: "Funding search not established.",
      situation: "No scholarships are tracked, so funding coverage cannot be assessed.",
      directive: "Add the first relevant funding opportunity.",
    };
  }
  if (upcomingDeadlineCount > 0) {
    return {
      status: "Funding deadlines are active.",
      situation: `${upcomingDeadlineCount} upcoming deadline${upcomingDeadlineCount === 1 ? " is" : "s are"} attached to ${scholarshipCount} tracked scholarship${scholarshipCount === 1 ? "" : "s"}; ${activeCount} ${activeCount === 1 ? "is" : "are"} in an active stage.`,
      directive: "Open the nearest scholarship deadline and verify its requirements.",
    };
  }
  return {
    status: "Funding field tracked. Dates still open.",
    situation: `${scholarshipCount} scholarship${scholarshipCount === 1 ? " is" : "s are"} on record with no upcoming deadline identified.`,
    directive: "Add the next known deadline or move one opportunity into an active stage.",
  };
}

export function buildTimelineWorkspaceBrief({
  milestoneCount,
  inProgressCount,
  completedCount,
}: {
  milestoneCount: number;
  inProgressCount: number;
  completedCount: number;
}): WorkspaceBriefData {
  if (milestoneCount === 0) {
    return {
      status: "Roadmap not established.",
      situation: "No milestones are available to show sequence or current position.",
      directive: "Add the first meaningful milestone in the law school journey.",
    };
  }
  if (inProgressCount > 0) {
    return {
      status: "Roadmap in motion.",
      situation: `${inProgressCount} milestone${inProgressCount === 1 ? " is" : "s are"} in progress; ${completedCount} of ${milestoneCount} ${completedCount === 1 ? "is" : "are"} complete.`,
      directive: "Open the current milestone and record the next concrete move.",
    };
  }
  if (completedCount === milestoneCount) {
    return {
      status: "Roadmap complete.",
      situation: `All ${milestoneCount} milestone${milestoneCount === 1 ? " is" : "s are"} marked complete.`,
      directive: "Add another milestone only if the pathway has genuinely changed.",
    };
  }
  return {
    status: "Roadmap mapped. Current step unassigned.",
    situation: `${completedCount} of ${milestoneCount} milestone${milestoneCount === 1 ? " is" : "s are"} complete, with none marked in progress.`,
    directive: "Mark the next milestone in progress to establish current position.",
  };
}

export function buildDocumentsWorkspaceBrief({
  documentCount,
  linkedSourceCount,
  schoolLinkedCount,
}: {
  documentCount: number;
  linkedSourceCount: number;
  schoolLinkedCount: number;
}): WorkspaceBriefData {
  if (documentCount === 0) {
    return {
      status: "Application dossier not started.",
      situation: "No essays, recommendations, transcripts, financial records, or supporting documents are tracked.",
      directive: "Add the first document already in active preparation.",
    };
  }
  if (linkedSourceCount < documentCount) {
    return {
      status: "Dossier in assembly.",
      situation: `${documentCount} document${documentCount === 1 ? " is" : "s are"} tracked; ${documentCount - linkedSourceCount} ${documentCount - linkedSourceCount === 1 ? "does" : "do"} not yet have a source link. ${schoolLinkedCount} ${schoolLinkedCount === 1 ? "is" : "are"} assigned to a school.`,
      directive: "Attach the next available source link so the record can be retrieved.",
    };
  }
  return {
    status: "Dossier sources connected.",
    situation: `All ${documentCount} tracked document${documentCount === 1 ? " has" : "s have"} a source link; ${schoolLinkedCount} ${schoolLinkedCount === 1 ? "is" : "are"} assigned to a school.`,
    directive: "Review the next document required by an active application.",
  };
}
