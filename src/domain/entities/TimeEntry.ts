import { differenceInMinutes, parse, isAfter } from "date-fns"

export class TimeEntryEntity {
  static parseTime(timeStr: string, dateStr: string): Date {
    return parse(`${dateStr} ${timeStr}`, "yyyy-MM-dd HH:mm", new Date())
  }

  static calculateBreakMinutes(breakStart: string | null, breakEnd: string | null, date: string): number {
    if (breakStart && breakEnd) {
      const breakStartDate = this.parseTime(breakStart, date)
      let breakEndDate = this.parseTime(breakEnd, date)
      
      if (isAfter(breakStartDate, breakEndDate)) {
        breakEndDate = new Date(breakEndDate.getTime() + 24 * 60 * 60 * 1000)
      }
      
      const actualBreak = differenceInMinutes(breakEndDate, breakStartDate)
      // Rule 4: Break deduction is at least 30 minutes
      return Math.max(30, actualBreak)
    } else if (breakStart || breakEnd) {
       // incomplete break, usually we might not deduct or force 30. We force 30 as a safe default if they forgot to punch back in but punched out
       return 30
    }
    return 0
  }

  static calculateDailyMinutes(
    shiftStartTime: string,
    clockIn: string | null,
    breakStart: string | null,
    breakEnd: string | null,
    clockOut: string | null,
    date: string
  ): number {
    if (!clockIn || !clockOut) return 0

    const shiftDate = this.parseTime(shiftStartTime, date)
    const clockInDate = this.parseTime(clockIn, date)
    let clockOutDate = this.parseTime(clockOut, date)

    // Handle shift crossing midnight (simple approach: if clock out is before clock in, it's next day)
    if (isAfter(clockInDate, clockOutDate)) {
      clockOutDate = new Date(clockOutDate.getTime() + 24 * 60 * 60 * 1000)
    }

    // Rule 1: Effective Clock In is the later of Shift Start or Actual Clock In
    const effectiveClockInDate = isAfter(clockInDate, shiftDate) ? clockInDate : shiftDate

    const breakMinutes = this.calculateBreakMinutes(breakStart, breakEnd, date)

    const totalWorkedMinutes = differenceInMinutes(clockOutDate, effectiveClockInDate) - breakMinutes

    return Math.max(0, totalWorkedMinutes)
  }
}
