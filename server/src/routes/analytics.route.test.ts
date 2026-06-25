import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { CURRENCY_RATES_FIXTURE, EMPLOYEE_FILTER_FIXTURE } from '../test/fixtures.js';
import { resetDb, testDb } from '../test/db.js';

describe('GET /analytics/pay-insights', () => {
  beforeEach(async () => {
    await resetDb();
    await testDb.employee.createMany({ data: EMPLOYEE_FILTER_FIXTURE });
    await testDb.currencyRate.createMany({ data: CURRENCY_RATES_FIXTURE });
  });

  it('returns 200 with pay insights computed from the seeded employees and rates', async () => {
    const app = createApp();

    const response = await request(app).get('/analytics/pay-insights');

    expect(response.status).toBe(200);
    expect(response.body.totalEmployees).toBe(7);
    // Hand-computed from EMPLOYEE_FILTER_FIXTURE + CURRENCY_RATES_FIXTURE (USD=1, INR=0.012, EUR=1.08):
    // 90,000 + 600 + 40,000 + 118,800 + 140,400 + 108,000 + 720 = 498,520
    expect(response.body.totalAnnualPayrollUsd).toBeCloseTo(498_520, 2);
    expect(response.body.byDepartment).toHaveLength(3);
    expect(response.body.byCountry).toHaveLength(3);
  });
});
