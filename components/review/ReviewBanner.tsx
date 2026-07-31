"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function ReviewBanner() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden border-b border-border-subtle bg-surface-raised"
        >
          <div className="flex items-start justify-between gap-4 px-4 py-3 md:px-8">
            <p className="text-xs leading-relaxed text-ink-secondary">
              <span className="font-display font-medium text-ink-primary">The Brief</span>
              <span className="mx-1.5 text-ink-tertiary">·</span>
              Mission Control for ambitious nontraditional students.
              <span className="mx-1.5 text-ink-tertiary">·</span>
              This preview contains real portfolio data and is intended for demonstration purposes.
            </p>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="shrink-0 rounded-md p-1 text-ink-tertiary transition-colors hover:bg-surface-overlay hover:text-ink-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
