# Requirements — Salary Management Software

## Goal
Enable an HR manager to manage salary data for ~10,000 employees across multiple
countries through a web application, replacing a tedious Excel-based process, and
to answer questions about how the organization pays its people.

## User & Context
**Primary user:** HR Manager of ACME org. Non-technical, needs to view, search,
and update salaries quickly, and understand pay patterns across the organization.
Data spans multiple countries, so salaries exist in multiple currencies.

## In Scope
1. **Browse employees** — paginated, searchable, filterable list scaling to 10k rows.
2. **View employee detail** — full salary and role information for one employee.
3. **Update salary** — edit an employee's salary with validation.
4. **Add employee** — create a new employee record.
5. **Pay insights** — analytics answering "how do we pay people?":
   total payroll, average & median pay, and breakdowns by department and country,
   normalized to a common currency for fair comparison.

## Key Design Decision: Multi-currency
Salaries are stored in their **native currency** (amount + ISO currency code).
For any aggregate question ("average pay", "Germany vs India"), figures are
**normalized to a base currency (USD)** via a conversion-rate table. This keeps
source data faithful while enabling meaningful org-wide comparison. It is the
core reason the analytics are non-trivial.

## Out of Scope (and why)
- **Authentication / role-based access** — single-user HR persona assumed; auth is
  orthogonal to the core domain and would add cost without demonstrating salary logic.
- **Payroll runs, payslips, tax** — these are downstream of salary *management* and
  are large domains in their own right.
- **Excel import/export** — the point is to move *off* Excel; bulk import is future work.
- **Salary change history / audit trail** — deliberately deferred, but the schema is
  designed so it can be added cleanly (a natural next iteration).

## Non-functional Considerations
- **Scale:** queries paginate and aggregate at the database layer, not in memory,
  so 10k rows (and beyond) stay responsive.
- **Quality:** core logic (currency normalization, analytics, validation) is built
  test-first. Tests are fast and deterministic (in-memory SQLite), following a
  test-pyramid bias toward unit tests.
- **Maintainability:** layered architecture (routes → service → repository) so
  responsibilities are isolated and new features slot in without rework.

## Success Criteria
HR manager can find any employee, correct a salary, add a joiner, and read clear,
currency-normalized answers about organizational pay — all from the browser.