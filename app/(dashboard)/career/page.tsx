import { createClient } from "@/lib/supabase/server";
import { CareerClient } from "@/components/career/CareerClient";
import type { Application, Certification, NetworkingContact, User } from "@/types/database.types";

// Every dashboard page shows session-specific data (this operator's
// own records) -- force-dynamic guarantees Next/Vercel never serve a
// cached render across users, sessions, or time, regardless of whether
// automatic dynamic-rendering detection would already cover it.
export const dynamic = "force-dynamic";

type ResumeProfile = Pick<User, "resume_url" | "resume_updated_at">;

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
      initialResumeUrl={(profile as ResumeProfile | null)?.resume_url ?? null}
      initialResumeUpdatedAt={(profile as ResumeProfile | null)?.resume_updated_at ?? null}
    />
  );
}
