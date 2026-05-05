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
export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
};
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
