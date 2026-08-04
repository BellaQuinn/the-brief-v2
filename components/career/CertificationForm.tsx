"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Certification, CertificationStatus } from "@/types/database.types";

const STATUS_OPTIONS: { value: CertificationStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "studying", label: "Studying" },
  { value: "scheduled", label: "Scheduled" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
];

interface CertificationFormProps {
  certification?: Certification | null;
  onSaved: (certification: Certification) => void;
  onCancel: () => void;
}

export function CertificationForm({ certification, onSaved, onCancel }: CertificationFormProps) {
  const supabase = createClient();
  const [name, setName] = useState(certification?.name ?? "");
  const [provider, setProvider] = useState(certification?.provider ?? "");
  const [status, setStatus] = useState<CertificationStatus>(certification?.status ?? "planned");
  const [examDate, setExamDate] = useState(certification?.exam_date ?? "");
  const [expirationDate, setExpirationDate] = useState(certification?.expiration_date ?? "");
  const [progress, setProgress] = useState(String(certification?.progress ?? "0"));
  const [passingScore, setPassingScore] = useState(String(certification?.passing_score ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      provider: provider || null,
      status,
      exam_date: examDate || null,
      expiration_date: expirationDate || null,
      progress: Number(progress) || 0,
      passing_score: passingScore ? Number(passingScore) : null,
    };

    const { data, error } = certification
      ? await supabase.from("certifications").update(payload).eq("id", certification.id).select().single()
      : await supabase
          .from("certifications")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as Certification);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Certification name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Provider" placeholder="CompTIA, (ISC)², etc." value={provider} onChange={(e) => setProvider(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as CertificationStatus)}
          options={STATUS_OPTIONS}
        />
        <Input
          label="Progress (%)"
          type="number"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Exam date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        <Input
          label="Expiration date"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
        />
      </div>
      <Input
        label="Passing score (optional)"
        type="number"
        placeholder="e.g. 750 for CompTIA -- leave blank for pass/fail certs"
        value={passingScore}
        onChange={(e) => setPassingScore(e.target.value)}
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
