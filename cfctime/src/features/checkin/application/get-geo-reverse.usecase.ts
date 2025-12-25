import type { Result } from "@/common/domain/result";
import type { ICheckInRepository } from "../domain/checkin-repository";

export class GetGeoReverse {
    private readonly repository: ICheckInRepository;
  constructor(repository: ICheckInRepository) {
    this.repository = repository;
  }

  execute = async (lat: number, lon: number): Promise<Result<string, Error>> => {
    const result = await this.repository.getGeoReverse(lat, lon);
    return result;
  };
}