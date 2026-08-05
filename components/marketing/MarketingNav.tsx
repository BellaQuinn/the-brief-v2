import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-seal/40 font-mono text-sm font-bold text-seal">
            B
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-ink-primary">The Brief</p>
            <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-tertiary">Mission Control</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/guide" className="text-ink-secondary transition-colors hover:text-ink-primary">
            Guide
          </Link>
          <Link href="/progress" className="hidden text-ink-secondary transition-colors hover:text-ink-primary sm:inline">
            Real progress
          </Link>
          <Link href="/login" className="text-ink-secondary transition-colors hover:text-ink-primary">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-ink-primary px-3.5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Create account
          </Link>
        </nav>
      </div>
    </header>
  );
}
