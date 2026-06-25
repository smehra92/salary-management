import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { resetDb, testDb } from '../test/db.js';

function buildEmployee(overrides: Partial<Parameters<typeof testDb.employee.create>[0]['data']> = {}) {
  return {
    name: 'Baseline Employee',
    email: 'baseline.employee@example.com',
    department: 'Engineering',
    country: 'USA',
    role: 'Mid',
    salaryAmount: 6_000_000,
    salaryCurrency: 'USD',
    joinedAt: new Date('2022-01-01'),
    ...overrides,
  };
}

describe('user journeys', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('HR adds an employee, then finds them by searching their email', async () => {
    const app = createApp();

    // A few existing employees, so the search has to actually filter, not just return "everyone".
    await testDb.employee.createMany({
      data: [
        buildEmployee({ name: 'Existing One', email: 'existing.one@example.com' }),
        buildEmployee({ name: 'Existing Two', email: 'existing.two@example.com' }),
      ],
    });

    const createResponse = await request(app).post('/employees').send({
      name: 'New Joiner',
      email: 'new.joiner@example.com',
      department: 'Sales',
      country: 'India',
      role: 'Junior',
      amountMajor: 42_000,
      currency: 'INR',
      joinedAt: '2024-03-01',
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBeTruthy();

    const searchResponse = await request(app).get('/employees').query({ search: 'new.joiner@example.com' });

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.total).toBe(1);
    expect(searchResponse.body.data).toHaveLength(1);
    expect(searchResponse.body.data[0]).toMatchObject({
      id: createResponse.body.id,
      name: 'New Joiner',
      email: 'new.joiner@example.com',
    });
  });

  it('HR corrects a salary and sees the change reflected in the employee list', async () => {
    const app = createApp();
    const employee = await testDb.employee.create({
      data: buildEmployee({ name: 'Pay Riser', email: 'pay.riser@example.com', salaryAmount: 5_000_000 }),
    });

    const patchResponse = await request(app)
      .patch(`/employees/${employee.id}/salary`)
      .send({ amountMajor: 88_000.5, currency: 'EUR' });

    expect(patchResponse.status).toBe(200);

    const listResponse = await request(app).get('/employees').query({ search: 'pay.riser@example.com' });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].salaryAmount).toBe(8_800_050);
    expect(listResponse.body.data[0].salaryCurrency).toBe('EUR');
  });

  it('filtering and pagination compose: filtering narrows the set, pagination pages through it', async () => {
    const app = createApp();

    await testDb.employee.createMany({
      data: [
        ...Array.from({ length: 12 }, (_, index) =>
          buildEmployee({
            name: `Wonderland Employee ${String(index).padStart(2, '0')}`,
            email: `wonderland${index}@example.com`,
            country: 'Wonderland',
          }),
        ),
        ...Array.from({ length: 3 }, (_, index) =>
          buildEmployee({
            name: `Otherland Employee ${index}`,
            email: `otherland${index}@example.com`,
            country: 'Otherland',
          }),
        ),
      ],
    });

    const firstPage = await request(app).get('/employees').query({ country: 'Wonderland', pageSize: 5, page: 1 });
    const secondPage = await request(app).get('/employees').query({ country: 'Wonderland', pageSize: 5, page: 2 });

    expect(firstPage.status).toBe(200);
    expect(firstPage.body.total).toBe(12);
    expect(firstPage.body.totalPages).toBe(3);
    expect(firstPage.body.data).toHaveLength(5);
    expect(firstPage.body.data.every((employee: { country: string }) => employee.country === 'Wonderland')).toBe(
      true,
    );

    expect(secondPage.body.total).toBe(12);
    expect(secondPage.body.data).toHaveLength(5);

    const firstPageIds = new Set(firstPage.body.data.map((employee: { id: string }) => employee.id));
    const overlap = secondPage.body.data.filter((employee: { id: string }) => firstPageIds.has(employee.id));
    expect(overlap).toHaveLength(0);
  });

  it('analytics reflects what was seeded: per-country USD-normalized averages add up', async () => {
    const app = createApp();

    await testDb.currencyRate.createMany({
      data: [
        { currencyCode: 'USD', rateToUsd: 1 },
        { currencyCode: 'INR', rateToUsd: 0.012 },
      ],
    });

    // USA (USD): 100,000 and 80,000 -> avg 90,000 USD.
    // India (INR): 5,000,000 and 4,000,000 major units -> 60,000 and 48,000 USD -> avg 54,000 USD.
    await testDb.employee.createMany({
      data: [
        buildEmployee({
          name: 'Alice',
          email: 'alice.analytics@example.com',
          country: 'USA',
          salaryCurrency: 'USD',
          salaryAmount: 10_000_000,
        }),
        buildEmployee({
          name: 'Bob',
          email: 'bob.analytics@example.com',
          country: 'USA',
          salaryCurrency: 'USD',
          salaryAmount: 8_000_000,
        }),
        buildEmployee({
          name: 'Carol',
          email: 'carol.analytics@example.com',
          country: 'India',
          salaryCurrency: 'INR',
          salaryAmount: 500_000_000,
        }),
        buildEmployee({
          name: 'Dave',
          email: 'dave.analytics@example.com',
          country: 'India',
          salaryCurrency: 'INR',
          salaryAmount: 400_000_000,
        }),
      ],
    });

    const response = await request(app).get('/analytics/pay-insights');

    expect(response.status).toBe(200);
    expect(response.body.totalEmployees).toBe(4);

    const usa = response.body.byCountry.find((entry: { country: string }) => entry.country === 'USA');
    const india = response.body.byCountry.find((entry: { country: string }) => entry.country === 'India');

    expect(usa.count).toBe(2);
    expect(usa.averageSalaryUsd).toBeCloseTo(90_000, 2);

    expect(india.count).toBe(2);
    expect(india.averageSalaryUsd).toBeCloseTo(54_000, 2);
  });

  it('rejects a duplicate email at creation with 409', async () => {
    const app = createApp();
    const input = {
      name: 'First Person',
      email: 'duplicate.journey@example.com',
      department: 'Engineering',
      country: 'USA',
      role: 'Mid',
      amountMajor: 60_000,
      currency: 'USD',
      joinedAt: '2023-01-01',
    };

    const first = await request(app).post('/employees').send(input);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/employees')
      .send({ ...input, name: 'Second Person' });

    expect(second.status).toBe(409);
    expect(second.body.error).toBeTruthy();
  });

  it('rejects an invalid salary amount at the API boundary with 400', async () => {
    const app = createApp();
    const employee = await testDb.employee.create({
      data: buildEmployee({ name: 'Underpaid Attempt', email: 'underpaid.attempt@example.com' }),
    });

    const response = await request(app)
      .patch(`/employees/${employee.id}/salary`)
      .send({ amountMajor: -500, currency: 'USD' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
  });
});
