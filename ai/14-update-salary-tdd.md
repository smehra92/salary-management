In server/, add the ability to update an employee's salary. This step is RED:
write failing tests across service and route, no implementation yet.

CONTRACT:
- Repository: updateSalary(id, { salaryAmount, salaryCurrency }) -> updated
  Employee; salaryAmount stored in MINOR units (Int). Throws/return-signals when
  the id doesn't exist.
- Service: updateEmployeeSalary(id, { amountMajor, currency }) where amountMajor is
  a human-facing major-unit number (e.g. 75000.5). The service:
    * validates amountMajor is a finite number > 0  -> else a validation error
    * validates currency is one of the known ISO codes (USD, INR, EUR, GBP, SGD,
      AUD) -> else a validation error
    * converts amountMajor to minor units (round to nearest integer) and calls
      repo.updateSalary
    * surfaces a not-found error when the employee doesn't exist
- Route: PATCH /employees/:id/salary  body { amountMajor, currency }
    * 200 + updated employee on success
    * 400 on validation error
    * 404 when employee not found

TESTS (test-first):
SERVICE (fake repo):
  - valid input converts major->minor correctly (75000.50 -> 7500050) and calls
    repo.updateSalary with the right args
  - rejects amount <= 0, NaN, and non-finite -> validation error, repo NOT called
  - rejects an unknown currency -> validation error, repo NOT called
  - propagates not-found from the repo as a not-found error
ROUTE (supertest, test db with one seeded employee + rates):
  - PATCH valid body -> 200, body reflects the new salary (in minor units) and
    currency
  - invalid amount -> 400
  - unknown currency -> 400
  - unknown id -> 404
REPOSITORY (test db):
  - updateSalary changes the row and returns it; updating a missing id signals
    not-found

Import the not-yet-created functions so it fails. Run `npm test`, confirm RED for
the right reason. Stop.