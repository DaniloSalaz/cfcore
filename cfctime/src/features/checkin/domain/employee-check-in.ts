export type LogType = 'IN' | 'OUT';

export type StatusKey =
  | 'EMPTY'
  | 'IN'
  | 'IN-OUT'
  | 'IN-OUT-IN'
  | 'IN-OUT-IN-OUT';

export interface EmployeeCheckIn {
  employee: string;
  log_type: LogType;
  time: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}