import { describe, expect, it, vi } from 'vitest';
import { createEmployeeService } from './employee.service.js';

function createFakeRepo(total: number) {
  return {
    findEmployees: vi.fn().mockResolvedValue({ data: [], total }),
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
  });
});
