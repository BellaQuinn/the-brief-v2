import { cn } from "@/lib/utils";

type GaugeColor = "signal" | "accent";

const DOT_CLASS: Record<GaugeColor, string> = {
  signal: "bg-signal",
  accent: "bg-accent",
};

const RING_TEXT_CLASS: Record<GaugeColor, string> = {
  signal: "text-signal",
  accent: "text-accent",
};

const RADIUS = 41;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// A circular instrument face — value and unit are drawn as SVG <text>,
// on the same coordinate system as the ring and after it in draw order,
// so they're always centered and always on top. (An earlier pass tried
// overlaying HTML text on the SVG with a negative-margin hack; it
// didn't reliably center and lost to the ring strokes.)
export function GaugeModule({
  label,
  value,
  unit,
  caption,
  fraction,
  color,
  empty = false,
}: {
  label: string;
  value: string;
  unit: string;
  caption: string;
  fraction: number;
  color: GaugeColor;
  empty?: boolean;
}) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const offset = CIRCUMFERENCE * (1 - clamped);

  return (
    <div className="flex min-w-[150px] flex-1 basis-[160px] flex-col items-center px-4 py-3.5">
      <div className="mb-1.5 flex w-full items-center gap-1.5 font-mono text-[9px] uppercase tracking-eyebrow text-ink-tertiary">
        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-signal", empty ? "bg-ink-tertiary" : DOT_CLASS[color])} />
        {label}
      </div>
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx="52" cy="52" r="47" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="1.5 6.3" />
        <circle cx="52" cy="52" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        {!empty && (
          <circle
            cx="52"
            cy="52"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            className={RING_TEXT_CLASS[color]}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 52 52)"
          />
        )}
        <text x="52" y="56" textAnchor="middle">
          <tspan className="fill-ink-primary font-mono text-[20px] font-bold">{empty ? "—" : value}</tspan>
          {!empty && <tspan className="fill-ink-tertiary font-mono text-[10px]"> {unit}</tspan>}
        </text>
      </svg>
      <p className="mt-1.5 text-center text-[11px] text-ink-secondary">{caption}</p>
    </div>
  );
}
