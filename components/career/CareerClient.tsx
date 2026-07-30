"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { Modal } from "@/components/ui/Modal";
import { CertificationCard } from "@/components/career/CertificationCard";
import { CertificationForm } from "@/components/career/CertificationForm";
import { ApplicationKanban } from "@/components/career/ApplicationKanban";
import { NetworkingRow } from "@/components/career/NetworkingRow";
import { NetworkingForm } from "@/components/career/NetworkingForm";
import { ResumeCard } from "@/components/career/ResumeCard";
import type { Application, Certification, NetworkingContact } from "@/types/database.types";

function upsertById<T extends { id: string }>(list: T[], row: T): T[] {
  const exists = list.some((item) => item.id === row.id);
  return exists ? list.map((item) => (item.id === row.id ? row : item)) : [...list, row];
}

interface CareerClientProps {
  initialCertifications: Certification[];
  initialApplications: Application[];
  initialNetworking: NetworkingContact[];
  initialResumeUrl: string | null;
  initialResumeUpdatedAt: string | null;
}

export function CareerClient({
  initialCertifications,
  initialApplications,
  initialNetworking,
  initialResumeUrl,
  initialResumeUpdatedAt,
}: CareerClientProps) {
  const [certifications, setCertifications] = useState(initialCertifications);
  const [applications, setApplications] = useState(initialApplications);
  const [networking, setNetworking] = useState(initialNetworking);
  const [resumeUrl, setResumeUrl] = useState(initialResumeUrl);
  const [resumeUpdatedAt, setResumeUpdatedAt] = useState(initialResumeUpdatedAt);

  const [addingCert, setAddingCert] = useState(false);
  const [addingContact, setAddingContact] = useState(false);

  return (
    <div>
      <WorkspaceHeader
        eyebrow="CAREER"
        title="Career workspace"
        subtitle={`${certifications.length} certifications · ${applications.length} applications · ${networking.length} contacts`}
      />

      <div className="space-y-8 px-8 py-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-primary">Certifications</h2>
            <button
              onClick={() => setAddingCert(true)}
              className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
            >
              <Plus className="h-3.5 w-3.5" />
              Add certification
            </button>
          </div>
          {certifications.length === 0 ? (
            <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
              <p className="text-sm text-ink-secondary">No certifications tracked yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {certifications.map((c) => (
                <CertificationCard
                  key={c.id}
                  certification={c}
                  onSaved={(updated) => setCertifications((prev) => upsertById(prev, updated))}
                  onDeleted={(id) => setCertifications((prev) => prev.filter((item) => item.id !== id))}
                />
              ))}
            </div>
          )}
          <Modal open={addingCert} onClose={() => setAddingCert(false)} title="Add certification">
            <CertificationForm
              onSaved={(c) => {
                setCertifications((prev) => upsertById(prev, c));
                setAddingCert(false);
              }}
              onCancel={() => setAddingCert(false)}
            />
          </Modal>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Job applications</h2>
          <ApplicationKanban
            applications={applications}
            onSaved={(a) => setApplications((prev) => upsertById(prev, a))}
            onDeleted={(id) => setApplications((prev) => prev.filter((item) => item.id !== id))}
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-primary">Networking</h2>
            <button
              onClick={() => setAddingContact(true)}
              className="flex items-center gap-1.5 text-xs text-signal hover:text-signal-bright"
            >
              <Plus className="h-3.5 w-3.5" />
              Add contact
            </button>
          </div>
          {networking.length === 0 ? (
            <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
              <p className="text-sm text-ink-secondary">No contacts tracked yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border-subtle rounded-card border border-border bg-surface">
              {networking.map((contact) => (
                <NetworkingRow
                  key={contact.id}
                  contact={contact}
                  onSaved={(updated) => setNetworking((prev) => upsertById(prev, updated))}
                  onDeleted={(id) => setNetworking((prev) => prev.filter((item) => item.id !== id))}
                />
              ))}
            </ul>
          )}
          <Modal open={addingContact} onClose={() => setAddingContact(false)} title="Add contact">
            <NetworkingForm
              onSaved={(c) => {
                setNetworking((prev) => upsertById(prev, c));
                setAddingContact(false);
              }}
              onCancel={() => setAddingContact(false)}
            />
          </Modal>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-ink-primary">Resume</h2>
          <ResumeCard
            resumeUrl={resumeUrl}
            resumeUpdatedAt={resumeUpdatedAt}
            onSaved={(url, updatedAt) => {
              setResumeUrl(url);
              setResumeUpdatedAt(updatedAt);
            }}
          />
        </section>
      </div>
    </div>
  );
}
