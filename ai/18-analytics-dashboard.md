Build the analytics dashboard in client/ over GET /analytics/pay-insights. This is
the "how do we pay people?" view. Use Recharts for charts.

1. NAVIGATION: add simple in-app navigation between two views — "Employees" (the
   existing table) and "Insights" (this dashboard). A lightweight tab/toggle is
   fine; no router needed for two views (mention if you'd prefer react-router —
   but keep it minimal).

2. DATA: a usePayInsights hook (mirror useEmployees): loading / error / data
   states, calls getPayInsights() on mount.

3. HEADLINE CARDS (shadcn Card), all in USD:
   - Total employees
   - Total annual payroll (USD)
   - Average salary (USD)
   - Median salary (USD)
   Format large USD numbers readably (Intl.NumberFormat, currency USD; abbreviate
   millions if helpful, e.g. $1.2M, but keep an exact value available on hover/title).

4. CHARTS (Recharts, responsive):
   - "Average salary by department" — bar chart from byDepartment
     (department on X, averageSalaryUsd on Y)
   - "Headcount by country" — bar or simple chart from byCountry (count)
   - "Average salary by country" — bar chart (averageSalaryUsd) — THIS is the one
     that visibly shows normalization working (different countries, comparable USD)
   Sort bars sensibly (e.g. descending) so the chart tells a story.

5. CLARITY: a visible note "All salary figures normalized to USD for comparison."
   Tooltips on bars showing the exact USD value and the group's headcount.

6. STATES: loading skeletons for cards/charts; a clear error message if the
   endpoint fails; sensible rendering if a group is empty.

7. Keep data-shaping logic (e.g. sorting, abbreviating) in small pure helpers in
   client/src/lib and add a Vitest test for the number-abbreviation helper
   (e.g. 1200000 -> "$1.2M", 950 -> "$950.00").

Run with backend (seeded) + client. Verify the cards show realistic totals for
10,000 employees and the by-country average chart shows DIFFERENT bars per country
(proof normalization + seed distribution both work). Run client tests green.
Stop after I can review.