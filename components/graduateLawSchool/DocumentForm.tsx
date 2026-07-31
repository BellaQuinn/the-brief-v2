"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { DocumentCategory, LawSchool, LawSchoolDocument } from "@/types/database.types";

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: "essay", label: "Essay" },
  { value: "recommendation", label: "Recommendation" },
  { value: "transcript", label: "Transcript" },
  { value: "financial", label: "Financial" },
  { value: "other", label: "Other" },
];

interface DocumentFormProps {
  document?: LawSchoolDocument | null;
  schools: LawSchool[];
  onSaved: (document: LawSchoolDocument) => void;
  onCancel: () => void;
}

export function DocumentForm({ document, schools, onSaved, onCancel }: DocumentFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState(document?.title ?? "");
  const [category, setCategory] = useState<DocumentCategory>(document?.category ?? "other");
  const [lawSchoolId, setLawSchoolId] = useState(document?.law_school_id ?? "");
  const [url, setUrl] = useState(document?.url ?? "");
  const [notes, setNotes] = useState(document?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const payload = {
      title,
      category,
      law_school_id: lawSchoolId || null,
      url: url || null,
      notes: notes || null,
    };

    const { data, error } = document
      ? await supabase.from("law_school_documents").update(payload).eq("id", document.id).select().single()
      : await supabase
          .from("law_school_documents")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as LawSchoolDocument);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          options={CATEGORY_OPTIONS}
        />
        <Select
          label="Linked school"
          value={lawSchoolId}
          onChange={(e) => setLawSchoolId(e.target.value)}
          options={[{ value: "", label: "Not linked to a school" }, ...schools.map((s) => ({ value: s.id, label: s.school_name }))]}
        />
      </div>
      <Input label="URL" type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
      <Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

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
