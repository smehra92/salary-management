import type { Employee } from '../generated/prisma/client.js';
import { ValidationError } from '../domain/errors.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const KNOWN_CURRENCY_CODES = ['USD', 'INR', 'EUR', 'GBP', 'SGD', 'AUD'];

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
}

interface UpdateSalaryParams {
  amountMajor: number;
  currency: string;
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
    if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
      throw new ValidationError(`Amount must be a finite number greater than 0, received: ${amountMajor}`);
    }

    if (!KNOWN_CURRENCY_CODES.includes(currency)) {
      throw new ValidationError(`Unknown currency code: "${currency}"`);
    }

    const salaryAmount = Math.round(amountMajor * 100);

    return repo.updateSalary(id, { salaryAmount, salaryCurrency: currency });
  }

  return { listEmployees, updateEmployeeSalary };
}
