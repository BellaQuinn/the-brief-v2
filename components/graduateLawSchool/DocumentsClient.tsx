"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { Modal } from "@/components/ui/Modal";
import { DocumentCard } from "@/components/graduateLawSchool/DocumentCard";
import { DocumentForm } from "@/components/graduateLawSchool/DocumentForm";
import { buildDocumentsWorkspaceBrief } from "@/lib/workspaceBriefs";
import type { LawSchool, LawSchoolDocument } from "@/types/database.types";

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

export function DocumentsClient({
  initialDocuments,
  schools,
}: {
  initialDocuments: LawSchoolDocument[];
  schools: LawSchool[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [adding, setAdding] = useState(false);
  const linkedSourceCount = documents.filter(({ url }) => Boolean(url)).length;
  const schoolLinkedCount = documents.filter(({ law_school_id }) => Boolean(law_school_id)).length;
  const brief = buildDocumentsWorkspaceBrief({
    documentCount: documents.length,
    linkedSourceCount,
    schoolLinkedCount,
  });

  return (
    <div>
      <WorkspaceBrief
        eyebrow="GRADUATE & LAW SCHOOL // DOCUMENTS"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${documents.length} tracked · ${linkedSourceCount} sourced`}
        action={
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 border border-accent/30 bg-accent-dim/50 px-3 py-2 text-xs font-medium text-accent-bright transition-colors hover:border-accent/60 hover:bg-accent-dim"
          >
            <Plus className="h-3.5 w-3.5" />
            Add document
          </button>
        }
      />

      <div className="px-4 py-6 md:px-8">
        {documents.length === 0 ? (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">No documents tracked yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {documents.map((d) => (
              <DocumentCard
                key={d.id}
                document={d}
                schools={schools}
                onSaved={(updated) => setDocuments((prev) => upsertById(prev, updated))}
                onDeleted={(id) => setDocuments((prev) => prev.filter((item) => item.id !== id))}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add document">
        <DocumentForm
          schools={schools}
          onSaved={(d) => {
            setDocuments((prev) => upsertById(prev, d));
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </div>
  );
}
