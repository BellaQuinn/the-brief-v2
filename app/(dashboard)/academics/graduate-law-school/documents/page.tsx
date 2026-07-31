import { createClient } from "@/lib/supabase/server";
import { DocumentsClient } from "@/components/graduateLawSchool/DocumentsClient";
import type { LawSchool, LawSchoolDocument } from "@/types/database.types";

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
