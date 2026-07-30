"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/brief");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-seal/40 text-seal">
            <span className="font-display text-sm font-semibold">B</span>
          </div>
          <p className="eyebrow mb-2">The Brief</p>
          <h1 className="font-display text-xl font-medium text-ink-primary">Welcome back</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-ink-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink-primary outline-none transition-colors placeholder:text-ink-tertiary focus:border-signal"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-sm text-ink-secondary">
                Password
              </label>
              <Link href="/reset-password" className="text-xs text-signal hover:text-signal-bright">
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink-primary outline-none transition-colors placeholder:text-ink-tertiary focus:border-signal"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-signal px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-signal-bright disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-tertiary">
          New here?{" "}
          <Link href="/signup" className="text-signal hover:text-signal-bright">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
