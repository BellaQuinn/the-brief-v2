import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle px-4 py-20 md:px-8 md:py-28">
      <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-signal/40 to-transparent" />
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow justify-center">Personal operating system</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-primary md:text-6xl">
          Mission control for ambitious nontraditional students.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-secondary md:text-lg">
          The Brief pulls your degree, your certifications, your job search, and — if it applies — your law school
          applications into one daily briefing. Not another place to enter data twice; the one place that already
          knows what&apos;s due, what&apos;s next, and whether you&apos;re actually on track.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#demo"
            className="flex items-center gap-1.5 rounded-lg bg-ink-primary px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            View the live demo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <Link
            href="/signup"
            className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-raised"
          >
            Create your own account
          </Link>
        </div>
      </div>
    </section>
  );
}
