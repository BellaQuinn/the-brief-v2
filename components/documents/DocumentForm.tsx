"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildStoragePath, uploadDocumentFile } from "@/lib/documentStorage";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CATEGORY_LABEL } from "@/lib/documents";
import { DocumentRelationshipPicker, type EntityOptionMap, type RelationshipValue } from "@/components/documents/DocumentRelationshipPicker";
import type { AcademicDocumentCategory, DocumentWithRelationships } from "@/types/database.types";

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }));

function titleFromFileName(name: string): string {
  const withoutExt = name.replace(/\.[^./]+$/, "");
  return withoutExt || name;
}

export function DocumentForm({
  document,
  entityOptions,
  defaultRelationship,
  onSaved,
  onCancel,
}: {
  document?: DocumentWithRelationships | null;
  entityOptions: EntityOptionMap;
  defaultRelationship?: RelationshipValue;
  onSaved: (document: DocumentWithRelationships) => void;
  onCancel: () => void;
}) {
  const supabase = createClient();
  const isEditing = Boolean(document);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(document?.title ?? "");
  const [category, setCategory] = useState<AcademicDocumentCategory>(document?.category ?? "other");
  const [description, setDescription] = useState(document?.description ?? "");
  const [relationships, setRelationships] = useState<RelationshipValue[]>(
    document?.relationships.map((r) => ({ entity_type: r.entity_type, entity_id: r.entity_id, label: r.label })) ??
      (defaultRelationship ? [defaultRelationship] : [])
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !title) setTitle(titleFromFileName(selected.name));
  }

  async function handleCreate() {
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      return;
    }

    const documentId = crypto.randomUUID();
    const storagePath = buildStoragePath(user.id, documentId, 1, file.name);
    const mimeType = file.type || "application/octet-stream";

    const uploadResult = await uploadDocumentFile(storagePath, file);
    if (!uploadResult.ok) {
      setError(uploadResult.error);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert({
        id: documentId,
        user_id: user.id,
        title: title || titleFromFileName(file.name),
        description: description || null,
        category,
        status: "active",
        is_favorite: false,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: mimeType,
      })
      .select()
      .single();
    if (insertError || !inserted) {
      setError(insertError?.message ?? "The document couldn't be saved.");
      return;
    }

    await supabase.from("document_versions").insert({
      document_id: documentId,
      user_id: user.id,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: mimeType,
      version_number: 1,
    });

    if (relationships.length > 0) {
      await supabase.from("document_relationships").insert(
        relationships.map((r) => ({
          document_id: documentId,
          user_id: user.id,
          entity_type: r.entity_type,
          entity_id: r.entity_id,
        }))
      );
    }

    onSaved({
      ...inserted,
      relationships: relationships.map((r, i) => ({
        id: `pending-${i}`,
        document_id: documentId,
        user_id: user.id,
        entity_type: r.entity_type,
        entity_id: r.entity_id,
        created_at: new Date().toISOString(),
        label: r.label,
      })),
    } as DocumentWithRelationships);
  }

  async function handleEdit() {
    if (!document) return;
    const { data: updated, error: updateError } = await supabase
      .from("documents")
      .update({ title, description: description || null, category })
      .eq("id", document.id)
      .select()
      .single();
    if (updateError || !updated) {
      setError(updateError?.message ?? "The document couldn't be saved.");
      return;
    }

    const existingKeys = new Set(document.relationships.map((r) => `${r.entity_type}:${r.entity_id}`));
    const nextKeys = new Set(relationships.map((r) => `${r.entity_type}:${r.entity_id}`));
    const toRemove = document.relationships.filter((r) => !nextKeys.has(`${r.entity_type}:${r.entity_id}`));
    const toAdd = relationships.filter((r) => !existingKeys.has(`${r.entity_type}:${r.entity_id}`));

    for (const r of toRemove) {
      await supabase.from("document_relationships").delete().eq("id", r.id);
    }
    let addedRows: { id: string; entity_type: string; entity_id: string }[] = [];
    if (toAdd.length > 0) {
      const { data } = await supabase
        .from("document_relationships")
        .insert(
          toAdd.map((r) => ({
            document_id: document.id,
            user_id: document.user_id,
            entity_type: r.entity_type,
            entity_id: r.entity_id,
          }))
        )
        .select();
      addedRows = data ?? [];
    }

    const kept = document.relationships.filter((r) => nextKeys.has(`${r.entity_type}:${r.entity_id}`));
    const added = toAdd.map((r) => {
      const row = addedRows.find((a) => a.entity_type === r.entity_type && a.entity_id === r.entity_id);
      return {
        id: row?.id ?? `pending-${r.entity_type}-${r.entity_id}`,
        document_id: document.id,
        user_id: document.user_id,
        entity_type: r.entity_type,
        entity_id: r.entity_id,
        created_at: new Date().toISOString(),
        label: r.label,
      };
    });

    onSaved({ ...updated, relationships: [...kept, ...added] } as DocumentWithRelationships);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    if (isEditing) {
      await handleEdit();
    } else {
      await handleCreate();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div>
          <label className="mb-1.5 block text-sm text-ink-secondary">File</label>
          <input
            type="file"
            required
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            className="block w-full text-sm text-ink-secondary file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface-raised file:px-3 file:py-2 file:text-sm file:text-ink-primary"
          />
          <p className="mt-1 text-xs text-ink-tertiary">PDF, image, Word, Excel, PowerPoint, or plain text — up to 25MB.</p>
        </div>
      )}

      <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <Select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value as AcademicDocumentCategory)}
        options={CATEGORY_OPTIONS}
      />
      <Textarea label="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      <DocumentRelationshipPicker entityOptions={entityOptions} value={relationships} onChange={setRelationships} />

      {error && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : isEditing ? "Save" : "Upload"}
        </Button>
      </div>
    </form>
  );
}
