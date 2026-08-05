"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { markBootSequenceShown, shouldShowBootSequence } from "@/lib/bootSequence";

// "Hacker DNA" principle made concrete: a memorable moment on the day's
// first load, not a permanent aesthetic. See lib/bootSequence.ts for the
// trigger rule. Skippable by design — never makes anyone wait to work.
const LINES = [
  "Reviewing academic standing...",
  "Checking application pipeline...",
  "Cross-referencing your calendar...",
  "Briefing ready.",
];

const LINE_DELAY_MS = 220;
const HOLD_MS = 500;

export function BootSequence() {
  const [visible, setVisible] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    if (!shouldShowBootSequence()) return;
    setVisible(true);
    markBootSequenceShown();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (lineCount >= LINES.length) {
      const holdTimer = setTimeout(() => setVisible(false), HOLD_MS);
      return () => clearTimeout(holdTimer);
    }
    const timer = setTimeout(() => setLineCount((n) => n + 1), LINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visible, lineCount]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setVisible(false)}
          role="status"
          aria-label="The Brief is loading"
        >
          <div className="w-full max-w-sm px-6 font-mono text-sm">
            {LINES.slice(0, lineCount).map((line, i) => {
              const isLast = i === LINES.length - 1;
              return (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={isLast ? "text-signal" : "text-ink-secondary"}
                >
                  {"> "}
                  {line}
                  {isLast && <span className="ml-1 inline-block animate-pulse-signal">_</span>}
                </motion.p>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
