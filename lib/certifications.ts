import { parseDateOnly } from "@/lib/utils";
import type { Certification } from "@/types/database.types";

export interface NextCertificationExam {
  name: string;
  daysUntil: number;
}

// Picks the nearest upcoming exam among active certifications. Returns
// null when nothing qualifies — the gauge that renders this shows an
// honest "no exam scheduled" state rather than a fabricated countdown.
export function nextCertificationExam(certifications: Certification[]): NextCertificationExam | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = certifications
    .filter((c) => (c.status === "studying" || c.status === "scheduled") && c.exam_date)
    .map((c) => ({ name: c.name, examDate: parseDateOnly(c.exam_date!) }))
    .filter((c) => c.examDate.getTime() >= today.getTime())
    .sort((a, b) => a.examDate.getTime() - b.examDate.getTime());

  const next = upcoming[0];
  if (!next) return null;

  const daysUntil = Math.round((next.examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { name: next.name, daysUntil };
}
