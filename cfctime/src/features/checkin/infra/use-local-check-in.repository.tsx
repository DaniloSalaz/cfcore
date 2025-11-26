import { type Result, type Option , Ok, Err} from "@/common/domain/result";
import type { EmployeeCheckIn } from "../domain/employee-check-in";
import type { CheckinCreatePayload, ICheckInLocalRespository } from "../domain/checkin-repository.interface";
import { getDatabaseInstance, type EmployeeCheckInDB } from "@/common/factories/database.factory";

export function useLocalCheckInRepository(): ICheckInLocalRespository {
  const db = getDatabaseInstance();
  return {
    getAll: async (): Promise<Result<EmployeeCheckIn[], Error>> => {
      try {
        const data = await db.employeeCheckIns.toArray();
        return Ok(data);
      } catch (error) {
        return Err(error as Error);
      }
    },
    getAllUnsynced: async (): Promise<Result<EmployeeCheckIn[], Error>> => {
      try {
        const data = await db.employeeCheckIns.where('isSync').equals(0).sortBy("time");
        return Ok(data);
      } catch (error) {
        return Err(error as Error);
      }
    },
    getSyncedByTime: async (timestamp: string): Promise<Result<Option<EmployeeCheckIn>, Error>> => {
      try {
        const data = await db.employeeCheckIns.where({ time: timestamp, isSync: 1 }).first();
        return Ok(data as Option<EmployeeCheckIn>);
      } catch (error) {
        return Err(error as Error);
      }
    },
    create: async (isUnsyn: boolean, input: CheckinCreatePayload): Promise<Result<EmployeeCheckIn, Error>> => {
      try {
        const newCheckIn: EmployeeCheckInDB = {
          ...input,
          isSync: !isUnsyn,
        } as EmployeeCheckInDB;
        const id = await db.employeeCheckIns.add(newCheckIn);
        const createdCheckIn = await db.employeeCheckIns.get(id);
        if (createdCheckIn) {
          return Ok(createdCheckIn);
        } else {
          return Err(new Error("Failed to retrieve the created check-in."));
        }
      } catch (error) {
        return Err(error as Error);
      }
    },
    delete: async (isUnsyn: boolean, timestamp: string): Promise<Result<void, Error>> => {
      try {
        await db.employeeCheckIns.where({ time: timestamp, isSync: isUnsyn ? 0 : 1 }).delete();
        return Ok(undefined);
      } catch (error) {
        return Err(error as Error);
      }
    },
    deleteAllSynced: async (): Promise<Result<void, Error>> => {
      try {
        await db.employeeCheckIns.where('isSync').equals(1).delete();
        return Ok(undefined);
      } catch (error) {
        return Err(error as Error);
      }
    },
    deleteAllUnsynced: async (): Promise<Result<void, Error>> => {
      try {
        await db.employeeCheckIns.where('isSync').equals(0).delete();
        return Ok(undefined);
      } catch (error) {
        return Err(error as Error);
      }
    },
  }
}