import type { Employee } from '../generated/prisma/client.js';
import { ValidationError } from '../domain/errors.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const KNOWN_CURRENCY_CODES = ['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AUD'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED_EMPLOYEE_FIELDS = ['name', 'email', 'department', 'country', 'role'] as const;

interface EmployeeFilters {
  search?: string;
  department?: string;
  country?: string;
}

interface EmployeeRepository {
  findEmployees(params: {
    skip: number;
    take: number;
    filters?: EmployeeFilters;
  }): Promise<{ data: Employee[]; total: number }>;
  updateSalary(id: string, data: { salaryAmount: number; salaryCurrency: string }): Promise<Employee>;
  createEmployee(data: {
    name: string;
    email: string;
    department: string;
    country: string;
    role: string;
    salaryAmount: number;
    salaryCurrency: string;
    joinedAt: Date;
  }): Promise<Employee>;
}

interface UpdateSalaryParams {
  amountMajor: number;
  currency: string;
}

interface CreateEmployeeInput {
  name: string;
  email: string;
  department: string;
  country: string;
  role: string;
  amountMajor: number;
  currency: string;
  joinedAt: string;
}

interface ListEmployeesParams extends EmployeeFilters {
  page?: number;
  pageSize?: number;
}

interface ListEmployeesResult {
  data: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function normalizeFilter(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Returns undefined (rather than an all-empty object) when no filter was meaningfully provided. */
function buildFilters(params: ListEmployeesParams): EmployeeFilters | undefined {
  const search = normalizeFilter(params.search);
  const department = normalizeFilter(params.department);
  const country = normalizeFilter(params.country);

  if (search === undefined && department === undefined && country === undefined) {
    return undefined;
  }

  return { search, department, country };
}

function assertValidAmountAndCurrency(amountMajor: number, currency: string): void {
  if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
    throw new ValidationError(`Amount must be a finite number greater than 0, received: ${amountMajor}`);
  }

  if (!KNOWN_CURRENCY_CODES.includes(currency)) {
    throw new ValidationError(`Unknown currency code: "${currency}"`);
  }
}

function toMinorUnits(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}

function assertRequiredEmployeeFields(input: CreateEmployeeInput): void {
  for (const field of REQUIRED_EMPLOYEE_FIELDS) {
    if (!input[field]?.trim()) {
      throw new ValidationError(`${field} is required`);
    }
  }

  if (!EMAIL_PATTERN.test(input.email)) {
    throw new ValidationError(`Invalid email address: "${input.email}"`);
  }
}

function parseJoinedAt(joinedAt: string): Date {
  const parsed = new Date(joinedAt);

  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`Invalid joinedAt date: "${joinedAt}"`);
  }

  if (parsed.getTime() > Date.now()) {
    throw new ValidationError(`joinedAt cannot be in the future: "${joinedAt}"`);
  }

  return parsed;
}

export function createEmployeeService(repo: EmployeeRepository) {
  async function listEmployees(params: ListEmployeesParams = {}): Promise<ListEmployeesResult> {
    const page = Math.max(params.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.min(Math.max(params.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const skip = (page - 1) * pageSize;
    const filters = buildFilters(params);

    const { data, total } = await repo.findEmployees({ skip, take: pageSize, filters });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async function updateEmployeeSalary(id: string, { amountMajor, currency }: UpdateSalaryParams): Promise<Employee> {
    assertValidAmountAndCurrency(amountMajor, currency);

    return repo.updateSalary(id, { salaryAmount: toMinorUnits(amountMajor), salaryCurrency: currency });
  }

  async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    assertRequiredEmployeeFields(input);
    assertValidAmountAndCurrency(input.amountMajor, input.currency);
    const joinedAt = parseJoinedAt(input.joinedAt);

    return repo.createEmployee({
      name: input.name,
      email: input.email,
      department: input.department,
      country: input.country,
      role: input.role,
      salaryAmount: toMinorUnits(input.amountMajor),
      salaryCurrency: input.currency,
      joinedAt,
    });
  }

  return { listEmployees, updateEmployeeSalary, createEmployee };
}
