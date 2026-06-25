import type { EmployeeForAnalytics, PayInsights } from '../domain/analytics.js';
import { computePayInsights } from '../domain/analytics.js';
import type { CurrencyRate } from '../domain/currency.js';

interface AnalyticsRepository {
  findAllEmployeeSalaries(): Promise<EmployeeForAnalytics[]>;
  findAllCurrencyRates(): Promise<CurrencyRate[]>;
}

export function createAnalyticsService(repo: AnalyticsRepository) {
  async function getPayInsights(): Promise<PayInsights> {
    const [employees, rates] = await Promise.all([repo.findAllEmployeeSalaries(), repo.findAllCurrencyRates()]);

    return computePayInsights(employees, rates);
  }

  return { getPayInsights };
}
