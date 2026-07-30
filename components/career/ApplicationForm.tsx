"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Application, ApplicationStatus } from "@/types/database.types";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone screen" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

interface ApplicationFormProps {
  application?: Application | null;
  defaultStatus?: ApplicationStatus;
  onSaved: (application: Application) => void;
  onCancel: () => void;
}

export function ApplicationForm({ application, defaultStatus, onSaved, onCancel }: ApplicationFormProps) {
  const supabase = createClient();
  const [company, setCompany] = useState(application?.company ?? "");
  const [position, setPosition] = useState(application?.position ?? "");
  const [salary, setSalary] = useState(application?.salary ?? "");
  const [location, setLocation] = useState(application?.location ?? "");
  const [status, setStatus] = useState<ApplicationStatus>(application?.status ?? defaultStatus ?? "saved");
  const [dateApplied, setDateApplied] = useState(application?.date_applied ?? "");
  const [nextAction, setNextAction] = useState(application?.next_action ?? "");
  const [notes, setNotes] = useState(application?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      company,
      position,
      salary: salary || null,
      location: location || null,
      status,
      date_applied: dateApplied || null,
      next_action: nextAction || null,
      notes: notes || null,
    };

    const { data, error } = application
      ? await supabase.from("applications").update(payload).eq("id", application.id).select().single()
      : await supabase
          .from("applications")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as Application);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Company" required value={company} onChange={(e) => setCompany(e.target.value)} />
        <Input label="Position" required value={position} onChange={(e) => setPosition(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Salary" placeholder="$85k–$95k" value={salary} onChange={(e) => setSalary(e.target.value)} />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          options={STATUS_OPTIONS}
        />
        <Input label="Date applied" type="date" value={dateApplied} onChange={(e) => setDateApplied(e.target.value)} />
      </div>
      <Input label="Next action" placeholder="Follow up with recruiter" value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
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
