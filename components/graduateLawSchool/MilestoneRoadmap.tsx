import { MilestoneRow } from "@/components/graduateLawSchool/MilestoneRow";
import type { Milestone } from "@/types/database.types";

// Dated milestones first (soonest first), then undated ones by sort_order —
// so adding a real date to an aspirational milestone moves it into its
// correct chronological place among the others.
export function sortMilestones(milestones: Milestone[]): Milestone[] {
  const dated = milestones.filter((m) => m.target_date).sort((a, b) => a.target_date!.localeCompare(b.target_date!));
  const undated = milestones.filter((m) => !m.target_date).sort((a, b) => a.sort_order - b.sort_order);
  return [...dated, ...undated];
}

export function MilestoneRoadmap({
  milestones,
  onSaved,
  onDeleted,
}: {
  milestones: Milestone[];
  onSaved: (milestone: Milestone) => void;
  onDeleted: (id: string) => void;
}) {
  const ordered = sortMilestones(milestones);
  const nextSortOrder = milestones.length > 0 ? Math.max(...milestones.map((m) => m.sort_order)) + 1 : 0;

  if (ordered.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
        <p className="text-sm text-ink-secondary">No milestones yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ordered.map((milestone) => (
        <MilestoneRow
          key={milestone.id}
          milestone={milestone}
          nextSortOrder={nextSortOrder}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
}
