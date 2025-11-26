// src/app/providers/app-dependencies/app-dependencies.types.ts

import type { ICheckInRespository, ICheckInLocalRespository } from "@/features/checkin/domain/checkin-repository.interface";
import type { INetworkStatusService } from '@/common/domain/network-status.interface'
import { SubmitCheckInUseCase } from "@/features/checkin/application/submit-checkIn.usecase";
import { GetTodaysCheckinsUseCase } from "@/features/checkin/application/get-todays-checkins.usecase";
import { SyncCheckinsUseCase } from "@/features/checkin/application/sync-checkins.usecase";
import type { CheckInDatabase } from '@/common/factories/database.factory';

export interface AppDependencies {
  // Repositories
  checkinRepository: ICheckInRespository;
  localCheckinRepository: ICheckInLocalRespository;

  // Services
  networkStatusService: INetworkStatusService;
  database: CheckInDatabase;

  // Use cases
  submitCheckInUseCase: SubmitCheckInUseCase;
  getTodaysCheckinsUseCase: GetTodaysCheckinsUseCase;
  syncCheckinsUseCase: SyncCheckinsUseCase;
}
