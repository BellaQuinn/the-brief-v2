"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { DocumentForm } from "@/components/graduateLawSchool/DocumentForm";
import { cn } from "@/lib/utils";
import type { DocumentCategory, LawSchool, LawSchoolDocument } from "@/types/database.types";

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  essay: "Essay",
  recommendation: "Recommendation",
  transcript: "Transcript",
  financial: "Financial",
  other: "Other",
};

export function DocumentCard({
  document,
  schools,
  onSaved,
  onDeleted,
}: {
  document: LawSchoolDocument;
  schools: LawSchool[];
  onSaved: (document: LawSchoolDocument) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const linkedSchool = schools.find((s) => s.id === document.law_school_id);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${document.title}"?`);
    if (!confirmed) return;
    const { error } = await supabase.from("law_school_documents").delete().eq("id", document.id);
    if (error) {
      alert(error.message);
      return;
    }
    onDeleted(document.id);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {document.url ? (
            <a
              href={document.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 truncate text-sm font-medium text-signal hover:text-signal-bright"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{document.title}</span>
            </a>
          ) : (
            <p className="truncate text-sm font-medium text-ink-primary">{document.title}</p>
          )}
          <p className="mt-0.5 text-xs text-ink-tertiary">
            {[CATEGORY_LABEL[document.category], linkedSchool?.school_name].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className={cn("flex shrink-0 items-center gap-2")}>
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit document"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete document"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {document.notes && <p className="mt-2 whitespace-pre-wrap text-xs text-ink-tertiary">{document.notes}</p>}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit document">
        <DocumentForm
          document={document}
          schools={schools}
          onSaved={(d) => {
            onSaved(d);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
