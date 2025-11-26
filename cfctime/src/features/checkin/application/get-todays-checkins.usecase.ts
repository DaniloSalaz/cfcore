import type { Result } from '@/common/domain/result'
import type { EmployeeCheckIn } from '../domain/employee-check-in'
import type { INetworkStatusService } from '@/common/domain/network-status.interface'
import type { ICheckInRespository, ICheckInLocalRespository, CheckinCreatePayload } from '../domain/checkin-repository.interface'

export class GetTodaysCheckinsUseCase {
  private repository: ICheckInRespository;
  private localRepository: ICheckInLocalRespository;
  private networkStatusService: INetworkStatusService;

  constructor(
    repository: ICheckInRespository,
    localRepository: ICheckInLocalRespository,
    networkStatusService: INetworkStatusService,
  ) {
    this.repository = repository;
    this.localRepository = localRepository;
    this.networkStatusService = networkStatusService;
  }

  async syncLocalCheckIn(input: EmployeeCheckIn): Promise<void> {
    const result = await this.localRepository.getSyncedByTime(input.time);
    if(result.ok && result.value === null) {
      await this.localRepository.create(false, input as CheckinCreatePayload);
    }
  }

  async execute(): Promise<Result<EmployeeCheckIn[], Error>> {
    if(this.networkStatusService.isOnline()) {
      const result = await this.repository.getAllToday();
      if(result.ok) {
        await this.localRepository.deleteAllSynced();
        await Promise.all(result.value.map(element => this.syncLocalCheckIn(element)));
      }
      return result;
    }
    return await this.localRepository.getAll();
  }
}
