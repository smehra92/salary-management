import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb, testDb } from '../test/db.js';
import { findEmployees } from './employee.repository.js';

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

describe('findEmployees', () => {
  beforeEach(async () => {
    await resetDb();
    await testDb.employee.createMany({
      data: Array.from({ length: 30 }, (_, index) => buildEmployee(index)),
    });
  });

  afterAll(async () => {
    await testDb.$disconnect();
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
