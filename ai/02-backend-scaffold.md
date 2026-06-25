Scaffold the backend in the server/ directory. TypeScript + Express, tested with
Vitest. No business/domain logic yet — just a clean, tested skeleton.

Set up:
- package.json with scripts: dev, build, start, test, test:watch, lint, format
- TypeScript in strict mode (tsconfig.json)
- ESLint + Prettier configured
- Vitest + supertest for HTTP testing

Folder structure under server/src, matching docs/architecture.md:
  src/routes/        (Express routers)
  src/services/      (business logic — empty for now)
  src/repositories/  (data access — empty for now)
  src/domain/        (types + pure functions — empty for now)
  src/app.ts         (builds and returns the Express app: json middleware,
                      mounts routes; does NOT call listen)
  src/server.ts      (imports the app from app.ts and calls listen on a port
                      from env, default 3000)

Implement ONE thing to prove the stack works end to end: a GET /health route in
src/routes/health.route.ts that returns 200 with { status: "ok" }, mounted in
app.ts. Write src/routes/health.route.test.ts using supertest that imports the
app and asserts GET /health returns 200 and the expected body.

Use ES modules. Make sure `npm test` runs green and `npm run dev` starts the server.
Stop after this so I can review and run it before committing.