import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateTime(date: string | Date | null | undefined) {
  if (!date) return "-";
  return format(new Date(date), "MMM d, yyyy HH:mm");
}

export function formatCurrency(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "-";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
