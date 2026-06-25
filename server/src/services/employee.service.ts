import type { Employee } from '../generated/prisma/client.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

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

  return { listEmployees };
}
