import { format } from "date-fns";
import type {
  AssignmentWithDegreeContext,
  Certification,
  LawSchool,
  Milestone,
  NetworkingContact,
  Scholarship,
} from "@/types/database.types";

export type CalendarEventType =
  | "assignment"
  | "certification"
  | "networking"
  | "law_school"
  | "scholarship"
  | "milestone"
  | "lsat_test_date";

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
    lawSchools?: LawSchool[];
    scholarships?: Scholarship[];
    milestones?: Milestone[];
    lsatPlannedTestDate?: string | null;
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

  // Graduate & Law School dates. Excludes statuses where the date is
  // already moot (rejected/enrolled, declined/awarded, completed) --
  // showing a deadline reminder for a decision that's already made
  // doesn't answer "what does my future look like."
  const lawSchoolEvents: CalendarEvent[] = (input.lawSchools ?? [])
    .filter((s) => s.application_deadline && s.status !== "rejected" && s.status !== "enrolled")
    .map((s) => ({
      id: s.id,
      date: s.application_deadline!,
      type: "law_school",
      title: s.school_name,
      subtitle: "Application deadline",
      href: `${basePath}/academics/graduate-law-school/schools`,
    }));

  const scholarshipEvents: CalendarEvent[] = (input.scholarships ?? [])
    .filter((s) => s.deadline && s.status !== "declined" && s.status !== "awarded")
    .map((s) => ({
      id: s.id,
      date: s.deadline!,
      type: "scholarship",
      title: s.name,
      subtitle: "Scholarship deadline",
      href: `${basePath}/academics/graduate-law-school/scholarships`,
    }));

  const milestoneEvents: CalendarEvent[] = (input.milestones ?? [])
    .filter((m) => m.target_date && m.status !== "completed")
    .map((m) => ({
      id: m.id,
      date: m.target_date!,
      type: "milestone",
      title: m.title,
      subtitle: "Milestone",
      href: `${basePath}/academics/graduate-law-school/timeline`,
    }));

  const lsatTestDateEvents: CalendarEvent[] = input.lsatPlannedTestDate
    ? [
        {
          id: "lsat-planned-test-date",
          date: input.lsatPlannedTestDate,
          type: "lsat_test_date",
          title: "LSAT test date",
          href: `${basePath}/academics/graduate-law-school/lsat`,
        },
      ]
    : [];

  return [
    ...assignmentEvents,
    ...certificationEvents,
    ...networkingEvents,
    ...lawSchoolEvents,
    ...scholarshipEvents,
    ...milestoneEvents,
    ...lsatTestDateEvents,
  ].sort((a, b) => a.date.localeCompare(b.date));
}
