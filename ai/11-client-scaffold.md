Scaffold the frontend in the client/ directory: React + Vite + TypeScript +
shadcn/ui. No feature UI yet beyond a proof-of-life screen.

1. Create a Vite React+TS app in client/.
2. Install and initialize Tailwind + shadcn/ui (the New York / neutral style is
   fine). Add a couple of base components we'll use soon: button, table, input,
   card.
3. Set up an API base URL via Vite env: VITE_API_URL (default http://localhost:3000).
   Add client/.env.example documenting it. Do NOT commit a real .env.
4. Create a typed API layer in client/src/api/:
   - client.ts: a tiny fetch wrapper (GET helper) that prefixes VITE_API_URL,
     sets JSON headers, and throws a clear Error on non-2xx responses.
   - types.ts: TypeScript types mirroring the backend — Employee, the paginated
     list response { data, total, page, pageSize, totalPages }, and PayInsights.
   - employees.ts: getEmployees(params) calling GET /employees with query params.
   - analytics.ts: getPayInsights() calling GET /analytics/pay-insights.
   Components must import from this api/ layer — never call fetch directly.
5. Replace the default App with a minimal proof-of-life: on mount, call
   getEmployees({ pageSize: 1 }) and render either "Connected — N employees" using
   the total, or a clear error message. Just enough to prove client↔server works.
6. Enable CORS on the BACKEND for the client origin (add the cors middleware in
   server/src/app.ts allowing http://localhost:5173) so the browser call succeeds.

Confirm `npm run dev` in client/ starts (default port 5173) and the page shows the
connected employee count from the running backend. Stop after I can review.