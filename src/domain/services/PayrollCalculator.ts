import { getDay } from "date-fns"
import { TimeEntry, DailyPayroll } from "../../shared/types"
import { TimeEntryEntity } from "../entities/TimeEntry"

export class PayrollCalculator {
  private hourlyRate: number
  private shiftStartTime: string

  constructor(hourlyRate: number, shiftStartTime: string) {
    this.hourlyRate = hourlyRate
    this.shiftStartTime = shiftStartTime
  }

  public calculateWeek(entries: TimeEntry[]): DailyPayroll[] {
    // Sort entries by date to ensure chronological accumulation
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    let accumulatedWeeklyMinutes = 0
    const THRESHOLD_OVERTIME_A = 39 * 60 // 2340 minutes
    const THRESHOLD_OVERTIME_B = 43 * 60 // 2580 minutes

    return sortedEntries.map(entry => {
      const entryDate = new Date(entry.date);
      const dayOfWeek = getDay(entryDate) // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const isSunday = dayOfWeek === 0
      const isFriday = dayOfWeek === 5

      // allow per-entry overrides
      const effectiveHourlyRate = (entry as any).overrideHourlyRate ?? this.hourlyRate;
      let effectiveShiftStart = (entry as any).overrideShiftStartTime ?? this.shiftStartTime;
      if (isFriday) {
        const [hours, minutes] = effectiveShiftStart.split(':').map(Number);
        const date = new Date();
        date.setHours(hours - 1, minutes, 0, 0);
        effectiveShiftStart = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }

      const totalMinutesToday = TimeEntryEntity.calculateDailyMinutes(
        effectiveShiftStart,
        entry.clockIn,
        entry.breakStart,
        entry.breakEnd,
        entry.clockOut,
        entry.date
      )

      const breakMinutesToday = TimeEntryEntity.calculateBreakMinutes(
        entry.breakStart,
        entry.breakEnd,
        entry.date
      )

      let normalMinutes = 0
      let overtimeAMinutes = 0
      let overtimeBMinutes = 0

      if (isSunday) {
        // Sunday is always Overtime B entirely
        overtimeBMinutes = totalMinutesToday
        accumulatedWeeklyMinutes += totalMinutesToday
      } else {
        // Monday to Saturday logic
        let remainingMinutesToday = totalMinutesToday

        // Check how many minutes we can still fit into Normal time (up to 39h)
        if (accumulatedWeeklyMinutes < THRESHOLD_OVERTIME_A) {
          const availableNormal = THRESHOLD_OVERTIME_A - accumulatedWeeklyMinutes
          const normalToTake = Math.min(remainingMinutesToday, availableNormal)
          normalMinutes = normalToTake
          remainingMinutesToday -= normalToTake
          accumulatedWeeklyMinutes += normalToTake
        }

        // Check how many minutes we can fit into Overtime A (up to 43h)
        if (remainingMinutesToday > 0 && accumulatedWeeklyMinutes < THRESHOLD_OVERTIME_B) {
          const availableOvertimeA = THRESHOLD_OVERTIME_B - accumulatedWeeklyMinutes
          const overtimeAToTake = Math.min(remainingMinutesToday, availableOvertimeA)
          overtimeAMinutes = overtimeAToTake
          remainingMinutesToday -= overtimeAToTake
          accumulatedWeeklyMinutes += overtimeAToTake
        }

        // Anything left is Overtime B
        if (remainingMinutesToday > 0) {
          overtimeBMinutes = remainingMinutesToday
          accumulatedWeeklyMinutes += remainingMinutesToday
        }
      }

      const ratePerMinute = effectiveHourlyRate / 60
      
      // Para horas extras, desconsiderar a segunda casa decimal (truncar para 1 casa decimal)
      const overtimeAHoursTruncated = Math.floor((overtimeAMinutes / 60) * 10) / 10
      const overtimeBHoursTruncated = Math.floor((overtimeBMinutes / 60) * 10) / 10

      const grossPay = 
        (normalMinutes * ratePerMinute) +
        (overtimeAHoursTruncated * effectiveHourlyRate * 1.5) +
        (overtimeBHoursTruncated * effectiveHourlyRate * 2.0)

      return {
        date: entry.date,
        totalMinutes: totalMinutesToday,
        breakMinutes: breakMinutesToday,
        normalMinutes,
        overtimeAMinutes,
        overtimeBMinutes,
        grossPay
      }
    })
  }
}
