/**
 * A small, deliberately varied set of employees for exercising search and
 * filter behaviour (distinct names/emails/departments/countries), shared by
 * the repository and route test suites.
 */
export const EMPLOYEE_FILTER_FIXTURE = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    department: 'Engineering',
    country: 'USA',
    role: 'Senior',
    salaryAmount: 9_000_000,
    salaryCurrency: 'USD',
    joinedAt: new Date('2021-01-01'),
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    department: 'Engineering',
    country: 'India',
    role: 'Mid',
    salaryAmount: 5_000_000,
    salaryCurrency: 'INR',
    joinedAt: new Date('2021-02-01'),
  },
  {
    name: 'Carol Davis',
    email: 'carol.davis@example.com',
    department: 'Sales',
    country: 'USA',
    role: 'Junior',
    salaryAmount: 4_000_000,
    salaryCurrency: 'USD',
    joinedAt: new Date('2021-03-01'),
  },
  {
    name: 'David Miller',
    email: 'david.miller@example.com',
    department: 'Sales',
    country: 'Germany',
    role: 'Lead',
    salaryAmount: 11_000_000,
    salaryCurrency: 'EUR',
    joinedAt: new Date('2021-04-01'),
  },
  {
    name: 'Eve Walker',
    email: 'walker.special@findme.com',
    department: 'Marketing',
    country: 'Germany',
    role: 'Manager',
    salaryAmount: 13_000_000,
    salaryCurrency: 'EUR',
    joinedAt: new Date('2021-05-01'),
  },
  {
    name: 'Frank Engineer',
    email: 'frank.eng@example.com',
    department: 'Engineering',
    country: 'Germany',
    role: 'Senior',
    salaryAmount: 10_000_000,
    salaryCurrency: 'EUR',
    joinedAt: new Date('2021-06-01'),
  },
  {
    name: 'Grace Lee',
    email: 'grace.lee@example.com',
    department: 'Engineering',
    country: 'India',
    role: 'Lead',
    salaryAmount: 6_000_000,
    salaryCurrency: 'INR',
    joinedAt: new Date('2021-07-01'),
  },
];

/** Rates matching the currencies used in EMPLOYEE_FILTER_FIXTURE. */
export const CURRENCY_RATES_FIXTURE = [
  { currencyCode: 'USD', rateToUsd: 1 },
  { currencyCode: 'INR', rateToUsd: 0.012 },
  { currencyCode: 'EUR', rateToUsd: 1.08 },
];
