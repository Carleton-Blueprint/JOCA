import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { gql } from "@apollo/client";

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
