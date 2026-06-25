import type { Employee } from '../generated/prisma/client.js';
import { db } from '../db.js';

interface FindEmployeesParams {
  skip: number;
  take: number;
}

interface FindEmployeesResult {
  data: Employee[];
  total: number;
}

export async function findEmployees({ skip, take }: FindEmployeesParams): Promise<FindEmployeesResult> {
  const [data, total] = await Promise.all([
    db.employee.findMany({ skip, take, orderBy: { name: 'asc' } }),
    db.employee.count(),
  ]);

  return { data, total };
}
