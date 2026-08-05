"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { Modal } from "@/components/ui/Modal";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { cn } from "@/lib/utils";
import { buildResourcesWorkspaceBrief } from "@/lib/workspaceBriefs";
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
  const favoriteCount = resources.filter(({ favorite }) => favorite).length;
  const brief = buildResourcesWorkspaceBrief({ resourceCount: resources.length, favoriteCount });

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
      <WorkspaceBrief
        eyebrow="Resources // Intelligence archive"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${resources.length} indexed · ${favoriteCount} priority`}
        action={
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 border border-accent/30 bg-accent-dim/50 px-3 py-2 text-xs font-medium text-accent-bright transition-colors hover:border-accent/60 hover:bg-accent-dim">
            <Plus className="h-3.5 w-3.5" /> Add resource
          </button>
        }
      />

      <div className="space-y-8 px-4 py-7 md:px-8 md:py-8">
        <WorkspaceSection eyebrow="Archive query" title="Search and classification">
        <div className="signal-field px-4 py-5 md:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or notes…"
              className="w-full border-b border-border-strong bg-transparent py-2.5 pl-9 pr-3 text-sm text-ink-primary outline-none transition-colors placeholder:text-ink-tertiary focus:border-accent"
            />
          </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategory(f.value)}
              className={cn(
                "border-b py-1 font-mono text-[9px] uppercase tracking-wide transition-colors",
                category === f.value
                  ? "border-accent text-accent-bright"
                  : "border-transparent text-ink-tertiary hover:text-ink-primary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        </div>
        </WorkspaceSection>

        <WorkspaceSection eyebrow="Retrieved records" title={`${filtered.length} visible ${filtered.length === 1 ? "entry" : "entries"}`}>
        {filtered.length === 0 ? (
          <div className="border-y border-border-subtle px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">
              {resources.length === 0 ? "No resources saved yet." : "Nothing matches your search/filter."}
            </p>
          </div>
        ) : (
          <div className="trace-rail border-y border-border-subtle py-2">
            {filtered.map((r, index) => (
              <ResourceCard
                key={r.id}
                resource={r}
                index={index + 1}
                onSaved={(updated) => setResources((prev) => upsertById(prev, updated))}
                onDeleted={(id) => setResources((prev) => prev.filter((item) => item.id !== id))}
              />
            ))}
          </div>
        )}
        </WorkspaceSection>

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
