import type { InstitutionAcademicPolicy } from "@/lib/academicPolicy/types";

// Champlain College Online, undergraduate. Sourced from the registrar's
// published pages — see policySourceUrls. Honor-society local-chapter rules
// are unresolved (no Champlain-specific Alpha Sigma Lambda chapter
// constitution found), hence verificationStatus: "partial" on that rule.
export const champlainUndergraduatePolicy: InstitutionAcademicPolicy = {
  institutionId: "champlain-online-undergraduate",
  institutionName: "Champlain College Online",
  programLevel: "undergraduate",

  gradingScale: [
    { grade: "A", minPercent: 93, gradePoints: 4.0 },
    { grade: "A-", minPercent: 90, gradePoints: 3.67 },
    { grade: "B+", minPercent: 87, gradePoints: 3.33 },
    { grade: "B", minPercent: 83, gradePoints: 3.0 },
    { grade: "B-", minPercent: 80, gradePoints: 2.67 },
    { grade: "C+", minPercent: 77, gradePoints: 2.33 },
    { grade: "C", minPercent: 73, gradePoints: 2.0 },
    { grade: "C-", minPercent: 70, gradePoints: 1.67 },
    { grade: "D+", minPercent: 67, gradePoints: 1.33 },
    { grade: "D", minPercent: 63, gradePoints: 1.0 },
    { grade: "D-", minPercent: 60, gradePoints: 0.67 },
    { grade: "F", minPercent: 0, gradePoints: 0.0 },
    // NP counts toward GPA at 0.00 (unlike P/W/I/AU below) but is never
    // produced from a computed percentage — only reachable via an explicit
    // final_grade_override.
    { grade: "NP", minPercent: -1, gradePoints: 0.0 },
  ],
  nonGpaGrades: ["P", "W", "I", "AU"],

  honorsLists: [
    {
      id: "deans_list",
      label: "Dean's List",
      minTermGpa: 3.5,
      consecutiveTerms: 1,
      requiresFullTime: true,
      fullTimeCreditThreshold: 12,
    },
    {
      id: "presidents_list",
      label: "President's List",
      minTermGpa: 4.0,
      consecutiveTerms: 1,
      requiresFullTime: true,
      fullTimeCreditThreshold: 12,
    },
    {
      id: "trustees_list",
      label: "Trustees' List",
      minTermGpa: 4.0,
      consecutiveTerms: 2,
      requiresFullTime: true,
      fullTimeCreditThreshold: 12,
    },
  ],

  graduationHonors: [
    { id: "summa_cum_laude", label: "Summa Cum Laude", minCumulativeGpa: 3.8 },
    { id: "magna_cum_laude", label: "Magna Cum Laude", minCumulativeGpa: 3.65 },
    { id: "cum_laude", label: "Cum Laude", minCumulativeGpa: 3.5 },
  ],

  honorSocieties: [
    {
      id: "alpha_sigma_lambda",
      label: "Alpha Sigma Lambda",
      programLevel: "undergraduate",
      requirements: [
        {
          id: "graded_credits",
          label: "Institutional graded credits",
          kind: "gradedCredits",
          threshold: 24,
        },
        {
          id: "cumulative_gpa",
          label: "Cumulative GPA",
          kind: "cumulativeGpa",
          threshold: 3.5,
        },
        {
          id: "adult_student",
          label: "Adult-student status",
          kind: "adultStudent",
        },
        {
          id: "class_rank",
          label: "Top 20% of eligible students",
          kind: "classRank",
        },
        {
          id: "local_chapter",
          label: "Local chapter requirements",
          kind: "localChapter",
        },
      ],
      verificationStatus: "partial",
      notes:
        "National minimums only — no Champlain-specific Alpha Sigma Lambda chapter constitution or local eligibility rules found. Local chapter may impose stricter standards.",
    },
  ],

  policySourceUrls: [
    "https://www.champlain.edu/office/registrar/records/grades/",
    "https://www.champlain.edu/office/registrar/",
    "https://www.champlain.edu/office/registrar/records/graduation/",
  ],
  verificationStatus: "partial",
  notes:
    "Honors-list eligibility requires full-time enrollment (12+ credits per 15-week semester). Champlain Online's 7-week sub-terms aren't confidently mapped to that period here — honors status is computed per term using that term's own credit load, and marked 'Institution Confirmation Required' below the threshold rather than guessed.",
};
