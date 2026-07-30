import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

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
      <Sidebar user={profile} />
      <main className="min-h-screen flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
