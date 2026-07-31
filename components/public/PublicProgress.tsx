import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReadOnlyDegreeCard, ReadOnlyTermsList } from "@/components/shared/ReadOnlyAcademics";
import { ReadOnlyCertificationsList } from "@/components/shared/ReadOnlyCertifications";
import { sortDegrees } from "@/lib/utils";
import type { Certification, DegreeWithTerms } from "@/types/database.types";

// Single-tenant for now: this app has one user. If it ever supports
// multiple public profiles, this becomes a param instead of a constant.
const PUBLIC_USER_EMAIL = "ktalley132@gmail.com";

export async function PublicProgress() {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, first_name")
    .eq("email", PUBLIC_USER_EMAIL)
    .single();

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-ink-secondary">Nothing to show yet.</p>
      </main>
    );
  }

  const [{ data: degrees }, { data: certifications }] = await Promise.all([
    supabase
      .from("degrees")
      .select("*, terms(*, courses(*))")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true })
      .order("created_at", { ascending: true, referencedTable: "terms" })
      .order("created_at", { ascending: true, referencedTable: "terms.courses" }),
    supabase
      .from("certifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("exam_date", { ascending: true, nullsFirst: false }),
  ]);

  const typedDegrees = sortDegrees((degrees as DegreeWithTerms[]) ?? []);
  const typedCerts = (certifications as Certification[]) ?? [];

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-2">{`$ ${profile.first_name ?? "PROGRESS"}`}</p>
            <h1 className="font-display text-2xl font-medium text-ink-primary">
              Academic progress<span className="ml-1 inline-block animate-pulse-signal">_</span>
            </h1>
          </div>
          <Link href="/login" className="text-sm text-signal hover:text-signal-bright">
            Sign in
          </Link>
        </div>

        {typedDegrees.length > 0 ? (
          <div className="space-y-8">
            {typedDegrees.map((degree) => (
              <div key={degree.id}>
                <ReadOnlyDegreeCard degree={degree} />
                <ReadOnlyTermsList terms={degree.terms} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">No degree plan published yet.</p>
          </div>
        )}

        <ReadOnlyCertificationsList certifications={typedCerts} />
      </div>
    </main>
  );
}
