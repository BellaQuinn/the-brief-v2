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
      <div className="signal-field overflow-x-auto px-1 py-5">
        <div className="flex min-w-max">
        {COLUMNS.map((col, columnIndex) => {
          const items = applications.filter((a) => a.status === col.value);
          return (
            <div key={col.value} className="relative w-56 shrink-0 px-3 first:pl-4 last:pr-4">
              <div className="relative mb-4 border-b border-border-subtle pb-3">
                <span aria-hidden className="absolute -bottom-[4px] left-0 h-[7px] w-[7px] rotate-45 border border-accent/70 bg-background" />
                <span className="font-mono text-[8px] text-accent/70">{String(columnIndex + 1).padStart(2, "0")}</span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-primary">{col.label}</span>
                  <span className="font-mono text-[10px] text-ink-tertiary">{items.length}</span>
                </div>
              </div>
              <div>
                {items.map((a) => (
                  <ApplicationCard key={a.id} application={a} onSaved={onSaved} onDeleted={onDeleted} />
                ))}
                {items.length === 0 && col.value !== "saved" && (
                  <p className="py-3 font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">No records</p>
                )}
                {col.value === "saved" && (
                  <button
                    onClick={() => setAdding(true)}
                    className="flex w-full items-center gap-1.5 border-y border-border-subtle py-2.5 text-xs text-accent transition-colors hover:text-accent-bright"
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
