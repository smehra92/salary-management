import { Router } from 'express';
import type { createEmployeeService } from '../services/employee.service.js';

type EmployeeService = ReturnType<typeof createEmployeeService>;

function parseQueryNumber(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseQueryString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function createEmployeeRouter(employeeService: EmployeeService): Router {
  const router = Router();

  router.get('/employees', async (req, res) => {
    const page = parseQueryNumber(req.query.page);
    const pageSize = parseQueryNumber(req.query.pageSize);
    const search = parseQueryString(req.query.search);
    const department = parseQueryString(req.query.department);
    const country = parseQueryString(req.query.country);

    const result = await employeeService.listEmployees({ page, pageSize, search, department, country });

    res.status(200).json(result);
  });

  return router;
}
