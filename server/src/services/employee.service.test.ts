import type { Mock } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import type { Employee } from '../generated/prisma/client.js';
import { ConflictError, NotFoundError, ValidationError } from '../domain/errors.js';
import { createEmployeeService } from './employee.service.js';

type UpdateSalaryFn = (id: string, data: { salaryAmount: number; salaryCurrency: string }) => Promise<Employee>;
type CreateEmployeeFn = (data: {
  name: string;
  email: string;
  department: string;
  country: string;
  role: string;
  salaryAmount: number;
  salaryCurrency: string;
  joinedAt: Date;
}) => Promise<Employee>;

function createFakeRepo(total: number) {
  return {
    findEmployees: vi.fn().mockResolvedValue({ data: [], total }),
    updateSalary: vi.fn<UpdateSalaryFn>(),
    createEmployee: vi.fn<CreateEmployeeFn>(),
  };
}

function createFakeUpdateRepo(updateSalary: Mock<UpdateSalaryFn>) {
  return {
    findEmployees: vi.fn(),
    updateSalary,
    createEmployee: vi.fn<CreateEmployeeFn>(),
  };
}

function createFakeCreateRepo(createEmployee: Mock<CreateEmployeeFn>) {
  return {
    findEmployees: vi.fn(),
    updateSalary: vi.fn<UpdateSalaryFn>(),
    createEmployee,
  };
}

const VALID_CREATE_INPUT = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  department: 'Engineering',
  country: 'USA',
  role: 'Senior',
  amountMajor: 95_000,
  currency: 'USD',
  joinedAt: '2023-01-01',
};

describe('createEmployeeService', () => {
  describe('listEmployees', () => {
    it('defaults to page 1, pageSize 25 when no params are given', async () => {
      const repo = createFakeRepo(0);
      const service = createEmployeeService(repo);

      const result = await service.listEmployees({});

      expect(repo.findEmployees).toHaveBeenCalledWith({ skip: 0, take: 25 });
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(25);
    });

    it('clamps pageSize to a max of 100', async () => {
      const repo = createFakeRepo(0);
      const service = createEmployeeService(repo);

      const result = await service.listEmployees({ pageSize: 500 });

      expect(repo.findEmployees).toHaveBeenCalledWith({ skip: 0, take: 100 });
      expect(result.pageSize).toBe(100);
    });

    it('coerces page < 1 up to 1', async () => {
      const repo = createFakeRepo(0);
      const service = createEmployeeService(repo);

      const result = await service.listEmployees({ page: -5 });

      expect(repo.findEmployees).toHaveBeenCalledWith({ skip: 0, take: 25 });
      expect(result.page).toBe(1);
    });

    it('computes skip correctly and passes skip/take to the repo', async () => {
      const repo = createFakeRepo(0);
      const service = createEmployeeService(repo);

      await service.listEmployees({ page: 3, pageSize: 20 });

      expect(repo.findEmployees).toHaveBeenCalledWith({ skip: 40, take: 20 });
    });

    it('computes totalPages as ceil(total / pageSize)', async () => {
      const repo = createFakeRepo(95);
      const service = createEmployeeService(repo);

      const result = await service.listEmployees({ page: 1, pageSize: 20 });

      expect(result.total).toBe(95);
      expect(result.totalPages).toBe(5);
    });

    it('normalizes empty or whitespace-only filters to undefined', async () => {
      const repo = createFakeRepo(0);
      const service = createEmployeeService(repo);

      await service.listEmployees({ search: '   ', department: '', country: undefined });

      expect(repo.findEmployees).toHaveBeenCalledWith({ skip: 0, take: 25 });
    });

    it('trims and forwards filters to the repo', async () => {
      const repo = createFakeRepo(0);
      const service = createEmployeeService(repo);

      await service.listEmployees({ search: '  ann  ', department: 'Engineering', country: 'USA' });

      expect(repo.findEmployees).toHaveBeenCalledWith({
        skip: 0,
        take: 25,
        filters: { search: 'ann', department: 'Engineering', country: 'USA' },
      });
    });
  });

  describe('updateEmployeeSalary', () => {
    it('converts amountMajor to minor units and calls repo.updateSalary with the right args', async () => {
      const updateSalary = vi
        .fn<UpdateSalaryFn>()
        .mockResolvedValue({ id: 'abc', salaryAmount: 7_500_050, salaryCurrency: 'EUR' } as Employee);
      const repo = createFakeUpdateRepo(updateSalary);
      const service = createEmployeeService(repo);

      await service.updateEmployeeSalary('abc', { amountMajor: 75_000.5, currency: 'EUR' });

      expect(updateSalary).toHaveBeenCalledWith('abc', { salaryAmount: 7_500_050, salaryCurrency: 'EUR' });
    });

    it('rejects a non-positive, NaN, or non-finite amount without calling the repo', async () => {
      const updateSalary = vi.fn<UpdateSalaryFn>();
      const repo = createFakeUpdateRepo(updateSalary);
      const service = createEmployeeService(repo);

      await expect(service.updateEmployeeSalary('abc', { amountMajor: 0, currency: 'USD' })).rejects.toThrow(
        ValidationError,
      );
      await expect(service.updateEmployeeSalary('abc', { amountMajor: -50, currency: 'USD' })).rejects.toThrow(
        ValidationError,
      );
      await expect(service.updateEmployeeSalary('abc', { amountMajor: NaN, currency: 'USD' })).rejects.toThrow(
        ValidationError,
      );
      await expect(
        service.updateEmployeeSalary('abc', { amountMajor: Infinity, currency: 'USD' }),
      ).rejects.toThrow(ValidationError);

      expect(updateSalary).not.toHaveBeenCalled();
    });

    it('rejects an unknown currency without calling the repo', async () => {
      const updateSalary = vi.fn<UpdateSalaryFn>();
      const repo = createFakeUpdateRepo(updateSalary);
      const service = createEmployeeService(repo);

      await expect(service.updateEmployeeSalary('abc', { amountMajor: 1000, currency: 'XYZ' })).rejects.toThrow(
        ValidationError,
      );
      expect(updateSalary).not.toHaveBeenCalled();
    });

    it('propagates a not-found error from the repo', async () => {
      const updateSalary = vi.fn<UpdateSalaryFn>().mockRejectedValue(new NotFoundError('Employee not found: missing'));
      const repo = createFakeUpdateRepo(updateSalary);
      const service = createEmployeeService(repo);

      await expect(
        service.updateEmployeeSalary('missing', { amountMajor: 1000, currency: 'USD' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('createEmployee', () => {
    it('converts amountMajor to minor units and calls repo.createEmployee with the right shape', async () => {
      const createEmployee = vi.fn<CreateEmployeeFn>().mockResolvedValue({ id: 'new-id' } as Employee);
      const repo = createFakeCreateRepo(createEmployee);
      const service = createEmployeeService(repo);

      await service.createEmployee(VALID_CREATE_INPUT);

      expect(createEmployee).toHaveBeenCalledWith({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        department: 'Engineering',
        country: 'USA',
        role: 'Senior',
        salaryAmount: 9_500_000,
        salaryCurrency: 'USD',
        joinedAt: new Date('2023-01-01'),
      });
    });

    it('rejects a missing or empty required field without calling the repo', async () => {
      const createEmployee = vi.fn<CreateEmployeeFn>();
      const repo = createFakeCreateRepo(createEmployee);
      const service = createEmployeeService(repo);

      for (const field of ['name', 'email', 'department', 'country', 'role'] as const) {
        await expect(service.createEmployee({ ...VALID_CREATE_INPUT, [field]: '' })).rejects.toThrow(
          ValidationError,
        );
      }

      expect(createEmployee).not.toHaveBeenCalled();
    });

    it('rejects a malformed email without calling the repo', async () => {
      const createEmployee = vi.fn<CreateEmployeeFn>();
      const repo = createFakeCreateRepo(createEmployee);
      const service = createEmployeeService(repo);

      await expect(
        service.createEmployee({ ...VALID_CREATE_INPUT, email: 'not-an-email' }),
      ).rejects.toThrow(ValidationError);
      expect(createEmployee).not.toHaveBeenCalled();
    });

    it('rejects a non-positive amount or unknown currency without calling the repo', async () => {
      const createEmployee = vi.fn<CreateEmployeeFn>();
      const repo = createFakeCreateRepo(createEmployee);
      const service = createEmployeeService(repo);

      await expect(service.createEmployee({ ...VALID_CREATE_INPUT, amountMajor: 0 })).rejects.toThrow(
        ValidationError,
      );
      await expect(service.createEmployee({ ...VALID_CREATE_INPUT, currency: 'ZZZ' })).rejects.toThrow(
        ValidationError,
      );
      expect(createEmployee).not.toHaveBeenCalled();
    });

    it('rejects a joinedAt date in the future without calling the repo', async () => {
      const createEmployee = vi.fn<CreateEmployeeFn>();
      const repo = createFakeCreateRepo(createEmployee);
      const service = createEmployeeService(repo);

      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);

      await expect(
        service.createEmployee({ ...VALID_CREATE_INPUT, joinedAt: future.toISOString() }),
      ).rejects.toThrow(ValidationError);
      expect(createEmployee).not.toHaveBeenCalled();
    });

    it('propagates a conflict error from the repo', async () => {
      const createEmployee = vi
        .fn<CreateEmployeeFn>()
        .mockRejectedValue(new ConflictError('Email already in use: ada@example.com'));
      const repo = createFakeCreateRepo(createEmployee);
      const service = createEmployeeService(repo);

      await expect(service.createEmployee(VALID_CREATE_INPUT)).rejects.toThrow(ConflictError);
    });
  });
});
