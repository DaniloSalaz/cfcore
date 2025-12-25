import { type Result, Err, Ok } from "@/common/domain/result";
import type { ICheckInRepository } from "../domain/checkin-repository";
import type { StatusKey } from "../domain/employee-check-in";

export class GetStatusByLogUseCase {
  private repository: ICheckInRepository;

  constructor(repository: ICheckInRepository) {
    this.repository = repository;
  }
  async execute(time: string): Promise<Result<StatusKey, unknown>> {
    const logs = await this.repository.getAllToday();
    const filteredLogs = logs.ok
      ? logs.value.filter((log) => log.time <= time)
      : [];
    const statusString =
      filteredLogs
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
    if (logs.ok) {
      return Ok(statusKey);
    } else {
      return Err(logs.error);
    }
  }
}
