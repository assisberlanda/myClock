import { describe, expect, it } from "vitest";
import { escapeCsvValue, isDateInHistoryFilter } from "./historyFilters";

describe("historyFilters", () => {
  it("filtra por semana corretamente", () => {
    expect(
      isDateInHistoryFilter("2026-04-21", {
        mode: "week",
        weekDate: "2026-04-20",
        monthDate: "2026-04",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      })
    ).toBe(true);

    expect(
      isDateInHistoryFilter("2026-04-28", {
        mode: "week",
        weekDate: "2026-04-20",
        monthDate: "2026-04",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      })
    ).toBe(false);
  });

  it("filtra por mes corretamente", () => {
    expect(
      isDateInHistoryFilter("2026-04-12", {
        mode: "month",
        weekDate: "2026-04-20",
        monthDate: "2026-04",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      })
    ).toBe(true);

    expect(
      isDateInHistoryFilter("2026-05-01", {
        mode: "month",
        weekDate: "2026-04-20",
        monthDate: "2026-04",
        startDate: "2026-04-01",
        endDate: "2026-04-30",
      })
    ).toBe(false);
  });

  it("escapa valores CSV com aspas", () => {
    expect(escapeCsvValue('foo "bar"')).toBe('"foo ""bar"""');
  });
});
