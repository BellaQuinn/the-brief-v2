import { ArrowRight } from "lucide-react";

export function WorkspaceBrief({
  eyebrow,
  status,
  situation,
  directive,
  meta,
  action,
}: {
  eyebrow: string;
  status: string;
  situation: string;
  directive: string;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-border-subtle px-4 py-7 md:px-8 md:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-80 rounded-full bg-accent/[0.055] blur-3xl"
      />
      <div className="absolute left-4 top-0 h-0.5 w-12 bg-signal md:left-8" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="eyebrow">{eyebrow}</p>
            {meta && <p className="font-mono text-[10px] uppercase tracking-wide text-ink-tertiary">{meta}</p>}
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-primary md:text-[34px]">
            {status}
          </h1>
          <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-ink-secondary">{situation}</p>
          <p className="mt-3 flex items-start gap-2 text-sm font-medium text-accent-bright">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{directive}</span>
          </p>
        </div>
        {action && <div className="relative shrink-0">{action}</div>}
      </div>
    </header>
  );
}
