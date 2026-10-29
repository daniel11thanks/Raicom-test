import type { SubscriptionItem } from "../api/types";

// Same value and arithmetic as src/api/mockApi.ts, so the date previewed in the dialog is exactly
// the instant the server returns after the skip. Do not switch this to setDate: it would drift on DST.
const DAY_MS = 24 * 60 * 60 * 1000;

/** The next charge after skipping `shipments` shipments (default 1: exactly what the server returns after one skip). */
export function nextChargeAfterSkip(nextChargeAt: string, intervalDays: number, shipments = 1): string {
  // One multiplication of integers is exact, so this equals `shipments` skips applied one after another.
  return new Date(Date.parse(nextChargeAt) + shipments * intervalDays * DAY_MS).toISOString();
}

/** "Fri, Nov 6" for upcoming dates, "Oct 19" otherwise. The year is added when it is not the current one. */
export function formatDate(iso: string, options: { weekday?: boolean } = {}): string {
  const date = new Date(iso);
  const showYear = date.getFullYear() !== new Date().getFullYear();
  return new Intl.DateTimeFormat("en-US", {
    weekday: options.weekday ? "short" : undefined,
    month: "short",
    day: "numeric",
    year: showYear ? "numeric" : undefined,
  }).format(date);
}

export function lineTotalCents(item: SubscriptionItem): number {
  return item.unitPriceCents * item.quantity;
}

export function subtotalCents(items: SubscriptionItem[]): number {
  return items.reduce((sum, item) => sum + lineTotalCents(item), 0);
}
