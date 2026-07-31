import { createClient } from "@/lib/supabase/server";
import { LsatClient } from "@/components/graduateLawSchool/LsatClient";
import type { LsatPracticeTest } from "@/types/database.types";

export default async function LsatPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: practiceTests }] = await Promise.all([
    supabase
      .from("users")
      .select("lsat_goal_score, lsat_diagnostic_score, lsat_planned_test_date")
      .eq("id", authUser!.id)
      .single(),
    supabase.from("lsat_practice_tests").select("*").order("test_date", { ascending: false }),
  ]);

  return (
    <LsatClient
      initialGoals={
        profile ?? { lsat_goal_score: null, lsat_diagnostic_score: null, lsat_planned_test_date: null }
      }
      initialPracticeTests={(practiceTests as LsatPracticeTest[]) ?? []}
    />
  );
}
