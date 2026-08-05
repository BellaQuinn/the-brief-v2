function formatter(
  timeZone: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat("en-US", { ...options, timeZone });
  } catch {
    return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" });
  }
}

export function operatorGreeting(date: Date, timeZone: string): string {
  const hour = Number(
    formatter(timeZone, { hour: "numeric", hourCycle: "h23" }).format(date)
  );

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function operatorDayLabel(date: Date, timeZone: string): string {
  return formatter(timeZone, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

// "What calendar day is it for the operator right now" as a yyyy-MM-dd
// key, independent of the server process's own system timezone. This
// matters more here than for the greeting above: a serverless function
// on Vercel runs in UTC by default, so a server-side `format(now,
// "yyyy-MM-dd")` would silently disagree with the operator's actual
// "today" for several hours around midnight in any negative-UTC
// timezone — exactly the wrong thing for the reminder cron's "is this
// due today" math (lib/notifications.ts).
export function operatorDateKey(date: Date, timeZone: string): string {
  const parts = formatter(timeZone, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    lookup[part.type] = part.value;
  }
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}
