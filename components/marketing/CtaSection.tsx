import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow justify-center">Ready when you are</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-primary md:text-4xl">
          Ready to step into Mission Control?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
          Stop wondering what deserves your attention today.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#demo"
            className="flex items-center gap-1.5 rounded-lg bg-ink-primary px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Launch Demo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <Link
            href="/signup"
            className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-raised"
          >
            Create Account
          </Link>
        </div>
      </div>

      <footer className="mx-auto mt-24 max-w-6xl border-t border-border-subtle pt-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-tertiary">
          The Brief — built and maintained by Krystal
        </p>
        <Link href="/progress" className="mt-2 inline-block text-xs text-ink-tertiary hover:text-ink-secondary">
          See my real academic progress →
        </Link>
      </footer>
    </section>
  );
}
