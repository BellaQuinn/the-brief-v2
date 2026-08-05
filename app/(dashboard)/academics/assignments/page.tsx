import { createClient } from "@/lib/supabase/server";
import { AssignmentsClient } from "@/components/academics/assignments/AssignmentsClient";
import type { AssignmentWithDegreeContext } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const supabase = await createClient();

  // Every assignment across every degree, regardless of degree status —
  // matches Calendar's "everything on file" philosophy, not the Brief
  // dashboard's active-degree-only scope. This page answers "what's my
  // complete workload," so a planned or paused degree's coursework
  // belongs here even though it wouldn't belong on the Brief.
  const { data } = await supabase
    .from("assignments")
    .select("*, course:courses(course_code, course_name, term:terms(degree:degrees(degree_name)))")
    .order("due_date", { ascending: true, nullsFirst: false })
    .returns<AssignmentWithDegreeContext[]>();

  return <AssignmentsClient initialAssignments={data ?? []} />;
}
