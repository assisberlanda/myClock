"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useEmployeeStore } from "@/application/store/useEmployeeStore";
import { useEffect, useState } from "react";
import { CalculateWeeklyPayrollUseCase } from "@/application/useCases/CalculateWeeklyPayrollUseCase";
import { TimeEntryRepository } from "@/infrastructure/repositories/TimeEntryRepository";
import { WeeklyReport } from "@/shared/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SummaryCard } from "@/components/design-system/SummaryCard";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { formatDateLabel, formatMoney } from "@/shared/utils/formatters";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("Navigation");
  const tDashboard = useTranslations("Dashboard");
  const locale = useLocale();
  const { currentEmployee } = useEmployeeStore();
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);

  const handleDeleteEntry = async (date: string) => {
    if (!currentEmployee) return;
    
    if (confirm(`Tem certeza que deseja excluir o registro do dia ${date}?`)) {
      const repo = new TimeEntryRepository();
      await repo.deleteByDate(currentEmployee.id, date);
      
      // Refresh the weekly report
      const useCase = new CalculateWeeklyPayrollUseCase(repo);
      const report = await useCase.execute(currentEmployee.id, currentEmployee.hourlyRate, currentEmployee.shiftStartTime, new Date());
      setWeeklyReport(report);
    }
  };

  useEffect(() => {
    if (currentEmployee) {
      const repo = new TimeEntryRepository();
      const useCase = new CalculateWeeklyPayrollUseCase(repo);
      
      useCase.execute(currentEmployee.id, currentEmployee.hourlyRate, currentEmployee.shiftStartTime, new Date())
        .then((report) => setWeeklyReport(report));
    }
  }, [currentEmployee]);

  if (!currentEmployee) {
    return (
      <div className="container max-w-6xl mx-auto p-4 flex flex-col items-center justify-center h-[70vh]">
        <p className="text-muted-foreground mb-4">{tDashboard("welcomeTitle")}</p>
        <p className="text-sm text-center mb-6">{tDashboard("welcomeSubtitle")}</p>
        <button onClick={() => window.location.href = "/settings"} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">{tDashboard("setupProfile")}</button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:py-6 space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-sm text-muted-foreground">{tDashboard("helloUser", { name: currentEmployee.fullName })}</p>
      </div>

      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">{tDashboard("estimatedGrossPay")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formatMoney(weeklyReport?.totalGrossPay || 0, locale)}</div>
            <p className="text-xs text-blue-200 mt-1">{tDashboard("thisWeek", { weekNumber: weeklyReport?.weekNumber ?? "-" })}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            title={tDashboard("normalHours")}
            value={`${weeklyReport ? (weeklyReport.totalNormalMinutes / 60).toFixed(1) : "0.0"}h`}
          />
          <SummaryCard
            title={tDashboard("overtimeAShort")}
            value={`${weeklyReport ? (Math.floor((weeklyReport.totalOvertimeAMinutes / 60) * 10) / 10).toFixed(1) : "0.0"}h`}
          />
          <SummaryCard
            title={tDashboard("overtimeBShort")}
            value={`${weeklyReport ? (Math.floor((weeklyReport.totalOvertimeBMinutes / 60) * 10) / 10).toFixed(1) : "0.0"}h`}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">{tDashboard("weeklyBreakdown")}</h2>
        <div className="space-y-3">
          {weeklyReport?.payroll.map((day, index) => (
            <div 
              key={`${day.date}-${index}`} 
              className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded-lg border shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => window.location.href = `/clock?tab=date&date=${day.date}`}
            >
              <div>
                <p className="font-medium">
                  {formatDateLabel(new Date(`${day.date}T12:00:00`), locale, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tDashboard("normalShort")}: {(day.normalMinutes / 60).toFixed(1)}h
                  {(day.overtimeAMinutes > 0 || day.overtimeBMinutes > 0) && (
                    <span className="text-amber-600 ml-2">
                      {tDashboard("overtimeShort")}: {(Math.floor(((day.overtimeAMinutes + day.overtimeBMinutes) / 60) * 10) / 10).toFixed(1)}h
                    </span>
                  )}
                </p>
                {day.overtimeAMinutes + day.overtimeBMinutes > 0 ? (
                  <StatusBadge status="warning" label={tDashboard("overtimeActive")} />
                ) : null}
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="font-semibold">{formatMoney(day.grossPay, locale)}</div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteEntry(day.date)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {(!weeklyReport?.payroll || weeklyReport.payroll.length === 0) && (
            <p className="text-sm text-center text-muted-foreground py-4">{tDashboard("noEntriesThisWeek")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
