import type { Option, Result } from "@/common/domain/result";
import type { IUserRepository } from "../domain/user-repository";
import type { UserError } from "../domain/user-error";

export class GetUserLoggedInUseCase {
  private repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }
  execute(): Promise<Result<Option<string>, UserError>> {
    return this.repository.getUserLoggedIn();
  }
}
