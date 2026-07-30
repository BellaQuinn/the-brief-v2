import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Certification, DegreeWithTerms } from "@/types/database.types";

// Single-tenant for now: this app has one user. If it ever supports
// multiple public profiles, this becomes a param instead of a constant.
const PUBLIC_USER_EMAIL = "ktalley132@gmail.com";

const CERT_STATUS_LABEL: Record<Certification["status"], string> = {
  planned: "Planned",
  studying: "Studying",
  scheduled: "Scheduled",
  passed: "Passed",
  failed: "Failed",
  expired: "Expired",
};

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

  const [{ data: degree }, { data: certifications }] = await Promise.all([
    supabase
      .from("degrees")
      .select("*, terms(*, courses(*))")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true, referencedTable: "terms" })
      .order("created_at", { ascending: true, referencedTable: "terms.courses" })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("certifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("exam_date", { ascending: true, nullsFirst: false }),
  ]);

  const typedDegree = degree as DegreeWithTerms | null;
  const typedCerts = (certifications as Certification[]) ?? [];

  const pct =
    typedDegree?.total_credits && typedDegree.total_credits > 0
      ? Math.min(100, Math.round((typedDegree.completed_credits / typedDegree.total_credits) * 100))
      : 0;

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

        {typedDegree ? (
          <div className="rounded-card border border-border bg-surface p-5">
            <p className="eyebrow mb-1">{typedDegree.school_name}</p>
            <h2 className="font-display text-lg font-medium text-ink-primary">{typedDegree.degree_name}</h2>

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-xs text-ink-secondary">
                <span>
                  {typedDegree.completed_credits} / {typedDegree.total_credits ?? "—"} credits
                </span>
                {typedDegree.expected_graduation && (
                  <span>Expected {new Date(typedDegree.expected_graduation).toLocaleDateString()}</span>
                )}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-signal" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-ink-secondary">No degree plan published yet.</p>
          </div>
        )}

        {typedDegree && typedDegree.terms.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-ink-primary">Terms</h2>
            <div className="space-y-2">
              {typedDegree.terms.map((term) => (
                <div key={term.id} className="rounded-lg border border-border-subtle bg-surface-raised p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-primary">{term.name}</span>
                    <span className="font-mono text-xs text-ink-tertiary">{term.courses.length} courses</span>
                  </div>
                  {term.courses.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {term.courses.map((course) => (
                        <li key={course.id} className="flex items-center justify-between text-xs">
                          <span className="text-ink-secondary">
                            {course.course_code && <span className="font-mono text-ink-tertiary">{course.course_code} </span>}
                            {course.course_name}
                          </span>
                          <span className="font-mono text-ink-tertiary">{course.credits ?? "—"} cr</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {typedCerts.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-ink-primary">Certifications</h2>
            <div className="space-y-2">
              {typedCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-raised px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm text-ink-primary">{cert.name}</p>
                    {cert.provider && <p className="text-xs text-ink-tertiary">{cert.provider}</p>}
                  </div>
                  <span className="font-mono text-xs text-ink-tertiary">{CERT_STATUS_LABEL[cert.status]}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
