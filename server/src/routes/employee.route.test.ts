import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { CURRENCY_RATES_FIXTURE, EMPLOYEE_FILTER_FIXTURE } from '../test/fixtures.js';
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
  describe('pagination', () => {
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

  describe('filtering', () => {
    beforeEach(async () => {
      await resetDb();
      await testDb.employee.createMany({ data: EMPLOYEE_FILTER_FIXTURE });
    });

    it('filters by country and the total reflects only the filtered count', async () => {
      const app = createApp();

      const response = await request(app).get('/employees').query({ country: 'Germany' });

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(3);
      expect(response.body.data.map((employee: { name: string }) => employee.name).sort()).toEqual([
        'David Miller',
        'Eve Walker',
        'Frank Engineer',
      ]);
    });

    it('searches by a partial match on name or email', async () => {
      const app = createApp();

      const response = await request(app).get('/employees').query({ search: 'Ali' });

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(1);
      expect(response.body.data.map((employee: { name: string }) => employee.name)).toEqual([
        'Alice Johnson',
      ]);
    });

    it('combines a department filter with pagination over the filtered set', async () => {
      const app = createApp();

      const response = await request(app)
        .get('/employees')
        .query({ department: 'Engineering', pageSize: 5 });

      expect(response.status).toBe(200);
      expect(response.body.pageSize).toBe(5);
      expect(response.body.total).toBe(4);
      expect(response.body.totalPages).toBe(1);
      expect(response.body.data.map((employee: { name: string }) => employee.name)).toEqual([
        'Alice Johnson',
        'Bob Smith',
        'Frank Engineer',
        'Grace Lee',
      ]);
    });
  });
});

describe('PATCH /employees/:id/salary', () => {
  let employeeId: string;

  beforeEach(async () => {
    await resetDb();
    const employee = await testDb.employee.create({ data: buildEmployee(0) });
    employeeId = employee.id;
    await testDb.currencyRate.createMany({ data: CURRENCY_RATES_FIXTURE });
  });

  it('returns 200 with the updated employee on valid input', async () => {
    const app = createApp();

    const response = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({ amountMajor: 75_000.5, currency: 'EUR' });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(employeeId);
    expect(response.body.salaryAmount).toBe(7_500_050);
    expect(response.body.salaryCurrency).toBe('EUR');
  });

  it('returns 400 for an invalid amount', async () => {
    const app = createApp();

    const response = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({ amountMajor: -100, currency: 'USD' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
  });

  it('returns 400 for an unknown currency', async () => {
    const app = createApp();

    const response = await request(app)
      .patch(`/employees/${employeeId}/salary`)
      .send({ amountMajor: 1000, currency: 'XYZ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
  });

  it('returns 404 for an unknown employee id', async () => {
    const app = createApp();

    const response = await request(app)
      .patch('/employees/00000000-0000-0000-0000-000000000000/salary')
      .send({ amountMajor: 1000, currency: 'USD' });

    expect(response.status).toBe(404);
    // Distinguishes a deliberate not-found JSON response from Express's default
    // (unmatched-route) 404, which has no body — guards against a false-positive RED here.
    expect(response.body.error).toBeTruthy();
  });
});

function buildCreateInput(email: string) {
  return {
    name: 'New Employee',
    email,
    department: 'Engineering',
    country: 'USA',
    role: 'Mid',
    amountMajor: 85_000,
    currency: 'USD',
    joinedAt: '2023-06-01',
  };
}

describe('POST /employees', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('returns 201 with the created employee on valid input', async () => {
    const app = createApp();

    const response = await request(app).post('/employees').send(buildCreateInput('new.employee@example.com'));

    expect(response.status).toBe(201);
    expect(response.body.id).toBeTruthy();
    expect(response.body.email).toBe('new.employee@example.com');
  });

  it('returns 400 for an invalid body', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/employees')
      .send({ ...buildCreateInput('missing.name@example.com'), name: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
  });

  it('returns 409 when the email is already in use', async () => {
    const app = createApp();
    const input = buildCreateInput('duplicate@example.com');

    await request(app).post('/employees').send(input);
    const response = await request(app).post('/employees').send(input);

    expect(response.status).toBe(409);
    expect(response.body.error).toBeTruthy();
  });
});
