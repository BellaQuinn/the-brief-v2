"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/database.types";

const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern (New York)" },
  { value: "America/Chicago", label: "Central (Chicago)" },
  { value: "America/Denver", label: "Mountain (Denver)" },
  { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
  { value: "America/Anchorage", label: "Alaska (Anchorage)" },
  { value: "Pacific/Honolulu", label: "Hawaii (Honolulu)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
];

export function ProfileForm({
  profile,
}: {
  profile: Pick<User, "first_name" | "last_name" | "email" | "timezone">;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [timezone, setTimezone] = useState(profile.timezone);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("users")
      .update({ first_name: firstName || null, last_name: lastName || null, timezone })
      .eq("id", userData.user!.id);

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-card border border-border bg-surface p-5">
      <div>
        <p className="eyebrow mb-1">Profile</p>
        <p className="text-xs text-ink-tertiary">{profile.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <Select label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} options={TIMEZONE_OPTIONS} />

      {error && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error}
        </p>
      )}
      {saved && !error && <p className="text-sm text-status-onTrack">Saved.</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
