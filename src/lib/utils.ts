import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour < 6) return "night";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function daysBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getCurrentWeek(programStartDate: Date): number {
  const days = daysBetween(programStartDate, new Date());
  return Math.max(1, Math.floor(days / 7) + 1);
}

export function getCurrentPhase(week: number): string {
  if (week <= 4) return "Foundation Phase";
  if (week <= 8) return "Development Phase";
  if (week <= 12) return "Strength Phase";
  if (week <= 16) return "Hypertrophy Phase";
  if (week <= 20) return "Peak Phase";
  return "Maintenance Phase";
}

export function getTrainingDayLabel(dayOfWeek: number): string | null {
  const schedule: Record<number, string> = {
    1: "PUSH A",
    2: "PULL A",
    3: "LEGS A",
    4: "PUSH B",
    5: "PULL B",
    6: "LEGS B",
  };
  return schedule[dayOfWeek] || null;
}

export function isRestDay(): boolean {
  return new Date().getDay() === 0; // Sunday
}

export function getDayOfWeek(): number {
  const day = new Date().getDay();
  return day === 0 ? 7 : day; // Monday=1 ... Sunday=7
}
