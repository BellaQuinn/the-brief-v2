"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ENTITY_TYPE_LABEL } from "@/lib/documents";
import type { DocumentRelationshipEntityType } from "@/types/database.types";

export interface RelationshipValue {
  entity_type: DocumentRelationshipEntityType;
  entity_id: string;
  label: string;
}

export type EntityOptionMap = Record<DocumentRelationshipEntityType, { id: string; label: string }[]>;

const ENTITY_TYPES = Object.keys(ENTITY_TYPE_LABEL) as DocumentRelationshipEntityType[];

// A document can belong to zero or more entities (a syllabus might attach
// to a course *and* the assignments it defines) -- this is a controlled
// multi-select, not a single dropdown.
export function DocumentRelationshipPicker({
  entityOptions,
  value,
  onChange,
}: {
  entityOptions: EntityOptionMap;
  value: RelationshipValue[];
  onChange: (next: RelationshipValue[]) => void;
}) {
  const availableTypes = useMemo(
    () => ENTITY_TYPES.filter((type) => entityOptions[type]?.length > 0),
    [entityOptions]
  );
  const [pendingType, setPendingType] = useState<DocumentRelationshipEntityType | "">("");
  const [pendingEntityId, setPendingEntityId] = useState("");

  const pendingOptions = pendingType ? entityOptions[pendingType] ?? [] : [];

  function handleAdd() {
    if (!pendingType || !pendingEntityId) return;
    const already = value.some((v) => v.entity_type === pendingType && v.entity_id === pendingEntityId);
    if (already) return;
    const entity = pendingOptions.find((o) => o.id === pendingEntityId);
    if (!entity) return;
    onChange([...value, { entity_type: pendingType, entity_id: pendingEntityId, label: entity.label }]);
    setPendingEntityId("");
  }

  function handleRemove(entity_type: DocumentRelationshipEntityType, entity_id: string) {
    onChange(value.filter((v) => !(v.entity_type === entity_type && v.entity_id === entity_id)));
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm text-ink-secondary">Attached to</label>

      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span
              key={`${v.entity_type}-${v.entity_id}`}
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface-raised px-2 py-1 text-xs text-ink-secondary"
            >
              <span className="text-ink-tertiary">{ENTITY_TYPE_LABEL[v.entity_type]}:</span>
              {v.label}
              <button
                type="button"
                onClick={() => handleRemove(v.entity_type, v.entity_id)}
                aria-label={`Remove ${v.label}`}
                className="text-ink-tertiary hover:text-status-atRisk"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {availableTypes.length === 0 ? (
        <p className="text-xs text-ink-tertiary">No degrees, courses, or records exist yet to attach this to.</p>
      ) : (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Select
            value={pendingType}
            onChange={(e) => {
              setPendingType(e.target.value as DocumentRelationshipEntityType | "");
              setPendingEntityId("");
            }}
            options={[
              { value: "", label: "Type…" },
              ...availableTypes.map((type) => ({ value: type, label: ENTITY_TYPE_LABEL[type] })),
            ]}
          />
          <Select
            value={pendingEntityId}
            onChange={(e) => setPendingEntityId(e.target.value)}
            disabled={!pendingType}
            options={[{ value: "", label: pendingType ? "Select…" : "—" }, ...pendingOptions.map((o) => ({ value: o.id, label: o.label }))]}
          />
          <Button type="button" variant="secondary" onClick={handleAdd} disabled={!pendingType || !pendingEntityId}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
