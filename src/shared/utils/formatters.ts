import { DEFAULT_CURRENCY, DEFAULT_LANGUAGE } from "@/shared/i18n/config";

export function formatMoney(amount: number, locale: string = DEFAULT_LANGUAGE): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateLabel(
  date: Date,
  locale: string = DEFAULT_LANGUAGE,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatTimeLabel(
  date: Date,
  locale: string = DEFAULT_LANGUAGE,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...options,
  }).format(date);
}
