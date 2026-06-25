import type { Employee, Prisma } from '../generated/prisma/client.js';
import type { EmployeeForAnalytics } from '../domain/analytics.js';
import { db } from '../db.js';

interface EmployeeFilters {
  search?: string;
  department?: string;
  country?: string;
}

interface FindEmployeesParams {
  skip: number;
  take: number;
  filters?: EmployeeFilters;
}

interface FindEmployeesResult {
  data: Employee[];
  total: number;
}

function buildWhere(filters: EmployeeFilters = {}): Prisma.EmployeeWhereInput {
  const where: Prisma.EmployeeWhereInput = {};

  if (filters.search) {
    // SQLite's `contains` already matches case-insensitively for ASCII text;
    // Prisma's `mode: 'insensitive'` option is Postgres/Mongo-only and errors on SQLite.
    where.OR = [{ name: { contains: filters.search } }, { email: { contains: filters.search } }];
  }

  if (filters.department) {
    where.department = filters.department;
  }

  if (filters.country) {
    where.country = filters.country;
  }

  return where;
}

export async function findEmployees({ skip, take, filters }: FindEmployeesParams): Promise<FindEmployeesResult> {
  const where = buildWhere(filters);

  const [data, total] = await Promise.all([
    db.employee.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
    db.employee.count({ where }),
  ]);

  return { data, total };
}

export async function findAllEmployeeSalaries(): Promise<EmployeeForAnalytics[]> {
  return db.employee.findMany({
    select: { department: true, country: true, salaryAmount: true, salaryCurrency: true },
  });
}
