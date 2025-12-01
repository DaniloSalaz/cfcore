import { type Result, Ok, Err } from '@/common/domain/result'
import type { INetworkStatusService } from '@/common/domain/network-status.interface'
import type { ICheckInRepository, ICheckInLocalRepository } from '../domain/checkin-repository'

export class SyncCheckinsUseCase {
  private repository: ICheckInRepository
  private localRepository: ICheckInLocalRepository
  private networkStatusService: INetworkStatusService

  constructor(
    repository: ICheckInRepository,
    localRepository: ICheckInLocalRepository,
    networkStatusService: INetworkStatusService,
  ) {
    this.repository = repository
    this.localRepository = localRepository
    this.networkStatusService = networkStatusService
  }


  async execute(): Promise<Result<void, Error>> {
    const localCheckInsResult = await this.localRepository.getAllUnsynced();
    if (localCheckInsResult.ok && this.networkStatusService.isOnline()) {
      if (localCheckInsResult.value.length > 0) {
        const syncResult = await this.repository.syncBatch(
          localCheckInsResult.value.map(checkin => ({
            employee: checkin.employee,
            log_type: checkin.log_type,
            latitude: checkin.latitude,
            longitude: checkin.longitude,
            time: checkin.time,
          }))
        );
        if (syncResult.ok) {
          await this.localRepository.deleteAllUnsynced();
          return Ok(void 0);
        }
        return Err(syncResult.error);
      }
    }
    return Ok(void 0);
  }
}
