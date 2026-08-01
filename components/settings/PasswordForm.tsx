"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function PasswordForm() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="signal-field signal-field-accent max-w-3xl px-5 py-6 md:px-7">
      <div className="grid gap-7 md:grid-cols-[180px_minmax(0,1fr)]">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent/80">Private credential</p>
        <p className="mt-2 text-sm text-ink-primary">Password values are never displayed.</p>
        <p className="mt-2 text-xs text-ink-tertiary">Rotation takes effect after the update is accepted.</p>
      </div>

      <div className="space-y-4">
      <Input
        label="New password"
        type="password"
        minLength={8}
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirm new password"
        type="password"
        minLength={8}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {error && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error}
        </p>
      )}
      {saved && !error && <p className="text-sm text-status-onTrack">Password updated.</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !password}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </div>
      </div>
      </div>
    </form>
  );
}
