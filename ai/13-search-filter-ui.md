Add search and filtering UI to the employee list in client/, wired to the query
params the backend already supports (search, department, country) on GET /employees.

1. EXTEND useEmployees:
   - add filter state: search, department, country
   - expose setters: setSearch, setDepartment, setCountry
   - pass these filters into getEmployees({ page, pageSize, search, department,
     country })
   - CRITICAL: whenever any filter changes, reset page to 1 before/while fetching
   - empty string / "All" means "no filter" — omit it from the request

2. DEBOUNCE the search input: typing updates a local input value immediately
   (controlled input stays responsive), but the actual filter/fetch only fires
   after ~300ms of no typing. Implement a small reusable useDebounce hook
   (client/src/hooks/useDebounce.ts) and unit-test it with Vitest + fake timers
   (asserts the value updates only after the delay).

3. FILTER CONTROLS component (client/src/components/EmployeeFilters.tsx):
   - a search Input (placeholder "Search by name or email")
   - a Department select (shadcn Select): an "All departments" option + the fixed
     department set used in the seed
   - a Country select: an "All countries" option + the countries used in the seed
   - a "Clear filters" button that resets all three
   Keep the department/country option lists in one shared constants file so they
   match the seed (don't hardcode them in two places).

4. WIRING: render EmployeeFilters above EmployeeTable. The "X employees" count and
   "Page X of Y" must reflect the FILTERED total (the backend returns the filtered
   total already — just display what the hook has). Empty result -> the table's
   "No employees found" state.

Run with backend + client. Verify: typing filters after a pause (not per
keystroke); selecting a country narrows results and resets to page 1; the total
count updates to the filtered number; Clear filters restores all 10,000. Run the
useDebounce test green. Stop after I can review.