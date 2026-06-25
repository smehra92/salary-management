import type { CurrencyRate } from './currency.js';
import { convertToUsd } from './currency.js';

export interface EmployeeForAnalytics {
  department: string;
  country: string;
  salaryAmount: number;
  salaryCurrency: string;
}

interface GroupInsight {
  count: number;
  averageSalaryUsd: number;
  totalPayrollUsd: number;
}

export interface DepartmentInsight extends GroupInsight {
  department: string;
}

export interface CountryInsight extends GroupInsight {
  country: string;
}

export interface PayInsights {
  totalEmployees: number;
  totalAnnualPayrollUsd: number;
  averageSalaryUsd: number;
  medianSalaryUsd: number;
  byDepartment: DepartmentInsight[];
  byCountry: CountryInsight[];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** convertToUsd returns minor-unit USD (cents) since salaryAmount is minor-unit native currency; ÷100 gives major-unit USD (dollars). */
function toUsdMajor(employee: EmployeeForAnalytics, rates: CurrencyRate[]): number {
  return convertToUsd(employee.salaryAmount, employee.salaryCurrency, rates) / 100;
}

function median(sortedValues: number[]): number {
  const count = sortedValues.length;
  if (count === 0) {
    return 0;
  }

  const mid = Math.floor(count / 2);
  return count % 2 === 0 ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 : sortedValues[mid];
}

function groupBy(pairs: Array<[string, number]>): Map<string, number[]> {
  const groups = new Map<string, number[]>();
  for (const [key, usd] of pairs) {
    const group = groups.get(key);
    if (group) {
      group.push(usd);
    } else {
      groups.set(key, [usd]);
    }
  }
  return groups;
}

function summarizeGroup(usdSalaries: number[]): GroupInsight {
  const total = usdSalaries.reduce((sum, usd) => sum + usd, 0);
  return {
    count: usdSalaries.length,
    totalPayrollUsd: round2(total),
    averageSalaryUsd: round2(total / usdSalaries.length),
  };
}

export function computePayInsights(employees: EmployeeForAnalytics[], rates: CurrencyRate[]): PayInsights {
  const usdSalaries = employees.map((employee) => toUsdMajor(employee, rates));
  const total = usdSalaries.reduce((sum, usd) => sum + usd, 0);

  const byDepartment = [
    ...groupBy(employees.map((employee, index): [string, number] => [employee.department, usdSalaries[index]])),
  ].map(([department, salaries]) => ({ department, ...summarizeGroup(salaries) }));

  const byCountry = [
    ...groupBy(employees.map((employee, index): [string, number] => [employee.country, usdSalaries[index]])),
  ].map(([country, salaries]) => ({ country, ...summarizeGroup(salaries) }));

  return {
    totalEmployees: employees.length,
    totalAnnualPayrollUsd: round2(total),
    averageSalaryUsd: employees.length === 0 ? 0 : round2(total / employees.length),
    medianSalaryUsd: round2(median([...usdSalaries].sort((a, b) => a - b))),
    byDepartment,
    byCountry,
  };
}
