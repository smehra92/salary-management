Expose pay insights over HTTP in server/. The hard logic already lives in
src/domain/analytics.ts (tested); these layers just fetch and feed it.

1. REPOSITORY: a method to fetch all employees' { department, country,
   salaryAmount, salaryCurrency } and a method to fetch all CurrencyRate rows.
2. SERVICE: createAnalyticsService(repo) -> { getPayInsights() } that loads
   employees + rates and returns computePayInsights(employees, rates).
3. ROUTE: GET /analytics/pay-insights -> 200 with the PayInsights JSON. Thin
   handler. Mount in app.ts.
4. TESTS:
   - service test with a fake repo (returns fixed employees + rates) asserting it
     delegates to computePayInsights and returns its result
   - route test (supertest, test db seeded with a few employees + rates) asserting
     200 and the expected top-level fields (totalEmployees, totalAnnualPayrollUsd,
     byDepartment, byCountry)

Run `npm test` (all green), then curl localhost:3000/analytics/pay-insights against
the seeded dev db and confirm realistic numbers. Stop after I can review.