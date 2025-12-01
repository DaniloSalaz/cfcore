import type { Result, Option } from '@/common/domain/result'
import type { User } from './user';
import type { UserError } from './user-error';
import type { Employee } from './employee';

export interface IUserRepository {
    getUserLoggedIn(): Promise<Result<Option<string>, UserError>>;
    getEmployee(): Promise<Result<Option<Employee>, UserError>>;
    login(email: string, password: string): Promise<Result<User, UserError>>;
    logout(): Promise<Result<void, UserError>>;
}