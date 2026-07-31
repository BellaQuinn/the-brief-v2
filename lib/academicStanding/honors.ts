import type { HonorsListRule, InstitutionAcademicPolicy } from "@/lib/academicPolicy/types";
import type { CumulativeGpaResult, GraduationHonorsForecast, HonorsListStatusEntry, TermGpaResult } from "@/lib/academicStanding/types";

export interface TermForHonors {
  termId: string;
  startDate: string | null; // used to order terms for the Trustees' List "consecutive terms" check
  hasInProgressCourses: boolean;
  gpaResult: TermGpaResult;
}

function singleTermStatus(term: TermForHonors, rule: HonorsListRule): HonorsListStatusEntry {
  if (term.gpaResult.totalCredits < rule.fullTimeCreditThreshold) {
    return {
      ruleId: rule.id,
      label: rule.label,
      termId: term.termId,
      status: "institution_confirmation_required",
      detail: `This term carries ${term.gpaResult.totalCredits} credits, below the ${rule.fullTimeCreditThreshold}-credit full-time standard — Champlain Online's sub-terms aren't automatically mapped to a full semester here, so eligibility needs institutional confirmation.`,
    };
  }

  if (term.gpaResult.gpaBearingCredits === 0) {
    return {
      ruleId: rule.id,
      label: rule.label,
      termId: term.termId,
      status: "awaiting_final_grades",
      detail: "No final grades recorded for this term yet.",
    };
  }

  const gpa = term.gpaResult.gpa ?? 0;
  const meetsGpa = gpa >= rule.minTermGpa;

  if (term.hasInProgressCourses) {
    return {
      ruleId: rule.id,
      label: rule.label,
      termId: term.termId,
      status: meetsGpa ? "on_track" : "at_risk",
      detail: meetsGpa
        ? `Currently at ${gpa.toFixed(2)} with courses still in progress — on track for the ${rule.minTermGpa.toFixed(2)} requirement.`
        : `Currently at ${gpa.toFixed(2)}, below the ${rule.minTermGpa.toFixed(2)} requirement, with courses still in progress.`,
    };
  }

  return {
    ruleId: rule.id,
    label: rule.label,
    termId: term.termId,
    status: meetsGpa ? "earned" : "not_yet_eligible",
    detail: meetsGpa
      ? `Term GPA ${gpa.toFixed(2)} meets the ${rule.minTermGpa.toFixed(2)} requirement.`
      : `Term GPA ${gpa.toFixed(2)} is below the ${rule.minTermGpa.toFixed(2)} requirement.`,
  };
}

function consecutiveTermsStatus(terms: TermForHonors[], rule: HonorsListRule): HonorsListStatusEntry {
  const ordered = [...terms].filter((t) => t.startDate).sort((a, b) => a.startDate!.localeCompare(b.startDate!));

  for (let i = 0; i < ordered.length - 1; i++) {
    const first = ordered[i]!;
    const second = ordered[i + 1]!;
    const bothMeetCredits =
      first.gpaResult.totalCredits >= rule.fullTimeCreditThreshold &&
      second.gpaResult.totalCredits >= rule.fullTimeCreditThreshold;
    const bothComplete = !first.hasInProgressCourses && !second.hasInProgressCourses;
    const bothAtGpa = (first.gpaResult.gpa ?? 0) >= rule.minTermGpa && (second.gpaResult.gpa ?? 0) >= rule.minTermGpa;

    if (bothMeetCredits && bothComplete && bothAtGpa) {
      return {
        ruleId: rule.id,
        label: rule.label,
        status: "earned",
        detail: `Two consecutive terms at ${rule.minTermGpa.toFixed(2)}+ GPA, full-time both terms.`,
      };
    }

    // On track: an earlier completed qualifying term immediately followed
    // by a still-in-progress term currently trending at or above the bar.
    if (
      bothMeetCredits &&
      !first.hasInProgressCourses &&
      (first.gpaResult.gpa ?? 0) >= rule.minTermGpa &&
      second.hasInProgressCourses
    ) {
      const secondOnTrack = second.gpaResult.gpaBearingCredits === 0 || (second.gpaResult.gpa ?? 0) >= rule.minTermGpa;
      return {
        ruleId: rule.id,
        label: rule.label,
        status: secondOnTrack ? "on_track" : "at_risk",
        detail: secondOnTrack
          ? `First of two required terms already met the ${rule.minTermGpa.toFixed(2)} bar; the following term is still in progress and currently on track.`
          : `First of two required terms met the ${rule.minTermGpa.toFixed(2)} bar, but the following term is currently trending below it.`,
      };
    }
  }

  if (ordered.length === 0) {
    return { ruleId: rule.id, label: rule.label, status: "not_yet_eligible", detail: "No terms with recorded dates yet." };
  }

  return {
    ruleId: rule.id,
    label: rule.label,
    status: "not_yet_eligible",
    detail: `Requires two consecutive terms at ${rule.minTermGpa.toFixed(2)} GPA — not yet met.`,
  };
}

export function computeHonorsListStatus(terms: TermForHonors[], policy: InstitutionAcademicPolicy): HonorsListStatusEntry[] {
  return policy.honorsLists.map((rule) => {
    if (rule.consecutiveTerms <= 1) {
      // One entry per term for single-term rules, most recent term first.
      const ordered = [...terms].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
      const mostRecent = ordered[0];
      if (!mostRecent) {
        return { ruleId: rule.id, label: rule.label, status: "awaiting_final_grades", detail: "No terms yet." };
      }
      return singleTermStatus(mostRecent, rule);
    }
    return consecutiveTermsStatus(terms, rule);
  });
}

export function computeGraduationHonorsForecast(
  cumulative: CumulativeGpaResult,
  isDegreeCompleted: boolean,
  policy: InstitutionAcademicPolicy
): GraduationHonorsForecast {
  if (cumulative.gpa === null) {
    return {
      currentDistinctionId: null,
      currentDistinctionLabel: null,
      isOfficial: false,
      gpaToNextDistinction: null,
      nextDistinctionLabel: policy.graduationHonors[0]?.label ?? null,
      basis: cumulative.basis,
    };
  }

  const sorted = [...policy.graduationHonors].sort((a, b) => b.minCumulativeGpa - a.minCumulativeGpa);
  const gpa = cumulative.gpa;
  const current = sorted.find((rule) => gpa >= rule.minCumulativeGpa) ?? null;
  const currentIndex = current ? sorted.indexOf(current) : sorted.length;
  const next = currentIndex > 0 ? sorted[currentIndex - 1] : null;

  return {
    currentDistinctionId: current?.id ?? null,
    currentDistinctionLabel: current?.label ?? null,
    isOfficial: isDegreeCompleted && current !== null,
    gpaToNextDistinction: next ? Math.max(0, next.minCumulativeGpa - gpa) : null,
    nextDistinctionLabel: next?.label ?? null,
    basis: cumulative.basis,
  };
}
