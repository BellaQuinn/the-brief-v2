"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ApplicationCard } from "@/components/career/ApplicationCard";
import { ApplicationForm } from "@/components/career/ApplicationForm";
import type { Application, ApplicationStatus } from "@/types/database.types";

const COLUMNS: { value: ApplicationStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone screen" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export function ApplicationKanban({
  applications,
  onSaved,
  onDeleted,
}: {
  applications: Application[];
  onSaved: (a: Application) => void;
  onDeleted: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const items = applications.filter((a) => a.status === col.value);
          return (
            <div key={col.value} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between px-0.5">
                <span className="text-xs font-medium text-ink-primary">{col.label}</span>
                <span className="font-mono text-[11px] text-ink-tertiary">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((a) => (
                  <ApplicationCard key={a.id} application={a} onSaved={onSaved} onDeleted={onDeleted} />
                ))}
                {col.value === "saved" && (
                  <button
                    onClick={() => setAdding(true)}
                    className="flex w-64 items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-ink-tertiary transition-colors hover:border-signal/40 hover:text-signal"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add application
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add application">
        <ApplicationForm
          defaultStatus="saved"
          onSaved={(a) => {
            onSaved(a);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </div>
  );
}
