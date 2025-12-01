export type LogType = 'IN' | 'OUT';

export interface EmployeeCheckIn {
  employee: string;
  log_type: LogType;
  time: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}