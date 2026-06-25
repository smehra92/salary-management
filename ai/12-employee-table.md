Build the employee list screen in client/. Server-side pagination over the
existing GET /employees endpoint — the browser holds only the current page, never
all 10,000 rows.

1. HOOK: client/src/hooks/useEmployees.ts
   - manages state: data (current page rows), total, page, pageSize, totalPages,
     loading, error
   - exposes: the state plus setPage(n) (and keep pageSize fixed at 25 for now)
   - on mount and whenever page changes, calls getEmployees({ page, pageSize })
     from the api layer; sets loading before, clears it after; captures errors
   - guards against out-of-range pages (1..totalPages)

2. COMPONENT: client/src/components/EmployeeTable.tsx using shadcn table
   - columns: Name, Email, Department, Country, Role, Salary
   - SALARY DISPLAY: salaryAmount is an integer in MINOR units — format it for
     humans using Intl.NumberFormat with the row's salaryCurrency
     (style: "currency", currency: salaryCurrency), dividing by 100 to get major
     units. Show each salary in its OWN native currency (do NOT convert here —
     normalization is an analytics concern, not a list concern).
   - loading state: a simple skeleton or "Loading…" row
   - error state: a clear message (not a blank screen)
   - empty state: "No employees found"

3. PAGINATION CONTROLS: Prev / Next buttons + "Page X of Y" and total count
   ("10,000 employees"). Disable Prev on page 1 and Next on the last page.

4. Render EmployeeTable as the main App screen (replace the proof-of-life).

5. A small formatting UNIT TEST: extract the salary formatter into a pure helper
   (e.g. client/src/lib/formatCurrency.ts) and test it with Vitest — minor units
   ÷100, correct currency symbol, e.g. (199900,"USD") -> "$1,999.00". Set up Vitest
   in the client if not already present.

Run the client (with the backend running + seeded). Confirm the table shows real
employees, salaries render in their native currencies, and Prev/Next page through
correctly. Run the formatter test green. Stop after I can review.