import { type Result, Err, Ok } from "@/common/domain/result";
import { FrappeApp } from 'frappe-js-sdk';
import type { CheckinCreatePayload, ICheckInRepository } from "../domain/checkin-repository";
import type { EmployeeCheckIn } from "../domain/employee-check-in";
import { getFrappeInstance } from "@/common/factories/frappe.factory";
import moment from 'moment';
import { CheckInError } from "../domain/checkin-error";


const DOCTYPE_EMPLOYEE_CHECKIN = 'Employee Checkin';


export class FrappeCheckInRepository implements ICheckInRepository {
  private frappeApp: FrappeApp;

  constructor() {
    this.frappeApp = getFrappeInstance();
  }
  async getAllToday(): Promise<Result<EmployeeCheckIn[], Error>> {
    const formattedStartDate = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDate = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    return this.frappeApp.db().getDocList(DOCTYPE_EMPLOYEE_CHECKIN, {
      fields: ['employee', 'time', 'log_type'],
      filters: [
        ['time', 'between', [formattedStartDate, formattedEndDate]],
      ],
      orderBy: { field: 'time', order: 'asc' },
    })
    .then((response) => {
      return Ok(response as EmployeeCheckIn[]);
    })
    .catch((error) => {
      console.error('Error fetching today\'s check-ins:', error);
      const exception = error?.message as string | undefined;
      const message = !!exception ? exception: 'Failed to fetch today\'s check-ins';
      return Err(new CheckInError('CHECKIN_FETCH_FAILED', message));
    });

  }
  create(input: CheckinCreatePayload): Promise<Result<EmployeeCheckIn, Error>> {
    return this.frappeApp.db().createDoc(DOCTYPE_EMPLOYEE_CHECKIN, input)
      .then((createdDoc) => {
        const employeeCheckIn: EmployeeCheckIn = {
          employee: createdDoc.employee,
          log_type: createdDoc.log_type,
          time: createdDoc.time || '',
          latitude: createdDoc.latitude,
          longitude: createdDoc.longitude,
        };
        return Ok(employeeCheckIn);
      })
      .catch((error) => {
        console.error('Error creating check-in:', error);
        const exception = error?.message as string | undefined;
        const message = !!exception ? exception: 'Failed to create check-in';
        return Err(new CheckInError('CHECKIN_CREATE_FAILED', message));
      });
  }
  syncBatch(inputs: CheckinCreatePayload[]): Promise<Result<void, Error>> {
    throw new Error("Method not implemented.");
  }

}