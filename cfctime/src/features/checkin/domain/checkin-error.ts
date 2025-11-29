import { DomainError } from "@/common/domain/domain-error";

export const CHECKIN_ERROR_CODES = {
  NETWORK_ERROR: 'CHECKIN_NETWORK_ERROR',
  INVALID_CHECKIN_TIME: 'CHECKIN_INVALID_TIME',
  MAX_CHECKINS_REACHED: 'CHECKIN_MAX_REACHED',
  CHECKIN_CREATE_FAILED: 'CHECKIN_CREATE_FAILED',
};
export class CheckInError extends DomainError {
  constructor(code: string, message: string,) {
    super(code, message);
  }
}