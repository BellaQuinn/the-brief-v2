import { createClient } from "@/lib/supabase/server";
import { AcademicsClient } from "@/components/academics/AcademicsClient";
import { sortDegrees } from "@/lib/utils";
import type { DegreeWithTerms } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

export default async function AcademicsPage() {
  const supabase = await createClient();

  // Assignments are deliberately not fetched here — CourseRow lazy-loads
  // them per-course on first expand, since a full degree plan can carry
  // hundreds of assignments the user never opens in a given session.
  const { data: degrees } = await supabase
    .from("degrees")
    .select("*, terms(*, courses(*))")
    .order("created_at", { ascending: true })
    .order("created_at", { ascending: true, referencedTable: "terms" })
    .order("created_at", { ascending: true, referencedTable: "terms.courses" });

  return <AcademicsClient initialDegrees={sortDegrees((degrees as DegreeWithTerms[]) ?? [])} />;
}
