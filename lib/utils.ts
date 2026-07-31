import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Degree, DegreeStatus } from "@/types/database.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
