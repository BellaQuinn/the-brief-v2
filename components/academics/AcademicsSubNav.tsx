"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// One ordered list, live tabs carry a path, not-yet-built ones carry null —
// keeps visual order stable as tabs go live one at a time (rather than two
// separate "live" / "placeholder" groups re-sorting each other around).
const TABS: { path: string | null; label: string }[] = [
  { path: "", label: "Overview" },
  { path: "/standing", label: "Academic Standing" },
  { path: null, label: "Planner" },
  { path: null, label: "Courses" },
  { path: null, label: "Assignments" },
  { path: "/graduate-law-school", label: "Graduate & Law School" },
  { path: null, label: "Documents" },
];

export function AcademicsSubNav({
  basePath,
  includeGraduateLawSchool = true,
}: {
  basePath: string;
  // Graduate & Law School is private-only (LSAT scores, school-by-school
  // application status) — the Portfolio Preview shell renders this tab as
  // inert instead of linking to a route that doesn't exist there.
  includeGraduateLawSchool?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-border-subtle bg-surface-raised/60 px-4 md:px-8">
      {TABS.map((tab) => {
        const path = tab.path === "/graduate-law-school" && !includeGraduateLawSchool ? null : tab.path;
        const label = tab.label;
        if (path === null) {
          return (
            <span
              key={label}
              className="shrink-0 cursor-default whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm text-ink-tertiary/40"
            >
              {label}
            </span>
          );
        }
        const href = `${basePath}${path}`;
        const isActive = pathname === href || (path === "/graduate-law-school" && pathname.startsWith(`${href}/`));
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
    </nav>
  );
}
