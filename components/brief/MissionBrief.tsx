"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MissionBriefData } from "@/lib/missionBrief";
import type { MomentumLabel } from "@/lib/momentum";

const STEP_DELAY_MS = 130;

// Color follows the reading, not a fixed accent — "Losing ground"
// styled in the same green as "Excellent" would misrepresent a bad
// number as a good one.
const MOMENTUM_COLOR: Record<MomentumLabel, string> = {
  Excellent: "text-signal-bright",
  Steady: "text-signal-bright",
  Building: "text-ink-secondary",
  "Losing ground": "text-status-atRisk",
};

// The "Briefing Compile" moment: each line resolves in sequence rather
// than appearing all at once, so the brief reads as something being
// assembled for you, not a static header. Reduced-motion users get the
// full brief immediately — the moment is a flourish, not the content.
export function MissionBrief({
  data,
  dayLabel,
  greeting,
  momentum,
}: {
  data: MissionBriefData;
  dayLabel: string;
  greeting: string;
  // Null means there isn't enough recent data to say anything real —
  // per the Design Philosophy, that's a reason to omit the line
  // entirely, not to show a placeholder or an invented reading.
  momentum: MomentumLabel | null;
}) {
  const stepCount = momentum ? 6 : 5;
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(reduceMotion ? stepCount : 0);

  useEffect(() => {
    if (reduceMotion || step >= stepCount) return;
    const timer = setTimeout(() => setStep((s) => s + 1), STEP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion, step, stepCount]);

  return (
    <section className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-10 h-72 w-[26rem] rounded-full bg-signal/[0.09] blur-3xl"
      />
      <div className="absolute left-0 top-0 h-0.5 w-16 bg-signal" />

      <div className="pt-6">
        <Reveal show={step > 0} className="mb-3.5 flex items-baseline justify-between">
          <span className="eyebrow">Mission status</span>
          <span className="font-mono text-[10.5px] text-ink-tertiary">{dayLabel}</span>
        </Reveal>

        <Reveal show={step > 1}>
          <p className="mb-4 text-[44px] font-semibold leading-none tracking-tight text-signal">{data.status}</p>
        </Reveal>

        <Reveal show={step > 2}>
          <p className="mb-3 text-lg font-medium text-ink-secondary">{greeting}</p>
        </Reveal>

        <Reveal show={step > 3} className="mb-2">
          <p className="max-w-[60ch] text-[15.5px] text-ink-primary">{data.situation}</p>
        </Reveal>

        <Reveal show={step > 4}>
          <p className="flex items-center gap-2 border-l-2 border-accent pl-2.5 text-[15.5px] font-medium text-accent-bright">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            {data.directive}
          </p>
        </Reveal>

        {momentum && (
          <Reveal show={step > 5} className="mt-4 border-t border-border-subtle pt-3">
            <p className="font-mono text-xs text-ink-tertiary">
              Momentum — <span className={cn("font-semibold", MOMENTUM_COLOR[momentum])}>{momentum}</span>
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Reveal({ show, className, children }: { show: boolean; className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
