"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { LawSchool, LawSchoolPriority, LawSchoolStatus } from "@/types/database.types";

const STATUS_OPTIONS: { value: LawSchoolStatus; label: string }[] = [
  { value: "researching", label: "Researching" },
  { value: "planning_to_apply", label: "Planning to apply" },
  { value: "applying", label: "Applying" },
  { value: "applied", label: "Applied" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "enrolled", label: "Enrolled" },
];

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Not set" },
  { value: "dream", label: "Dream" },
  { value: "reach", label: "Reach" },
  { value: "target", label: "Target" },
  { value: "safety", label: "Safety" },
];

interface SchoolFormProps {
  school?: LawSchool | null;
  onSaved: (school: LawSchool) => void;
  onCancel: () => void;
}

export function SchoolForm({ school, onSaved, onCancel }: SchoolFormProps) {
  const supabase = createClient();
  const [schoolName, setSchoolName] = useState(school?.school_name ?? "");
  const [status, setStatus] = useState<LawSchoolStatus>(school?.status ?? "researching");
  const [priority, setPriority] = useState<string>(school?.priority ?? "");
  const [applicationDeadline, setApplicationDeadline] = useState(school?.application_deadline ?? "");
  const [lsatRequirement, setLsatRequirement] = useState(String(school?.lsat_requirement ?? ""));
  const [medianGpa, setMedianGpa] = useState(String(school?.median_gpa ?? ""));
  const [medianLsat, setMedianLsat] = useState(String(school?.median_lsat ?? ""));
  const [essaysStatus, setEssaysStatus] = useState(school?.essays_status ?? "");
  const [recommendationsStatus, setRecommendationsStatus] = useState(school?.recommendations_status ?? "");
  const [whyThisSchool, setWhyThisSchool] = useState(school?.why_this_school ?? "");
  const [personalNotes, setPersonalNotes] = useState(school?.personal_notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const payload = {
      school_name: schoolName,
      status,
      priority: (priority || null) as LawSchoolPriority | null,
      application_deadline: applicationDeadline || null,
      lsat_requirement: lsatRequirement ? Number(lsatRequirement) : null,
      median_gpa: medianGpa ? Number(medianGpa) : null,
      median_lsat: medianLsat ? Number(medianLsat) : null,
      essays_status: essaysStatus || null,
      recommendations_status: recommendationsStatus || null,
      why_this_school: whyThisSchool || null,
      personal_notes: personalNotes || null,
    };

    const { data, error } = school
      ? await supabase.from("law_schools").update(payload).eq("id", school.id).select().single()
      : await supabase
          .from("law_schools")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as LawSchool);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="School name" required value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as LawSchoolStatus)}
          options={STATUS_OPTIONS}
        />
        <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} options={PRIORITY_OPTIONS} />
      </div>
      <Input
        label="Application deadline"
        type="date"
        value={applicationDeadline}
        onChange={(e) => setApplicationDeadline(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="LSAT requirement"
          type="number"
          value={lsatRequirement}
          onChange={(e) => setLsatRequirement(e.target.value)}
        />
        <Input label="Median GPA" type="number" step="0.01" value={medianGpa} onChange={(e) => setMedianGpa(e.target.value)} />
        <Input label="Median LSAT" type="number" value={medianLsat} onChange={(e) => setMedianLsat(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Essays status"
          placeholder="Not started, Draft, Submitted..."
          value={essaysStatus}
          onChange={(e) => setEssaysStatus(e.target.value)}
        />
        <Input
          label="Recommendations status"
          placeholder="Requested, Submitted..."
          value={recommendationsStatus}
          onChange={(e) => setRecommendationsStatus(e.target.value)}
        />
      </div>
      <Textarea
        label="Why this school"
        placeholder="Why it appeals, campus visit impressions, conversations..."
        rows={3}
        value={whyThisSchool}
        onChange={(e) => setWhyThisSchool(e.target.value)}
      />
      <Textarea label="Personal notes" rows={2} value={personalNotes} onChange={(e) => setPersonalNotes(e.target.value)} />

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
