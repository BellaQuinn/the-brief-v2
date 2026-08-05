interface WorkspaceHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  // Kept for backward compatibility with existing call sites (Academics'
  // sub-nav layouts render their own section chrome) — now a no-op since
  // the dots strip this used to skip no longer exists.
  hideDots?: boolean;
}

/**
 * The recurring "briefing header" every workspace opens with — a mono
 * eyebrow line (classification-style), a sans-serif headline, and an
 * optional right-aligned action. This is the one piece of type treatment
 * repeated everywhere, so it needs to carry the brand on its own.
 */
export function WorkspaceHeader({ eyebrow, title, subtitle, action }: WorkspaceHeaderProps) {
  return (
    <div className="workspace-header-treatment relative overflow-hidden border-b border-border-subtle">
      <span aria-hidden className="absolute left-4 top-0 h-0.5 w-12 bg-signal md:left-8" />
      <div className="relative flex items-start justify-between gap-4 px-4 py-7 md:px-8 md:py-8">
        <div className="min-w-0">
          <p className="eyebrow mb-2">{eyebrow}</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-secondary">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
