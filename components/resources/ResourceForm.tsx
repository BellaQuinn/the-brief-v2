"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Resource, ResourceCategory } from "@/types/database.types";

const CATEGORY_OPTIONS: { value: ResourceCategory; label: string }[] = [
  { value: "book", label: "Book" },
  { value: "article", label: "Article" },
  { value: "template", label: "Template" },
  { value: "link", label: "Link" },
  { value: "course", label: "Course" },
  { value: "other", label: "Other" },
];

interface ResourceFormProps {
  resource?: Resource | null;
  onSaved: (resource: Resource) => void;
  onCancel: () => void;
}

export function ResourceForm({ resource, onSaved, onCancel }: ResourceFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState(resource?.title ?? "");
  const [category, setCategory] = useState<ResourceCategory>(resource?.category ?? "other");
  const [url, setUrl] = useState(resource?.url ?? "");
  const [notes, setNotes] = useState(resource?.notes ?? "");
  const [favorite, setFavorite] = useState(resource?.favorite ?? false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title,
      category,
      url: url || null,
      notes: notes || null,
      favorite,
    };

    const { data, error } = resource
      ? await supabase.from("resources").update(payload).eq("id", resource.id).select().single()
      : await supabase
          .from("resources")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as Resource);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ResourceCategory)}
          options={CATEGORY_OPTIONS}
        />
        <Input label="URL" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        <input
          type="checkbox"
          checked={favorite}
          onChange={(e) => setFavorite(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-border bg-surface accent-signal"
        />
        Mark as favorite
      </label>

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
