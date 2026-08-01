import type { CalendarEventType } from "@/lib/calendar";

// Single source for label/color/order so the legend, the grid dots, and the
// detail panel's grouping always agree with each other.
export const EVENT_TYPE_ORDER: CalendarEventType[] = [
  "assignment",
  "certification",
  "networking",
  "law_school",
  "scholarship",
  "milestone",
  "lsat_test_date",
];

export const EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  assignment: "Assignment",
  certification: "Certification",
  networking: "Networking",
  law_school: "Law school deadline",
  scholarship: "Scholarship deadline",
  milestone: "Milestone",
  lsat_test_date: "LSAT test date",
};

export const EVENT_DOT_CLASS: Record<CalendarEventType, string> = {
  assignment: "bg-signal",
  certification: "bg-seal",
  networking: "bg-ink-secondary",
  law_school: "bg-accent",
  scholarship: "bg-accent-bright",
  milestone: "bg-signal-bright",
  lsat_test_date: "bg-seal-bright",
};
