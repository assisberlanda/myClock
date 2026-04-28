"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useEmployeeStore } from "@/application/store/useEmployeeStore";
import { useEffect, useState, Suspense } from "react";
import { format, parseISO } from "date-fns";
import { db, initializeDatabase } from "@/infrastructure/database/db";
import { TimeEntry } from "@/shared/types";
import { TimeEntryRepository } from "@/infrastructure/repositories/TimeEntryRepository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { formatDateLabel, formatTimeLabel } from "@/shared/utils/formatters";
import { useSearchParams } from "next/navigation";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";

function ClockPageContent() {
  const t = useTranslations("Navigation");
  const tClock = useTranslations("Clock");
  const tHistory = useTranslations("History");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { currentEmployee } = useEmployeeStore();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [todayEntry, setTodayEntry] = useState<TimeEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'date'>((searchParams.get('tab') as 'today' | 'date') || 'today');
  const [selectedDate, setSelectedDate] = useState<string>(searchParams.get('date') || format(new Date(), "yyyy-MM-dd"));
  const [dateEntry, setDateEntry] = useState<TimeEntry | null>(null);
  const [originalDate, setOriginalDate] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'clockIn' | 'breakStart' | 'breakEnd' | 'clockOut' | null>(null);
  const [tempValues, setTempValues] = useState<Partial<TimeEntry>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [overrideHourlyRate, setOverrideHourlyRate] = useState<string>('');
  const [overrideShiftStart, setOverrideShiftStart] = useState<string>('');

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const tabParam = searchParams.get('tab');
    if (dateParam) setSelectedDate(dateParam);
    if (tabParam === 'date' || tabParam === 'today') setActiveTab(tabParam);
  }, [searchParams]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initializeAndLoadData = async () => {
      try {
        await initializeDatabase();
        if (currentEmployee) {
          const today = format(new Date(), "yyyy-MM-dd");
          db.timeEntries
            .where("[employeeId+date]")
            .equals([currentEmployee.id, today])
            .first()
            .then((entry) => {
              if (entry) {
                setTodayEntry(entry);
              } else {
                setTodayEntry(null);
              }
            })
            .catch((error) => {
              console.error('Error loading today entry:', error);
              setTodayEntry(null);
            });
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        setTodayEntry(null);
      }
    };
    
    initializeAndLoadData();
  }, [currentEmployee, refreshKey]);

  useEffect(() => {
    const loadDateEntry = async () => {
      try {
        await initializeDatabase();
        if (currentEmployee && selectedDate) {
          db.timeEntries
            .where("[employeeId+date]")
            .equals([currentEmployee.id, selectedDate])
            .first()
            .then((entry) => {
              if (entry) {
                setDateEntry(entry);
                setOriginalDate(selectedDate);
                setOverrideEnabled(!!(entry as any).overrideHourlyRate || !!(entry as any).overrideShiftStartTime);
                setOverrideHourlyRate((entry as any).overrideHourlyRate ? String((entry as any).overrideHourlyRate) : '');
                setOverrideShiftStart((entry as any).overrideShiftStartTime || '');
              } else {
                setDateEntry(null);
                setOriginalDate(null);
                setOverrideEnabled(false);
                setOverrideHourlyRate('');
                setOverrideShiftStart('');
              }
            })
            .catch((error) => {
              console.error('Error loading date entry:', error);
              setDateEntry(null);
              setOriginalDate(null);
              setOverrideEnabled(false);
              setOverrideHourlyRate('');
              setOverrideShiftStart('');
            });
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        setDateEntry(null);
        setOriginalDate(null);
        setOverrideEnabled(false);
        setOverrideHourlyRate('');
        setOverrideShiftStart('');
      }
    };
    
    loadDateEntry();
  }, [currentEmployee, selectedDate, refreshKey]);

  const handleAction = async (action: 'clockIn' | 'breakStart' | 'breakEnd' | 'clockOut') => {
    if (!currentEmployee) return;

    const today = format(new Date(), "yyyy-MM-dd");
    const nowHHmm = format(new Date(), "HH:mm");

    let entry = await db.timeEntries
      .where("[employeeId+date]")
      .equals([currentEmployee.id, today])
      .first();

    if (!entry) {
      entry = {
        id: crypto.randomUUID(),
        employeeId: currentEmployee.id,
        date: today,
        clockIn: null,
        breakStart: null,
        breakEnd: null,
        clockOut: null,
      };
    }

    entry[action] = nowHHmm;

    await db.timeEntries.put(entry);
    setTodayEntry(entry);
    setRefreshKey(prev => prev + 1);
  };

  const handleDateAction = async (action: 'clockIn' | 'breakStart' | 'breakEnd' | 'clockOut', time?: string) => {
    if (!currentEmployee) return;

    const entry = { ...(dateEntry || {
      id: crypto.randomUUID(),
      employeeId: currentEmployee.id,
      date: selectedDate,
      clockIn: null,
      breakStart: null,
      breakEnd: null,
      clockOut: null,
    }) };

    entry[action] = time || format(new Date(), "HH:mm");
    setDateEntry(entry);
    await db.timeEntries.put(entry);
  };

  const handleEditClick = (field: 'clockIn' | 'breakStart' | 'breakEnd' | 'clockOut') => {
    setEditingField(field);
    setTempValues({ [field]: todayEntry?.[field] || '' });
  };

  const handleSaveEdit = async () => {
    if (!editingField || !currentEmployee) return;

    const today = format(new Date(), "yyyy-MM-dd");
    let entry = await db.timeEntries
      .where("[employeeId+date]")
      .equals([currentEmployee.id, today])
      .first();

    if (!entry) {
      entry = {
        id: crypto.randomUUID(),
        employeeId: currentEmployee.id,
        date: today,
        clockIn: null,
        breakStart: null,
        breakEnd: null,
        clockOut: null,
      };
    }

    entry[editingField] = tempValues[editingField] || '';

    await db.timeEntries.put(entry);
    setTodayEntry(entry);
    setEditingField(null);
    setTempValues({});
    setRefreshKey(prev => prev + 1);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValues({});
  };

  const handleAddEntry = async () => {
    if (!currentEmployee || !dateEntry) return;
    
    try {
      const entryToSave: any = {
        ...dateEntry,
        date: selectedDate
      };
      if (overrideEnabled) {
        const rate = overrideHourlyRate ? parseFloat(overrideHourlyRate) : undefined;
        if (rate && !isNaN(rate)) entryToSave.overrideHourlyRate = rate;
        if (overrideShiftStart) entryToSave.overrideShiftStartTime = overrideShiftStart;
      } else {
        delete entryToSave.overrideHourlyRate;
        delete entryToSave.overrideShiftStartTime;
      }

      await db.timeEntries.put(entryToSave);

      if (originalDate && originalDate !== selectedDate) {
        await db.timeEntries.where('[employeeId+date]')
          .equals([currentEmployee.id, originalDate])
          .delete();
      }

      setDateEntry(null);
      setOriginalDate(null);
      setSelectedDate(format(new Date(), "yyyy-MM-dd"));
      setOverrideEnabled(false);
      setOverrideHourlyRate('');
      setOverrideShiftStart('');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleDeleteEntry = async (date: string) => {
    if (!currentEmployee) return;
    if (confirm(`Excluir registro de ${date}?`)) {
      const repo = new TimeEntryRepository();
      await repo.deleteByDate(currentEmployee.id, date);
      setRefreshKey(prev => prev + 1);
    }
  };


  if (!currentEmployee) {
    return (
      <div className="container max-w-6xl mx-auto p-4 flex flex-col items-center justify-center h-[70vh]">
        <p className="text-muted-foreground mb-4">{tClock("setupProfileMessage")}</p>
        <Button onClick={() => window.location.href = "/settings"}>{tClock("goToSettings")}</Button>
      </div>
    );
  }

  const getStatusText = () => {
    if (!todayEntry?.clockIn) return tClock("statusReady");
    if (todayEntry.clockIn && !todayEntry.breakStart) return tClock("statusWorking");
    if (todayEntry.breakStart && !todayEntry.breakEnd) return tClock("statusOnBreak");
    if (todayEntry.breakEnd && !todayEntry.clockOut) return tClock("statusWorkingAfterBreak");
    if (todayEntry.clockOut) return tClock("statusCompleted");
    return tClock("statusUnknown");
  };

  return (
    <div className="container max-w-6xl mx-auto p-4 md:py-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("clock")}</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'today'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => setActiveTab('date')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'date'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Data
        </button>
      </div>

      {activeTab === 'today' && (
        <>
          <Card className="border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
            <CardContent className="p-6 text-center space-y-2">
              <div className="flex justify-center">
                <StatusBadge
                  status={todayEntry?.clockOut ? "success" : todayEntry?.breakStart && !todayEntry?.breakEnd ? "warning" : "secondary"}
                  label={getStatusText()}
                />
              </div>
              <div className="text-5xl font-bold tracking-tighter tabular-nums">{formatTimeLabel(currentTime, locale)}</div>
              <p className="text-sm text-muted-foreground">
                {formatDateLabel(currentTime, locale, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button
                size="lg"
                className="h-24 flex-col gap-2 bg-green-500/80 hover:bg-green-600/80 text-white w-full"
                disabled={editingField === 'clockIn'}
                onClick={() => todayEntry?.clockIn && editingField !== 'clockIn' ? handleEditClick('clockIn') : handleAction('clockIn')}
              >
                <span className="text-lg font-semibold">{tClock("clockIn")}</span>
                <span className="text-xs opacity-80">
                  {editingField === 'clockIn' ? tempValues.clockIn || tClock("emptyTime") : todayEntry?.clockIn || tClock("emptyTime")}
                </span>
              </Button>
              {editingField === 'clockIn' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="time"
                    value={tempValues.clockIn || ''}
                    onChange={(e) => setTempValues({ ...tempValues, clockIn: e.target.value })}
                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                  <Button size="sm" variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button
                size="lg"
                variant="secondary"
                className="h-24 flex-col gap-2 w-full"
                disabled={editingField === 'breakStart'}
                onClick={() => todayEntry?.breakStart && editingField !== 'breakStart' ? handleEditClick('breakStart') : handleAction('breakStart')}
              >
                <span className="text-lg font-semibold">{tClock("breakStart")}</span>
                <span className="text-xs text-muted-foreground">
                  {editingField === 'breakStart' ? tempValues.breakStart || tClock("emptyTime") : todayEntry?.breakStart || tClock("emptyTime")}
                </span>
              </Button>
              {editingField === 'breakStart' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="time"
                    value={tempValues.breakStart || ''}
                    onChange={(e) => setTempValues({ ...tempValues, breakStart: e.target.value })}
                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                  <Button size="sm" variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button
                size="lg"
                variant="secondary"
                className="h-24 flex-col gap-2 w-full"
                disabled={editingField === 'breakEnd'}
                onClick={() => todayEntry?.breakEnd && editingField !== 'breakEnd' ? handleEditClick('breakEnd') : handleAction('breakEnd')}
              >
                <span className="text-lg font-semibold">{tClock("breakEnd")}</span>
                <span className="text-xs text-muted-foreground">
                  {editingField === 'breakEnd' ? tempValues.breakEnd || tClock("emptyTime") : todayEntry?.breakEnd || tClock("emptyTime")}
                </span>
              </Button>
              {editingField === 'breakEnd' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="time"
                    value={tempValues.breakEnd || ''}
                    onChange={(e) => setTempValues({ ...tempValues, breakEnd: e.target.value })}
                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                  <Button size="sm" variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button
                size="lg"
                className="h-24 flex-col gap-2 bg-red-500/80 hover:bg-red-600/80 text-white w-full"
                disabled={editingField === 'clockOut'}
                onClick={() => todayEntry?.clockOut && editingField !== 'clockOut' ? handleEditClick('clockOut') : handleAction('clockOut')}
              >
                <span className="text-lg font-semibold">{tClock("clockOut")}</span>
                <span className="text-xs opacity-80">
                  {editingField === 'clockOut' ? tempValues.clockOut || tClock("emptyTime") : todayEntry?.clockOut || tClock("emptyTime")}
                </span>
              </Button>
              {editingField === 'clockOut' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="time"
                    value={tempValues.clockOut || ''}
                    onChange={(e) => setTempValues({ ...tempValues, clockOut: e.target.value })}
                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                  <Button size="sm" variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                </div>
              )}
            </div>
          </div>

                  </>
      )}

      {activeTab === 'date' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Selecionar Data</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <div>
                <p className="text-sm font-medium mb-4">
                  Editar registro para {formatDateLabel(parseISO(selectedDate), locale, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tClock("clockIn")}</label>
                    <input
                      type="time"
                      value={dateEntry?.clockIn || ""}
                      onChange={(e) => handleDateAction('clockIn', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tClock("breakStart")}</label>
                    <input
                      type="time"
                      value={dateEntry?.breakStart || ""}
                      onChange={(e) => handleDateAction('breakStart', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tClock("breakEnd")}</label>
                    <input
                      type="time"
                      value={dateEntry?.breakEnd || ""}
                      onChange={(e) => handleDateAction('breakEnd', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tClock("clockOut")}</label>
                    <input
                      type="time"
                      value={dateEntry?.clockOut || ""}
                      onChange={(e) => handleDateAction('clockOut', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* checkbox for past dates: shows override toggle and opens override editor */}
                {selectedDate < todayStr && (
                  <div className="mt-4">
                    <label className="inline-flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={overrideEnabled}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setOverrideEnabled(checked);
                          if (checked) {
                            setOverrideHourlyRate((dateEntry as any)?.overrideHourlyRate ? String((dateEntry as any).overrideHourlyRate) : '');
                            setOverrideShiftStart((dateEntry as any)?.overrideShiftStartTime ?? '');
                          } else {
                            setOverrideHourlyRate('');
                            setOverrideShiftStart('');
                          }
                        }}
                        className="h-4 w-4 mt-1"
                      />
                      <span className="text-sm">Altera o valor da hora paga e o turno de trabalho para essa data?</span>
                    </label>

                    {overrideEnabled && (
                      <div className="p-3 bg-muted/10 border mt-3 text-sm">
                        <div className="flex flex-col md:flex-row gap-3 items-center">
                          <div className="flex flex-col flex-1">
                            <label className="text-xs text-muted-foreground">Valor da hora (EUR)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="w-full h-9 rounded-md border border-input px-2 text-sm"
                              value={overrideHourlyRate}
                              onChange={(e) => setOverrideHourlyRate(e.target.value)}
                              placeholder={String(currentEmployee?.hourlyRate ?? '')}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="text-xs text-muted-foreground">Horário do turno</label>
                            <input
                              type="time"
                              className="h-9 rounded-md border border-input px-2 text-sm"
                              value={overrideShiftStart}
                              onChange={(e) => setOverrideShiftStart(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4 gap-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddEntry}
                  disabled={!dateEntry || (!dateEntry.clockIn && !dateEntry.breakStart && !dateEntry.breakEnd && !dateEntry.clockOut)}
                >
                  Salvar
                </Button>
                <Button variant="secondary" onClick={() => {
                  setDateEntry(null);
                  setOriginalDate(null);
                  setSelectedDate(todayStr);
                  setOverrideEnabled(false);
                  setOverrideHourlyRate('');
                  setOverrideShiftStart('');
                }}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ClockPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClockPageContent />
    </Suspense>
  );
}
