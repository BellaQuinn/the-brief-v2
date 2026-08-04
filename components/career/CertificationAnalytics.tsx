"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CertificationPracticeTestForm } from "@/components/career/CertificationPracticeTestForm";
import { CertificationPracticeTestCard } from "@/components/career/CertificationPracticeTestCard";
import { CertificationStudyPlanReviewModal } from "@/components/career/CertificationStudyPlanReviewModal";
import { domainAverages, highestScore, latestScore, remainingToPassing } from "@/lib/certificationPractice";
import { cn } from "@/lib/utils";
import type { Certification, CertificationPracticeTest, CertificationStudyPlanSuggestion } from "@/types/database.types";

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

function Metric({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">{label}</p>
      <p className="mt-1 font-mono text-base font-semibold tabular-nums text-ink-primary">{value ?? "—"}</p>
    </div>
  );
}

export function CertificationAnalytics({
  certification,
  initialTests,
}: {
  certification: Certification;
  initialTests: CertificationPracticeTest[];
}) {
  const [tests, setTests] = useState(
    [...initialTests].sort((a, b) => b.test_date.localeCompare(a.test_date))
  );
  const [adding, setAdding] = useState(false);
  const [studyPlanOpen, setStudyPlanOpen] = useState(false);
  const [studyPlanLoading, setStudyPlanLoading] = useState(false);
  const [studyPlanError, setStudyPlanError] = useState<string | null>(null);
  const [studyPlanSuggestions, setStudyPlanSuggestions] = useState<CertificationStudyPlanSuggestion[]>([]);

  function handleSaved(test: CertificationPracticeTest) {
    setTests((prev) => upsertById(prev, test).sort((a, b) => b.test_date.localeCompare(a.test_date)));
  }

  async function handleGenerateStudyPlan() {
    setStudyPlanOpen(true);
    setStudyPlanLoading(true);
    setStudyPlanError(null);
    const res = await fetch(`/api/certifications/${certification.id}/generate-study-plan`, { method: "POST" });
    const body = await res.json();
    setStudyPlanLoading(false);
    if (!res.ok) {
      setStudyPlanError(body.error ?? "Study plan generation failed.");
      return;
    }
    setStudyPlanSuggestions(body.suggestions ?? []);
  }

  const latest = latestScore(tests);
  const highest = highestScore(tests);
  const remaining = remainingToPassing(latest, certification.passing_score);
  const domains = domainAverages(tests);
  const domainEntries = Object.entries(domains).filter(([, stats]) => stats.average != null);
  const hasScoredTest = tests.some((t) => t.overall_score != null || t.overall_result != null);

  return (
    <div className="signal-field mt-3 px-4 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          <Metric label="Latest" value={latest} />
          <Metric label="Highest" value={highest} />
          <Metric
            label="To passing"
            value={certification.passing_score == null ? "—" : remaining === 0 ? "Met" : remaining}
          />
          <Metric label="Tests logged" value={tests.length} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateStudyPlan}
            disabled={!hasScoredTest}
            title={!hasScoredTest ? "Log a practice test with a score or result first" : undefined}
            className="flex items-center gap-1.5 border border-seal/30 bg-seal-dim/50 px-3 py-1.5 text-xs font-medium text-seal-bright transition-colors hover:border-seal/60 hover:bg-seal-dim disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate study plan
          </button>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 border border-accent/30 bg-accent-dim/50 px-3 py-1.5 text-xs font-medium text-accent-bright transition-colors hover:border-accent/60 hover:bg-accent-dim"
          >
            <Plus className="h-3.5 w-3.5" />
            Log practice test
          </button>
        </div>
      </div>

      {domainEntries.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-border-subtle pt-4">
          {domainEntries.map(([domain, stats]) => (
            <div key={domain}>
              <p className="font-mono text-[9px] uppercase tracking-wide text-ink-tertiary">{domain}</p>
              <p className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-base font-semibold tabular-nums text-ink-primary">{stats.average!.toFixed(1)}</span>
                {stats.trend && (
                  <span
                    className={cn(
                      "text-[10px] font-mono",
                      stats.trend === "improving" && "text-status-onTrack",
                      stats.trend === "declining" && "text-status-atRisk",
                      stats.trend === "flat" && "text-ink-tertiary"
                    )}
                  >
                    {stats.trend === "improving" ? "↑" : stats.trend === "declining" ? "↓" : "flat"}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-border-subtle">
        {tests.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-tertiary">No practice tests logged yet.</p>
        ) : (
          tests.map((t) => (
            <CertificationPracticeTestCard
              key={t.id}
              certificationId={certification.id}
              test={t}
              onSaved={handleSaved}
              onDeleted={(id) => setTests((prev) => prev.filter((item) => item.id !== id))}
            />
          ))
        )}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Log practice test">
        <CertificationPracticeTestForm
          certificationId={certification.id}
          onSaved={(t) => {
            handleSaved(t);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </Modal>

      <CertificationStudyPlanReviewModal
        open={studyPlanOpen}
        onClose={() => setStudyPlanOpen(false)}
        loading={studyPlanLoading}
        error={studyPlanError}
        initialSuggestions={studyPlanSuggestions}
      />
    </div>
  );
}
