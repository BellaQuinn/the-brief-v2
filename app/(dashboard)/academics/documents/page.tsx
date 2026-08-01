import { createClient } from "@/lib/supabase/server";
import { fetchDocumentsWorkspaceData } from "@/lib/documentsData.server";
import { DocumentsClient } from "@/components/documents/DocumentsClient";

// Every entity a document can attach to, across every degree — same
// "everything on file" scope as Assignments/Courses/Calendar, since a
// student needs to find an old syllabus regardless of which degree or
// term it belonged to.
export default async function DocumentsPage() {
  const supabase = await createClient();

  const [{ documents, entityOptions }, { data: recentViews }] = await Promise.all([
    fetchDocumentsWorkspaceData(supabase),
    supabase.from("document_views").select("document_id, viewed_at").order("viewed_at", { ascending: false }).limit(50),
  ]);

  return (
    <DocumentsClient
      initialDocuments={documents}
      entityOptions={entityOptions}
      initialRecentViews={recentViews ?? []}
    />
  );
}
