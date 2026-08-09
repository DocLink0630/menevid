import type { Currency } from "@prisma/client";

export const EMPTY = "-";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return EMPTY;
  return new Date(date).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: Currency = "LKR",
): string {
  if (amount === null || amount === undefined) return EMPTY;
  const locale = currency === "USD" ? "en-US" : "en-LK";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

export function daysUntil(date: Date | string): number {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
