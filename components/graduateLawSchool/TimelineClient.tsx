"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { Modal } from "@/components/ui/Modal";
import { MilestoneRoadmap } from "@/components/graduateLawSchool/MilestoneRoadmap";
import { MilestoneForm } from "@/components/graduateLawSchool/MilestoneForm";
import { buildTimelineWorkspaceBrief } from "@/lib/workspaceBriefs";
import type { Milestone } from "@/types/database.types";

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

export function TimelineClient({ initialMilestones }: { initialMilestones: Milestone[] }) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [adding, setAdding] = useState(false);
  const nextSortOrder = milestones.length > 0 ? Math.max(...milestones.map((m) => m.sort_order)) + 1 : 0;
  const inProgressCount = milestones.filter(({ status }) => status === "in_progress").length;
  const completedCount = milestones.filter(({ status }) => status === "completed").length;
  const brief = buildTimelineWorkspaceBrief({
    milestoneCount: milestones.length,
    inProgressCount,
    completedCount,
  });

  return (
    <div>
      <WorkspaceBrief
        eyebrow="GRADUATE & LAW SCHOOL // TIMELINE"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${completedCount}/${milestones.length} complete`}
        action={
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 border border-accent/30 bg-accent-dim/50 px-3 py-2 text-xs font-medium text-accent-bright transition-colors hover:border-accent/60 hover:bg-accent-dim"
          >
            <Plus className="h-3.5 w-3.5" />
            Add milestone
          </button>
        }
      />

      <div className="px-4 py-6 md:px-8">
        <MilestoneRoadmap
          milestones={milestones}
          onSaved={(m) => setMilestones((prev) => upsertById(prev, m))}
          onDeleted={(id) => setMilestones((prev) => prev.filter((item) => item.id !== id))}
        />
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add milestone">
        <MilestoneForm
          nextSortOrder={nextSortOrder}
          onSaved={(m) => {
            setMilestones((prev) => upsertById(prev, m));
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </div>
  );
}
