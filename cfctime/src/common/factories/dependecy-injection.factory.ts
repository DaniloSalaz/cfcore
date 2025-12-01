import type { AppDependencies } from "../types/app-dependencies.interface";
import { LocalCheckinRepository } from "@/features/checkin/infra/local-check-in.repository";
import { NetworkStatusService } from "../infra/network-status.service";
import { SubmitCheckInUseCase } from "@/features/checkin/application/submit-checkIn.usecase";
import { GetTodaysCheckinsUseCase } from "@/features/checkin/application/get-todays-checkins.usecase";
import { SyncCheckinsUseCase } from "@/features/checkin/application/sync-checkins.usecase";
import { getDatabaseInstance } from './database.factory';
import { FrappeCheckInRepository } from "@/features/checkin/infra/frappe-checkin.repository";
import { FrappeAuthRepository } from "@/features/auth/infra/frappe-auth.repository";
import { LogoutUserUseCase } from "@/features/auth/application/logout-user.usecase";
import { GetUserLoggedInUseCase } from "@/features/auth/application/get-user.usecase";
import { LoginUserUseCase } from "@/features/auth/application/login-user.usecase";
import { GetEmployeeUseCase } from "@/features/auth/application/get-employee.usecase";

export const buildDependencies = (): AppDependencies => {
  const checkinRepository = new FrappeCheckInRepository();
  const localCheckinRepository = new LocalCheckinRepository();
  const networkStatusService = new NetworkStatusService();
  const database = getDatabaseInstance();
  const userRepository = new FrappeAuthRepository();

  const submitCheckInUseCase = new SubmitCheckInUseCase(
    checkinRepository,
    userRepository,
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

  const getUserLoggedInUseCase = new GetUserLoggedInUseCase(userRepository);
  const logoutUserUseCase = new LogoutUserUseCase(userRepository);
  const loginUserUseCase = new LoginUserUseCase(userRepository);
  const getEmployeeUseCase = new GetEmployeeUseCase(userRepository);

  return {
    checkinRepository,
    localCheckinRepository,
    userRepository,

    networkStatusService,
    database,
    
    submitCheckInUseCase,
    getTodaysCheckinsUseCase,
    syncCheckinsUseCase,
    getUserLoggedInUseCase,
    logoutUserUseCase,
    loginUserUseCase,
    getEmployeeUseCase,
  };
};