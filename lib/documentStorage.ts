"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "documents";

// Storage paths are part of a URL path segment eventually (via the
// Supabase API), and the original filename is user input -- strip
// anything that isn't safe there instead of trusting it verbatim.
function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// {user_id}/{document_id}/{version}-{name} -- versions live as siblings
// under the same document folder, never overwritten in place, so version
// history is just listing that folder (see database/add_documents.sql).
export function buildStoragePath(
  userId: string,
  documentId: string,
  versionNumber: number,
  fileName: string
): string {
  return `${userId}/${documentId}/${versionNumber}-${sanitizeFileName(fileName)}`;
}

export async function uploadDocumentFile(
  path: string,
  file: File
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Short-lived on purpose -- generated fresh per preview/download click
// rather than cached, so nothing long-lived leaks the file outside the
// authenticated session that requested it.
export async function getSignedDocumentUrl(path: string, expiresInSeconds = 60): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function deleteDocumentFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove(paths);
}
