"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileTopBar({ right }: { right?: React.ReactNode }) {
  const pathname = usePathname();
  const isBrief = pathname === "/brief" || pathname.startsWith("/brief/");

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border-subtle px-4 py-3 md:hidden",
        isBrief ? "brief-header-treatment" : "workspace-header-treatment"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-seal/40 text-seal">
          <span className="font-display text-[10px] font-semibold">B</span>
        </div>
        <p className="font-display text-sm font-medium text-ink-primary">The Brief</p>
      </div>
      {right}
    </div>
  );
}
