"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { Modal } from "@/components/ui/Modal";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { DocumentPreviewModal } from "@/components/documents/DocumentPreviewModal";
import type { EntityOptionMap } from "@/components/documents/DocumentRelationshipPicker";
import { createClient } from "@/lib/supabase/client";
import type { DocumentWithRelationships } from "@/types/database.types";

// Same data, same DocumentCard, just pre-filtered to one course and with
// the upload flow pre-attaching that course -- not a separate document
// system, a scoped lens over the same `documents` table the global
// workspace reads (matching how Planner/Courses/Assignments already
// share `assignments` without duplicating anything).
export function CourseDocumentsSection({
  courseId,
  courseLabel,
  documents,
  entityOptions,
  onChange,
}: {
  courseId: string;
  courseLabel: string;
  documents: DocumentWithRelationships[];
  entityOptions: EntityOptionMap;
  onChange: (next: DocumentWithRelationships[]) => void;
}) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState<DocumentWithRelationships | null>(null);

  const scoped = documents.filter(
    (d) => d.status === "active" && d.relationships.some((r) => r.entity_type === "course" && r.entity_id === courseId)
  );

  function upsert(row: DocumentWithRelationships) {
    const exists = documents.some((d) => d.id === row.id);
    onChange(exists ? documents.map((d) => (d.id === row.id ? row : d)) : [...documents, row]);
  }

  async function handlePreview(document: DocumentWithRelationships) {
    setPreviewing(document);
    const { data: user } = await supabase.auth.getUser();
    if (user.user) await supabase.from("document_views").insert({ document_id: document.id, user_id: user.user.id });
  }

  return (
    <WorkspaceSection
      eyebrow="Documents"
      title="Files for this course"
      className="mt-6"
      action={
        <button onClick={() => setUploading(true)} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright">
          <Plus className="h-3 w-3" />
          Upload
        </button>
      }
    >
      {scoped.length === 0 ? (
        <p className="text-sm text-ink-tertiary">No documents attached to this course yet.</p>
      ) : (
        <div className="space-y-3">
          {scoped.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              entityOptions={entityOptions}
              onUpdated={upsert}
              onDeleted={(id) => onChange(documents.filter((d) => d.id !== id))}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      <Modal open={uploading} onClose={() => setUploading(false)} title="Upload document">
        <DocumentForm
          entityOptions={entityOptions}
          defaultRelationship={{ entity_type: "course", entity_id: courseId, label: courseLabel }}
          onSaved={(doc) => {
            upsert(doc);
            setUploading(false);
          }}
          onCancel={() => setUploading(false)}
        />
      </Modal>

      <DocumentPreviewModal document={previewing} onClose={() => setPreviewing(null)} />
    </WorkspaceSection>
  );
}
