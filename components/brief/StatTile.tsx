import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  tone?: "neutral" | "onTrack" | "atRisk";
}

export function StatTile({ label, value, tone = "neutral" }: StatTileProps) {
  return (
    <div className="rounded-card border border-border bg-surface px-4 py-3.5">
      <p className="eyebrow mb-2">{label}</p>
      <p
        className={cn(
          "font-display text-xl font-medium",
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
