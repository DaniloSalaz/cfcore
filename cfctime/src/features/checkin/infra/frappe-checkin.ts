import { type Result, Err, Ok } from "@/common/domain/result";
import { FrappeApp } from 'frappe-js-sdk';
import type { CheckinCreatePayload, ICheckInRespository } from "../domain/checkin-repository.interface";
import type { EmployeeCheckIn } from "../domain/employee-check-in";
import { getFrappeInstance } from "@/common/factories/frappe.factory";
import moment from 'moment';


const DOCTYPE_EMPLOYEE_CHECKIN = 'Employee Checkin';


export class FrappeCheckInRepository implements ICheckInRespository {
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
      return Err(error as Error);
    });

  }
  create(input: CheckinCreatePayload): Promise<Result<EmployeeCheckIn, Error>> {
    return this.frappeApp.db().createDoc(DOCTYPE_EMPLOYEE_CHECKIN, input)
      .then((createdDoc) => {
        return Ok(createdDoc as EmployeeCheckIn);
      })
      .catch((error) => {
        console.error('Error creating check-in:', error);
        return Err(error as Error);
      });
  }
  syncBatch(inputs: CheckinCreatePayload[]): Promise<Result<void, Error>> {
    throw new Error("Method not implemented.");
  }

}