"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { path: "", label: "Overview" },
  { path: "/schools", label: "Schools" },
  { path: "/lsat", label: "LSAT" },
  { path: "/applications", label: "Applications" },
  { path: "/scholarships", label: "Scholarships" },
  { path: "/timeline", label: "Timeline" },
  { path: "/documents", label: "Documents" },
] as const;

// Pill-style rather than AcademicsSubNav's underline tabs — this is the
// second nav level stacked below it, and the different shape keeps the two
// from reading as one confusing strip.
export function GraduateLawSchoolSubNav({ basePath }: { basePath: string }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 md:px-8">
      {TABS.map(({ path, label }) => {
        const href = `${basePath}${path}`;
        const isActive = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors",
              isActive
                ? "border-signal/40 bg-signal/10 text-signal"
                : "border-border text-ink-tertiary hover:border-border-strong hover:text-ink-secondary"
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
