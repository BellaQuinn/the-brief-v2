"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, GraduationCap, Briefcase, Library, BookOpen, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@/types/database.types";

const NAV_ITEMS = [
  { href: "/brief", label: "The Brief", icon: LayoutDashboard, designation: "Mission Control" },
  { href: "/calendar", label: "Calendar", icon: Calendar, designation: "Schedule Operations" },
  { href: "/academics", label: "Academics", icon: GraduationCap, designation: "Academic Intelligence" },
  { href: "/career", label: "Career", icon: Briefcase, designation: "Career Operations" },
  { href: "/resources", label: "Resources", icon: Library, designation: "Resource Archive" },
  { href: "/guide", label: "Guide", icon: BookOpen, designation: "Reference Manual" },
  { href: "/settings", label: "Settings", icon: Settings, designation: "System Configuration" },
] as const;

// Client-side only — avoids a server/client render mismatch on first
// paint, and ticks on its own rather than re-rendering the whole sidebar
// from a server timestamp.
function useLocalClock(): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

export function Sidebar({ user }: { user: Pick<User, "first_name" | "last_name" | "email"> | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const localTime = useLocalClock();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] ?? ""}`
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      {/* OS strip — a slim live status line above the wordmark, so the
          sidebar reads as a persistent panel rather than a page element. */}
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5 font-mono text-[10px] text-ink-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse-signal" />
          {localTime ?? " "}
        </span>
        <span>Synced</span>
      </div>

      {/* Wordmark */}
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-seal/40 text-seal">
          <span className="font-display text-xs font-semibold">B</span>
        </div>
        <div>
          <p className="font-display text-sm font-medium leading-none text-ink-primary">The Brief</p>
          <p className="eyebrow mt-1 !text-[9px]">Mission Control</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, designation }) => {
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
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center", isActive && "nav-frame-active")}>
                <Icon className={cn("h-4 w-4", isActive ? "text-signal-bright" : "text-ink-tertiary")} />
              </span>
              <span className="flex flex-col">
                {label}
                <span
                  className={cn(
                    "font-mono text-[8px] uppercase tracking-eyebrow",
                    isActive ? "text-signal-bright/70" : "text-ink-tertiary/60"
                  )}
                >
                  {designation}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* System status — ambient console flavor, not a computed status */}
      <div className="mx-3 mb-3 rounded-lg border border-border-subtle bg-surface-raised/40 px-3 py-2.5 font-mono text-[10px] leading-relaxed text-ink-tertiary">
        <p className="eyebrow mb-1.5 !text-[9px] text-signal-bright/85">Sync complete</p>
        <p>Academic systems — online</p>
        <p>Career systems — online</p>
        <p>Admissions systems — online</p>
        <p className="text-ink-secondary">
          No critical alerts.
          <span className="ml-1 inline-block h-2.5 w-1 animate-pulse-signal bg-signal align-middle" />
        </p>
      </div>

      {/* Account footer */}
      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal-dim font-mono text-[11px] text-signal-bright">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-tertiary">Operator</p>
            <p className="truncate text-sm text-ink-primary">
              {user?.first_name ? `${user.first_name} ${user.last_name ?? ""}`.trim() : user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-overlay hover:text-ink-primary"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
