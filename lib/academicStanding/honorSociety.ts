import type { HonorSocietyRequirement, InstitutionAcademicPolicy } from "@/lib/academicPolicy/types";
import type { HonorSocietyProgressResult, HonorSocietyRequirementStatus } from "@/lib/academicStanding/types";

function requirementStatus(
  requirement: HonorSocietyRequirement,
  gradedCredits: number,
  cumulativeGpa: number | null
): HonorSocietyRequirementStatus {
  switch (requirement.kind) {
    case "gradedCredits": {
      const threshold = requirement.threshold ?? 0;
      const met = gradedCredits >= threshold;
      return {
        id: requirement.id,
        label: requirement.label,
        status: met ? "met" : "in_progress",
        detail: `${gradedCredits} / ${threshold} credits`,
      };
    }
    case "cumulativeGpa": {
      const threshold = requirement.threshold ?? 0;
      const met = cumulativeGpa !== null && cumulativeGpa >= threshold;
      return {
        id: requirement.id,
        label: requirement.label,
        status: met ? "met" : "in_progress",
        detail: cumulativeGpa !== null ? `${cumulativeGpa.toFixed(2)} / ${threshold.toFixed(2)}` : `No GPA yet / ${threshold.toFixed(2)} required`,
      };
    }
    case "adultStudent":
      return {
        id: requirement.id,
        label: requirement.label,
        status: "assumed_true",
        detail: "Assumed true — The Brief has one user, its account owner. Institution confirmation still required.",
      };
    case "classRank":
      return {
        id: requirement.id,
        label: requirement.label,
        status: "institution_confirmation_required",
        detail: "Class rank isn't visible to this app — institution confirmation required.",
      };
    case "localChapter":
      return {
        id: requirement.id,
        label: requirement.label,
        status: "not_yet_verified",
        detail: "No local chapter rules on file — not yet verified.",
      };
  }
}

export function computeHonorSocietyProgress(
  gradedInstitutionalCredits: number,
  cumulativeGpa: number | null,
  policy: InstitutionAcademicPolicy
): HonorSocietyProgressResult[] {
  return policy.honorSocieties.map((rule) => {
    const requirements = rule.requirements.map((requirement) =>
      requirementStatus(requirement, gradedInstitutionalCredits, cumulativeGpa)
    );

    const automatable = requirements.filter((r) => r.status === "met" || r.status === "in_progress");
    const allAutomatableMet = automatable.length > 0 && automatable.every((r) => r.status === "met");

    return {
      ruleId: rule.id,
      label: rule.label,
      overallStatus: allAutomatableMet ? "potentially_eligible" : "requirements_in_progress",
      requirements,
    };
  });
}
