import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = "PPP p") {
  if (!date) return "";
  return format(new Date(date), formatStr);
}

export function formatNumber(num: number | undefined | null, decimals: number = 2) {
  if (num === undefined || num === null) return "N/A";
  return num.toFixed(decimals);
}
