import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Degree, DegreeStatus } from "@/types/database.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// `new Date("yyyy-MM-dd")` parses as UTC midnight, which can roll back a
// day once formatted in a negative-UTC-offset timezone — use this for any
// plain `date` column (deadlines, exam dates, etc.) instead.
export function formatDateOnly(dateString: string): string {
  const parts = dateString.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  return new Date(year, month - 1, day).toLocaleDateString();
}

const DEGREE_STATUS_RANK: Record<DegreeStatus, number> = {
  active: 0,
  planned: 1,
  paused: 2,
  completed: 3,
};

// Active first, then planned, then paused/completed — stable within each
// group so newly added degrees keep appearing in creation order.
export function sortDegrees<T extends Pick<Degree, "status">>(degrees: T[]): T[] {
  return [...degrees].sort((a, b) => DEGREE_STATUS_RANK[a.status] - DEGREE_STATUS_RANK[b.status]);
}
