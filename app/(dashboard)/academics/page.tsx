import { createClient } from "@/lib/supabase/server";
import { AcademicsClient } from "@/components/academics/AcademicsClient";
import type { DegreeWithTerms } from "@/types/database.types";

export default async function AcademicsPage() {
  const supabase = await createClient();

  // Assignments are deliberately not fetched here — CourseRow lazy-loads
  // them per-course on first expand, since a full degree plan can carry
  // hundreds of assignments the user never opens in a given session.
  const { data: degree } = await supabase
    .from("degrees")
    .select("*, terms(*, courses(*))")
    .order("created_at", { ascending: true, referencedTable: "terms" })
    .order("created_at", { ascending: true, referencedTable: "terms.courses" })
    .limit(1)
    .maybeSingle();

  return <AcademicsClient initialDegree={degree as DegreeWithTerms | null} />;
}
