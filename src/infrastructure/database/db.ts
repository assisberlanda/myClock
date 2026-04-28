import Dexie, { Table } from 'dexie';
import { Employee, TimeEntry } from '../../shared/types';

export class MyClockDatabase extends Dexie {
  employees!: Table<Employee, string>;
  timeEntries!: Table<TimeEntry, string>;

  constructor() {
    // Use consistent database name for persistence
    super('MyClockDB');
    this.version(1).stores({
      employees: 'id', // employeeNumber is also unique but id is primary key
      timeEntries: 'id, employeeId, date, [employeeId+date]', // indexes on employeeId and date
    });
    
    // Add version 2 for database cleanup
    this.version(2).stores({
      employees: 'id',
      timeEntries: 'id, employeeId, date, [employeeId+date]',
    }).upgrade(tx => {
      // Clear all data when upgrading to version 2
      return tx.table('employees').clear().then(() => tx.table('timeEntries').clear());
    });
    
    // Handle database errors
    this.on('blocked', () => {
      console.warn('Database blocked - another tab might be open');
    });
    
    this.on('versionchange', () => {
      // Close database connection when version changes
      this.close();
    });
  }
  
  // Method to clear corrupted data
  async clearCorruptedData() {
    try {
      await this.transaction('rw', this.employees, this.timeEntries, async () => {
        await this.employees.clear();
        await this.timeEntries.clear();
      });
      console.log('Database cleared successfully');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }
  
  // Method to check and repair database
  async checkAndRepair() {
    try {
      // Test database access
      await this.employees.count();
      await this.timeEntries.count();
      return true;
    } catch (error) {
      console.error('Database error detected:', error);
      if (error instanceof Error && error.message.includes('invalid digit')) {
        console.log('Attempting to repair corrupted database...');
        await this.clearCorruptedData();
        return true;
      }
      throw error;
    }
  }
}

export const db = new MyClockDatabase();

// Initialize database with error handling
export async function initializeDatabase() {
  try {
    await db.checkAndRepair();
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Only clear database if there's corruption, not on normal errors
    if (error instanceof Error && error.message.includes('invalid digit')) {
      try {
        console.log('Clearing corrupted database...');
        await db.delete();
        await db.open();
        console.log('Database cleared and recreated successfully');
        return db;
      } catch (clearError) {
        console.error('Failed to clear database:', clearError);
        throw clearError;
      }
    } else {
      // For other errors, just try to open the database
      try {
        await db.open();
        return db;
      } catch (openError) {
        console.error('Failed to open database:', openError);
        throw openError;
      }
    }
  }
}
