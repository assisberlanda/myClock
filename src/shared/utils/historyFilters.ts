import { getWeek, getYear, isAfter, isBefore, parseISO } from "date-fns";

export type HistoryFilterMode = "week" | "month" | "range";

export interface HistoryFilterState {
  mode: HistoryFilterMode;
  weekDate: string;
  monthDate: string;
  startDate: string;
  endDate: string;
}

export function isDateInHistoryFilter(dateStr: string, filter: HistoryFilterState): boolean {
  const date = parseISO(dateStr);

  if (filter.mode === "week") {
    const target = parseISO(filter.weekDate);
    return (
      getWeek(date, { weekStartsOn: 1 }) === getWeek(target, { weekStartsOn: 1 }) &&
      getYear(date) === getYear(target)
    );
  }

  if (filter.mode === "month") {
    const [year, month] = filter.monthDate.split("-").map(Number);
    return getYear(date) === year && date.getMonth() + 1 === month;
  }

  const rangeStart = parseISO(filter.startDate);
  const rangeEnd = parseISO(filter.endDate);
  return !isBefore(date, rangeStart) && !isAfter(date, rangeEnd);
}

export function escapeCsvValue(value: string | number): string {
  return `"${String(value).replaceAll('"', '""')}"`;
}
