import { cn } from "@/lib/utils";
import type { ApplicationPipeline } from "@/lib/applicationPipeline";

const STAGES: { key: keyof ApplicationPipeline; label: string }[] = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
];

export function TrackerModule({ pipeline }: { pipeline: ApplicationPipeline }) {
  const total = pipeline.saved + pipeline.applied + pipeline.interviewing + pipeline.offer;

  return (
    <div className="instrument-frame instrument-frame-neutral min-w-[260px] flex-[2] basis-[320px] px-5 py-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-eyebrow text-ink-tertiary">
        <span className="h-1.5 w-1.5 rounded-full bg-ink-tertiary animate-pulse-signal" />
        Tracking · {total} open
      </div>
      <div className="flex items-start">
        {STAGES.map((stage, i) => {
          const count = pipeline[stage.key];
          const has = count > 0;
          return (
            <div key={stage.key} className="relative flex min-w-0 flex-1 flex-col items-center gap-1.5">
              {i > 0 && <span aria-hidden className="absolute right-1/2 top-3 h-px w-full bg-border-strong" />}
              <span
                className={cn(
                  "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold",
                  has
                    ? "border-accent bg-accent-dim text-accent-bright"
                    : "border-border-strong bg-surface-raised text-ink-tertiary"
                )}
              >
                {count}
              </span>
              <span className="text-center text-[9px] uppercase leading-tight tracking-wide text-ink-tertiary">
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
