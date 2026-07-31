import { createClient } from "@/lib/supabase/server";
import { TimelineClient } from "@/components/graduateLawSchool/TimelineClient";
import type { Milestone } from "@/types/database.types";

export default async function TimelinePage() {
  const supabase = await createClient();

  const { data: milestones } = await supabase.from("milestones").select("*");

  return <TimelineClient initialMilestones={(milestones as Milestone[]) ?? []} />;
}
