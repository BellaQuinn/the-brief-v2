import { createClient } from "@/lib/supabase/server";
import { ScholarshipsClient } from "@/components/graduateLawSchool/ScholarshipsClient";
import type { LawSchool, Scholarship } from "@/types/database.types";

export default async function ScholarshipsPage() {
  const supabase = await createClient();

  const [{ data: scholarships }, { data: schools }] = await Promise.all([
    supabase.from("scholarships").select("*").order("deadline", { ascending: true, nullsFirst: false }),
    supabase.from("law_schools").select("*").order("created_at", { ascending: true }),
  ]);

  return (
    <ScholarshipsClient
      initialScholarships={(scholarships as Scholarship[]) ?? []}
      schools={(schools as LawSchool[]) ?? []}
    />
  );
}
