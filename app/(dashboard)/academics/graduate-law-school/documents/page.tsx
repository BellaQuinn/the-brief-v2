import { createClient } from "@/lib/supabase/server";
import { DocumentsClient } from "@/components/graduateLawSchool/DocumentsClient";
import type { LawSchool, LawSchoolDocument } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const supabase = await createClient();

  const [{ data: documents }, { data: schools }] = await Promise.all([
    supabase.from("law_school_documents").select("*").order("created_at", { ascending: true }),
    supabase.from("law_schools").select("*").order("created_at", { ascending: true }),
  ]);

  return (
    <DocumentsClient
      initialDocuments={(documents as LawSchoolDocument[]) ?? []}
      schools={(schools as LawSchool[]) ?? []}
    />
  );
}
