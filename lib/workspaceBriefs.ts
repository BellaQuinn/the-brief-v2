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
