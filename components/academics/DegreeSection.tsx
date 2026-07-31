"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DegreeSummary } from "@/components/academics/DegreeSummary";
import { TermSection } from "@/components/academics/TermSection";
import { TermForm } from "@/components/academics/TermForm";
import { Modal } from "@/components/ui/Modal";
import type { AcademicsActions } from "@/components/academics/AcademicsClient";
import type { Degree, DegreeWithTerms } from "@/types/database.types";

export function DegreeSection({
  degree,
  actions,
  onDegreeSaved,
  onDegreeDeleted,
}: {
  degree: DegreeWithTerms;
  actions: AcademicsActions;
  onDegreeSaved: (degree: Degree) => void;
  onDegreeDeleted: (degreeId: string) => void;
}) {
  const [addingTerm, setAddingTerm] = useState(false);

  return (
    <div id={`degree-${degree.id}`} tabIndex={-1} className="outline-none">
      <DegreeSummary degree={degree} onSaved={onDegreeSaved} onDeleted={onDegreeDeleted} />

      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-primary">Terms</h2>
          <button
            onClick={() => setAddingTerm(true)}
            className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
          >
            <Plus className="h-3.5 w-3.5" />
            Add term
          </button>
        </div>

        {degree.terms.length === 0 ? (
          <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
            <p className="text-sm text-ink-secondary">No terms yet. Add your first one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {degree.terms.map((term) => (
              <TermSection key={term.id} term={term} actions={actions} />
            ))}
          </div>
        )}

        <Modal open={addingTerm} onClose={() => setAddingTerm(false)} title="Add term">
          <TermForm
            degreeId={degree.id}
            onSaved={(t) => {
              actions.onTermSaved(t);
              setAddingTerm(false);
            }}
            onCancel={() => setAddingTerm(false)}
          />
        </Modal>
      </div>
    </div>
  );
}
