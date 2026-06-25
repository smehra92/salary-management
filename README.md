# Salary Management

Web-based salary management software for an HR manager overseeing ~10,000
employees across multiple countries. Replaces a tedious Excel-based workflow and
answers questions about **how the organization pays its people** — including fair,
currency-normalized comparisons across countries.

## Live Demo
- **App (frontend):** _<add Vercel URL once deployed>_
- **API (backend):** _<add Render URL once deployed>_
- **Demo video:** _<add link once recorded>_

> Note: the live backend uses SQLite re-seeded on startup (free-tier ephemeral
> filesystem), so demo edits reset on restart. See `docs/deployment.md` for the
> rationale and what production would do instead.

## Features
- Browse 10,000 employees with server-side **pagination**, **search** (name/email),
  and **filters** (department, country)
- View an employee and **update their salary** (validated)
- **Add a new employee** (validated, duplicate-email safe)
- **Pay Insights dashboard**: total payroll, average & median pay, and breakdowns
  by department and country — all **normalized to USD** for fair comparison

## Tech Stack
- **Backend:** Node.js, TypeScript, Express
- **Database:** SQLite via Prisma
- **Frontend:** React + Vite, TypeScript, shadcn/ui, Recharts
- **Testing:** Vitest (+ supertest)

## Architecture
Layered backend with clear separation of concerns — `routes` (HTTP only) →
`services` (business logic) → `repositories` (data access) → `domain` (pure
functions & types). Money is stored in **integer minor units** to avoid
floating-point drift; salaries are kept in their **native currency** and
normalized to USD only when aggregating. Full write-up and diagram in
`docs/architecture.md`.

## Project Structure
- `server/` — REST API, domain logic, tests
- `client/` — React UI
- `docs/`   — requirements, architecture, deployment, trade-offs
- `ai/`     — prompts and AI-tooling notes used to build this

## Getting Started

**Prerequisites:** Node.js 20+ and npm.

### 1. Backend (`server/`)
```bash
cd server
npm install
cp .env.example .env          # sets DATABASE_URL="file:./dev.db"
npx prisma migrate dev        # create the database schema
npx prisma db seed            # seed 10,000 employees (deterministic)
npm run dev                   # API on http://localhost:3000
```

### 2. Frontend (`client/`)
```bash
cd client
npm install
cp .env.example .env          # set VITE_API_URL=http://localhost:3000
npm run dev                   # app on http://localhost:5173
```

Open http://localhost:5173 with both servers running.

## Testing
```bash
cd server && npm test         # unit, integration, and route tests
cd client && npm test         # component/helper unit tests
```
Tests follow a **test-pyramid** bias: mostly fast unit tests on pure logic
(currency normalization, analytics, pagination), with integration tests proving
the layers compose and route tests at the HTTP boundary. All tests are
deterministic (in-memory/isolated test DB).

## Key Design Decisions
- **Multi-currency normalization** — store salaries faithfully in native currency;
  normalize to USD via a rate table only for comparison. This is what makes
  "how do we pay people?" answerable across countries.
- **Money as integer minor units** — no floating-point drift in payroll math.
- **Layered architecture + dependency injection** — business logic is testable
  without a database, and new features slot in without rework.
- **Server-side pagination/filtering** — the browser holds one page; the database
  does the work, so it scales the same at 10k or 10M rows.
- **TDD** — core logic was built test-first; the commit history shows the
  red → green → refactor evolution.

## Scope
See `docs/requirements.md` for the full goal, in/out-of-scope decisions, and
reasoning (auth, payroll runs, and salary-history are deliberately out, with the
schema left open to add history cleanly).

## AI Usage
This project was built in an AI-assisted workflow (Claude Code). The prompts and
instructions used at each step are committed in `ai/` as artifacts, alongside the
decisions and trade-offs that were mine to make.

## Status
✅ Feature-complete against the brief — see commit history for the step-by-step
evolution.