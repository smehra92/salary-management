Add search and filtering to the existing employee listing in server/. Extend the
repository, service, and route — keep filtering in the database (Prisma where
clause), never in memory. Combine with the existing pagination.

Filters to support (all optional, combinable):
- search: case-insensitive partial match on name OR email
- department: exact match
- country: exact match

1. REPOSITORY (extend findEmployees):
   - accept an optional `filters` object { search?, department?, country? }
   - build a Prisma `where` clause:
       search -> OR: [ name contains (insensitive), email contains (insensitive) ]
       department -> equals
       country -> equals
   - apply the SAME where to both findMany and count, so `total` reflects the
     filtered set (this matters for correct pagination).

2. SERVICE (extend listEmployees):
   - accept filters alongside page/pageSize, pass them through to the repo
   - trim whitespace; treat empty strings as "not provided"
   - keep all existing pagination behaviour unchanged

3. ROUTE (extend GET /employees):
   - read query params: search, department, country (plus existing page/pageSize)
   - pass them to the service; stay thin (no query building in the route)

4. TESTS — extend the existing suites, test-first where practical:
   SERVICE (fake repo): empty/whitespace filters are normalized to undefined;
     filters are forwarded to the repo correctly.
   REPOSITORY (test db, seed a known mix): filter by country returns only that
     country and total matches; search matches name partial AND email partial,
     case-insensitive; department filter works; filters COMBINE with pagination
     (filtered total drives totalPages, not the grand total).
   ROUTE (supertest): GET /employees?country=Germany returns only Germany and the
     total reflects the filtered count; GET /employees?search=<partial> works;
     combining ?department=Engineering&pageSize=5 paginates the filtered set.

Run `npm test`; every suite green. Then verify manually against the seeded dev db.
Stop after I can review.