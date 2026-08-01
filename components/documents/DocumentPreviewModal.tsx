"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { getSignedDocumentUrl } from "@/lib/documentStorage";
import { getFileKind } from "@/lib/documents";
import type { DocumentRecord } from "@/types/database.types";

// Office formats (docx/pptx/xlsx) get a download-to-view fallback instead
// of an in-browser viewer -- that's real added complexity (a third-party
// viewer or iframe embed) that doesn't earn its place in the MVP.
export function DocumentPreviewModal({ document, onClose }: { document: DocumentRecord | null; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!document) {
      setUrl(null);
      return;
    }
    setLoading(true);
    getSignedDocumentUrl(document.storage_path).then((signedUrl) => {
      setUrl(signedUrl);
      setLoading(false);
    });
  }, [document]);

  const kind = document ? getFileKind(document.mime_type) : "other";

  return (
    <Modal open={Boolean(document)} onClose={onClose} title={document?.title ?? ""}>
      {loading && <p className="py-8 text-center text-sm text-ink-tertiary">Loading preview…</p>}
      {!loading && document && !url && (
        <p className="py-8 text-center text-sm text-status-atRisk">The preview link couldn't be generated.</p>
      )}
      {!loading && url && kind === "pdf" && (
        <embed src={url} type="application/pdf" className="h-[70vh] w-full rounded-lg border border-border" />
      )}
      {!loading && url && kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={document?.title ?? ""} className="max-h-[70vh] w-full rounded-lg object-contain" />
      )}
      {!loading && url && kind !== "pdf" && kind !== "image" && (
        <div className="py-8 text-center">
          <p className="mb-3 text-sm text-ink-secondary">This file type can't preview inline.</p>
          <a
            href={url}
            download={document?.file_name}
            className="text-sm font-medium text-accent-bright hover:underline"
          >
            Download {document?.file_name}
          </a>
        </div>
      )}
    </Modal>
  );
}
