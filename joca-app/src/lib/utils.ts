import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (timeStr: string) => {
  if (!timeStr) return "N/A";

  const [h, m] = timeStr.split(":");
  let hour = Number(h);

  const suffix = hour < 12 ? " a.m" : " p.m";

  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  return `${hour}:${m} ${suffix}`;
};

/** Parse a Strapi date (YYYY-MM-DD) as local midnight — not UTC. */
export function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Inclusive calendar-day voting window in America/Toronto (not server/browser TZ). */
export const VOTING_TIMEZONE = "America/Toronto";

/** YYYY-MM-DD for `date` in `timeZone` (lexicographically comparable). */
export function calendarDateInTimeZone(
  date: Date,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Inclusive voting window on America/Toronto calendar days.
 * UI and server must agree regardless of Vercel UTC or browser TZ.
 */
export function isWithinVotingWindow(
  votingDateStart: string,
  votingDateEnd: string,
  now: Date = new Date(),
): boolean {
  const today = calendarDateInTimeZone(now, VOTING_TIMEZONE);
  const start = votingDateStart.split("T")[0];
  const end = votingDateEnd.split("T")[0];
  return today >= start && today <= end;
}
