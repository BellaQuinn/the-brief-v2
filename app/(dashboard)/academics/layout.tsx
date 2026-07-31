import { AcademicsSubNav } from "@/components/academics/AcademicsSubNav";

export default function AcademicsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 border-b border-border-subtle bg-surface-raised/60 px-4 py-1.5">
        <span className="h-2 w-2 rounded-full bg-status-atRisk/70" />
        <span className="h-2 w-2 rounded-full bg-seal/70" />
        <span className="h-2 w-2 rounded-full bg-status-onTrack/70" />
      </div>
      <AcademicsSubNav basePath="/academics" />
      {children}
    </div>
  );
}
