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
