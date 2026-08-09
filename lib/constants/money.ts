import type { Currency } from "@prisma/client";

/** Max absolute value for @db.Decimal(14, 2) money columns. */
export const MAX_MONEY = 999_999_999_999.99;

export const CURRENCIES = ["LKR", "USD"] as const satisfies readonly Currency[];

export type MoneyCurrency = (typeof CURRENCIES)[number];
