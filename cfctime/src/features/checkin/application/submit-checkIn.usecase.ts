import { type Result, Err } from '@/common/domain/result'
import { type INetworkStatusService } from '@/common/domain/network-status.interface'
import type { ICheckInRepository, ICheckInLocalRepository, CheckinCreatePayload } from '../domain/checkin-repository'
import type { IUserRepository } from '@/features/auth/domain/user-repository';
import { CheckInError } from '../domain/checkin-error';

export class SubmitCheckInUseCase {
  private readonly repository: ICheckInRepository;
  private readonly userRepository: IUserRepository;
  private readonly localRepository: ICheckInLocalRepository;
  private readonly networkStatusService: INetworkStatusService;

  constructor(
    repository: ICheckInRepository,
    userRepository: IUserRepository,
    localRepository: ICheckInLocalRepository,
    networkStatusService: INetworkStatusService,
  ) {
    this.repository = repository;
    this.userRepository = userRepository;
    this.localRepository = localRepository;
    this.networkStatusService = networkStatusService;
  }

    async execute(input: Omit<CheckinCreatePayload, 'employee'>): Promise<Result<any, Error>> {
      const userResult = await this.userRepository.getEmployee();
      if (!userResult.ok || (userResult.ok && userResult.value === null)) {
        return Err(new CheckInError('CHECKIN_SESSION_NOT_STARTED', 'User session not started'));
      }
      if(this.networkStatusService.isOnline() && userResult.ok && userResult.value !== null) {
        return this.repository.create({ ...input, employee: userResult.value.name });
      }
      return this.localRepository.create(true, { ...input, employee: userResult.value?.name || '' });
    }
}