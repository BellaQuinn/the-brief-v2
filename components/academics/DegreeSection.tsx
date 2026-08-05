"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DegreeSummary } from "@/components/academics/DegreeSummary";
import { TermSection } from "@/components/academics/TermSection";
import { TermForm } from "@/components/academics/TermForm";
import { Modal } from "@/components/ui/Modal";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import type { AcademicsActions } from "@/components/academics/AcademicsClient";
import type { Degree, DegreeWithTerms } from "@/types/database.types";

export function DegreeSection({
  degree,
  programIndex,
  actions,
  onDegreeSaved,
  onDegreeDeleted,
}: {
  degree: DegreeWithTerms;
  programIndex: number;
  actions: AcademicsActions;
  onDegreeSaved: (degree: Degree) => void;
  onDegreeDeleted: (degreeId: string) => void;
}) {
  const [addingTerm, setAddingTerm] = useState(false);

  return (
    <div id={`degree-${degree.id}`} tabIndex={-1} className="relative pl-5 outline-none md:pl-9">
      <span aria-hidden className="absolute bottom-0 left-0 top-3 w-px bg-gradient-to-b from-signal via-border-strong to-transparent" />
      <span aria-hidden className="absolute left-[-3px] top-3 h-[7px] w-[7px] rotate-45 border border-signal bg-background shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
      <DegreeSummary
        degree={degree}
        programIndex={programIndex}
        onSaved={onDegreeSaved}
        onDeleted={onDegreeDeleted}
      />

      <WorkspaceSection
        eyebrow="Plan sequence"
        title="Terms and coursework"
        className="mt-6"
        action={
          <button
            onClick={() => setAddingTerm(true)}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright"
          >
            <Plus className="h-3.5 w-3.5" />
            Add term
          </button>
        }
      >
        {degree.terms.length === 0 ? (
          <div className="border-y border-border-subtle py-8 text-center">
            <p className="text-sm text-ink-secondary">No terms yet. Add your first one.</p>
          </div>
        ) : (
          <div>
            {degree.terms.map((term) => (
              <TermSection key={term.id} term={term} actions={actions} />
            ))}
          </div>
        )}

      </WorkspaceSection>

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
  );
}
