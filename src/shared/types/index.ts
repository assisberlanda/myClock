export interface Employee {
  id: string
  employeeId?: string
  userId?: string
  companyId?: string
  fullName: string
  employeeNumber: string
  shiftStartTime: string // HH:mm
  hourlyRate: number
}

export interface TimeEntry {
  id: string
  employeeId: string
  date: string // YYYY-MM-DD
  clockIn: string | null // HH:mm
  breakStart: string | null // HH:mm
  breakEnd: string | null // HH:mm
  clockOut: string | null // HH:mm
  // Optional per-day overrides (hourly rate and shift start) to be used only for this date's calculations
  overrideHourlyRate?: number
  overrideShiftStartTime?: string
}

export interface DailyPayroll {
  date: string
  totalMinutes: number
  breakMinutes: number
  normalMinutes: number
  overtimeAMinutes: number
  overtimeBMinutes: number
  grossPay: number
}

export interface WeeklyReport {
  weekNumber: number
  year: number
  entries: TimeEntry[]
  payroll: DailyPayroll[]
  totalGrossPay: number
  totalNormalMinutes: number
  totalOvertimeAMinutes: number
  totalOvertimeBMinutes: number
}
