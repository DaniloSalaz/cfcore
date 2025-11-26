import { type Result, Err, Ok } from "@/common/domain/result";
import type { CheckinCreatePayload, ICheckInRespository } from "../domain/checkin-repository.interface";
import type { EmployeeCheckIn } from "../domain/employee-check-in";
import { useFrappeGetDocList, useFrappeCreateDoc } from "frappe-react-sdk";
import moment from 'moment';

const DOCTYPE_EMPLOYEE_CHECKIN = 'Employee Checkin';
export function useFrappeCheckInRepository(): ICheckInRespository {
  return {
    getAllToday: function (): Promise<Result<EmployeeCheckIn[], Error>> {
      const { data, error } = useFrappeGetDocList<EmployeeCheckIn>(DOCTYPE_EMPLOYEE_CHECKIN, {
        fields: ['employee', 'time'],
        filters: [
          ['time', '>=', moment().startOf('day').toString()],
          ['time', '<=', moment().endOf('day').toString()],
        ],
        orderBy: {
            field: "time",
            order: 'desc'
        },
      });
      return new Promise((resolve) => {
        if (error) {
          resolve(Err(error as unknown as Error));
        } else if (data) {
          resolve(Ok(data));
        } else {
          resolve(Err(new Error('Unknown error occurred while fetching check-ins.')));
        }
      });
    },
  create: async function (input: CheckinCreatePayload): Promise<Result<EmployeeCheckIn, Error>> {
    const { createDoc, error } = useFrappeCreateDoc();
    try {
      const createdDoc = await createDoc(DOCTYPE_EMPLOYEE_CHECKIN, input);
      return new Promise((resolve) => {
        if (error) {
          resolve(Err(error as unknown as Error));
        } else {
          resolve(Ok(createdDoc as EmployeeCheckIn));
        }
      });
    } catch (error) {
      return Promise.resolve(Err(error as Error));
    }
  },
  syncBatch: function (inputs: CheckinCreatePayload[]): Promise<Result<void, Error>> {
    throw new Error("Function not implemented.");
  }
};
} 