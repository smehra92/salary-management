In server/, set up database testing infrastructure and write FAILING tests for
employee listing with pagination. Do NOT write the repository or service
implementation yet — tests must fail first.

1. TEST DATABASE SETUP (deterministic + isolated, never touches dev.db):
   - Add a Vitest setup that points DATABASE_URL at a separate throwaway test
     database file (e.g. file:./test.db), and applies the schema to it with
     `prisma db push --skip-generate` before tests run.
   - Provide a test PrismaClient and a helper to reset tables (deleteMany on
     Employee + CurrencyRate) in beforeEach, so every test starts clean.
   - Configure vitest.config so this setup runs and tests are isolated.

2. DEFINE THE CONTRACT. The repository exposes:
     findEmployees({ skip, take }): Promise<{ data: Employee[]; total: number }>
   The service exposes a factory:
     createEmployeeService(repo) -> { listEmployees({ page?, pageSize? }) }
   listEmployees returns:
     { data, total, page, pageSize, totalPages }

3. SERVICE UNIT TESTS (src/services/employee.service.test.ts) — use a FAKE repo
   object (no database), spy on its calls:
   - defaults to page 1, pageSize 25 when no params given
   - clamps pageSize to a max of 100
   - coerces page < 1 up to 1
   - computes skip correctly ((page-1)*pageSize) and passes skip/take to the repo
   - computes totalPages = ceil(total / pageSize)

4. REPOSITORY INTEGRATION TESTS (src/repositories/employee.repository.test.ts) —
   against the test DB:
   - insert 30 employees, then findEmployees({skip:0, take:10}) returns 10 rows
     and total 30
   - findEmployees({skip:10, take:10}) returns the next 10 (no overlap)
   - total reflects the real count

Import from the not-yet-created modules so the suite fails. Run `npm test`,
confirm it fails for the right reason (missing implementations, not a broken
harness). Stop there.