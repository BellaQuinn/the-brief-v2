"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ResumeFormProps {
  resumeUrl: string | null;
  onSaved: (resumeUrl: string, resumeUpdatedAt: string) => void;
  onCancel: () => void;
}

export function ResumeForm({ resumeUrl, onSaved, onCancel }: ResumeFormProps) {
  const supabase = createClient();
  const [url, setUrl] = useState(resumeUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("users")
      .update({ resume_url: url || null, resume_updated_at: now })
      .eq("id", userData.user!.id)
      .select("resume_url, resume_updated_at")
      .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data!.resume_url ?? "", data!.resume_updated_at ?? now);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Resume link"
        type="url"
        placeholder="https://docs.google.com/document/d/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      {error && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
