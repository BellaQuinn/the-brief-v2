import type { CalendarEventType } from "@/lib/calendar";

// Single source for label/color/order so the legend, the grid dots, and the
// detail panel's grouping always agree with each other.
export const EVENT_TYPE_ORDER: CalendarEventType[] = ["assignment", "certification", "networking"];

export const EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  assignment: "Assignment",
  certification: "Certification",
  networking: "Networking",
};

export const EVENT_DOT_CLASS: Record<CalendarEventType, string> = {
  assignment: "bg-signal",
  certification: "bg-seal",
  networking: "bg-ink-secondary",
};
