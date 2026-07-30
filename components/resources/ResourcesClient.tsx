"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { Modal } from "@/components/ui/Modal";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { cn } from "@/lib/utils";
import type { Resource, ResourceCategory } from "@/types/database.types";

const CATEGORY_FILTERS: { value: ResourceCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "book", label: "Books" },
  { value: "article", label: "Articles" },
  { value: "template", label: "Templates" },
  { value: "link", label: "Links" },
  { value: "course", label: "Courses" },
  { value: "other", label: "Other" },
];

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

export function ResourcesClient({ initialResources }: { initialResources: Resource[] }) {
  const [resources, setResources] = useState(initialResources);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "all">("all");
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      const matchesCategory = category === "all" || r.category === category;
      const matchesSearch =
        !q || r.title.toLowerCase().includes(q) || (r.notes ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [resources, search, category]);

  return (
    <div>
      <WorkspaceHeader
        eyebrow="RESOURCES"
        title="Resource library"
        subtitle={`${resources.length} saved`}
      />

      <div className="px-8 py-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or notes…"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink-primary outline-none transition-colors placeholder:text-ink-tertiary focus:border-signal"
            />
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-signal px-3.5 py-2 text-sm font-medium text-background transition-colors hover:bg-signal-bright"
          >
            <Plus className="h-3.5 w-3.5" />
            Add resource
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategory(f.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                category === f.value
                  ? "border-signal/40 bg-signal/10 text-signal"
                  : "border-border text-ink-tertiary hover:text-ink-primary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">
              {resources.length === 0 ? "No resources saved yet." : "Nothing matches your search/filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                onSaved={(updated) => setResources((prev) => upsertById(prev, updated))}
                onDeleted={(id) => setResources((prev) => prev.filter((item) => item.id !== id))}
              />
            ))}
          </div>
        )}

        <Modal open={adding} onClose={() => setAdding(false)} title="Add resource">
          <ResourceForm
            onSaved={(r) => {
              setResources((prev) => upsertById(prev, r));
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </Modal>
      </div>
    </div>
  );
}
