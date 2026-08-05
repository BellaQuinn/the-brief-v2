import { ArrowRight } from "lucide-react";

// Recreated from the real demo account's live screens (not static screenshots) —
// same components, tokens, and numbers as what a signed-in visitor to the demo
// actually sees today. See it live at #demo below.

function MissionBriefPreview() {
  return (
    <div className="signal-field flex flex-col justify-center px-6 py-10 md:min-h-[420px] md:px-8">
      <p className="font-mono text-xs uppercase tracking-eyebrow text-signal/75">Mission status</p>
      <p className="mt-4 text-4xl font-bold text-signal md:text-5xl">On track</p>
      <p className="mt-6 text-lg text-ink-secondary">Good afternoon, Alex.</p>
      <p className="mt-2 text-lg text-ink-secondary">Two items are due today — nothing urgent.</p>
      <p className="mt-6 flex items-start gap-2 text-base font-medium text-accent-bright">
        <ArrowRight className="mt-1 h-4 w-4 shrink-0" aria-hidden />
        <span>Get ahead on Process Mapping Exercise before Thursday.</span>
      </p>
    </div>
  );
}

function GpaPreview() {
  return (
    <div className="signal-field flex flex-col justify-center px-6 py-10 md:min-h-[420px] md:px-8">
      <p className="font-mono text-xs uppercase tracking-eyebrow text-signal/75">Cumulative reading</p>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-mono text-7xl font-bold tabular-nums text-ink-primary md:text-8xl">3.40</span>
        <span className="font-mono text-sm text-ink-tertiary">/ 4.00</span>
      </div>
      <p className="mt-5 text-base text-ink-secondary">15 completed credits support this reading.</p>
      <div className="relative mt-10 h-8">
        <div className="absolute inset-x-0 top-3 h-px bg-border-strong" />
        {[0, 1, 2, 3, 4].map((mark) => (
          <span key={mark} aria-hidden className="absolute top-1.5 h-4 w-px bg-border-strong" style={{ left: `${mark * 25}%` }} />
        ))}
        <span
          className="absolute top-[9px] h-4 w-4 -translate-x-1/2 rotate-45 border border-signal bg-background"
          style={{ left: "85%" }}
        />
      </div>
    </div>
  );
}

function ScenarioPreview() {
  return (
    <div className="signal-field flex flex-col justify-center px-6 py-10 md:min-h-[420px] md:px-8">
      <p className="font-mono text-xs uppercase tracking-eyebrow text-signal/75">What-if // no data is changed</p>
      <p className="mt-4 text-lg text-ink-primary">MGMT 320 — Operations Management → A</p>
      <div className="mt-8 flex items-baseline gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-tertiary">Current</p>
          <p className="font-mono text-4xl font-bold tabular-nums text-ink-primary md:text-5xl">3.40</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-ink-tertiary" aria-hidden />
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-signal/75">Projected</p>
          <p className="font-mono text-4xl font-bold tabular-nums text-signal md:text-5xl">3.50</p>
        </div>
      </div>
    </div>
  );
}

export function PreviewSection() {
  return (
    <section id="demo" className="border-b border-border-subtle px-4 py-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="eyebrow">See it running</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-primary md:text-4xl">
            This is real, not a rendering.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            The three panels below are pulled from the live demo account's real screens — same components, same
            numbers a signed-in visitor sees today. Sign in yourself to look around.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <MissionBriefPreview />
          <GpaPreview />
          <ScenarioPreview />
        </div>

        <div className="mt-10 rounded-card border border-border-subtle bg-surface px-6 py-6 md:flex md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-ink-primary">Try the demo — fictional student, real product</p>
            <p className="mt-1 text-xs text-ink-tertiary">
              Populated with a made-up degree, job search, and LSAT history so nothing you see is anyone's real data.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-0">
            <code className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-ink-secondary">
              demo@thebrief.app
            </code>
            <code className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-ink-secondary">
              ShowcaseDemo2026!
            </code>
            <a
              href="/login"
              className="rounded-lg bg-ink-primary px-4 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
