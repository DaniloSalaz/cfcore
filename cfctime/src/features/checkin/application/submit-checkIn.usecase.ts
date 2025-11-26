import { type Result } from '@/common/domain/result'
import { type INetworkStatusService } from '@/common/domain/network-status.interface'
import type { ICheckInRespository, ICheckInLocalRespository, CheckinCreatePayload } from '../domain/checkin-repository.interface'

export class SubmitCheckInUseCase {
  private readonly repository: ICheckInRespository;
  private readonly localRepository: ICheckInLocalRespository;
  private readonly networkStatusService: INetworkStatusService;

  constructor(
    repository: ICheckInRespository,
    localRepository: ICheckInLocalRespository,
    networkStatusService: INetworkStatusService,
  ) {
    this.repository = repository;
    this.localRepository = localRepository;
    this.networkStatusService = networkStatusService;
  }

    async execute(input: CheckinCreatePayload): Promise<Result<any, Error>> {
      if(this.networkStatusService.isOnline()) {
        return this.repository.create(input);
      }
      return this.localRepository.create(true, input);
    }
}