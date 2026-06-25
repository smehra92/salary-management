"Prompt used with Claude Code to draft the architecture document."

Create docs/architecture.md for this salary-management project. Do NOT write any
app code — this is a documentation-only step. Capture these decisions, which I've
already made, and write them up clearly:

ARCHITECTURE: Layered backend, clean separation of concerns:
- routes      (Express) — HTTP only: parse/validate the request, call a service,
                          shape the response. No business logic here.
- services    — business logic: analytics calculations, currency normalization,
                orchestration. Knows nothing about HTTP or SQL.
- repositories— data access via Prisma: queries, pagination, aggregation.
- domain      — types and pure functions (e.g. currency conversion). No I/O.
Data store: SQLite via Prisma. Frontend: React + Vite + shadcn/ui, talks to the
API over HTTP.

REQUEST FLOW to document: Client → Express route → Service → Repository → Prisma
→ SQLite, and back.

KEY DECISIONS to explain (with the "why"):
1. Layered separation — for testability, single responsibility, and so a new
   feature (e.g. salary-change history in round 2) slots in without rework.
2. Multi-currency — store each salary in its NATIVE currency (amount + ISO code);
   normalize to a base currency (USD) via a rate table when aggregating, so
   org-wide comparisons are fair while source data stays faithful.
3. Aggregation happens in the DATABASE layer, not in memory, so 10k+ rows stay
   responsive.
4. Testing follows the test pyramid: mostly fast unit tests (domain/service with
   in-memory SQLite), a few integration tests over the API. Tests are
   deterministic.
5. Why SQLite + Prisma: zero-config, easy to seed 10k rows, trivial to deploy,
   in-memory mode makes tests fast.

DATA MODEL sketch (high level, not final schema):
- Employee: id, name, email, department, country, role, salaryAmount,
  salaryCurrency, joinedAt
- CurrencyRate: currencyCode, rateToUsd

Include a Mermaid diagram showing the layers and the request flow, since Mermaid
renders on GitHub. Keep the document to about one page. Clear prose, no fluff.

Stop after creating the file so I can review it before committing.
