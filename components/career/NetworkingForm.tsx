"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { NetworkingContact } from "@/types/database.types";

interface NetworkingFormProps {
  contact?: NetworkingContact | null;
  onSaved: (contact: NetworkingContact) => void;
  onCancel: () => void;
}

export function NetworkingForm({ contact, onSaved, onCancel }: NetworkingFormProps) {
  const supabase = createClient();
  const [name, setName] = useState(contact?.name ?? "");
  const [company, setCompany] = useState(contact?.company ?? "");
  const [role, setRole] = useState(contact?.role ?? "");
  const [linkedin, setLinkedin] = useState(contact?.linkedin ?? "");
  const [lastContact, setLastContact] = useState(contact?.last_contact ?? "");
  const [nextFollowUp, setNextFollowUp] = useState(contact?.next_follow_up ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name,
      company: company || null,
      role: role || null,
      linkedin: linkedin || null,
      last_contact: lastContact || null,
      next_follow_up: nextFollowUp || null,
      notes: notes || null,
    };

    const { data, error } = contact
      ? await supabase.from("networking").update(payload).eq("id", contact.id).select().single()
      : await supabase
          .from("networking")
          .insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user!.id })
          .select()
          .single();

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSaved(data as NetworkingContact);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
      </div>
      <Input label="LinkedIn" placeholder="linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Last contact" type="date" value={lastContact} onChange={(e) => setLastContact(e.target.value)} />
        <Input label="Next follow-up" type="date" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)} />
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
