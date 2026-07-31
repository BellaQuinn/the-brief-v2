import { describe, expect, it } from "vitest";
import { champlainUndergraduatePolicy as policy } from "@/lib/academicPolicy/champlain";
import { computeHonorSocietyProgress } from "@/lib/academicStanding/honorSociety";

describe("computeHonorSocietyProgress", () => {
  it("stays in progress until graded credits and GPA both clear the bar", () => {
    const [result] = computeHonorSocietyProgress(18, 3.72, policy);
    expect(result!.overallStatus).toBe("requirements_in_progress");
    expect(result!.requirements.find((r) => r.id === "graded_credits")?.status).toBe("in_progress");
    expect(result!.requirements.find((r) => r.id === "cumulative_gpa")?.status).toBe("met");
  });

  it("never says 'eligible' outright — class rank and local chapter always need confirmation", () => {
    const [result] = computeHonorSocietyProgress(30, 3.9, policy);
    expect(result!.overallStatus).toBe("potentially_eligible");
    expect(result!.requirements.find((r) => r.id === "class_rank")?.status).toBe("institution_confirmation_required");
    expect(result!.requirements.find((r) => r.id === "local_chapter")?.status).toBe("not_yet_verified");
    expect(result!.overallStatus).not.toBe("eligible" as never);
  });

  it("assumes adult-student status true without a stored toggle", () => {
    const [result] = computeHonorSocietyProgress(0, null, policy);
    const adultStudent = result!.requirements.find((r) => r.id === "adult_student");
    expect(adultStudent?.status).toBe("assumed_true");
  });

  it("treats a missing GPA as not-yet-met rather than throwing", () => {
    const [result] = computeHonorSocietyProgress(10, null, policy);
    expect(result!.requirements.find((r) => r.id === "cumulative_gpa")?.status).toBe("in_progress");
  });
});
