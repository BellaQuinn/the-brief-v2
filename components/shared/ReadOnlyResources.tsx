import { Book, FileText, LayoutTemplate, Link2, GraduationCap, MoreHorizontal, Star, ExternalLink } from "lucide-react";
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

export function ReadOnlyResources({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
        <p className="text-sm text-ink-secondary">No resources yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {resources.map((resource) => {
        const Icon = CATEGORY_ICON[resource.category];
        return (
          <div key={resource.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-primary">{resource.title}</p>
                  <p className="mt-0.5 text-[11px] text-ink-tertiary">{CATEGORY_LABEL[resource.category]}</p>
                </div>
              </div>
              <Star
                className={cn("h-3.5 w-3.5 shrink-0", resource.favorite ? "fill-seal text-seal" : "text-ink-tertiary")}
                aria-label={resource.favorite ? "Favorite" : undefined}
              />
            </div>
            {resource.notes && <p className="mt-2 text-xs text-ink-secondary">{resource.notes}</p>}
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-1.5 truncate text-xs text-signal hover:text-signal-bright"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">{resource.url}</span>
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
