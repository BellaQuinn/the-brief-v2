"use client";

import { useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ResumeForm } from "@/components/career/ResumeForm";

export function ResumeCard({
  resumeUrl,
  resumeUpdatedAt,
  onSaved,
}: {
  resumeUrl: string | null;
  resumeUpdatedAt: string | null;
  onSaved: (resumeUrl: string, resumeUpdatedAt: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="signal-field signal-field-accent flex items-center justify-between gap-5 px-5 py-6 md:px-7">
      <div className="min-w-0">
        <p className="eyebrow mb-2">Source status</p>
        {resumeUrl ? (
          <div className="flex items-center gap-2">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 truncate text-sm text-signal hover:text-signal-bright"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{resumeUrl}</span>
            </a>
            {resumeUpdatedAt && (
              <span className="shrink-0 font-mono text-xs text-ink-tertiary">
                Updated {new Date(resumeUpdatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-ink-tertiary">No resume link set.</p>
        )}
      </div>
      <button
        onClick={() => setEditing(true)}
        aria-label="Edit resume link"
        className="shrink-0 rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit resume link">
        <ResumeForm
          resumeUrl={resumeUrl}
          onSaved={(url, updatedAt) => {
            onSaved(url, updatedAt);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
