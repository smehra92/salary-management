import { Router } from 'express';
import type { Response } from 'express';
import type { createEmployeeService } from '../services/employee.service.js';
import { ConflictError, NotFoundError, ValidationError } from '../domain/errors.js';

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

/** Maps domain errors to HTTP status codes; rethrows anything else for Express's default handler. */
function sendErrorResponse(error: unknown, res: Response): void {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }
  if (error instanceof ConflictError) {
    res.status(409).json({ error: error.message });
    return;
  }
  throw error;
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

  router.post('/employees', async (req, res) => {
    try {
      const created = await employeeService.createEmployee({
        name: req.body?.name,
        email: req.body?.email,
        department: req.body?.department,
        country: req.body?.country,
        role: req.body?.role,
        amountMajor: req.body?.amountMajor,
        currency: req.body?.currency,
        joinedAt: req.body?.joinedAt,
      });
      res.status(201).json(created);
    } catch (error) {
      sendErrorResponse(error, res);
    }
  });

  router.patch('/employees/:id/salary', async (req, res) => {
    try {
      const updated = await employeeService.updateEmployeeSalary(req.params.id, {
        amountMajor: req.body?.amountMajor,
        currency: req.body?.currency,
      });
      res.status(200).json(updated);
    } catch (error) {
      sendErrorResponse(error, res);
    }
  });

  return router;
}
