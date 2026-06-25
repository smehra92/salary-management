import { describe, expect, it, vi } from 'vitest';
import { NotFoundError, ValidationError } from '../domain/errors.js';
import { createEmployeeService } from './employee.service.js';

function createFakeRepo(total: number) {
  return {
    findEmployees: vi.fn().mockResolvedValue({ data: [], total }),
  };
}

function createFakeUpdateRepo(updateSalary: ReturnType<typeof vi.fn>) {
  return {
    findEmployees: vi.fn(),
    updateSalary,
  };
}

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
      const updateSalary = vi.fn().mockResolvedValue({ id: 'abc', salaryAmount: 7_500_050, salaryCurrency: 'EUR' });
      const repo = createFakeUpdateRepo(updateSalary);
      const service = createEmployeeService(repo);

      await service.updateEmployeeSalary('abc', { amountMajor: 75_000.5, currency: 'EUR' });

      expect(updateSalary).toHaveBeenCalledWith('abc', { salaryAmount: 7_500_050, salaryCurrency: 'EUR' });
    });

    it('rejects a non-positive, NaN, or non-finite amount without calling the repo', async () => {
      const updateSalary = vi.fn();
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
      const updateSalary = vi.fn();
      const repo = createFakeUpdateRepo(updateSalary);
      const service = createEmployeeService(repo);

      await expect(service.updateEmployeeSalary('abc', { amountMajor: 1000, currency: 'XYZ' })).rejects.toThrow(
        ValidationError,
      );
      expect(updateSalary).not.toHaveBeenCalled();
    });

    it('propagates a not-found error from the repo', async () => {
      const updateSalary = vi.fn().mockRejectedValue(new NotFoundError('Employee not found: missing'));
      const repo = createFakeUpdateRepo(updateSalary);
      const service = createEmployeeService(repo);

      await expect(
        service.updateEmployeeSalary('missing', { amountMajor: 1000, currency: 'USD' }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
