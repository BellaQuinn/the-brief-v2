import { format } from "date-fns";
import type { AssignmentWithContext } from "@/types/database.types";

export type MissionBriefStatus = "All clear" | "On track";

export interface MissionBriefData {
  status: MissionBriefStatus;
  situation: string;
  directive: string;
}

const SMALL_NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

function spellCount(n: number): string {
  return n < SMALL_NUMBERS.length ? SMALL_NUMBERS[n]! : String(n);
}

function capitalize(s: string): string {
  return `${s[0]!.toUpperCase()}${s.slice(1)}`;
}

// The brief states status before detail, and never claims something it
// can't check against real data (e.g. "nothing critical" is only said
// when no due-today item actually carries urgent priority).
function buildSituation(today: AssignmentWithContext[]): string {
  if (today.length === 0) {
    return "Nothing needs you today. That's the result of the last two weeks, not luck.";
  }
  const count = today.length;
  const noun = count === 1 ? "item is" : "items are";
  const hasUrgent = today.some((a) => a.priority === "urgent");
  const qualifier = hasUrgent ? "" : " — nothing urgent";
  return `${capitalize(spellCount(count))} ${noun} due today${qualifier}.`;
}

// Always names exactly one next action — silence is a feature, but going
// blank here would leave the user to infer what to do, which the voice
// rules don't allow. Ordered by what's actually true: a real upcoming
// deadline first, then real open work elsewhere, then a plain admission
// there's nothing on file to point to.
function buildDirective(
  upcoming: AssignmentWithContext[],
  openApplications: number,
  activeCerts: number
): string {
  const next = upcoming[0];
  if (next?.due_date) {
    // Not `new Date(next.due_date)` — that parses "yyyy-MM-dd" as UTC
    // midnight, which rolls back a day in negative-UTC-offset timezones
    // (same gotcha documented in lib/utils.ts's formatDateOnly).
    const [year, month, day] = next.due_date.split("-").map(Number);
    const weekday = format(new Date(year!, month! - 1, day!), "EEEE");
    return `Get ahead on ${next.title} before ${weekday}.`;
  }
  if (openApplications > 0) {
    return "Nothing on the horizon this week — a good time to check in on your open applications.";
  }
  if (activeCerts > 0) {
    return "Nothing on the horizon this week — a good time to make progress on your certification.";
  }
  return "Nothing on the horizon this week.";
}

export function buildMissionBrief(
  today: AssignmentWithContext[],
  upcoming: AssignmentWithContext[],
  openApplications: number,
  activeCerts: number
): MissionBriefData {
  return {
    status: today.length === 0 ? "All clear" : "On track",
    situation: buildSituation(today),
    directive: buildDirective(upcoming, openApplications, activeCerts),
  };
}
