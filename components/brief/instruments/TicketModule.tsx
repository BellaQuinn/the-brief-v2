import { cn } from "@/lib/utils";

export function TicketModule({
  label,
  value,
  unit,
  caption,
  attention = true,
}: {
  label: string;
  value: number;
  unit: string;
  caption: string;
  // Amber framing means "needs attention" — only true when the count
  // backing this module is actually greater than zero. A calm count
  // gets the calm (signal) frame instead, matching the "confidence over
  // urgency" voice rule: color still marks true urgency, it just
  // doesn't default to urgency-colored when there's nothing to flag.
  attention?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-[180px] flex-1 basis-[200px] px-4 py-3.5",
        attention ? "instrument-frame instrument-frame-seal" : "instrument-frame instrument-frame-signal"
      )}
    >
      <div
        className={cn(
          "mb-2.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-eyebrow",
          attention ? "text-seal/75" : "text-signal/75"
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-signal", attention ? "bg-seal" : "bg-signal")} />
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[30px] font-bold tabular-nums text-ink-primary">{value}</span>
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-tertiary">{unit}</span>
      </div>
      <p className="mt-1 text-xs text-ink-secondary">{caption}</p>
    </div>
  );
}
