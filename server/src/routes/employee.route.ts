import { Router } from 'express';
import type { createEmployeeService } from '../services/employee.service.js';
import { NotFoundError, ValidationError } from '../domain/errors.js';

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

  router.patch('/employees/:id/salary', async (req, res) => {
    try {
      const updated = await employeeService.updateEmployeeSalary(req.params.id, {
        amountMajor: req.body?.amountMajor,
        currency: req.body?.currency,
      });
      res.status(200).json(updated);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      throw error;
    }
  });

  return router;
}
