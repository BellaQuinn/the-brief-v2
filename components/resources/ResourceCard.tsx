"use client";

import { useState } from "react";
import { Book, FileText, LayoutTemplate, Link2, GraduationCap, MoreHorizontal, Star, Pencil, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { ResourceForm } from "@/components/resources/ResourceForm";
import { cn } from "@/lib/utils";
import type { Resource, ResourceCategory } from "@/types/database.types";

const CATEGORY_ICON: Record<ResourceCategory, typeof Book> = {
  book: Book,
  article: FileText,
  template: LayoutTemplate,
  link: Link2,
  course: GraduationCap,
  other: MoreHorizontal,
};

const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  book: "Book",
  article: "Article",
  template: "Template",
  link: "Link",
  course: "Course",
  other: "Other",
};

export function ResourceCard({
  resource,
  index,
  onSaved,
  onDeleted,
}: {
  resource: Resource;
  index: number;
  onSaved: (r: Resource) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const Icon = CATEGORY_ICON[resource.category];

  async function toggleFavorite() {
    const { data, error } = await supabase
      .from("resources")
      .update({ favorite: !resource.favorite })
      .eq("id", resource.id)
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    onSaved(data as Resource);
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${resource.title}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("resources").delete().eq("id", resource.id);
    if (error) {
      alert(error.message);
      return;
    }
    onDeleted(resource.id);
  }

  return (
    <article className="relative py-4 pl-9">
      <span aria-hidden className="trace-node" />
      <span aria-hidden className="trace-connector" />
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="flex min-w-0 items-start gap-3">
          <span className="font-mono text-[8px] text-accent/80">{String(index).padStart(2, "0")}</span>
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-primary">{resource.title}</p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">{CATEGORY_LABEL[resource.category]}</p>
            {resource.notes && <p className="mt-2 text-xs text-ink-secondary">{resource.notes}</p>}
            {resource.url && (
              <a href={resource.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1.5 truncate text-xs text-accent hover:text-accent-bright">
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{resource.url}</span>
              </a>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={toggleFavorite}
            aria-label={resource.favorite ? "Unmark favorite" : "Mark favorite"}
            className="rounded-md p-1.5 transition-colors hover:bg-surface-raised"
          >
            <Star
              className={cn("h-3.5 w-3.5", resource.favorite ? "fill-seal text-seal" : "text-ink-tertiary")}
            />
          </button>
          <button
            onClick={() => setEditing(true)}
            aria-label="Edit resource"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete resource"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit resource">
        <ResourceForm
          resource={resource}
          onSaved={(r) => {
            onSaved(r);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </article>
  );
}
