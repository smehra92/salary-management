Expose employee listing over HTTP in server/. Wire the existing service to an
Express route, tested with supertest against the app (not a running server).

1. WIRING: the route needs an employee service backed by the real repository
   (which uses the shared PrismaClient). Compose these in a small place — e.g. a
   factory or a tiny composition step in app.ts — so the route handler receives a
   ready service. Keep the route handler free of Prisma/SQL.

2. ROUTE: src/routes/employee.route.ts
   - GET /employees
   - reads query params `page` and `pageSize` (strings -> numbers; if missing or
     non-numeric, let the service apply its defaults — do NOT duplicate the
     clamping logic here)
   - calls service.listEmployees({ page, pageSize })
   - responds 200 with the service result
     ({ data, total, page, pageSize, totalPages })
   - mount it in app.ts.

3. TESTS: src/routes/employee.route.test.ts using supertest + the test database
   (reuse the existing test-db harness; seed a handful of employees in the test):
   - GET /employees returns 200 and a body with data, total, page, pageSize,
     totalPages
   - GET /employees?page=2&pageSize=5 returns the right slice and echoes page=2,
     pageSize=5
   - GET /employees with no params uses defaults (page 1, pageSize 25)
   - GET /employees?pageSize=99999 is clamped to 100 (proves the route delegates
     to the service rather than trusting the client)

Run `npm test`; all suites (currency, service, repository, route) must be green.
Then start the server and confirm `curl "localhost:3000/employees?pageSize=3"`
returns 3 employees from the seeded dev database. Stop after I can review.