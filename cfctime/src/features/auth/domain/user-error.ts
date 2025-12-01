import { DomainError } from "@/common/domain/domain-error";

export const USER_ERROR_CODES = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_CREATION_FAILED: 'USER_CREATION_FAILED',
};

export class UserError extends DomainError {
  constructor(code: string, message: string,) {
    super(code, message);
  }
}