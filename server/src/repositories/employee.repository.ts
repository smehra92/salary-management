import type { Employee } from '../generated/prisma/client.js';
import { Prisma } from '../generated/prisma/client.js';
import type { EmployeeForAnalytics } from '../domain/analytics.js';
import { ConflictError, NotFoundError } from '../domain/errors.js';
import { db } from '../db.js';

const RECORD_NOT_FOUND = 'P2025';
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

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

interface UpdateSalaryData {
  salaryAmount: number;
  salaryCurrency: string;
}

export async function updateSalary(id: string, data: UpdateSalaryData): Promise<Employee> {
  try {
    return await db.employee.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND) {
      throw new NotFoundError(`Employee not found: ${id}`);
    }
    throw error;
  }
}

interface CreateEmployeeData {
  name: string;
  email: string;
  department: string;
  country: string;
  role: string;
  salaryAmount: number;
  salaryCurrency: string;
  joinedAt: Date;
}

export async function createEmployee(data: CreateEmployeeData): Promise<Employee> {
  try {
    return await db.employee.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_VIOLATION) {
      throw new ConflictError(`Email already in use: ${data.email}`);
    }
    throw error;
  }
}
