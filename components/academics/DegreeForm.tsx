"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Degree, DegreeStatus } from "@/types/database.types";

const STATUS_OPTIONS: { value: DegreeStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "planned", label: "Planned" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

interface DegreeFormProps {
  degree?: Degree | null;
  onSaved: (degree: Degree) => void;
  onCancel: () => void;
}

export function DegreeForm({ degree, onSaved, onCancel }: DegreeFormProps) {
  const supabase = createClient();
  const [schoolName, setSchoolName] = useState(degree?.school_name ?? "");
  const [degreeName, setDegreeName] = useState(degree?.degree_name ?? "");
  const [major, setMajor] = useState(degree?.major ?? "");
  const [totalCredits, setTotalCredits] = useState(String(degree?.total_credits ?? "120"));
  const [completedCredits, setCompletedCredits] = useState(String(degree?.completed_credits ?? "0"));
  const [expectedGraduation, setExpectedGraduation] = useState(degree?.expected_graduation ?? "");
  const [status, setStatus] = useState<DegreeStatus>(degree?.status ?? "active");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const payload = {
      school_name: schoolName,
      degree_name: degreeName,
      major: major || null,
      total_credits: totalCredits ? Number(totalCredits) : null,
      completed_credits: Number(completedCredits) || 0,
      expected_graduation: expectedGraduation || null,
      status,
    };

    const { data, error } = degree
      ? await supabase.from("degrees").update(payload).eq("id", degree.id).select().single()
      : await supabase
          .from("degrees")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as Degree);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="School" required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
      <Input
        label="Degree"
        required
        placeholder="B.S. Cybersecurity"
        value={degreeName}
        onChange={(e) => setDegreeName(e.target.value)}
      />
      <Input label="Major" value={major} onChange={(e) => setMajor(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Total credits"
          type="number"
          min={0}
          value={totalCredits}
          onChange={(e) => setTotalCredits(e.target.value)}
        />
        <Input
          label="Completed credits"
          type="number"
          min={0}
          value={completedCredits}
          onChange={(e) => setCompletedCredits(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Expected graduation"
          type="date"
          value={expectedGraduation}
          onChange={(e) => setExpectedGraduation(e.target.value)}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as DegreeStatus)}
          options={STATUS_OPTIONS}
        />
      </div>

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
