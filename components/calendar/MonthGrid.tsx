import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import { EVENT_DOT_CLASS } from "@/components/calendar/eventStyles";
import type { CalendarEvent } from "@/lib/calendar";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_DOTS_PER_DAY = 4;

export function MonthGrid({
  events,
  month,
  selectedDate,
  onSelectDate,
}: {
  events: CalendarEvent[];
  month: Date;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const existing = eventsByDate.get(event.date);
    if (existing) existing.push(event);
    else eventsByDate.set(event.date, [event]);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-3 md:p-4">
      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[10px] text-ink-tertiary">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate.get(dateKey) ?? [];
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const selected = selectedDate === dateKey;
          const shownDots = dayEvents.slice(0, MAX_DOTS_PER_DAY);
          const overflowCount = dayEvents.length - shownDots.length;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              className={cn(
                "flex aspect-square min-w-0 flex-col items-center gap-1 rounded-md border p-1 text-left transition-colors",
                selected
                  ? "border-signal bg-signal/10"
                  : today
                    ? "border-signal/50"
                    : "border-transparent hover:border-border-strong",
                !inMonth && "opacity-35"
              )}
            >
              <span className={cn("text-xs", today ? "font-medium text-signal-bright" : "text-ink-secondary")}>
                {format(day, "d")}
              </span>
              {shownDots.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-0.5">
                  {shownDots.map((event) => (
                    <span
                      key={event.id}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        event.overdue ? "bg-status-atRisk" : EVENT_DOT_CLASS[event.type]
                      )}
                    />
                  ))}
                  {overflowCount > 0 && <span className="text-[9px] leading-none text-ink-tertiary">+{overflowCount}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
