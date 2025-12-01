import type { Result } from "@/common/domain/result";
import type { IUserRepository } from "../domain/user-repository";
import type { UserError } from "../domain/user-error";

export class LogoutUserUseCase {
  private repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Result<void, UserError>> {
    return await this.repository.logout();
  }
}