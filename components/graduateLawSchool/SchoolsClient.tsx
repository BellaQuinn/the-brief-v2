"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { SchoolCard } from "@/components/graduateLawSchool/SchoolCard";
import { SchoolForm } from "@/components/graduateLawSchool/SchoolForm";
import { PRIORITY_LABEL, STATUS_LABEL } from "@/components/graduateLawSchool/SchoolBadges";
import type { LawSchool } from "@/types/database.types";

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

export function SchoolsClient({ initialSchools }: { initialSchools: LawSchool[] }) {
  const [schools, setSchools] = useState(initialSchools);
  const [adding, setAdding] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const filtered = schools.filter(
    (s) => (!statusFilter || s.status === statusFilter) && (!priorityFilter || s.priority === priorityFilter)
  );

  return (
    <div>
      <WorkspaceHeader
        eyebrow="GRADUATE & LAW SCHOOL // SCHOOLS"
        title="Schools"
        hideDots
        subtitle={`${schools.length} school${schools.length === 1 ? "" : "s"} tracked`}
        action={
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
          >
            <Plus className="h-3.5 w-3.5" />
            Add school
          </button>
        }
      />

      <div className="space-y-4 px-4 py-6 md:px-8">
        {schools.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-auto"
              options={[{ value: "", label: "All statuses" }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]}
            />
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-auto"
              options={[{ value: "", label: "All priorities" }, ...Object.entries(PRIORITY_LABEL).map(([value, label]) => ({ value, label }))]}
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="mb-4 text-sm text-ink-secondary">
              {schools.length === 0 ? "No schools tracked yet." : "No schools match these filters."}
            </p>
            {schools.length === 0 && (
              <button onClick={() => setAdding(true)} className="text-sm text-signal hover:text-signal-bright">
                Add your first school
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((school) => (
              <SchoolCard
                key={school.id}
                school={school}
                onSaved={(s) => setSchools((prev) => upsertById(prev, s))}
                onDeleted={(id) => setSchools((prev) => prev.filter((item) => item.id !== id))}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add school">
        <SchoolForm
          onSaved={(s) => {
            setSchools((prev) => upsertById(prev, s));
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </div>
  );
}
