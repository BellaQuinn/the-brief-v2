import type { Application, ApplicationStatus } from "@/types/database.types";

const COLUMNS: { value: ApplicationStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone screen" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export function ReadOnlyApplications({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border px-6 py-8 text-center">
        <p className="text-sm text-ink-secondary">No applications yet.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {COLUMNS.map((col) => {
        const items = applications.filter((a) => a.status === col.value);
        if (items.length === 0) return null;
        return (
          <div key={col.value} className="w-64 shrink-0">
            <div className="mb-2 flex items-center justify-between px-0.5">
              <span className="text-xs font-medium text-ink-primary">{col.label}</span>
              <span className="font-mono text-[11px] text-ink-tertiary">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((a) => (
                <div key={a.id} className="w-64 shrink-0 rounded-lg border border-border-subtle bg-surface-raised p-3">
                  <p className="truncate text-sm font-medium text-ink-primary">{a.position}</p>
                  <p className="truncate text-xs text-ink-tertiary">{a.company}</p>
                  {(a.location || a.salary) && (
                    <p className="mt-1.5 font-mono text-[11px] text-ink-tertiary">
                      {[a.location, a.salary].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
