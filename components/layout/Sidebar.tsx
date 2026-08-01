"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Calendar, GraduationCap, Briefcase, Library, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User } from "@/types/database.types";

const NAV_ITEMS = [
  { href: "/brief", label: "The Brief", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/academics", label: "Academics", icon: GraduationCap },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ user }: { user: Pick<User, "first_name" | "last_name" | "email"> | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] ?? ""}`
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 px-5 py-6">
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
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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

      {/* System status — ambient console flavor, not a computed status */}
      <div className="mx-3 mb-3 rounded-lg border border-border-subtle bg-surface-raised/40 px-3 py-2.5">
        <p className="eyebrow mb-1.5 !text-[9px]">System</p>
        <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal animate-pulse-signal" />
          Ready, Operator.
        </div>
      </div>

      {/* Account footer */}
      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal-dim font-mono text-[11px] text-signal-bright">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
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
