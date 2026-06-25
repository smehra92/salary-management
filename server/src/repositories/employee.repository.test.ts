import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { EMPLOYEE_FILTER_FIXTURE } from '../test/fixtures.js';
import { resetDb, testDb } from '../test/db.js';
import { NotFoundError } from '../domain/errors.js';
import { findEmployees, updateSalary } from './employee.repository.js';

function buildEmployee(index: number) {
  return {
    name: `Employee ${index}`,
    email: `employee${index}@example.com`,
    department: 'Engineering',
    country: 'USA',
    role: 'Mid',
    salaryAmount: 6_000_000,
    salaryCurrency: 'USD',
    joinedAt: new Date('2022-01-01'),
  };
}

afterAll(async () => {
  await testDb.$disconnect();
});

describe('findEmployees', () => {
  describe('pagination', () => {
    beforeEach(async () => {
      await resetDb();
      await testDb.employee.createMany({
        data: Array.from({ length: 30 }, (_, index) => buildEmployee(index)),
      });
    });

    it('returns the first page of results with the total count', async () => {
      const result = await findEmployees({ skip: 0, take: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(30);
    });

    it('returns the next page with no overlap with the first', async () => {
      const firstPage = await findEmployees({ skip: 0, take: 10 });
      const secondPage = await findEmployees({ skip: 10, take: 10 });

      expect(secondPage.data).toHaveLength(10);
      const firstPageIds = new Set(firstPage.data.map((employee) => employee.id));
      const overlap = secondPage.data.filter((employee) => firstPageIds.has(employee.id));
      expect(overlap).toHaveLength(0);
    });

    it('reflects the real total count regardless of the page requested', async () => {
      const result = await findEmployees({ skip: 20, take: 10 });

      expect(result.total).toBe(30);
    });
  });

  describe('filtering', () => {
    beforeEach(async () => {
      await resetDb();
      await testDb.employee.createMany({ data: EMPLOYEE_FILTER_FIXTURE });
    });

    it('filters by country and the total matches the filtered set', async () => {
      const result = await findEmployees({ skip: 0, take: 10, filters: { country: 'Germany' } });

      expect(result.data.map((employee) => employee.name).sort()).toEqual([
        'David Miller',
        'Eve Walker',
        'Frank Engineer',
      ]);
      expect(result.total).toBe(3);
    });

    it('filters by department', async () => {
      const result = await findEmployees({ skip: 0, take: 10, filters: { department: 'Sales' } });

      expect(result.data.map((employee) => employee.name).sort()).toEqual(['Carol Davis', 'David Miller']);
      expect(result.total).toBe(2);
    });

    it('search matches a partial, case-insensitive name', async () => {
      const result = await findEmployees({ skip: 0, take: 10, filters: { search: 'ALI' } });

      expect(result.data.map((employee) => employee.name)).toEqual(['Alice Johnson']);
      expect(result.total).toBe(1);
    });

    it('search matches a partial, case-insensitive email when the name does not match', async () => {
      const result = await findEmployees({ skip: 0, take: 10, filters: { search: 'FINDME' } });

      expect(result.data.map((employee) => employee.name)).toEqual(['Eve Walker']);
      expect(result.total).toBe(1);
    });

    it('combines filters with pagination, with total reflecting only the filtered set', async () => {
      const firstPage = await findEmployees({ skip: 0, take: 2, filters: { department: 'Engineering' } });
      const secondPage = await findEmployees({ skip: 2, take: 2, filters: { department: 'Engineering' } });

      expect(firstPage.total).toBe(4);
      expect(secondPage.total).toBe(4);
      expect(firstPage.data.map((employee) => employee.name)).toEqual(['Alice Johnson', 'Bob Smith']);
      expect(secondPage.data.map((employee) => employee.name)).toEqual(['Frank Engineer', 'Grace Lee']);
    });
  });
});

describe('updateSalary', () => {
  let employeeId: string;

  beforeEach(async () => {
    await resetDb();
    const employee = await testDb.employee.create({ data: buildEmployee(0) });
    employeeId = employee.id;
  });

  it('changes the row and returns the updated employee', async () => {
    const updated = await updateSalary(employeeId, { salaryAmount: 7_500_050, salaryCurrency: 'EUR' });

    expect(updated.id).toBe(employeeId);
    expect(updated.salaryAmount).toBe(7_500_050);
    expect(updated.salaryCurrency).toBe('EUR');

    const reloaded = await testDb.employee.findUniqueOrThrow({ where: { id: employeeId } });
    expect(reloaded.salaryAmount).toBe(7_500_050);
    expect(reloaded.salaryCurrency).toBe('EUR');
  });

  it('signals not-found when the id does not exist', async () => {
    await expect(
      updateSalary('00000000-0000-0000-0000-000000000000', { salaryAmount: 1000, salaryCurrency: 'USD' }),
    ).rejects.toThrow(NotFoundError);
  });
});
