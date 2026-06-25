import type { Employee } from '../generated/prisma/client.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

interface EmployeeRepository {
  findEmployees(params: { skip: number; take: number }): Promise<{ data: Employee[]; total: number }>;
}

interface ListEmployeesParams {
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

export function createEmployeeService(repo: EmployeeRepository) {
  async function listEmployees(params: ListEmployeesParams = {}): Promise<ListEmployeesResult> {
    const page = Math.max(params.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.min(Math.max(params.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const { data, total } = await repo.findEmployees({ skip, take: pageSize });

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
