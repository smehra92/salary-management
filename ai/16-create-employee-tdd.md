In server/, add the ability to create an employee. RED step: failing tests across
service and route, no implementation yet.

CONTRACT:
- Repository: createEmployee(data) -> created Employee. data has name, email,
  department, country, role, salaryAmount (MINOR units Int), salaryCurrency,
  joinedAt. Must surface Prisma's unique-constraint violation on email as a
  distinguishable "conflict" signal.
- Service: createEmployee(input) where input is human-facing:
    { name, email, department, country, role, amountMajor, currency, joinedAt }
  The service:
    * validates required fields are present/non-empty (name, email, department,
      country, role)
    * validates email looks like an email
    * validates amountMajor finite > 0 and currency in the known ISO set
    * validates joinedAt is a valid date not in the future
    * converts amountMajor -> minor units, calls repo.createEmployee
    * maps the repo conflict signal to a typed ConflictError (duplicate email)
- Route: POST /employees  body = the human-facing input
    * 201 + created employee on success
    * 400 on validation error
    * 409 on duplicate email

TESTS (test-first):
SERVICE (fake repo):
  - valid input converts major->minor and calls repo.createEmployee with correct
    shape
  - missing/empty required field -> validation error, repo NOT called
  - bad email format -> validation error
  - amount <= 0 / unknown currency -> validation error
  - future joinedAt -> validation error
  - repo conflict signal -> ConflictError surfaced
ROUTE (supertest, test db):
  - valid body -> 201, returns created employee with an id
  - invalid body -> 400
  - duplicate email (create the same email twice) -> 409
REPOSITORY (test db):
  - createEmployee inserts and returns the row with a generated id
  - inserting a duplicate email surfaces the conflict signal

Import the not-yet-created functions so it fails. Run `npm test`, confirm RED for
the right reason. Stop.