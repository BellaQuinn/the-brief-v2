import { createClient } from "@/lib/supabase/server";
import { ScholarshipsClient } from "@/components/graduateLawSchool/ScholarshipsClient";
import type { LawSchool, Scholarship } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

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
