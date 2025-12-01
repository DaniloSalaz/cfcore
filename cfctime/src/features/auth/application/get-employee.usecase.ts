import type { Option, Result } from "@/common/domain/result";
import type { UserError } from "../domain/user-error";
import type { IUserRepository } from "../domain/user-repository";
import type { Employee } from "../domain/employee";

export class GetEmployeeUseCase {
  private repository: IUserRepository;
  constructor(repository: IUserRepository) {
    this.repository = repository;
  }
  execute(): Promise<Result<Option<Employee>, UserError>> {
    return this.repository.getEmployee();
  }
}
