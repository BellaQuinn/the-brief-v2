"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { DocumentPreviewModal } from "@/components/documents/DocumentPreviewModal";
import type { EntityOptionMap } from "@/components/documents/DocumentRelationshipPicker";
import { createClient } from "@/lib/supabase/client";
import { CATEGORY_LABEL, ENTITY_TYPE_LABEL, filterDocuments, sortDocumentsByRecency, type DocumentFilters } from "@/lib/documents";
import { buildAcademicDocumentsWorkspaceBrief } from "@/lib/workspaceBriefs";
import { cn } from "@/lib/utils";
import type { DocumentWithRelationships } from "@/types/database.types";

const ALL = "all";

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

export function DocumentsClient({
  initialDocuments,
  entityOptions,
  initialRecentViews,
}: {
  initialDocuments: DocumentWithRelationships[];
  entityOptions: EntityOptionMap;
  initialRecentViews: { document_id: string; viewed_at: string }[];
}) {
  const supabase = createClient();
  const [documents, setDocuments] = useState(initialDocuments);
  const [recentViews, setRecentViews] = useState(initialRecentViews);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [entityType, setEntityType] = useState(ALL);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState<DocumentWithRelationships | null>(null);

  const activeCount = documents.filter((d) => d.status === "active").length;
  const unattachedCount = documents.filter((d) => d.status === "active" && d.relationships.length === 0).length;
  const archivedCount = documents.filter((d) => d.status === "archived").length;
  const brief = buildAcademicDocumentsWorkspaceBrief({ documentCount: activeCount, unattachedCount, archivedCount });

  const isDefaultView = !search && category === ALL && entityType === ALL && !favoritesOnly && !showArchived;

  const filtered = useMemo(() => {
    const filters: DocumentFilters = {
      search: search || undefined,
      category: category === ALL ? undefined : (category as DocumentFilters["category"]),
      entityType: entityType === ALL ? undefined : (entityType as DocumentFilters["entityType"]),
      favoritesOnly,
      status: showArchived ? "archived" : "active",
    };
    return sortDocumentsByRecency(filterDocuments(documents, filters));
  }, [documents, search, category, entityType, favoritesOnly, showArchived]);

  const recentDocuments = useMemo(() => {
    const seen = new Set<string>();
    const result: DocumentWithRelationships[] = [];
    for (const view of [...recentViews].sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime())) {
      if (seen.has(view.document_id)) continue;
      const doc = documents.find((d) => d.id === view.document_id && d.status === "active");
      if (!doc) continue;
      seen.add(view.document_id);
      result.push(doc);
      if (result.length >= 6) break;
    }
    return result;
  }, [recentViews, documents]);

  async function handlePreview(document: DocumentWithRelationships) {
    setPreviewing(document);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data } = await supabase
      .from("document_views")
      .insert({ document_id: document.id, user_id: user.user.id })
      .select()
      .single();
    if (data) setRecentViews((prev) => [{ document_id: document.id, viewed_at: data.viewed_at }, ...prev]);
  }

  return (
    <div>
      <WorkspaceBrief
        eyebrow="Academics // Documents"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${activeCount} document${activeCount === 1 ? "" : "s"} on file`}
        action={
          <Button onClick={() => setUploading(true)} className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Upload
          </Button>
        }
      />

      <div className="px-4 py-6 md:px-8">
        <WorkspaceSection eyebrow="Filter" title="Find a document">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="Search title or description…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[{ value: ALL, label: "Any category" }, ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }))]}
            />
            <Select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              options={[{ value: ALL, label: "Attached to anything" }, ...Object.entries(ENTITY_TYPE_LABEL).map(([value, label]) => ({ value, label }))]}
            />
            <div className="flex items-center gap-2">
              <FilterToggle active={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)} label="Favorites" />
              <FilterToggle active={showArchived} onClick={() => setShowArchived((v) => !v)} label="Archived" />
            </div>
          </div>
        </WorkspaceSection>

        {isDefaultView && recentDocuments.length > 0 && (
          <WorkspaceSection eyebrow="Recently viewed" title="Pick up where you left off" className="mt-8">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handlePreview(doc)}
                  className="shrink-0 rounded-lg border border-border-subtle px-3 py-2 text-left text-xs text-ink-secondary hover:border-border hover:text-ink-primary"
                >
                  <span className="block max-w-[160px] truncate">{doc.title}</span>
                </button>
              ))}
            </div>
          </WorkspaceSection>
        )}

        <div className="mt-8 space-y-3">
          {filtered.length === 0 ? (
            <div className="border-y border-border-subtle px-6 py-10 text-center">
              <p className="text-sm text-ink-secondary">
                {documents.length === 0 ? "No documents uploaded yet." : "Nothing matches these filters."}
              </p>
            </div>
          ) : (
            filtered.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                entityOptions={entityOptions}
                onUpdated={(updated) => setDocuments((prev) => upsertById(prev, updated))}
                onDeleted={(id) => setDocuments((prev) => prev.filter((d) => d.id !== id))}
                onPreview={handlePreview}
              />
            ))
          )}
        </div>
      </div>

      <Modal open={uploading} onClose={() => setUploading(false)} title="Upload document">
        <DocumentForm
          entityOptions={entityOptions}
          onSaved={(doc) => {
            setDocuments((prev) => upsertById(prev, doc));
            setUploading(false);
          }}
          onCancel={() => setUploading(false)}
        />
      </Modal>

      <DocumentPreviewModal document={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
}

function FilterToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm transition-colors",
        active ? "border-accent/50 bg-accent-dim/40 text-accent-bright" : "border-border text-ink-secondary hover:text-ink-primary"
      )}
    >
      {label}
    </button>
  );
}
