import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  tone?: "neutral" | "onTrack" | "atRisk";
  icon?: LucideIcon;
}

export function StatTile({ label, value, tone = "neutral", icon: Icon }: StatTileProps) {
  return (
    <div className="rounded-card border border-border bg-surface px-4 py-3.5 shadow-card transition-shadow hover:shadow-elevated">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {Icon && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-raised text-ink-tertiary">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <p
        className={cn(
          "font-display text-xl font-semibold",
          tone === "onTrack" && "text-status-onTrack",
          tone === "atRisk" && "text-status-atRisk",
          tone === "neutral" && "text-ink-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}
