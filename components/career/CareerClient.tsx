"use client";

import { useState } from "react";
import { isPast, isToday } from "date-fns";
import { Plus } from "lucide-react";
import { WorkspaceBrief } from "@/components/layout/WorkspaceBrief";
import { WorkspaceSection } from "@/components/layout/WorkspaceSection";
import { Modal } from "@/components/ui/Modal";
import { CertificationCard } from "@/components/career/CertificationCard";
import { CertificationForm } from "@/components/career/CertificationForm";
import { ApplicationKanban } from "@/components/career/ApplicationKanban";
import { NetworkingRow } from "@/components/career/NetworkingRow";
import { NetworkingForm } from "@/components/career/NetworkingForm";
import { ResumeCard } from "@/components/career/ResumeCard";
import { buildCareerWorkspaceBrief } from "@/lib/workspaceBriefs";
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

  const activeCertificationCount = certifications.filter(({ status }) => status === "studying" || status === "scheduled").length;
  const activeApplicationCount = applications.filter(({ status }) =>
    ["applied", "phone_screen", "interviewing", "offer"].includes(status)
  ).length;
  const dueFollowUpCount = networking.filter(({ next_follow_up }) => {
    if (!next_follow_up) return false;
    const date = new Date(next_follow_up);
    return isPast(date) || isToday(date);
  }).length;
  const brief = buildCareerWorkspaceBrief({
    certificationCount: certifications.length,
    activeCertificationCount,
    activeApplicationCount,
    dueFollowUpCount,
  });

  return (
    <div>
      <WorkspaceBrief
        eyebrow="Career // Operations"
        status={brief.status}
        situation={brief.situation}
        directive={brief.directive}
        meta={`${certifications.length} credentials · ${applications.length} applications · ${networking.length} contacts`}
      />

      <div className="space-y-10 px-4 py-7 md:px-8 md:py-8">
        <WorkspaceSection
          eyebrow="Credential signal"
          title="Certification readiness"
          action={
            <button onClick={() => setAddingCert(true)} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright">
              <Plus className="h-3.5 w-3.5" /> Add certification
            </button>
          }
        >
          {certifications.length === 0 ? (
            <div className="border-y border-border-subtle px-6 py-8 text-center">
              <p className="text-sm text-ink-secondary">No certifications tracked yet.</p>
            </div>
          ) : (
            <div className="trace-rail border-y border-border-subtle py-2">
              {certifications.map((c, index) => (
                <CertificationCard
                  key={c.id}
                  certification={c}
                  index={index + 1}
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
        </WorkspaceSection>

        <WorkspaceSection eyebrow="Opportunity pipeline" title="Application movement">
          <ApplicationKanban
            applications={applications}
            onSaved={(a) => setApplications((prev) => upsertById(prev, a))}
            onDeleted={(id) => setApplications((prev) => prev.filter((item) => item.id !== id))}
          />
        </WorkspaceSection>

        <WorkspaceSection
          eyebrow="Relationship trace"
          title="Follow-through network"
          action={
            <button onClick={() => setAddingContact(true)} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright">
              <Plus className="h-3.5 w-3.5" /> Add contact
            </button>
          }
        >
          {networking.length === 0 ? (
            <div className="border-y border-border-subtle px-6 py-8 text-center">
              <p className="text-sm text-ink-secondary">No contacts tracked yet.</p>
            </div>
          ) : (
            <ul className="trace-rail border-y border-border-subtle py-2">
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
        </WorkspaceSection>

        <WorkspaceSection eyebrow="Primary dossier" title="Resume source">
          <ResumeCard
            resumeUrl={resumeUrl}
            resumeUpdatedAt={resumeUpdatedAt}
            onSaved={(url, updatedAt) => {
              setResumeUrl(url);
              setResumeUpdatedAt(updatedAt);
            }}
          />
        </WorkspaceSection>
      </div>
    </div>
  );
}
