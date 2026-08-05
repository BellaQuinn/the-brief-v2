const COMPARISONS = [
  {
    other: "Track tasks.",
    brief: "Coordinates your entire academic and career operation.",
    detail:
      "A grade, a due date, a deadline — entered once at the source and it flows upward automatically: assignment → course → GPA → calendar → reminders. Never re-typed.",
  },
  {
    other: "Store files.",
    brief: "Turns a syllabus into ready-to-review, ready-to-accept assignments.",
    detail:
      "Syllabus extraction and study-plan suggestions are always reviewed one at a time — accept, edit, or dismiss. Nothing reaches your real record without you saying yes.",
  },
  {
    other: "Tell you what you want to hear.",
    brief: "Shows its own math.",
    detail:
      "If The Brief says you're on track, it's because the math behind it says so — every calculation shows its own basis, not just a headline number. No invented confidence.",
  },
];

export function AudienceSection() {
  return (
    <section className="border-b border-border-subtle px-4 py-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="eyebrow">Who it's for</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-primary md:text-3xl">
              Built for people doing this the hard way.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-secondary">
              Working full-time while finishing a degree. Stacking a certification on top of a job search. Aiming a
              bachelor&apos;s toward law school on nights and weekends. If your calendar already has more than one
              kind of deadline on it, The Brief was built with your exact situation in mind.
            </p>
          </div>
          <div>
            <p className="eyebrow">Why it's different</p>
            <div className="mt-3 space-y-5">
              {COMPARISONS.map((c) => (
                <div key={c.brief} className="border-l-2 border-border-strong pl-4">
                  <p className="flex items-baseline gap-2 text-sm text-ink-tertiary line-through decoration-ink-tertiary/50">
                    <span className="not-italic text-status-atRisk no-underline">✕</span>
                    Other apps: {c.other}
                  </p>
                  <p className="mt-1 flex items-baseline gap-2 text-sm font-medium text-ink-primary">
                    <span className="text-signal">✓</span>
                    The Brief: {c.brief}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-tertiary">{c.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
