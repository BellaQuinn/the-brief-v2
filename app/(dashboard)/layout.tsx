import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { MobileSignOutButton } from "@/components/layout/MobileSignOutButton";
import { BootSequence } from "@/components/layout/BootSequence";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, last_name, email")
    .eq("id", authUser.id)
    .single();

  return (
    <div className="flex">
      <BootSequence />
      <Sidebar user={profile} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <MobileTopBar right={<MobileSignOutButton />} />
        <main className="flex-1 overflow-y-auto bg-background pb-16 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
