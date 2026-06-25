In client/, add a "New employee" flow over POST /employees.

1. API: add createEmployee(input) to the employees api module (POST, JSON,
   throws on non-2xx with the server message).

2. A "New employee" button above the table opens a shadcn Dialog with a form:
   fields name, email, department (select, shared constants), country (select,
   shared constants), role (select), amount (MAJOR units number input), currency
   (select), joined date (date input).

3. Client-side validation mirroring the server (required fields, email format,
   amount > 0, date not in the future) with inline messages; disable Save until
   valid. Client checks are for feedback only — the server remains the source of
   truth.

4. On Save: call createEmployee; pending state while saving; on success close the
   dialog and refresh the list (the new employee should appear when filters allow);
   on 400 show the field/message, on 409 show a clear "an employee with this email
   already exists" message — keep the dialog open on error.

5. Reuse existing helpers (currency set, major<->minor conversion, formatting).
   No new test infra needed; if you add a new pure helper, unit-test it.

Run with backend + client. Verify: add a valid employee -> appears in the list;
duplicate email -> friendly 409 message; invalid fields blocked client-side and
also rejected server-side if bypassed. Run client tests green. Stop.