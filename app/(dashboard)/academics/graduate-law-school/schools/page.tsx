import { createClient } from "@/lib/supabase/server";
import { SchoolsClient } from "@/components/graduateLawSchool/SchoolsClient";
import type { LawSchool } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const supabase = await createClient();

  const { data: schools } = await supabase.from("law_schools").select("*").order("created_at", { ascending: true });

  return <SchoolsClient initialSchools={(schools as LawSchool[]) ?? []} />;
}
