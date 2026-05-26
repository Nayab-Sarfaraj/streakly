import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekStart(date: dayjs.Dayjs): dayjs.Dayjs {
  const day = date.day();
  const diff = day === 0 ? -6 : 1 - day;
  return date.add(diff, "day");
}

export function getScoreColor(score: number): string {
  if (score === 0) return "hsl(0 0% 6%)";
  if (score < 30) return "hsl(0 0% 10%)";
  if (score < 60) return "hsl(0 0% 16%)";
  if (score < 80) return "hsl(0 0% 22%)";
  return "hsl(0 0% 32%)";
}
