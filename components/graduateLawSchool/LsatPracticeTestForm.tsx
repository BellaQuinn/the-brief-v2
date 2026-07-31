"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { LsatPracticeTest } from "@/types/database.types";

const TIMED_OPTIONS = [
  { value: "true", label: "Timed" },
  { value: "false", label: "Untimed" },
];

interface LsatPracticeTestFormProps {
  test?: LsatPracticeTest | null;
  onSaved: (test: LsatPracticeTest) => void;
  onCancel: () => void;
}

export function LsatPracticeTestForm({ test, onSaved, onCancel }: LsatPracticeTestFormProps) {
  const supabase = createClient();
  const [testDate, setTestDate] = useState(test?.test_date ?? "");
  const [source, setSource] = useState(test?.source ?? "");
  const [scaledScore, setScaledScore] = useState(String(test?.scaled_score ?? ""));
  const [logicalReasoning, setLogicalReasoning] = useState(String(test?.logical_reasoning_score ?? ""));
  const [readingComprehension, setReadingComprehension] = useState(String(test?.reading_comprehension_score ?? ""));
  const [analyticalReasoning, setAnalyticalReasoning] = useState(String(test?.analytical_reasoning_score ?? ""));
  const [timed, setTimed] = useState(String(test?.timed ?? "true"));
  const [confidence, setConfidence] = useState(String(test?.confidence ?? ""));
  const [missedQuestions, setMissedQuestions] = useState(String(test?.missed_questions ?? ""));
  const [notes, setNotes] = useState(test?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const payload = {
      test_date: testDate,
      source: source || null,
      scaled_score: scaledScore ? Number(scaledScore) : null,
      logical_reasoning_score: logicalReasoning ? Number(logicalReasoning) : null,
      reading_comprehension_score: readingComprehension ? Number(readingComprehension) : null,
      analytical_reasoning_score: analyticalReasoning ? Number(analyticalReasoning) : null,
      timed: timed === "true",
      confidence: confidence ? Number(confidence) : null,
      missed_questions: missedQuestions ? Number(missedQuestions) : null,
      notes: notes || null,
    };

    const { data, error } = test
      ? await supabase.from("lsat_practice_tests").update(payload).eq("id", test.id).select().single()
      : await supabase
          .from("lsat_practice_tests")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as LsatPracticeTest);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Test date" type="date" required value={testDate} onChange={(e) => setTestDate(e.target.value)} />
        <Input label="Source" placeholder="LSAC PrepTest 90, Official..." value={source} onChange={(e) => setSource(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Scaled score" type="number" min={120} max={180} value={scaledScore} onChange={(e) => setScaledScore(e.target.value)} />
        <Select label="Timed" value={timed} onChange={(e) => setTimed(e.target.value)} options={TIMED_OPTIONS} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Logical reasoning"
          type="number"
          value={logicalReasoning}
          onChange={(e) => setLogicalReasoning(e.target.value)}
        />
        <Input
          label="Reading comprehension"
          type="number"
          value={readingComprehension}
          onChange={(e) => setReadingComprehension(e.target.value)}
        />
        <Input
          label="Analytical reasoning"
          type="number"
          value={analyticalReasoning}
          onChange={(e) => setAnalyticalReasoning(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Confidence (1-5)"
          type="number"
          min={1}
          max={5}
          value={confidence}
          onChange={(e) => setConfidence(e.target.value)}
        />
        <Input
          label="Missed questions"
          type="number"
          value={missedQuestions}
          onChange={(e) => setMissedQuestions(e.target.value)}
        />
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
