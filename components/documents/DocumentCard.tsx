"use client";

import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Download,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { DocumentReplaceForm } from "@/components/documents/DocumentReplaceForm";
import { deleteDocumentFiles, getSignedDocumentUrl } from "@/lib/documentStorage";
import { CATEGORY_LABEL, formatFileSize, getFileKind } from "@/lib/documents";
import { cn } from "@/lib/utils";
import type { EntityOptionMap } from "@/components/documents/DocumentRelationshipPicker";
import type { DocumentWithRelationships } from "@/types/database.types";

export function DocumentCard({
  document,
  entityOptions,
  onUpdated,
  onDeleted,
  onPreview,
}: {
  document: DocumentWithRelationships;
  entityOptions: EntityOptionMap;
  onUpdated: (document: DocumentWithRelationships) => void;
  onDeleted: (id: string) => void;
  onPreview: (document: DocumentWithRelationships) => void;
}) {
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [busy, setBusy] = useState(false);

  const kind = getFileKind(document.mime_type);
  const Icon = kind === "image" ? ImageIcon : FileText;

  async function toggleFavorite() {
    const { data } = await supabase
      .from("documents")
      .update({ is_favorite: !document.is_favorite })
      .eq("id", document.id)
      .select()
      .single();
    if (data) onUpdated({ ...document, ...data });
  }

  async function toggleArchive() {
    const nextStatus = document.status === "archived" ? "active" : "archived";
    const { data } = await supabase.from("documents").update({ status: nextStatus }).eq("id", document.id).select().single();
    if (data) onUpdated({ ...document, ...data });
    setMenuOpen(false);
  }

  async function handleDownload() {
    const url = await getSignedDocumentUrl(document.storage_path);
    if (!url) return;
    const link = window.document.createElement("a");
    link.href = url;
    link.download = document.file_name;
    link.click();
    setMenuOpen(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${document.title}"? This removes every stored version.`);
    if (!confirmed) return;
    setBusy(true);

    const { data: versions } = await supabase
      .from("document_versions")
      .select("storage_path")
      .eq("document_id", document.id);
    const { error } = await supabase.from("documents").delete().eq("id", document.id);

    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    await deleteDocumentFiles((versions ?? []).map((v) => v.storage_path));
    onDeleted(document.id);
  }

  function handleFormSaved(updated: DocumentWithRelationships) {
    onUpdated(updated);
    setEditing(false);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-md bg-surface-raised p-2 text-ink-tertiary">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <button
            onClick={() => onPreview(document)}
            className="block truncate text-left text-sm font-medium text-ink-primary hover:text-accent-bright"
          >
            {document.title}
          </button>
          <p className="mt-0.5 truncate font-mono text-[11px] text-ink-tertiary">
            {[CATEGORY_LABEL[document.category], formatFileSize(document.file_size)].join(" · ")}
            {document.status === "archived" && <span className="ml-1.5 text-seal">· Archived</span>}
          </p>
          {document.relationships.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {document.relationships.map((r) => (
                <span key={r.id} className="rounded-md border border-border-subtle px-1.5 py-0.5 text-[10px] text-ink-tertiary">
                  {r.label}
                </span>
              ))}
            </div>
          )}
          {document.description && <p className="mt-1.5 text-xs text-ink-secondary">{document.description}</p>}
        </div>

        <div className="flex shrink-0 items-start gap-1">
          <button
            onClick={toggleFavorite}
            aria-label={document.is_favorite ? "Remove favorite" : "Mark favorite"}
            className={cn(
              "rounded-md p-1.5 transition-colors hover:bg-surface-raised",
              document.is_favorite ? "text-seal" : "text-ink-tertiary hover:text-ink-primary"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", document.is_favorite && "fill-current")} />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More actions"
              className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border bg-surface p-1 shadow-elevated">
                  <MenuItem icon={Download} label="Download" onClick={handleDownload} />
                  <MenuItem
                    icon={Pencil}
                    label="Rename / edit"
                    onClick={() => {
                      setEditing(true);
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={RefreshCw}
                    label="Replace file"
                    onClick={() => {
                      setReplacing(true);
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={document.status === "archived" ? ArchiveRestore : Archive}
                    label={document.status === "archived" ? "Unarchive" : "Archive"}
                    onClick={toggleArchive}
                  />
                  <MenuItem icon={Trash2} label="Delete" onClick={handleDelete} destructive disabled={busy} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit document">
        <DocumentForm document={document} entityOptions={entityOptions} onSaved={handleFormSaved} onCancel={() => setEditing(false)} />
      </Modal>

      <Modal open={replacing} onClose={() => setReplacing(false)} title="Replace file">
        <DocumentReplaceForm
          document={document}
          onSaved={(updated) => {
            onUpdated({ ...document, ...updated });
            setReplacing(false);
          }}
          onCancel={() => setReplacing(false)}
        />
      </Modal>
    </div>
  );
}

function MenuItem({
  icon: IconComponent,
  label,
  onClick,
  destructive,
  disabled,
}: {
  icon: typeof Star;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors disabled:opacity-50",
        destructive ? "text-status-atRisk hover:bg-status-atRisk/10" : "text-ink-secondary hover:bg-surface-raised hover:text-ink-primary"
      )}
    >
      <IconComponent className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
