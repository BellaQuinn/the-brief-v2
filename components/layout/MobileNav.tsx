"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, Briefcase, Library, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/brief", label: "Brief", icon: LayoutDashboard },
  { href: "/academics", label: "Academics", icon: GraduationCap },
  { href: "/career", label: "Career", icon: Briefcase },
  { href: "/resources", label: "Resources", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
              isActive ? "text-ink-primary" : "text-ink-tertiary"
            )}
          >
            {isActive && <span className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-seal" />}
            <Icon className={cn("h-5 w-5", isActive && "text-signal-bright")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
