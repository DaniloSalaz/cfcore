import { type Result, Err, Ok } from "@/common/domain/result";
import type { ICheckInRepository } from "../domain/checkin-repository";
import type { StatusKey } from "../domain/employee-check-in";

export class GetStatusDayUseCase {
  private repository: ICheckInRepository;

  constructor(repository: ICheckInRepository) {
    this.repository = repository;
  }
  execute(): Promise<Result<StatusKey, unknown>> {
    const logs = this.repository.getAllToday();
    return logs.then((result) => {
      if (result.ok) {
        const statusString =
          result.value
            .map((item) => (item.log_type === "IN" ? "IN" : "OUT"))
            .join("-") || "EMPTY";
        const validStatusKeys: StatusKey[] = [
          "EMPTY",
          "IN",
          "IN-OUT",
          "IN-OUT-IN",
          "IN-OUT-IN-OUT",
        ];
        const statusKey: StatusKey = validStatusKeys.includes(
          statusString as StatusKey
        )
          ? (statusString as StatusKey)
          : "EMPTY";
        return Ok(statusKey);
      } else {
        return Err(result.error);
      }
    });
  }
}
