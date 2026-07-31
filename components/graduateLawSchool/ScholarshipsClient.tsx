"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { Modal } from "@/components/ui/Modal";
import { ScholarshipCard } from "@/components/graduateLawSchool/ScholarshipCard";
import { ScholarshipForm } from "@/components/graduateLawSchool/ScholarshipForm";
import type { LawSchool, Scholarship } from "@/types/database.types";

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

export function ScholarshipsClient({
  initialScholarships,
  schools,
}: {
  initialScholarships: Scholarship[];
  schools: LawSchool[];
}) {
  const [scholarships, setScholarships] = useState(initialScholarships);
  const [adding, setAdding] = useState(false);

  return (
    <div>
      <WorkspaceHeader
        eyebrow="GRADUATE & LAW SCHOOL // SCHOLARSHIPS"
        title="Scholarships"
        hideDots
        subtitle={`${scholarships.length} scholarship${scholarships.length === 1 ? "" : "s"} tracked`}
        action={
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
          >
            <Plus className="h-3.5 w-3.5" />
            Add scholarship
          </button>
        }
      />

      <div className="px-4 py-6 md:px-8">
        {scholarships.length === 0 ? (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">No scholarships tracked yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {scholarships.map((s) => (
              <ScholarshipCard
                key={s.id}
                scholarship={s}
                schools={schools}
                onSaved={(updated) => setScholarships((prev) => upsertById(prev, updated))}
                onDeleted={(id) => setScholarships((prev) => prev.filter((item) => item.id !== id))}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add scholarship">
        <ScholarshipForm
          schools={schools}
          onSaved={(s) => {
            setScholarships((prev) => upsertById(prev, s));
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </div>
  );
}
