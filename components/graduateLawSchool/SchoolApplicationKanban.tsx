"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { Modal } from "@/components/ui/Modal";
import { SchoolApplicationCard } from "@/components/graduateLawSchool/SchoolApplicationCard";
import { SchoolForm } from "@/components/graduateLawSchool/SchoolForm";
import { STATUS_LABEL } from "@/components/graduateLawSchool/SchoolBadges";
import { buildSchoolApplicationsWorkspaceBrief } from "@/lib/workspaceBriefs";
import type { LawSchool, LawSchoolStatus } from "@/types/database.types";

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

const COLUMNS: { value: LawSchoolStatus; label: string }[] = Object.entries(STATUS_LABEL).map(([value, label]) => ({
  value: value as LawSchoolStatus,
  label,
}));

export function SchoolApplicationKanban({ initialSchools }: { initialSchools: LawSchool[] }) {
  const [schools, setSchools] = useState(initialSchools);
  const [adding, setAdding] = useState(false);
  const activeApplicationCount = schools.filter(({ status }) =>
    ["planning_to_apply", "applying", "applied", "waitlisted"].includes(status)
  ).length;
  const decisionCount = schools.filter(({ status }) => ["accepted", "rejected", "enrolled"].includes(status)).length;
  const brief = buildSchoolApplicationsWorkspaceBrief({
    schoolCount: schools.length,
    activeApplicationCount,
    decisionCount,
  });

  return (
    <div>
      <WorkspaceBrief
        eyebrow="GRADUATE & LAW SCHOOL // APPLICATIONS"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${activeApplicationCount} active · ${decisionCount} decisions`}
        action={
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 border border-accent/30 bg-accent-dim/50 px-3 py-2 text-xs font-medium text-accent-bright transition-colors hover:border-accent/60 hover:bg-accent-dim"
          >
            <Plus className="h-3.5 w-3.5" /> Add school
          </button>
        }
      />

      <div className="px-4 py-6 md:px-8">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {COLUMNS.map((col) => {
            const items = schools.filter((s) => s.status === col.value);
            return (
              <div key={col.value} className="w-64 shrink-0">
                <div className="mb-2 flex items-center justify-between px-0.5">
                  <span className="text-xs font-medium text-ink-primary">{col.label}</span>
                  <span className="font-mono text-[11px] text-ink-tertiary">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((school) => (
                    <SchoolApplicationCard
                      key={school.id}
                      school={school}
                      onSaved={(s) => setSchools((prev) => upsertById(prev, s))}
                      onDeleted={(id) => setSchools((prev) => prev.filter((item) => item.id !== id))}
                    />
                  ))}
                  {col.value === "researching" && (
                    <button
                      onClick={() => setAdding(true)}
                      className="flex w-64 items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-ink-tertiary transition-colors hover:border-signal/40 hover:text-signal"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add school
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
