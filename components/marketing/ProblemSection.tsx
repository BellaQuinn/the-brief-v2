const SCATTERED = [
  { label: "A syllabus PDF", detail: "buried in email, assignments copied out by hand" },
  { label: "A spreadsheet", detail: "for the job search, going stale the day it's made" },
  { label: "A phone calendar", detail: "for exam dates, disconnected from the coursework behind them" },
  { label: "A notebook", detail: "for LSAT scores, with no view of the trend behind the numbers" },
];

export function ProblemSection() {
  return (
    <section className="border-b border-border-subtle px-4 py-20 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="eyebrow">The problem</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-primary md:text-4xl">
            A degree, a job, certifications — that's not one plan. It's four, running in four different apps.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            Nothing talks to anything else, so nothing ever answers the one question that actually matters: what do
            I need to do next?
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-card border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-4">
          {SCATTERED.map((item) => (
            <div key={item.label} className="bg-surface px-5 py-6">
              <p className="text-sm font-medium text-ink-primary">{item.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-tertiary">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
