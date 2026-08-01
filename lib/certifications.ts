import type { Certification } from "@/types/database.types";

export interface NextCertificationExam {
  name: string;
  daysUntil: number;
}

function parseDateKey(dateKey: string): Date {
  // Not `new Date(dateKey)` — that parses "yyyy-MM-dd" as UTC midnight,
  // which rolls back a day in negative-UTC-offset timezones (same
  // gotcha documented in lib/utils.ts's formatDateOnly and reused from
  // lib/lsat.ts's daysUntilTest).
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

// Picks the nearest upcoming exam among active certifications. Returns
// null when nothing qualifies — the gauge that renders this shows an
// honest "no exam scheduled" state rather than a fabricated countdown.
export function nextCertificationExam(certifications: Certification[]): NextCertificationExam | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = certifications
    .filter((c) => (c.status === "studying" || c.status === "scheduled") && c.exam_date)
    .map((c) => ({ name: c.name, examDate: parseDateKey(c.exam_date!) }))
    .filter((c) => c.examDate.getTime() >= today.getTime())
    .sort((a, b) => a.examDate.getTime() - b.examDate.getTime());

  const next = upcoming[0];
  if (!next) return null;

  const daysUntil = Math.round((next.examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { name: next.name, daysUntil };
}
