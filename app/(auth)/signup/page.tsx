"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <p className="eyebrow mb-2">The Brief</p>
          <h1 className="mb-3 font-display text-xl font-medium text-ink-primary">Check your inbox</h1>
          <p className="text-sm text-ink-secondary">
            We sent a confirmation link to <span className="text-ink-primary">{email}</span>. Confirm
            your email to activate your account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-seal/40 text-seal">
            <span className="font-display text-sm font-semibold">B</span>
          </div>
          <p className="eyebrow mb-2">The Brief</p>
          <h1 className="font-display text-xl font-medium text-ink-primary">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm text-ink-secondary">
                First name
              </label>
              <input
                id="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink-primary outline-none transition-colors focus:border-signal"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-sm text-ink-secondary">
                Last name
              </label>
              <input
                id="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink-primary outline-none transition-colors focus:border-signal"
              />
            </div>
          </div>

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
            <label htmlFor="password" className="mb-1.5 block text-sm text-ink-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink-primary outline-none transition-colors placeholder:text-ink-tertiary focus:border-signal"
              placeholder="At least 8 characters"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-tertiary">
          Already have an account?{" "}
          <Link href="/login" className="text-signal hover:text-signal-bright">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
