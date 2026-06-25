import { describe, expect, it, vi } from 'vitest';

vi.mock('../domain/analytics.js', () => ({
  computePayInsights: vi.fn(),
}));

import { computePayInsights } from '../domain/analytics.js';
import { createAnalyticsService } from './analytics.service.js';

describe('createAnalyticsService', () => {
  describe('getPayInsights', () => {
    it('delegates to computePayInsights with the fetched employees and rates, returning its result as-is', async () => {
      const employees = [
        { department: 'Engineering', country: 'USA', salaryAmount: 10_000_000, salaryCurrency: 'USD' },
      ];
      const rates = [{ currencyCode: 'USD', rateToUsd: 1 }];
      const repo = {
        findAllEmployeeSalaries: vi.fn().mockResolvedValue(employees),
        findAllCurrencyRates: vi.fn().mockResolvedValue(rates),
      };
      const fakeInsights = {
        totalEmployees: 1,
        totalAnnualPayrollUsd: 100_000,
        averageSalaryUsd: 100_000,
        medianSalaryUsd: 100_000,
        byDepartment: [],
        byCountry: [],
      };
      vi.mocked(computePayInsights).mockReturnValue(fakeInsights);

      const service = createAnalyticsService(repo);
      const result = await service.getPayInsights();

      expect(computePayInsights).toHaveBeenCalledWith(employees, rates);
      expect(result).toBe(fakeInsights);
    });
  });
});
