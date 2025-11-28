import type { AppDependencies } from "../types/app-dependencies.interface";
import { LocalCheckinRepository } from "@/features/checkin/infra/local-check-in.repository";
import { NetworkStatusService } from "../infra/network-status.service";
import { SubmitCheckInUseCase } from "@/features/checkin/application/submit-checkIn.usecase";
import { GetTodaysCheckinsUseCase } from "@/features/checkin/application/get-todays-checkins.usecase";
import { SyncCheckinsUseCase } from "@/features/checkin/application/sync-checkins.usecase";
import { getDatabaseInstance } from './database.factory';
import { FrappeCheckInRepository } from "@/features/checkin/infra/frappe-checkin";

export const buildDependencies = (): AppDependencies => {
  const checkinRepository = new FrappeCheckInRepository();
  const localCheckinRepository = new LocalCheckinRepository();
  const networkStatusService = new NetworkStatusService();
  const database = getDatabaseInstance();

  const submitCheckInUseCase = new SubmitCheckInUseCase(
    checkinRepository,
    localCheckinRepository,
    networkStatusService,
  );

  const getTodaysCheckinsUseCase = new GetTodaysCheckinsUseCase(
    checkinRepository,
    localCheckinRepository,
    networkStatusService,
  );
  
  const syncCheckinsUseCase = new SyncCheckinsUseCase(
    checkinRepository,
    localCheckinRepository,
    networkStatusService,
  );

  return {
    checkinRepository,
    localCheckinRepository,
    networkStatusService,
    database,
    submitCheckInUseCase,
    getTodaysCheckinsUseCase,
    syncCheckinsUseCase,
  };
};