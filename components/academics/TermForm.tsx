"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Term, TermStatus } from "@/types/database.types";

const STATUS_OPTIONS: { value: TermStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

interface TermFormProps {
  degreeId: string;
  term?: Term | null;
  onSaved: (term: Term) => void;
  onCancel: () => void;
}

export function TermForm({ degreeId, term, onSaved, onCancel }: TermFormProps) {
  const supabase = createClient();
  const [name, setName] = useState(term?.name ?? "");
  const [startDate, setStartDate] = useState(term?.start_date ?? "");
  const [endDate, setEndDate] = useState(term?.end_date ?? "");
  const [status, setStatus] = useState<TermStatus>(term?.status ?? "upcoming");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      start_date: startDate || null,
      end_date: endDate || null,
      status,
    };

    const { data, error } = term
      ? await supabase.from("terms").update(payload).eq("id", term.id).select().single()
      : await supabase.from("terms").insert({ ...payload, degree_id: degreeId }).select().single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as Term);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Term name" required placeholder="Fall 2026 – 7A" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as TermStatus)}
        options={STATUS_OPTIONS}
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
