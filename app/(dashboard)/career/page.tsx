import { createClient } from "@/lib/supabase/server";
import { CareerClient } from "@/components/career/CareerClient";
import type { Application, Certification, NetworkingContact } from "@/types/database.types";

export default async function CareerPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const [{ data: certifications }, { data: applications }, { data: networking }, { data: profile }] =
    await Promise.all([
      supabase.from("certifications").select("*").order("exam_date", { ascending: true, nullsFirst: false }),
      supabase.from("applications").select("*").order("created_at", { ascending: true }),
      supabase.from("networking").select("*").order("next_follow_up", { ascending: true, nullsFirst: false }),
      supabase.from("users").select("resume_url, resume_updated_at").eq("id", authUser!.id).single(),
    ]);

  return (
    <CareerClient
      initialCertifications={(certifications as Certification[]) ?? []}
      initialApplications={(applications as Application[]) ?? []}
      initialNetworking={(networking as NetworkingContact[]) ?? []}
      initialResumeUrl={profile?.resume_url ?? null}
      initialResumeUpdatedAt={profile?.resume_updated_at ?? null}
    />
  );
}
