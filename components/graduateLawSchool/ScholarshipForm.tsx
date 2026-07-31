"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { LawSchool, Scholarship, ScholarshipStatus } from "@/types/database.types";

const STATUS_OPTIONS: { value: ScholarshipStatus; label: string }[] = [
  { value: "researching", label: "Researching" },
  { value: "eligible", label: "Eligible" },
  { value: "applying", label: "Applying" },
  { value: "applied", label: "Applied" },
  { value: "awarded", label: "Awarded" },
  { value: "declined", label: "Declined" },
];

interface ScholarshipFormProps {
  scholarship?: Scholarship | null;
  schools: LawSchool[];
  onSaved: (scholarship: Scholarship) => void;
  onCancel: () => void;
}

export function ScholarshipForm({ scholarship, schools, onSaved, onCancel }: ScholarshipFormProps) {
  const supabase = createClient();
  const [name, setName] = useState(scholarship?.name ?? "");
  const [lawSchoolId, setLawSchoolId] = useState(scholarship?.law_school_id ?? "");
  const [amount, setAmount] = useState(String(scholarship?.amount ?? ""));
  const [deadline, setDeadline] = useState(scholarship?.deadline ?? "");
  const [status, setStatus] = useState<ScholarshipStatus>(scholarship?.status ?? "researching");
  const [notes, setNotes] = useState(scholarship?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const payload = {
      name,
      law_school_id: lawSchoolId || null,
      amount: amount ? Number(amount) : null,
      deadline: deadline || null,
      status,
      notes: notes || null,
    };

    const { data, error } = scholarship
      ? await supabase.from("scholarships").update(payload).eq("id", scholarship.id).select().single()
      : await supabase
          .from("scholarships")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as Scholarship);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Scholarship name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Select
        label="Linked school"
        value={lawSchoolId}
        onChange={(e) => setLawSchoolId(e.target.value)}
        options={[{ value: "", label: "Not linked to a school" }, ...schools.map((s) => ({ value: s.id, label: s.school_name }))]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as ScholarshipStatus)}
        options={STATUS_OPTIONS}
      />
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
