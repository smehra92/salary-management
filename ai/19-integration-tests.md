Add a small, focused suite of integration tests in server/ that exercise full user
journeys across multiple endpoints (via supertest against the app + test database).
These complement, not duplicate, the existing unit/route tests. Keep them fast and
deterministic (reuse the test-db harness; reset between tests).

Create src/__tests__/journeys.integration.test.ts (or similar) covering:

1. "HR adds an employee, then finds them": POST /employees a new joiner ->
   GET /employees?search=<their email> returns exactly that employee, and the
   total reflects the filtered count.

2. "HR corrects a salary end to end": seed/create an employee -> PATCH
   /employees/:id/salary with a new amount/currency -> GET /employees and confirm
   the row shows the updated salary (in minor units) and currency.

3. "Filtering and pagination compose": seed a known mix (e.g. several countries) ->
   GET /employees?country=X&pageSize=N -> assert only country X, correct total,
   correct totalPages for the FILTERED set, and that page 2 returns a disjoint set.

4. "Analytics reflects the data": seed a SMALL known set with hand-computable USD
   figures across 2 countries/currencies -> GET /analytics/pay-insights ->
   assert totalEmployees, and that byCountry contains both countries with the
   expected normalized averages (toBeCloseTo). This proves the create/seed ->
   analytics path holds together.

5. "Validation is enforced at the API boundary": POST /employees with a duplicate
   email -> 409; PATCH salary with a negative amount -> 400. (One or two
   representative error journeys, not every case — units already cover those.)

Give each test a descriptive name that reads like the user story. Run `npm test`;
the full suite (unit + route + integration) must be green and reasonably fast.
Report the total test count and rough runtime. Stop after I can review.