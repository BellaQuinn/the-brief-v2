"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LIVE_TABS = [
  { path: "", label: "Overview" },
  { path: "/standing", label: "Academic Standing" },
] as const;

// Sketches where Academics is headed — not yet built, so these render as
// visible but inert rather than linking to dead pages. Each becomes a real
// tab as its own roadmap item ships (Graduate & Law School is next).
const PLACEHOLDER_TABS = ["Planner", "Courses", "Assignments", "Graduate & Law School", "Documents"];

export function AcademicsSubNav({ basePath }: { basePath: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-border-subtle bg-surface-raised/60 px-4 md:px-8">
      {LIVE_TABS.map(({ path, label }) => {
        const href = `${basePath}${path}`;
        const isActive = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "border-seal text-ink-primary"
                : "border-transparent text-ink-tertiary hover:text-ink-secondary"
            )}
          >
            {label}
          </Link>
        );
      })}
      {PLACEHOLDER_TABS.map((label) => (
        <span
          key={label}
          className="shrink-0 cursor-default whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm text-ink-tertiary/40"
        >
          {label}
        </span>
      ))}
    </nav>
  );
}
