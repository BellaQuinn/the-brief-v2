"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function MobileSignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      aria-label="Sign out"
      className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-overlay hover:text-ink-primary"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
