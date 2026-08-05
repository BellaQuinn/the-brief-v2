const CAPABILITIES = [
  "Assignments",
  "Courses",
  "Career",
  "Graduate School",
  "Documents",
  "Certifications",
  "Calendar",
  "AI Review",
];

export function CapabilityStrip() {
  return (
    <div className="border-b border-border-subtle bg-surface px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {CAPABILITIES.map((item) => (
          <span key={item} className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-tertiary">
            {item}
            <span className="text-signal">✓</span>
          </span>
        ))}
      </div>
    </div>
  );
}
