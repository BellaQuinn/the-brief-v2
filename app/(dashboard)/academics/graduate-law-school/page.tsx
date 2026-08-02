import { createClient } from "@/lib/supabase/server";
import { GraduateLawSchoolOverview } from "@/components/graduateLawSchool/GraduateLawSchoolOverview";
import { sortMilestones } from "@/components/graduateLawSchool/MilestoneRoadmap";
import { latestScore } from "@/lib/lsat";
import type { LawSchool, LsatPracticeTest, Milestone, Scholarship } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

export default async function GraduateLawSchoolOverviewPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [{ data: schools }, { data: scholarships }, { data: milestones }, { data: profile }, { data: practiceTests }] =
    await Promise.all([
      supabase.from("law_schools").select("*").order("created_at", { ascending: true }),
      supabase.from("scholarships").select("*").order("created_at", { ascending: true }),
      supabase.from("milestones").select("*"),
      supabase.from("users").select("lsat_goal_score").eq("id", authUser!.id).single(),
      supabase.from("lsat_practice_tests").select("*"),
    ]);

  const typedSchools = (schools as LawSchool[]) ?? [];
  const typedScholarships = (scholarships as Scholarship[]) ?? [];
  const typedMilestones = (milestones as Milestone[]) ?? [];

  const today = new Date().toISOString().slice(0, 10);

  const deadlines = [
    ...typedSchools
      .filter((s) => s.application_deadline && s.application_deadline >= today)
      .map((s) => ({ label: `${s.school_name} — application due`, date: s.application_deadline!, href: "/academics/graduate-law-school/schools" })),
    ...typedScholarships
      .filter((s) => s.deadline && s.deadline >= today)
      .map((s) => ({ label: `${s.name} — scholarship due`, date: s.deadline!, href: "/academics/graduate-law-school/scholarships" })),
    ...typedMilestones
      .filter((m) => m.target_date && m.target_date >= today && m.status !== "completed")
      .map((m) => ({ label: m.title, date: m.target_date!, href: "/academics/graduate-law-school/timeline" })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <GraduateLawSchoolOverview
      schools={typedSchools}
      scholarships={typedScholarships}
      deadlines={deadlines}
      milestones={sortMilestones(typedMilestones)}
      lsatGoalScore={profile?.lsat_goal_score ?? null}
      lsatLatestScore={latestScore((practiceTests as LsatPracticeTest[]) ?? [])}
    />
  );
}
