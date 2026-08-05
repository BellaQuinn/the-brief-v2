"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CertificationDomainScore, CertificationPracticeTest } from "@/types/database.types";

interface DomainRow {
  domain: string;
  score: string;
}

function toRows(scores: CertificationDomainScore[]): DomainRow[] {
  return scores.length > 0
    ? scores.map((s) => ({ domain: s.domain, score: s.score != null ? String(s.score) : "" }))
    : [{ domain: "", score: "" }];
}

interface CertificationPracticeTestFormProps {
  certificationId: string;
  test?: CertificationPracticeTest | null;
  onSaved: (test: CertificationPracticeTest) => void;
  onCancel: () => void;
}

export function CertificationPracticeTestForm({
  certificationId,
  test,
  onSaved,
  onCancel,
}: CertificationPracticeTestFormProps) {
  const supabase = createClient();
  const [testDate, setTestDate] = useState(test?.test_date ?? "");
  const [overallScore, setOverallScore] = useState(String(test?.overall_score ?? ""));
  const [overallResult, setOverallResult] = useState(test?.overall_result ?? "");
  const [domainRows, setDomainRows] = useState<DomainRow[]>(toRows(test?.domain_scores ?? []));
  const [notes, setNotes] = useState(test?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateRow(index: number, patch: Partial<DomainRow>) {
    setDomainRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    setDomainRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const domainScores: CertificationDomainScore[] = domainRows
      .filter((row) => row.domain.trim())
      .map((row) => ({ domain: row.domain.trim(), score: row.score ? Number(row.score) : null }));

    const payload = {
      certification_id: certificationId,
      test_date: testDate,
      overall_score: overallScore ? Number(overallScore) : null,
      overall_result: overallResult || null,
      domain_scores: domainScores,
      notes: notes || null,
    };

    const { data, error } = test
      ? await supabase.from("certification_practice_tests").update(payload).eq("id", test.id).select().single()
      : await supabase
          .from("certification_practice_tests")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as CertificationPracticeTest);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Test date" type="date" required value={testDate} onChange={(e) => setTestDate(e.target.value)} />
        <Input
          label="Overall score (optional)"
          type="number"
          placeholder="e.g. 780"
          value={overallScore}
          onChange={(e) => setOverallScore(e.target.value)}
        />
      </div>
      <Input
        label="Overall result (optional)"
        placeholder="Pass, Above Target, etc. -- for certs without a numeric score"
        value={overallResult}
        onChange={(e) => setOverallResult(e.target.value)}
      />

      <div>
        <p className="mb-1.5 block text-sm text-ink-secondary">Domain scores (optional)</p>
        <div className="space-y-2">
          {domainRows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Domain (e.g. People, Process)"
                value={row.domain}
                onChange={(e) => updateRow(i, { domain: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Score"
                value={row.score}
                onChange={(e) => updateRow(i, { score: e.target.value })}
                className="w-28"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="Remove domain"
                className="rounded-md p-2 text-ink-tertiary transition-colors hover:bg-status-atRisk/10 hover:text-status-atRisk"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setDomainRows((prev) => [...prev, { domain: "", score: "" }])}
          className="mt-2 flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright"
        >
          <Plus className="h-3.5 w-3.5" /> Add domain
        </button>
      </div>

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
