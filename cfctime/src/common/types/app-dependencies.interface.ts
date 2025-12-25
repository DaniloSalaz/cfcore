// src/app/providers/app-dependencies/app-dependencies.types.ts

import type { ICheckInRepository, ICheckInLocalRepository } from "@/features/checkin/domain/checkin-repository";
import type { INetworkStatusService } from '@/common/domain/network-status.interface'
import { SubmitCheckInUseCase } from "@/features/checkin/application/submit-checkIn.usecase";
import { GetTodaysCheckinsUseCase } from "@/features/checkin/application/get-todays-checkins.usecase";
import { SyncCheckinsUseCase } from "@/features/checkin/application/sync-checkins.usecase";
import type { CheckInDatabase } from '@/common/factories/database.factory';
import type { GetUserLoggedInUseCase } from "@/features/auth/application/get-user.usecase";
import type { LogoutUserUseCase } from "@/features/auth/application/logout-user.usecase";
import type { IUserRepository } from "@/features/auth/domain/user-repository";
import type { LoginUserUseCase } from "@/features/auth/application/login-user.usecase";
import type { GetEmployeeUseCase } from "@/features/auth/application/get-employee.usecase";
import type { GetStatusByLogUseCase } from "@/features/checkin/application/get-status-by-log.usecase";
import type { GetStatusDayUseCase } from "@/features/checkin/application/get-status-day.usecase";
import type { HasUnsyncedCheckins } from "@/features/checkin/application/has-unsynced-checkins";
import type { GetGeoReverse } from "@/features/checkin/application/get-geo-reverse.usecase";

export interface AppDependencies {
  // Repositories
  checkinRepository: ICheckInRepository;
  localCheckinRepository: ICheckInLocalRepository;
  userRepository: IUserRepository;

  // Services
  networkStatusService: INetworkStatusService;
  database: CheckInDatabase;

  // Use cases 
  getStatusDayUseCase: GetStatusDayUseCase;
  getStatusByLogUseCase: GetStatusByLogUseCase;
  submitCheckInUseCase: SubmitCheckInUseCase;
  getTodaysCheckinsUseCase: GetTodaysCheckinsUseCase;
  hasUnsyncedCheckinsUseCase: HasUnsyncedCheckins;
  syncCheckinsUseCase: SyncCheckinsUseCase;
  getUserLoggedInUseCase: GetUserLoggedInUseCase;
  loginUserUseCase: LoginUserUseCase;
  logoutUserUseCase: LogoutUserUseCase;
  getEmployeeUseCase: GetEmployeeUseCase;
  getGeoReverse: GetGeoReverse,
}
