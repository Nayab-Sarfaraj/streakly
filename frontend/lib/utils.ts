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
  if (score === 0) return "hsl(0 0% 6%)";          // no data — near-black
  if (score < 25)  return "hsl(0 72% 14%)";         // very low — dark red
  if (score < 50)  return "hsl(25 80% 18%)";        // low — dark orange
  if (score < 75)  return "hsl(43 85% 20%)";        // moderate — dark amber
  if (score < 90)  return "hsl(142 60% 18%)";       // good — dark green
  return           "hsl(142 70% 26%)";              // excellent — bright green
}
