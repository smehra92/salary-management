import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { resetDb, testDb } from '../test/db.js';

const TOTAL_SEEDED = 12;

function buildEmployee(index: number) {
  return {
    name: `Employee ${String(index).padStart(2, '0')}`,
    email: `employee${index}@example.com`,
    department: 'Engineering',
    country: 'USA',
    role: 'Mid',
    salaryAmount: 6_000_000,
    salaryCurrency: 'USD',
    joinedAt: new Date('2022-01-01'),
  };
}

describe('GET /employees', () => {
  beforeEach(async () => {
    await resetDb();
    await testDb.employee.createMany({
      data: Array.from({ length: TOTAL_SEEDED }, (_, index) => buildEmployee(index)),
    });
  });

  it('returns 200 with a paginated employee list shape', async () => {
    const app = createApp();

    const response = await request(app).get('/employees');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBe(TOTAL_SEEDED);
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('pageSize');
    expect(response.body).toHaveProperty('totalPages');
  });

  it('returns the requested slice and echoes page/pageSize', async () => {
    const app = createApp();

    const response = await request(app).get('/employees').query({ page: 2, pageSize: 5 });

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(2);
    expect(response.body.pageSize).toBe(5);
    expect(response.body.total).toBe(TOTAL_SEEDED);
    expect(response.body.totalPages).toBe(3);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.data.map((employee: { name: string }) => employee.name)).toEqual([
      'Employee 05',
      'Employee 06',
      'Employee 07',
      'Employee 08',
      'Employee 09',
    ]);
  });

  it('uses default page 1 and pageSize 25 when no params are given', async () => {
    const app = createApp();

    const response = await request(app).get('/employees');

    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(25);
    expect(response.body.data).toHaveLength(TOTAL_SEEDED);
  });

  it('clamps an excessive pageSize to 100, proving the route delegates to the service', async () => {
    const app = createApp();

    const response = await request(app).get('/employees').query({ pageSize: 99999 });

    expect(response.status).toBe(200);
    expect(response.body.pageSize).toBe(100);
  });
});
