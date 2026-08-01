"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildStoragePath, uploadDocumentFile } from "@/lib/documentStorage";
import { Button } from "@/components/ui/Button";
import type { DocumentRecord } from "@/types/database.types";

// Replace never overwrites the previous file in place -- it uploads a new
// version alongside it (documents.storage_path always mirrors the latest),
// so history stays intact and nothing is silently lost.
export function DocumentReplaceForm({
  document,
  onSaved,
  onCancel,
}: {
  document: DocumentRecord;
  onSaved: (document: DocumentRecord) => void;
  onCancel: () => void;
}) {
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || loading) return;
    setError(null);
    setLoading(true);

    const { data: latestVersion } = await supabase
      .from("document_versions")
      .select("version_number")
      .eq("document_id", document.id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();
    const nextVersion = (latestVersion?.version_number ?? 1) + 1;

    const storagePath = buildStoragePath(document.user_id, document.id, nextVersion, file.name);
    const mimeType = file.type || "application/octet-stream";

    const uploadResult = await uploadDocumentFile(storagePath, file);
    if (!uploadResult.ok) {
      setLoading(false);
      setError(uploadResult.error);
      return;
    }

    const { data: updated, error: updateError } = await supabase
      .from("documents")
      .update({ storage_path: storagePath, file_name: file.name, file_size: file.size, mime_type: mimeType })
      .eq("id", document.id)
      .select()
      .single();

    await supabase.from("document_versions").insert({
      document_id: document.id,
      user_id: document.user_id,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: mimeType,
      version_number: nextVersion,
    });

    setLoading(false);
    if (updateError || !updated) {
      setError(updateError?.message ?? "The replacement couldn't be saved.");
      return;
    }
    onSaved(updated as DocumentRecord);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-ink-secondary">
          Replacing <span className="text-ink-primary">{document.file_name}</span>. The previous version stays in
          this document's history.
        </p>
        <input
          type="file"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-ink-secondary file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface-raised file:px-3 file:py-2 file:text-sm file:text-ink-primary"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !file}>
          {loading ? "Uploading…" : "Replace"}
        </Button>
      </div>
    </form>
  );
}
