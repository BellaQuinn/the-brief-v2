"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { Modal } from "@/components/ui/Modal";
import { DocumentCard } from "@/components/graduateLawSchool/DocumentCard";
import { DocumentForm } from "@/components/graduateLawSchool/DocumentForm";
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

  return (
    <div>
      <WorkspaceHeader
        eyebrow="GRADUATE & LAW SCHOOL // DOCUMENTS"
        title="Documents"
        hideDots
        subtitle={`${documents.length} document${documents.length === 1 ? "" : "s"} tracked`}
        action={
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
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
