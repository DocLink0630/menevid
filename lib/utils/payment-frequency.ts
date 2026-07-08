/** Payment schedule frequency in months. */
export type PaymentFrequencyMonths = 1 | 3 | 4 | 6 | 12;

export const PAYMENT_FREQUENCIES: {
  value: PaymentFrequencyMonths;
  label: string;
}[] = [
  { value: 1, label: "Monthly" },
  { value: 3, label: "Quarterly" },
  { value: 4, label: "Every 4 months" },
  { value: 6, label: "Semi annual" },
  { value: 12, label: "Annual" },
];

/**
 * Encodes day-of-month (1-28) + frequency months into paymentDueDay
 * without a schema change. Legacy values 1-28 mean monthly.
 * Encoded: frequencyMonths * 100 + day (e.g. quarterly on day 1 => 301).
 */
export function encodePaymentDue(
  day: number,
  frequencyMonths: PaymentFrequencyMonths = 1,
): number {
  const safeDay = Math.min(28, Math.max(1, Math.trunc(day) || 1));
  const months = ([1, 3, 4, 6, 12] as const).includes(frequencyMonths)
    ? frequencyMonths
    : 1;
  return months * 100 + safeDay;
}

export function decodePaymentDue(value: number | null | undefined): {
  day: number;
  frequencyMonths: PaymentFrequencyMonths;
} {
  const n = Number(value) || 1;
  if (n <= 28) {
    return { day: n, frequencyMonths: 1 };
  }
  const day = n % 100;
  const months = Math.floor(n / 100);
  const frequencyMonths = ([1, 3, 4, 6, 12] as const).includes(
    months as PaymentFrequencyMonths,
  )
    ? (months as PaymentFrequencyMonths)
    : 1;
  return {
    day: day >= 1 && day <= 28 ? day : 1,
    frequencyMonths,
  };
}

export function paymentFrequencyLabel(
  frequencyMonths: PaymentFrequencyMonths,
): string {
  return (
    PAYMENT_FREQUENCIES.find((f) => f.value === frequencyMonths)?.label ??
    "Monthly"
  );
}
