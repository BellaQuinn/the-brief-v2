import { createClient } from "@/lib/supabase/server";
import { PlannerClient } from "@/components/academics/planner/PlannerClient";
import type { AssignmentWithDegreeContext } from "@/types/database.types";

export default async function PlannerPage() {
  const supabase = await createClient();

  // Scoped to the active degree(s), same rule as the Brief dashboard —
  // Planner answers "what should I work on right now to stay ahead,"
  // so a planned future degree's coursework doesn't belong in a
  // right-now priority queue. Not limited to a 7-day window like the
  // Brief, though — the queue itself (lib/plannerQueue.ts) handles
  // sorting everything open by real urgency.
  const { data } = await supabase
    .from("assignments")
    .select("*, course:courses!inner(course_code, course_name, term:terms!inner(degree:degrees!inner(status, degree_name)))")
    .not("status", "in", "(submitted,graded)")
    .eq("course.term.degree.status", "active")
    .returns<AssignmentWithDegreeContext[]>();

  return <PlannerClient initialAssignments={data ?? []} />;
}
