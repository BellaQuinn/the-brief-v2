"use client";

import { useState } from "react";
import Link from "next/link";
import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WorkspaceHeader } from "@/components/layout/WorkspaceHeader";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { EVENT_DOT_CLASS, EVENT_TYPE_LABEL, EVENT_TYPE_ORDER } from "@/components/calendar/eventStyles";
import { cn } from "@/lib/utils";
import { parseDateKey, type CalendarEvent } from "@/lib/calendar";

export function CalendarClient({
  events,
  eyebrow = "CALENDAR",
}: {
  events: CalendarEvent[];
  eyebrow?: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const selectedEvents = events.filter((event) => event.date === selectedDate);
  const groupedEvents = EVENT_TYPE_ORDER.map((type) => ({
    type,
    events: selectedEvents.filter((event) => event.type === type),
  })).filter((group) => group.events.length > 0);

  return (
    <div>
      <WorkspaceHeader
        eyebrow={eyebrow}
        title="Your timeline"
        subtitle="Assignments, certification exams, and networking events — all in one place."
      />

      <div className="mx-auto w-full max-w-[1120px] space-y-4 px-4 py-6 md:px-8 lg:py-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
          {EVENT_TYPE_ORDER.map((type) => (
            <span key={type} className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", EVENT_DOT_CLASS[type])} />
              {EVENT_TYPE_LABEL[type]}
            </span>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,680px)_minmax(260px,320px)] lg:items-start lg:justify-center">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth((month) => subMonths(month, 1))}
                aria-label="Previous month"
                className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="font-display text-base font-medium text-ink-primary">{format(currentMonth, "MMMM yyyy")}</h2>
              <button
                onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
                aria-label="Next month"
                className="rounded-md p-1.5 text-ink-tertiary transition-colors hover:bg-surface-raised hover:text-ink-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <MonthGrid events={events} month={currentMonth} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

        <aside className="rounded-card border border-border bg-surface p-4 lg:sticky lg:top-8 lg:min-h-[220px]">
          <p className="eyebrow mb-3">{format(parseDateKey(selectedDate), "MMMM d, yyyy")}</p>
          {groupedEvents.length === 0 ? (
            <p className="text-sm text-ink-tertiary">Nothing scheduled.</p>
          ) : (
            <div className="space-y-4">
              {groupedEvents.map(({ type, events: typeEvents }) => (
                <div key={type}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
                    <span className={cn("h-1.5 w-1.5 rounded-full", EVENT_DOT_CLASS[type])} />
                    {EVENT_TYPE_LABEL[type]}
                  </p>
                  <ul className="space-y-1.5">
                    {typeEvents.map((event) => (
                      <li key={event.id}>
                        <Link
                          href={event.href}
                          className="-mx-2 block rounded-md px-2 py-1.5 transition-colors hover:bg-surface-raised"
                        >
                          <p className={cn("text-sm text-ink-primary", event.overdue && "text-status-atRisk")}>
                            {event.title}
                          </p>
                          {(event.subtitle || event.degreeName || event.dueTime) && (
                            <p className="text-xs text-ink-tertiary">
                              {[event.subtitle, event.degreeName, event.dueTime && `Due ${event.dueTime}`]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </aside>
        </div>
      </div>
    </div>
  );
}
