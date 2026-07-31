"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, Briefcase, Library, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReviewSidebar({ token }: { token: string }) {
  const pathname = usePathname();
  const base = `/review/${token}`;

  const navItems = [
    { href: `${base}/brief`, label: "The Brief", icon: LayoutDashboard },
    { href: `${base}/academics`, label: "Academics", icon: GraduationCap },
    { href: `${base}/career`, label: "Career", icon: Briefcase },
    { href: `${base}/resources`, label: "Resources", icon: Library },
  ] as const;

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-seal/40 text-seal">
          <span className="font-display text-xs font-semibold">B</span>
        </div>
        <div>
          <p className="font-display text-sm font-medium leading-none text-ink-primary">The Brief</p>
          <p className="eyebrow mt-1 !text-[9px]">Mission Control</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-surface-raised text-ink-primary"
                  : "text-ink-secondary hover:bg-surface-raised/60 hover:text-ink-primary"
              )}
            >
              {isActive && (
                <span className="absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-seal" />
              )}
              <Icon className={cn("h-4 w-4", isActive ? "text-signal-bright" : "text-ink-tertiary")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-seal-dim text-seal">
            <Eye className="h-3.5 w-3.5" />
          </div>
          <p className="truncate text-sm text-ink-secondary">Read-only review</p>
        </div>
      </div>
    </aside>
  );
}
