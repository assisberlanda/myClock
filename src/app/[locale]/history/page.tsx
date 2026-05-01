"use client";

import { useLocale, useTranslations } from "next-intl";
import { LANGUAGE_TO_LOCALE } from "@/shared/i18n/config";
import { useEmployeeStore } from "@/application/store/useEmployeeStore";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { TimeEntryRepository } from "@/infrastructure/repositories/TimeEntryRepository";
import { CalculateWeeklyPayrollUseCase } from "@/application/useCases/CalculateWeeklyPayrollUseCase";
import { TimeEntry, WeeklyReport, DailyPayroll } from "@/shared/types";
import { Button } from "@/components/ui/button";
import {
  addWeeks,
  subWeeks,
  endOfMonth,
  format,
  getWeek,
  getYear,
  isAfter,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SummaryCard } from "@/components/design-system/SummaryCard";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { FormSection } from "@/components/design-system/FormSection";
import { escapeCsvValue, isDateInHistoryFilter } from "@/shared/utils/historyFilters";
import { formatDateLabel, formatMoney } from "@/shared/utils/formatters";
import { db, initializeDatabase } from "@/infrastructure/database/db";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Upload, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { APP_FULL_NAME } from "@/config/version";

type FilterMode = "week" | "month" | "range";

export default function HistoryPage() {
  const t = useTranslations("Navigation");
  const tHistory = useTranslations("History");
  const tDashboard = useTranslations("Dashboard");
  const locale = useLocale();
  const intlLocale = LANGUAGE_TO_LOCALE[locale as string] ?? locale;
  const { currentEmployee } = useEmployeeStore();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [historyPageOffset, setHistoryPageOffset] = useState(0);
  const [weekDate, setWeekDate] = useState<string>("");
  const [monthDate, setMonthDate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isImportingHistory, setIsImportingHistory] = useState(false);

  useEffect(() => {
    setWeekDate(format(new Date(), "yyyy-MM-dd"));
    setMonthDate(format(new Date(), "yyyy-MM"));
    setStartDate(format(new Date(), "yyyy-MM-01"));
    setEndDate(format(new Date(), "yyyy-MM-dd"));
  }, []);

  const buildMonthOptions = () => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: format(d, "yyyy-MM"),
        label: formatDateLabel(d, intlLocale, { month: "long", year: "numeric" }),
      });
    }
    return options;
  };

  const handleDeleteEntry = async (date: string) => {
    if (!currentEmployee) return;
    
    if (confirm(`Tem certeza que deseja excluir o registro do dia ${date}?`)) {
      const repo = new TimeEntryRepository();
      await repo.deleteByDate(currentEmployee.id, date);
      setRefreshKey((value) => value + 1);
    }
  };

  useEffect(() => {
    if (!currentEmployee) return;

    const fetchReports = async () => {
      const repo = new TimeEntryRepository();
      const useCase = new CalculateWeeklyPayrollUseCase(repo);
      const generatedReports: WeeklyReport[] = [];
      const reportKeys = new Set<string>();

      const includeReport = async (dateInWeek: Date) => {
        const weekNumber = getWeek(dateInWeek, { weekStartsOn: 1 });
        const year = getYear(dateInWeek);
        const key = `${year}-${weekNumber}`;
        if (reportKeys.has(key)) return;

        const report = await useCase.execute(
          currentEmployee.id,
          currentEmployee.hourlyRate,
          currentEmployee.shiftStartTime,
          dateInWeek
        );
        if (report.entries.length > 0 || filterMode === "week") {
          reportKeys.add(key);
          generatedReports.push(report);
        }
      };

      if (filterMode === "week") {
        await includeReport(parseISO(weekDate));
      } else if (filterMode === "month") {
        const [year, month] = monthDate.split("-").map(Number);
        const monthStart = startOfMonth(new Date(year, month - 1, 1));
        const monthEnd = endOfMonth(monthStart);
        // Show 8 weeks starting from the offset relative to the selected month
        let cursor = startOfWeek(subWeeks(monthEnd, (historyPageOffset * 8) + 7), { weekStartsOn: 1 });
        const limit = addWeeks(cursor, 7); // 8 weeks window without overlap
        while (!isAfter(cursor, limit)) {
          await includeReport(cursor);
          cursor = addWeeks(cursor, 1);
        }
      } else if (filterMode === "range") {
        let cursor = startOfWeek(parseISO(startDate), { weekStartsOn: 1 });
        const limit = parseISO(endDate);
        while (!isAfter(cursor, limit)) {
          await includeReport(cursor);
          cursor = addWeeks(cursor, 1);
        }
      }
      setReports(generatedReports.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.weekNumber - a.weekNumber;
      }));
    };

    fetchReports();
  }, [currentEmployee, filterMode, weekDate, monthDate, startDate, endDate, historyPageOffset, refreshKey]);

  const getVisibleReport = (report: WeeklyReport): WeeklyReport => {
    if (filterMode === "range") {
      const filteredEntries = report.entries.filter(entry => 
        isDateInHistoryFilter(entry.date, { mode: filterMode, weekDate, monthDate, startDate, endDate })
      );
      // We need to recalculate payroll for only these entries
      const repo = new TimeEntryRepository();
      const useCase = new CalculateWeeklyPayrollUseCase(repo);
      // This is a bit expensive but ensures consistency in range view
      // For simplicity, we'll just filter the existing payroll by date
      const filteredPayroll = report.payroll.filter(p => 
        isDateInHistoryFilter(p.date, { mode: filterMode, weekDate, monthDate, startDate, endDate })
      );
      return {
        ...report,
        entries: filteredEntries,
        payroll: filteredPayroll,
        totalGrossPay: filteredPayroll.reduce((sum, p) => sum + p.grossPay, 0),
        totalNormalMinutes: filteredPayroll.reduce((sum, p) => sum + p.normalMinutes, 0),
        totalOvertimeAMinutes: filteredPayroll.reduce((sum, p) => sum + p.overtimeAMinutes, 0),
        totalOvertimeBMinutes: filteredPayroll.reduce((sum, p) => sum + p.overtimeBMinutes, 0),
      };
    }
    return report;
  };

  const getFilterLabel = () => {
    if (filterMode === "week") return tHistory("filterWeek");
    if (filterMode === "month") return tHistory("filterMonth");
    return tHistory("filterRange");
  };

  const generatePDF = (report: WeeklyReport) => {
    if (!currentEmployee) return;
    const visible = getVisibleReport(report);
    if (visible.payroll.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(tHistory("pdfTitle"), 14, 20);
    doc.setFontSize(11);
    doc.text(`${tHistory("pdfEmployee")}: ${currentEmployee.fullName} (${currentEmployee.employeeNumber})`, 14, 28);
    doc.text(`${tHistory("pdfFilter")}: ${getFilterLabel()}`, 14, 34);
    doc.text(`${tHistory("pdfWeek")}: ${visible.weekNumber}/${visible.year}`, 14, 40);
    doc.text(`${tHistory("pdfHourlyRate")}: ${formatMoney(currentEmployee.hourlyRate, intlLocale)}`, 14, 46);

    // Summary box
    const ratePerMinute = currentEmployee.hourlyRate / 60;
    
    // Recalcular os valores brutos para o PDF seguindo a nova regra de trunção dos extras
    const overtimeAGross = visible.payroll.reduce((sum, day) => {
       const truncated = Math.floor((day.overtimeAMinutes / 60) * 10) / 10;
       return sum + (truncated * currentEmployee.hourlyRate * 1.5);
    }, 0);
    
    const overtimeBGross = visible.payroll.reduce((sum, day) => {
       const truncated = Math.floor((day.overtimeBMinutes / 60) * 10) / 10;
       return sum + (truncated * currentEmployee.hourlyRate * 2.0);
    }, 0);
    
    const normalGross = visible.totalNormalMinutes * ratePerMinute;

    doc.setFillColor(240, 245, 255);
    doc.setDrawColor(200, 220, 255);
    doc.rect(115, 22, 80, 28, "FD");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 50, 150);
    doc.text(`${tHistory("grossPay")}: ${formatMoney(visible.totalGrossPay, intlLocale)}`, 120, 30);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(`${tDashboard("normalHours")}: ${(visible.totalNormalMinutes / 60).toFixed(1)}h - ${formatMoney(normalGross, intlLocale)}`, 120, 37);
    doc.text(`${tDashboard("overtimeA")}: ${(Math.floor((visible.totalOvertimeAMinutes / 60) * 10) / 10).toFixed(1)}h - ${formatMoney(overtimeAGross, intlLocale)}`, 120, 42);
    
    doc.setTextColor(0, 100, 0); // Dark Green for Extra B
    doc.text(`${tDashboard("overtimeB")}: ${(Math.floor((visible.totalOvertimeBMinutes / 60) * 10) / 10).toFixed(1)}h - ${formatMoney(overtimeBGross, intlLocale)}`, 120, 47);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    const tableData = visible.payroll.map((day) => {
      const entry = visible.entries.find((e) => e.date === day.date);
      return [
        formatDateLabel(parseISO(day.date), intlLocale, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        entry?.clockIn || "-",
        entry?.breakStart || "-",
        entry?.breakEnd || "-",
        entry?.clockOut || "-",
        (day.normalMinutes / 60).toFixed(1),
        (Math.floor((day.overtimeAMinutes / 60) * 10) / 10).toFixed(1),
        (Math.floor((day.overtimeBMinutes / 60) * 10) / 10).toFixed(1),
        formatMoney(day.grossPay, locale),
      ];
    });

    autoTable(doc, {
      startY: 55,
      head: [
        [
          tHistory("tableDate"),
          tHistory("tableClockIn"),
          tHistory("tableBreakStart"),
          tHistory("tableBreakEnd"),
          tHistory("tableClockOut"),
          tDashboard("normalShort"),
          tHistory("tableOvertimeA"),
          tHistory("tableOvertimeB"),
          tHistory("tableGrossPay"),
        ],
      ],
      body: tableData,
      headStyles: { fillColor: [0, 50, 150] },
      alternateRowStyles: { fillColor: [245, 250, 255] },
    });

    doc.save(`${APP_FULL_NAME}_${currentEmployee.fullName}_${visible.weekNumber}_${visible.year}.pdf`);
  };

  const generateCSV = (report: WeeklyReport) => {
    const visible = getVisibleReport(report);
    const headers = [
      tHistory("tableDate"),
      tHistory("tableClockIn"),
      tHistory("tableBreakStart"),
      tHistory("tableBreakEnd"),
      tHistory("tableClockOut"),
      tDashboard("normalHours"),
      tHistory("tableOvertimeA"),
      tHistory("tableOvertimeB"),
      tHistory("tableGrossPay"),
    ];

    const rows = [
      headers.map(escapeCsvValue).join(","),
      ...visible.payroll.map((day) => {
        const entry = visible.entries.find((e) => e.date === day.date);
        return [
          day.date,
          entry?.clockIn ?? "",
          entry?.breakStart ?? "",
          entry?.breakEnd ?? "",
          entry?.clockOut ?? "",
          (day.normalMinutes / 60).toFixed(1),
          (Math.floor((day.overtimeAMinutes / 60) * 10) / 10).toFixed(1),
          (Math.floor((day.overtimeBMinutes / 60) * 10) / 10).toFixed(1),
          day.grossPay.toFixed(2),
        ].map(escapeCsvValue).join(",");
      }),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${APP_FULL_NAME}_${currentEmployee?.fullName}_${visible.weekNumber}_${visible.year}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string, duration = 3500) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const exportFilteredHistory = async () => {
    if (!currentEmployee) return;

    try {
      // Initialize database before exporting
      await initializeDatabase();
    } catch (error) {
      console.error('Database initialization failed:', error);
      showToast('error', tHistory('exportErrorMessage') || 'Database error');
      return;
    }

    let entries: TimeEntry[] = [];
    let payroll: DailyPayroll[] = [];

    if (filterMode === "week") {
      try {
        const date = parseISO(weekDate);
        const weekNumber = getWeek(date, { weekStartsOn: 1 });
        const year = getYear(date);
        const report = reports.find(r => r.weekNumber === weekNumber && r.year === year);
        if (report) {
          entries = report.entries;
          payroll = report.payroll;
        }
      } catch (err) {
        entries = [];
        payroll = [];
      }
    } else if (filterMode === "month") {
      entries = reports.flatMap(r => r.entries).filter(e => e.date.startsWith(monthDate));
      payroll = reports.flatMap(r => r.payroll).filter(p => p.date.startsWith(monthDate));
    } else if (filterMode === "range") {
      entries = reports.flatMap(r => r.entries).filter(e => e.date >= startDate && e.date <= endDate);
      payroll = reports.flatMap(r => r.payroll).filter(p => p.date >= startDate && p.date <= endDate);
    }

    // Ensure unique by date
    const uniqueEntries = Object.values(entries.reduce((acc, cur) => {
      acc[cur.date] = cur;
      return acc;
    }, {} as Record<string, TimeEntry>));

    const uniquePayroll = Object.values(payroll.reduce((acc, cur) => {
      acc[cur.date] = cur;
      return acc;
    }, {} as Record<string, DailyPayroll>));

    const payload = {
      meta: {
        filterMode,
        weekDate,
        monthDate,
        startDate,
        endDate,
        exportedAt: new Date().toISOString(),
        employee: currentEmployee ? { id: currentEmployee.id, fullName: currentEmployee.fullName } : undefined
      },
      entries: uniqueEntries,
      payroll: uniquePayroll
    };

    try {
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      let filename = `${currentEmployee.fullName.replace(/\s+/g, "_")}`;
      if (filterMode === "week") {
        try {
          const date = parseISO(weekDate);
          const weekNumber = getWeek(date, { weekStartsOn: 1 });
          const year = getYear(date);
          filename = `${filename}_week_${weekNumber}_${year}.json`;
        } catch {
          filename = `${filename}_week.json`;
        }
      } else if (filterMode === "month") {
        filename = `${filename}_month_${monthDate}.json`;
      } else if (filterMode === "range") {
        filename = `${filename}_range_${startDate}_to_${endDate}.json`;
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('success', tHistory('exportSuccessMessage') || 'Export successful');
    } catch (err) {
      console.error('Export failed', err);
      showToast('error', tHistory('exportErrorMessage') || 'Export failed');
    }
  };

  const importFilteredHistory: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentEmployee) return;

    setIsImportingHistory(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        // Initialize database before importing
        await initializeDatabase();
        
        const content = JSON.parse(event.target?.result as string);
        let entriesToImport: any[] = [];
        if (Array.isArray(content)) {
          entriesToImport = content;
        } else if (content && Array.isArray(content.entries)) {
          entriesToImport = content.entries;
        }

        if (entriesToImport.length > 0) {
          const repo = new TimeEntryRepository();
          let importedCount = 0;
          // Import only entries that are not already present for this employee
          for (const entry of entriesToImport) {
             try {
               const existing = await repo.getByDate(currentEmployee.id, entry.date);
               if (!existing) {
                 await repo.save({ ...entry, id: crypto.randomUUID(), employeeId: currentEmployee.id });
                 importedCount++;
               }
             } catch (saveError) {
               console.error(`Failed to import entry for date ${entry.date}:`, saveError);
             }
          }
          setRefreshKey((v) => v + 1);
          showToast('success', `${tHistory('importSuccessMessage') || 'Import successful'} (${importedCount} entries)`);
        } else {
          showToast('error', tHistory('importErrorMessage') || 'No valid entries found in file');
        }
      } catch (error) {
        console.error("Failed to import history:", error);
        showToast('error', tHistory('importErrorMessage') || 'Import failed: Invalid file format');
      } finally {
        setIsImportingHistory(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      console.error("Failed to read file");
      showToast('error', tHistory('importErrorMessage') || 'Failed to read file');
      setIsImportingHistory(false);
    };
    reader.readAsText(file);
  };

  const visibleReports = reports.map(getVisibleReport).filter(r => r.payroll.length > 0);

  const [overrides, setOverrides] = useState<Record<string, { enabled: boolean; hourlyRate?: string; shiftStart?: string }>>({});

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const toggleOverride = (date: string, enabled: boolean, entryHourly?: number | undefined, entryShift?: string | undefined) => {
    setOverrides(prev => {
      const copy = { ...prev };
      if (!enabled) {
        delete copy[date];
      } else {
        copy[date] = {
          enabled: true,
          hourlyRate: entryHourly !== undefined ? String(entryHourly) : '',
          shiftStart: entryShift ?? ''
        };
      }
      return copy;
    });
  };

  const setOverrideField = (date: string, field: 'hourlyRate' | 'shiftStart', value: string) => {
    setOverrides(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || { enabled: true }),
        [field]: value
      }
    }));
  };

  const saveOverrideForDate = async (date: string) => {
    if (!currentEmployee) return;
    const ov = overrides[date];
    if (!ov || !ov.enabled) return;

    const repo = new TimeEntryRepository();
    const entry = await repo.getByDate(currentEmployee.id, date);
    if (!entry) return showToast('error', tHistory('importErrorMessage') || 'Entry not found');

    const hasHourly = ov.hourlyRate && ov.hourlyRate.trim() !== '';
    const hasShift = ov.shiftStart && ov.shiftStart.trim() !== '';

    if (!hasHourly || !hasShift) {
      const missing = [] as string[];
      if (!hasHourly) missing.push('valor da hora');
      if (!hasShift) missing.push('horário de turno');
      const confirmMessage = `Falta: ${missing.join(' e ')}. Deseja usar os valores padrão das configurações?`;
      const ok = confirm(confirmMessage);
      if (!ok) return; // user chose to cancel and edit
      // fill defaults
      if (!hasHourly) ov.hourlyRate = String(currentEmployee.hourlyRate);
      if (!hasShift) ov.shiftStart = currentEmployee.shiftStartTime;
    }

    // apply override and save
    const updated = {
      ...entry,
      overrideHourlyRate: ov.hourlyRate ? parseFloat(ov.hourlyRate) : currentEmployee.hourlyRate,
      overrideShiftStartTime: ov.shiftStart || currentEmployee.shiftStartTime
    };
    await repo.save(updated as any);
    setRefreshKey(v => v + 1);
    showToast('success', 'Override salvo com sucesso');
  };

  const removeOverrideForDate = async (date: string) => {
    if (!currentEmployee) return;
    const repo = new TimeEntryRepository();
    const entry = await repo.getByDate(currentEmployee.id, date);
    if (!entry) return;
    delete (entry as any).overrideHourlyRate;
    delete (entry as any).overrideShiftStartTime;
    await repo.save(entry as any);
    setOverrides(prev => { const c = { ...prev }; delete c[date]; return c; });
    setRefreshKey(v => v + 1);
    showToast('success', 'Override removido');
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 md:py-6 space-y-6 relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-xs rounded-md px-4 py-2 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("history")}</h1>
        <p className="text-sm text-muted-foreground">{tHistory("subtitle")}</p>
      </div>

      <FormSection title={tHistory("filterTitle")}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">{tHistory("filterMode")}</label>
            <div className="flex bg-muted p-1 rounded-md">
              <button
                onClick={() => setFilterMode("week")}
                className={`flex-1 text-sm h-9 flex items-center justify-center rounded-md transition-all ${filterMode === "week" ? "bg-background shadow-sm" : ""}`}
              >
                {tHistory("modeWeek")}
              </button>
              <button
                onClick={() => setFilterMode("month")}
                className={`flex-1 text-sm h-9 flex items-center justify-center rounded-md transition-all ${filterMode === "month" ? "bg-background shadow-sm" : ""}`}
              >
                {tHistory("modeMonth")}
              </button>
              <button
                onClick={() => setFilterMode("range")}
                className={`flex-1 text-sm h-9 flex items-center justify-center rounded-md transition-all ${filterMode === "range" ? "bg-background shadow-sm" : ""}`}
              >
                {tHistory("modeRange")}
              </button>
            </div>
          </div>

          <div className="space-y-2" suppressHydrationWarning>
            {filterMode === "week" && (
              <>
                <label className="text-sm font-medium">{tHistory("filterWeek")}</label>
                <input
                  suppressHydrationWarning
                  type="date"
                  value={weekDate}
                  onChange={(e) => setWeekDate(e.target.value)}
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </>
            )}

            {filterMode === "month" && (
              <>
                <label className="text-sm font-medium">{tHistory("filterMonth")}</label>
                <select
                  value={monthDate}
                  onChange={(e) => setMonthDate(e.target.value)}
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {buildMonthOptions().map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </>
            )}

            {filterMode === "range" && (
              <div className="flex gap-3">
                <div className="space-y-2 flex-1" suppressHydrationWarning>
                  <label className="text-sm font-medium">{tHistory("filterStart")}</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2 flex-1" suppressHydrationWarning>
                  <label className="text-sm font-medium">{tHistory("filterEnd")}</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 col-start-3 md:col-start-auto">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={importFilteredHistory}
                  disabled={isImportingHistory}
                />
                <Button type="button" variant="secondary" disabled={isImportingHistory} className="justify-center px-3" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {tHistory("importFilteredJson")}
                </Button>

                <Button type="button" variant="secondary" onClick={exportFilteredHistory} className="justify-center px-3">
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5L16.5 12M12 3v13.5" />
                  </svg>
                  {tHistory("exportFilteredJson")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{tHistory("title")}</h2>
        </div>
        {visibleReports.map((report) => {
          return (
            <div key={`${report.year}-${report.weekNumber}`} className="space-y-3">
              <SummaryCard
                        title={tHistory("weekLabel", { weekNumber: report.weekNumber, year: report.year })}
                value={formatMoney(report.totalGrossPay, intlLocale)}
                subtitle={`${tDashboard("normalHours")}: ${(report.totalNormalMinutes / 60).toFixed(1)}h`}
                actions={
                  <>
                    <div className="flex flex-wrap gap-2">
                      {report.totalOvertimeAMinutes > 0 && (
                        <StatusBadge status="warning" label={`${tDashboard("overtimeAShort")}: ${(Math.floor((report.totalOvertimeAMinutes / 60) * 10) / 10).toFixed(1)}h`} />
                      )}
                      {report.totalOvertimeBMinutes > 0 && (
                        <StatusBadge status="success" label={`${tDashboard("overtimeBShort")}: ${(Math.floor((report.totalOvertimeBMinutes / 60) * 10) / 10).toFixed(1)}h`} />
                      )}
                      {report.totalOvertimeAMinutes === 0 && report.totalOvertimeBMinutes === 0 && (
                        <StatusBadge status="success" label={tHistory("noOvertime")} />
                      )}
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => generateCSV(report)}>
                      {tHistory("exportCsv")}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => generatePDF(report)}>
                      {tHistory("exportPdf")}
                    </Button>
                  </>
                }
              />
              
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {report.payroll.map((day) => {
                      const entry = report.entries.find((e) => e.date === day.date);
                      if (!entry) return null;
                      const isPast = entry.date < todayStr;
                      const entryHasOverride = (entry as any).overrideHourlyRate !== undefined || (entry as any).overrideShiftStartTime !== undefined;
                      return (
                        <div key={day.date}>
                              <div className="p-3 grid grid-cols-2 md:grid-cols-8 gap-3 items-center text-xs" onClick={(e) => e.stopPropagation()}>
                                <div className="col-span-2 md:col-span-2">
                                  <div className="font-medium text-sm">
                                    {formatDateLabel(parseISO(entry.date), intlLocale, {
                                      weekday: "long",
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric"
                                    })}
                                  </div>
                                </div>


                                <div className="space-y-0.5">
                                  <div className="text-muted-foreground text-xs"><span className="font-semibold">{tHistory("tableClockIn")}:</span></div>
                                  <div className="font-medium">{entry.clockIn || "--:--"}</div>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="text-muted-foreground text-xs"><span className="font-semibold">{tHistory("tableBreakStart")}:</span></div>
                                  <div className="font-medium">{entry.breakStart || "--:--"} - {entry.breakEnd || "--:--"}</div>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="text-muted-foreground text-xs"><span className="font-semibold">{tHistory("tableClockOut")}:</span></div>
                                  <div className="font-medium">{entry.clockOut || "--:--"}</div>
                                </div>

                                {report.payroll.find(p => p.date === entry.date) && (
                                  <>
                                    <div className="space-y-0.5">
                                      <div className="text-muted-foreground text-xs font-semibold">{tHistory("hoursPerDay")}</div>
                                      <div className="font-bold text-green-600 dark:text-green-400">
                                        {Math.floor(report.payroll.find(p => p.date === entry.date)!.totalMinutes / 60)}h {report.payroll.find(p => p.date === entry.date)!.totalMinutes % 60}m
                                      </div>
                                    </div>

                                    <div className="space-y-0.5">
                                      <div className="text-muted-foreground text-xs font-semibold">{tHistory("breakDuration")}</div>
                                      <div className="font-bold text-red-600 dark:text-red-400">
                                        {report.payroll.find(p => p.date === entry.date)!.breakMinutes}m
                                      </div>
                                    </div>
                                  </>
                                )}

                                <div className="flex items-center gap-1 col-span-2 md:col-span-1 justify-between md:justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.location.href = `/clock?tab=date&date=${entry.date}`}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 w-7 p-0"
                                    title="Editar"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteEntry(entry.date)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                    title="Excluir"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <div className="font-bold text-sm min-w-[60px] text-right">{formatMoney(day.grossPay, intlLocale)}</div>
                                </div>
                              </div>

                              {/* override editor panel */}
                              { (overrides[entry.date]?.enabled || entryHasOverride) && (
                                <div className="p-3 bg-muted/10 border-t text-sm">
                                  <div className="flex flex-col md:flex-row gap-3 items-center">
                                    <div className="flex flex-col flex-1">
                                      <label className="text-xs text-muted-foreground">Valor da hora (EUR)</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        className="w-full h-9 rounded-md border border-input px-2 text-sm"
                                        value={overrides[entry.date]?.hourlyRate ?? ((entry as any).overrideHourlyRate ?? '')}
                                        onChange={(e) => setOverrideField(entry.date, 'hourlyRate', e.target.value)}
                                        placeholder={String(currentEmployee?.hourlyRate ?? '')}
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-xs text-muted-foreground">Horário do turno</label>
                                      <input
                                        type="time"
                                        className="h-9 rounded-md border border-input px-2 text-sm"
                                        value={overrides[entry.date]?.shiftStart ?? ((entry as any).overrideShiftStartTime ?? '')}
                                        onChange={(e) => setOverrideField(entry.date, 'shiftStart', e.target.value)}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="default" onClick={() => saveOverrideForDate(entry.date)}>Salvar</Button>
                                      <Button size="sm" variant="ghost" onClick={() => removeOverrideForDate(entry.date)}>Remover</Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );

})}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
        <div className="flex justify-end mt-4">
          <nav className="inline-flex items-center text-sm" aria-label={tHistory("filterTitle")}>
            <Button variant="ghost" size="sm" onClick={() => setHistoryPageOffset(o => Math.max(0, o - 1))} aria-label={tHistory("paginationPrev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm">{historyPageOffset + 1}</span>
            <Button variant="ghost" size="sm" onClick={() => setHistoryPageOffset(o => o + 1)} aria-label={tHistory("paginationNext")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>

        {visibleReports.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">{tHistory("noEntries")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
