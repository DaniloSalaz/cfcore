import type { Result, Option } from '@/common/domain/result'
import type { EmployeeCheckIn, LogType } from './employee-check-in'

export interface CheckinCreatePayload {
  employee: string;
  log_type: LogType;
  latitude?: number;
  longitude?: number;
  time?: string;
}

export interface ICheckInRepository {
  getAllToday(): Promise<Result<EmployeeCheckIn[], Error>>;
  create(input: CheckinCreatePayload): Promise<Result<EmployeeCheckIn, Error>>;
  syncBatch(inputs: CheckinCreatePayload[]): Promise<Result<void, Error>>;
  getGeoReverse(lat: number, lon: number): Promise<Result<string, Error>>;
}

export interface ICheckInLocalRepository {
  getAll(): Promise<Result<EmployeeCheckIn[], Error>>;
  getAllUnsynced(): Promise<Result<EmployeeCheckIn[], Error>>;
  getSyncedByTime(timestamp: string): Promise<Result<Option<EmployeeCheckIn>, Error>>;
  create(isUnsyn: boolean, input: CheckinCreatePayload): Promise<Result<EmployeeCheckIn, Error>>;
  delete(isUnsyn: boolean, timestamp: string): Promise<Result<void, Error>>;
  deleteAllSynced(): Promise<Result<void, Error>>;
  deleteAllUnsynced(): Promise<Result<void, Error>>;
}