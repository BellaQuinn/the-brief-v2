import { createClient } from "@/lib/supabase/server";
import { TimelineClient } from "@/components/graduateLawSchool/TimelineClient";
import type { Milestone } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const supabase = await createClient();

  const { data: milestones } = await supabase.from("milestones").select("*");

  return <TimelineClient initialMilestones={(milestones as Milestone[]) ?? []} />;
}
