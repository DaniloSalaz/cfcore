import { type Result, Ok, Err, type Option } from "@/common/domain/result";
import type { User } from "../domain/user";
import { UserError } from "../domain/user-error";
import type { IUserRepository } from "../domain/user-repository";
import type { FrappeApp } from "frappe-js-sdk";
import { getFrappeInstance } from "@/common/factories/frappe.factory";
import type { Employee } from "../domain/employee";

export class FrappeAuthRepository implements IUserRepository {
  private frappeApp: FrappeApp;

  constructor() {
    this.frappeApp = getFrappeInstance();
  }
  async getEmployee(): Promise<Result<Option<Employee>, UserError>> {
    const username = await this.frappeApp.auth().getLoggedInUser();
    return this.frappeApp.db()
      .getDocList<Employee>('Employee', {
        filters: [['user_id', '=', username]],
        // fields: ['name', 'firstName', 'middleName', 'lastName'],
        limit: 1
      })
      .then((employee) => {
        if (employee && employee.length > 0) {
          return Ok<Option<Employee>>(employee[0]);
        } else {
          return Ok<Option<Employee>>(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching employee by email:', error);
        const exception = error?.exception;
        const message = !!exception ? exception.split(': ')[1] : 'Failed to get employee by email';
        return Err(new UserError('EMPLOYEE_FETCH_FAILED', message));
      });
  }

  getUserLoggedIn(): Promise<Result<Option<string>, UserError>> {
    return this.frappeApp.auth()
      .getLoggedInUser()
      .then((user) => {
        if (user) {
          return Ok<Option<string>>(user);
        } else {
          return Ok<Option<string>>(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching logged in user:', error);
        const exception = error?.exception;
        const message = !!exception ? exception.split(': ')[1] : 'Failed to get logged in user';
        return Err(new UserError('USER_FETCH_FAILED', message));
      });
  }

  login(email: string, password: string): Promise<Result<User, UserError>> {
    return this.frappeApp.auth()
      .loginWithUsernamePassword({username: email, password: password})
      .then(() => {
        const user: User = {
          email: email,
          firstName: '', // Fetch first name from user details if available
          lastName: ''   // Fetch last name from user details if available
        };
        return Ok(user);
      })
      .catch((error) => {
        console.error('Error during login:', error);
        const exception = error?.exception;
        const message = !!exception ? exception.split(': ')[1] : 'Failed to login';
        return Err(new UserError('USER_LOGIN_FAILED', message));
      });
  }
  logout(): Promise<Result<void, UserError>> {
    return this.frappeApp.auth()
      .logout()
      .then(() => {
        return Ok(undefined);
      })
      .catch((error) => {
        console.error('Error during logout:', error);
        const exception = error?.exception;
        const message = !!exception ? exception.split(': ')[1] : 'Failed to logout';
        return Err(new UserError('USER_LOGOUT_FAILED', message));
      });
  }
}