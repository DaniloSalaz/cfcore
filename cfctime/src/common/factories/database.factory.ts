import Dexie, { type Table } from 'dexie';
import type { EmployeeCheckIn } from '@/features/checkin/domain/employee-check-in';

export interface EmployeeCheckInDB extends EmployeeCheckIn {
  id?: number;
  isSync: boolean;
}

class CheckInDatabase extends Dexie {
  employeeCheckIns!: Table<EmployeeCheckInDB>;

  constructor() {
    super('CheckInDatabase');
    this.version(1).stores({
      employeeCheckIns: '++id, employee, logType, time, latitude, longitude, address, isSync'
    });
  }
}

// Singleton instance
let dbInstance: CheckInDatabase | null = null;

export const getDatabaseInstance = (): CheckInDatabase => {
  if (!dbInstance) {
    dbInstance = new CheckInDatabase();
  }
  return dbInstance;
};

export { CheckInDatabase };