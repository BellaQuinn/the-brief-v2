interface WorkspaceHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  // Skips the terminal "dots" strip — used when a parent layout (e.g.
  // Academics' sub-nav) already renders one, so a page doesn't stack two.
  hideDots?: boolean;
}

/**
 * The recurring "briefing header" every workspace opens with — a mono
 * eyebrow line (classification-style), a display headline, and an
 * optional right-aligned action. This is the one piece of type treatment
 * repeated everywhere, so it needs to carry the brand on its own.
 */
export function WorkspaceHeader({ eyebrow, title, subtitle, action, hideDots }: WorkspaceHeaderProps) {
  return (
    <div className="border-b border-border-subtle">
      {!hideDots && (
        <div className="flex items-center gap-1.5 border-b border-border-subtle bg-surface-raised/60 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-status-atRisk/70" />
          <span className="h-2 w-2 rounded-full bg-seal/70" />
          <span className="h-2 w-2 rounded-full bg-status-onTrack/70" />
        </div>
      )}
      <div className="flex items-start justify-between px-4 py-6 md:px-8">
        <div>
          <p className="eyebrow mb-2">{`$ ${eyebrow}`}</p>
          <h1 className="font-display text-xl font-medium text-ink-primary md:text-2xl">
            {title}
            <span className="ml-1 inline-block animate-pulse-signal">_</span>
          </h1>
          {subtitle && <p className="mt-1 text-sm text-ink-secondary">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
