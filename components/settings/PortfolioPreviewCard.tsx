"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export function PortfolioPreviewCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser (permissions,
      // unfocused document) -- select the text so a manual Cmd/Ctrl+C
      // still works instead of failing silently.
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("portfolio-preview-url")!);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-xs leading-relaxed text-ink-secondary">
        A shareable, read-only link for an advisor or mentor to see your real progress — Brief, Academics, Academic
        Standing, Calendar, Career, and Resources — without ever handing them your login.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <code
          id="portfolio-preview-url"
          className="flex-1 truncate rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs text-ink-secondary"
        >
          {url}
        </code>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2.5 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-raised"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-signal" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-ink-primary px-3.5 py-2.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
          >
            Open
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
