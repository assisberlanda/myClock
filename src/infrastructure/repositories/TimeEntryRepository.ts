import { TimeEntry } from '../../shared/types';
import { db } from '../database/db';

export class TimeEntryRepository {
  async getAllByEmployeeId(employeeId: string): Promise<TimeEntry[]> {
    return db.timeEntries.where('employeeId').equals(employeeId).toArray();
  }

  async getByDate(employeeId: string, date: string): Promise<TimeEntry | undefined> {
    return db.timeEntries.where('[employeeId+date]').equals([employeeId, date]).first();
  }

  async save(entry: TimeEntry): Promise<void> {
    await db.timeEntries.put(entry);
  }

  async getEntriesBetweenDates(employeeId: string, startDate: string, endDate: string): Promise<TimeEntry[]> {
    return db.timeEntries
      .where('employeeId')
      .equals(employeeId)
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .sortBy('date');
  }

  async deleteById(id: string): Promise<void> {
    await db.timeEntries.delete(id);
  }

  async deleteByDate(employeeId: string, date: string): Promise<void> {
    await db.timeEntries.where('[employeeId+date]').equals([employeeId, date]).delete();
  }
}

export const timeEntryRepository = new TimeEntryRepository();
