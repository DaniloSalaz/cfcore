export type LogType = 'IN' | 'OUT';

export interface EmployeeCheckIn {
  employee: string;
  logType: LogType;
  time: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}