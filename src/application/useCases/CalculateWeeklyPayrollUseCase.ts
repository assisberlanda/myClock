import { TimeEntryRepository } from '../../infrastructure/repositories/TimeEntryRepository';
import { PayrollCalculator } from '../../domain/services/PayrollCalculator';
import { WeeklyReport } from '../../shared/types';
import { getWeek, getYear } from 'date-fns';

export class CalculateWeeklyPayrollUseCase {
  constructor(private timeEntryRepository: TimeEntryRepository) {}

  async execute(employeeId: string, hourlyRate: number, shiftStartTime: string, dateInWeek: Date): Promise<WeeklyReport> {
    const weekNumber = getWeek(dateInWeek, { weekStartsOn: 1 }); // Monday is first day of week
    const year = getYear(dateInWeek);

    // Fetch all entries for this employee to properly calculate accumulated overtime across the week
    // Alternatively, we could fetch just the specific week. To be safe, we should fetch the specific week.
    // We can filter entries by week number.
    const allEntries = await this.timeEntryRepository.getAllByEmployeeId(employeeId);
    
    // Filter by the target week
    const weekEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return getWeek(entryDate, { weekStartsOn: 1 }) === weekNumber && getYear(entryDate) === year;
    });

    const calculator = new PayrollCalculator(hourlyRate, shiftStartTime);
    const payrollList = calculator.calculateWeek(weekEntries);

    const totalGrossPay = payrollList.reduce((sum, day) => sum + day.grossPay, 0);
    const totalNormalMinutes = payrollList.reduce((sum, day) => sum + day.normalMinutes, 0);
    const totalOvertimeAMinutes = payrollList.reduce((sum, day) => sum + day.overtimeAMinutes, 0);
    const totalOvertimeBMinutes = payrollList.reduce((sum, day) => sum + day.overtimeBMinutes, 0);

    return {
      weekNumber,
      year,
      entries: weekEntries,
      payroll: payrollList,
      totalGrossPay,
      totalNormalMinutes,
      totalOvertimeAMinutes,
      totalOvertimeBMinutes
    };
  }
}
