import type { Result } from "@/common/domain/result";
import type { LocalCheckinRepository } from "../infra/local-check-in.repository";

export class HasUnsyncedCheckins {
  private localCheckinRepository: LocalCheckinRepository;

  constructor(localCheckinRepository: LocalCheckinRepository) {
    this.localCheckinRepository = localCheckinRepository;
  }
  
  execute = async (): Promise<Result<boolean, unknown>> => {
    const result =
      await this.localCheckinRepository.getAllUnsynced();
    const hasUnsynced = result.ok && result.value.length > 0;
    return { ok: true, value: hasUnsynced };
  };
}
