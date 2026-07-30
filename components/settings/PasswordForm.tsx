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
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-card border border-border bg-surface p-5">
      <p className="eyebrow mb-1">Password</p>

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
    </form>
  );
}
