import { describe, expect, it } from 'vitest';
import { computePayInsights } from './analytics.js';

const RATES = [
  { currencyCode: 'USD', rateToUsd: 1 },
  { currencyCode: 'INR', rateToUsd: 0.012 },
  { currencyCode: 'EUR', rateToUsd: 1.08 },
];

// salaryAmount is in MINOR units (cents/paise). Hand-computed USD equivalents
// (major units = salaryAmount / 100, then * rateToUsd):
//   Alice: USA  / Engineering / USD 10,000,000 minor -> 100,000.00 major * 1     = 100,000.00 USD
//   Bob:   USA  / Sales       / USD  8,000,000 minor ->  80,000.00 major * 1     =  80,000.00 USD
//   Carol: India/ Engineering / INR 500,000,000 minor -> 5,000,000.00 major * 0.012 = 60,000.00 USD
//   David: India/ Sales       / INR 400,000,000 minor -> 4,000,000.00 major * 0.012 = 48,000.00 USD
//   Eve:   USA  / Engineering / USD  4,000,000 minor ->  40,000.00 major * 1     =  40,000.00 USD
const ALICE = { department: 'Engineering', country: 'USA', salaryAmount: 10_000_000, salaryCurrency: 'USD' };
const BOB = { department: 'Sales', country: 'USA', salaryAmount: 8_000_000, salaryCurrency: 'USD' };
const CAROL = { department: 'Engineering', country: 'India', salaryAmount: 500_000_000, salaryCurrency: 'INR' };
const DAVID = { department: 'Sales', country: 'India', salaryAmount: 400_000_000, salaryCurrency: 'INR' };
const EVE = { department: 'Engineering', country: 'USA', salaryAmount: 4_000_000, salaryCurrency: 'USD' };

// Sixth employee, added only for the even-count median test:
//   Frank: Germany / Marketing / EUR 5,000,000 minor -> 50,000.00 major * 1.08 = 54,000.00 USD
const FRANK = { department: 'Marketing', country: 'Germany', salaryAmount: 5_000_000, salaryCurrency: 'EUR' };

// 5 employees (odd count).
const EMPLOYEES = [ALICE, BOB, CAROL, DAVID, EVE];

function findGroup<T extends object>(groups: T[], key: keyof T, value: unknown): T {
  const group = groups.find((g) => g[key] === value);
  if (!group) {
    throw new Error(`Expected a group for ${String(key)}=${String(value)}`);
  }
  return group;
}

describe('computePayInsights', () => {
  it('counts every employee in totalEmployees', () => {
    const result = computePayInsights(EMPLOYEES, RATES);

    expect(result.totalEmployees).toBe(5);
  });

  it('sums normalized salaries across mixed currencies into totalAnnualPayrollUsd', () => {
    // 100,000 + 80,000 + 60,000 + 48,000 + 40,000 = 328,000.00 USD
    const result = computePayInsights(EMPLOYEES, RATES);

    expect(result.totalAnnualPayrollUsd).toBeCloseTo(328_000, 2);
  });

  it('computes averageSalaryUsd as total / count', () => {
    // 328,000 / 5 = 65,600.00 USD
    const result = computePayInsights(EMPLOYEES, RATES);

    expect(result.averageSalaryUsd).toBeCloseTo(65_600, 2);
  });

  it('computes medianSalaryUsd as the middle value for an odd count', () => {
    // sorted USD: [40,000 (Eve), 48,000 (David), 60,000 (Carol), 80,000 (Bob), 100,000 (Alice)]
    // middle (3rd of 5) = 60,000.00 USD
    const result = computePayInsights(EMPLOYEES, RATES);

    expect(result.medianSalaryUsd).toBeCloseTo(60_000, 2);
  });

  it('computes medianSalaryUsd as the average of the two middle values for an even count', () => {
    // adding Frank (54,000 USD) makes 6 employees.
    // sorted USD: [40,000, 48,000, 54,000 (Frank), 60,000, 80,000, 100,000]
    // median = (54,000 + 60,000) / 2 = 57,000.00 USD
    const result = computePayInsights([...EMPLOYEES, FRANK], RATES);

    expect(result.medianSalaryUsd).toBeCloseTo(57_000, 2);
  });

  it('groups byDepartment with correct count, average, and total per department', () => {
    // Engineering: Alice 100,000 + Carol 60,000 + Eve 40,000 = 200,000 total, count 3, avg 66,666.67
    // Sales:       Bob 80,000 + David 48,000 = 128,000 total, count 2, avg 64,000.00
    const result = computePayInsights(EMPLOYEES, RATES);

    expect(result.byDepartment).toHaveLength(2);

    const engineering = findGroup(result.byDepartment, 'department', 'Engineering');
    expect(engineering.count).toBe(3);
    expect(engineering.totalPayrollUsd).toBeCloseTo(200_000, 2);
    expect(engineering.averageSalaryUsd).toBeCloseTo(200_000 / 3, 2);

    const sales = findGroup(result.byDepartment, 'department', 'Sales');
    expect(sales.count).toBe(2);
    expect(sales.totalPayrollUsd).toBeCloseTo(128_000, 2);
    expect(sales.averageSalaryUsd).toBeCloseTo(64_000, 2);
  });

  it('groups byCountry with correct count, average, and total per country', () => {
    // USA:   Alice 100,000 + Bob 80,000 + Eve 40,000 = 220,000 total, count 3, avg 73,333.33
    // India: Carol 60,000 + David 48,000 = 108,000 total, count 2, avg 54,000.00
    const result = computePayInsights(EMPLOYEES, RATES);

    expect(result.byCountry).toHaveLength(2);

    const usa = findGroup(result.byCountry, 'country', 'USA');
    expect(usa.count).toBe(3);
    expect(usa.totalPayrollUsd).toBeCloseTo(220_000, 2);
    expect(usa.averageSalaryUsd).toBeCloseTo(220_000 / 3, 2);

    const india = findGroup(result.byCountry, 'country', 'India');
    expect(india.count).toBe(2);
    expect(india.totalPayrollUsd).toBeCloseTo(108_000, 2);
    expect(india.averageSalaryUsd).toBeCloseTo(54_000, 2);
  });

  it('returns zeros and empty groups for an empty employee list, without throwing', () => {
    const result = computePayInsights([], RATES);

    expect(result.totalEmployees).toBe(0);
    expect(result.totalAnnualPayrollUsd).toBe(0);
    expect(result.averageSalaryUsd).toBe(0);
    expect(result.medianSalaryUsd).toBe(0);
    expect(result.byDepartment).toEqual([]);
    expect(result.byCountry).toEqual([]);
  });
});
