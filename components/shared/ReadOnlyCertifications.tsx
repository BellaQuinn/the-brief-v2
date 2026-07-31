import type { Certification } from "@/types/database.types";

const CERT_STATUS_LABEL: Record<Certification["status"], string> = {
  planned: "Planned",
  studying: "Studying",
  scheduled: "Scheduled",
  passed: "Passed",
  failed: "Failed",
  expired: "Expired",
};

export function ReadOnlyCertificationsList({ certifications }: { certifications: Certification[] }) {
  if (certifications.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium text-ink-primary">Certifications</h2>
      <div className="space-y-2">
        {certifications.map((cert) => (
          <div
            key={cert.id}
            className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-raised px-3 py-2.5"
          >
            <div>
              <p className="text-sm text-ink-primary">{cert.name}</p>
              {cert.provider && <p className="text-xs text-ink-tertiary">{cert.provider}</p>}
            </div>
            <span className="font-mono text-xs text-ink-tertiary">{CERT_STATUS_LABEL[cert.status]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
