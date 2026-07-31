import { createClient } from "@/lib/supabase/server";
import { SchoolsClient } from "@/components/graduateLawSchool/SchoolsClient";
import type { LawSchool } from "@/types/database.types";

export default async function SchoolsPage() {
  const supabase = await createClient();

  const { data: schools } = await supabase.from("law_schools").select("*").order("created_at", { ascending: true });

  return <SchoolsClient initialSchools={(schools as LawSchool[]) ?? []} />;
}
