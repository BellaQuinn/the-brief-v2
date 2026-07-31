import { format } from "date-fns";
import type { AssignmentWithDegreeContext, Certification, NetworkingContact } from "@/types/database.types";

export type CalendarEventType = "assignment" | "certification" | "networking";

export interface CalendarEvent {
  id: string;
  date: string; // yyyy-MM-dd, local calendar day
  type: CalendarEventType;
  title: string;
  subtitle?: string; // course code (assignments) / provider (certifications) / company (networking)
  degreeName?: string; // assignments only
  dueTime?: string; // assignments only, e.g. "11:59 PM" — due_date carries a time, exam/follow-up dates don't
  overdue?: boolean; // assignment due_date in the past and not submitted/graded
  href: string;
}

const DONE_ASSIGNMENT_STATUSES = new Set(["submitted", "graded"]);

// Turns a "yyyy-MM-dd" key back into a real local-time Date. Deliberately
// not `new Date(dateKey)` / `parseISO` — those parse as UTC midnight, which
// can roll back a day once formatted in a negative-UTC-offset timezone.
export function parseDateKey(dateKey: string): Date {
  const parts = dateKey.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return new Date(year, month - 1, day);
}

export function buildCalendarEvents(
  input: {
    assignments: AssignmentWithDegreeContext[];
    certifications: Certification[];
    networking: NetworkingContact[];
  },
  basePath: string
): CalendarEvent[] {
  const todayKey = format(new Date(), "yyyy-MM-dd");

  const assignmentEvents: CalendarEvent[] = input.assignments
    .filter((a) => a.due_date)
    .map((a) => {
      // due_date is a timestamptz — convert to the browser's local calendar
      // day rather than slicing the UTC string, or a late-night due time can
      // land on the wrong day.
      const due = new Date(a.due_date!);
      const dateKey = format(due, "yyyy-MM-dd");
      return {
        id: a.id,
        date: dateKey,
        type: "assignment",
        title: a.title,
        subtitle: a.course.course_code ?? a.course.course_name,
        degreeName: a.course.term.degree.degree_name,
        dueTime: format(due, "h:mm a"),
        overdue: dateKey < todayKey && !DONE_ASSIGNMENT_STATUSES.has(a.status),
        href: `${basePath}/academics`,
      };
    });

  const certificationEvents: CalendarEvent[] = input.certifications
    .filter((c) => c.exam_date)
    .map((c) => ({
      id: c.id,
      date: c.exam_date!, // plain `date` column — already yyyy-MM-dd, no timezone conversion needed
      type: "certification",
      title: c.name,
      subtitle: c.provider ?? undefined,
      href: `${basePath}/career`,
    }));

  const networkingEvents: CalendarEvent[] = input.networking
    .filter((n) => n.next_follow_up)
    .map((n) => ({
      id: n.id,
      date: n.next_follow_up!, // plain `date` column
      type: "networking",
      title: n.name,
      subtitle: n.company ?? undefined,
      href: `${basePath}/career`,
    }));

  return [...assignmentEvents, ...certificationEvents, ...networkingEvents].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}
