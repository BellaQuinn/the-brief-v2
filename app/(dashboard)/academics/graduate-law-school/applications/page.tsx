import { createClient } from "@/lib/supabase/server";
import { SchoolApplicationKanban } from "@/components/graduateLawSchool/SchoolApplicationKanban";
import type { LawSchool } from "@/types/database.types";

export default async function GraduateLawSchoolApplicationsPage() {
  const supabase = await createClient();

  const { data: schools } = await supabase.from("law_schools").select("*").order("created_at", { ascending: true });

  return <SchoolApplicationKanban initialSchools={(schools as LawSchool[]) ?? []} />;
}
