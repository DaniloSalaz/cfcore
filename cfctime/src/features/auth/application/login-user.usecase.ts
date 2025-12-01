import type { Result } from "@/common/domain/result";
import type { IUserRepository } from "../domain/user-repository";
import type { User } from "../domain/user";
import type { UserError } from "../domain/user-error";

export class LoginUserUseCase {
  private repository: IUserRepository;

  constructor(repository: IUserRepository) {
    this.repository = repository;
  }

  async execute(email: string, password: string): Promise<Result<User, UserError>> {
    return await this.repository.login(email, password);
  }
}