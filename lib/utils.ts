import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStartOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getStartOfLastMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

export function getEndOfLastMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 0);
}

export function formatBytes(value: number) {
  if (value == null || isNaN(value)) return "0 B";

  const abs = Math.abs(value);

  if (abs >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)} TB`;
  }
  if (abs >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)} GB`;
  }
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} MB`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(2)} KB`;
  }

  return `${value.toFixed(0)} B`;
}
export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
//formatting number
export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
// formatting number with decimals
export function formatNumberDecimal(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
export const formatDate = (date: Date | string) => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  return new Date(date).toLocaleDateString("en-CA", options);
};
export const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};
export let jobProgress = 0;
export let isRunning = false;

export function setRunning(value: boolean) {
  isRunning = value;
}

export function incrementProgress(amount: number) {
  jobProgress += amount;
}

export function resetProgress() {
  jobProgress = 0;
}

export const formatMonthYear = (file: string) => {
  // match YYYY-MM-DD from path
  const match = file.match(/\d{4}-\d{2}-\d{2}/);

  if (!match) return file;

  const date = new Date(match[0]);

  return date.toLocaleDateString("en-US", {
    month: "long",
    // day: "numeric",
    year: "numeric",
  });
};

export const percentile = (arr: number[], p: number) => {
  if (!arr.length) return 0;

  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;

  return sorted[index] ?? 0;
};

export const oneEncode = (value: string): string => {
  return btoa(value);
};
export const tripleEncode = (value: string): string => {
  return btoa(btoa(btoa(value)));
};
export const oneDecode = (value: string): string => {
  return atob(value);
};
export const tripleDecode = (value: string): string => {
  return atob(atob(atob(value)));
};

export function isWithinDateRange(
  consumptionDay: string,
  startDate?: Date,
  endDate?: Date,
): boolean {
  // Parse date-only values as local dates to avoid UTC shifts.
  const parts = consumptionDay.slice(0, 10).split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return false;
  }

  const rowDate = new Date(parts[0], parts[1] - 1, parts[2]);

  const start = startDate
    ? new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      )
    : null;

  const end = endDate
    ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    : null;

  if (start && rowDate < start) return false;

  // Inclusive end date, even if endDate has a time component.
  if (end && rowDate > end) return false;

  return true;
}
