In server/, create FAILING tests for a pure salary-analytics function. No
database, no implementation yet — test first.

Create src/domain/analytics.ts (to be implemented later) exposing:
  computePayInsights(employees, rates): PayInsights

where each employee has at least { department, country, salaryAmount,
salaryCurrency } and salaryAmount is in MINOR units (integer cents/paise).
Reuse convertToUsd from ./currency for all conversions. All output money figures
are in whole USD (major units), rounded to 2 decimals.

PayInsights shape:
{
  totalEmployees: number
  totalAnnualPayrollUsd: number        // sum of all salaries, normalized to USD
  averageSalaryUsd: number
  medianSalaryUsd: number
  byDepartment: Array<{ department, count, averageSalaryUsd, totalPayrollUsd }>
  byCountry:    Array<{ country, count, averageSalaryUsd, totalPayrollUsd }>
}

Write src/domain/analytics.test.ts with a SMALL hand-built fixture (e.g. 5–6
employees across 2 countries / 2 departments and 2–3 currencies) where you can
compute the expected USD numbers BY HAND in the test comments. Cover:
- totalEmployees counts everyone
- totalAnnualPayrollUsd sums normalized salaries (mixed currencies) — use
  toBeCloseTo(value, 2)
- averageSalaryUsd = total / count
- medianSalaryUsd: test BOTH an odd count (middle value) and an even count
  (average of the two middle values) — add/remove a fixture row across two tests
- byDepartment groups correctly: right count, average and total per department,
  normalized
- byCountry groups correctly likewise
- an empty employee list returns zeros / empty arrays without throwing

Remember salaryAmount is in minor units: convert to major units (÷100) as part of
producing USD figures. Import from "./analytics" so the suite fails. Run
`npm test`, confirm it fails because analytics.ts has no implementation. Stop.