export function StatusSection() {
  return (
    <section className="border-b border-border-subtle px-4 py-16 md:px-8">
      <div className="signal-field mx-auto max-w-4xl bg-surface px-6 py-8 md:px-10 md:py-10">
        <p className="eyebrow">Development status</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-primary">
          A real, working project — actively built and extended.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Every feature described above is live in the product today, not a mockup or a roadmap slide. The Brief is
          currently used by its own creator to manage a real bachelor&apos;s degree, real certifications, and a real
          job search — which means each system here was built to solve a problem that actually existed, not a
          hypothetical one. It's still growing: new features ship regularly, and nothing above is the final version
          of itself.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          New accounts are open. Sign up and bring your own coursework, certifications, or job search — The Brief
          works the same way for your data as it does for the demo above.
        </p>
      </div>
    </section>
  );
}
