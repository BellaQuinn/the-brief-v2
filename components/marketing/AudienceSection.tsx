const PRINCIPLES = [
  {
    title: "No invented confidence",
    detail:
      "If The Brief says you're on track, it's because the math behind it says so — every calculation shows its own basis, not just a headline number.",
  },
  {
    title: "Enter it once",
    detail:
      "A grade, a due date, a deadline — entered once at the source and it flows upward automatically: assignment → course → GPA → calendar → reminders. Never re-typed.",
  },
  {
    title: "AI proposes, you decide",
    detail:
      "Syllabus extraction and study-plan suggestions are always reviewed one at a time — accept, edit, or dismiss. Nothing reaches your real record without you saying yes.",
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
              kind of deadline on it, The Brief was built with your exact situation in mind — not a traditional
              full-time student&apos;s.
            </p>
          </div>
          <div>
            <p className="eyebrow">Why it's different</p>
            <div className="mt-3 space-y-5">
              {PRINCIPLES.map((principle) => (
                <div key={principle.title}>
                  <h3 className="text-sm font-medium text-ink-primary">{principle.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-tertiary">{principle.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
