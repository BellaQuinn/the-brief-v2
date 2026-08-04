import { createClient } from "@/lib/supabase/server";
import { LsatClient } from "@/components/graduateLawSchool/LsatClient";
import type { LsatGoalCheckpoint, LsatPracticeTest } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

export default async function LsatPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: practiceTests }, { data: checkpoints }] = await Promise.all([
    supabase
      .from("users")
      .select("lsat_goal_score, lsat_diagnostic_score, lsat_planned_test_date")
      .eq("id", authUser!.id)
      .single(),
    supabase.from("lsat_practice_tests").select("*").order("test_date", { ascending: false }),
    supabase.from("lsat_goal_checkpoints").select("*").order("target_date", { ascending: true }),
  ]);

  return (
    <LsatClient
      initialGoals={
        profile ?? { lsat_goal_score: null, lsat_diagnostic_score: null, lsat_planned_test_date: null }
      }
      initialPracticeTests={(practiceTests as LsatPracticeTest[]) ?? []}
      initialCheckpoints={(checkpoints as LsatGoalCheckpoint[]) ?? []}
    />
  );
}
