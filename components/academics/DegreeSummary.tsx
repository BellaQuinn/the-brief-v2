"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DegreeForm } from "@/components/academics/DegreeForm";
import { cn } from "@/lib/utils";
import type { Degree } from "@/types/database.types";

const STATUS_LABEL: Record<Degree["status"], string> = {
  active: "Active",
  planned: "Planned",
  paused: "Paused",
  completed: "Completed",
};

export function DegreeSummary({
  degree,
  onSaved,
}: {
  degree: Degree | null;
  onSaved: (degree: Degree) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (!degree) {
    return (
      <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
        <p className="mb-4 text-sm text-ink-secondary">No degree plan set up yet.</p>
        <Button onClick={() => setEditing(true)} className="mx-auto">
          Set up your degree plan
        </Button>
        <Modal open={editing} onClose={() => setEditing(false)} title="Set up degree plan">
          <DegreeForm
            onSaved={(d) => {
              onSaved(d);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </Modal>
      </div>
    );
  }

  const pct =
    degree.total_credits && degree.total_credits > 0
      ? Math.min(100, Math.round((degree.completed_credits / degree.total_credits) * 100))
      : 0;

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow mb-1">{degree.school_name}</p>
          <h2 className="font-display text-lg font-medium text-ink-primary">{degree.degree_name}</h2>
          {degree.major && <p className="mt-0.5 text-sm text-ink-secondary">{degree.major}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs",
              degree.status === "active"
                ? "border-signal/40 text-signal"
                : "border-border-strong text-ink-tertiary"
            )}
          >
            {STATUS_LABEL[degree.status]}
          </span>
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit degree"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs text-ink-secondary">
          <span>
            {degree.completed_credits} / {degree.total_credits ?? "—"} credits
          </span>
          {degree.expected_graduation && (
            <span>Expected {new Date(degree.expected_graduation).toLocaleDateString()}</span>
          )}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-signal" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit degree plan">
        <DegreeForm
          degree={degree}
          onSaved={(d) => {
            onSaved(d);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
