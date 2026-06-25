In client/, add an employee detail + edit-salary flow over PATCH
/employees/:id/salary.

1. API: add updateSalary(id, { amountMajor, currency }) to the employees api
   module (PATCH, JSON body, throws on non-2xx with the server's message).

2. INTERACTION: clicking a row in EmployeeTable opens a detail view of that
   employee — use a shadcn Dialog (modal) so we don't need a router for this scope.

3. DETAIL + EDIT (client/src/components/EmployeeDetailDialog.tsx):
   - show the employee's full info (name, email, department, country, role,
     current salary formatted in native currency, joined date)
   - an edit form: a number input for the new amount (MAJOR units, prefilled with
     the current major-unit value) and a currency select (the known ISO set)
   - client-side validation mirroring the server: amount must be > 0, currency
     required; disable Save until valid; show inline error messages
   - on Save: call updateSalary; while saving show a pending state; on success
     close the dialog and REFRESH the list so the new salary shows; on server
     error (400/404) show the message in the dialog, don't close
   - NEVER trust the client validation alone — the server is the source of truth;
     the client checks are just for fast feedback

4. Extract any major<->minor conversion used in the form into a small tested
   helper (reuse/extend the existing currency formatting lib); add a Vitest case
   for major->minor (75000.50 -> 7500050) and minor->major prefill.

Run with backend + client. Verify: open a row, edit the salary, save, see the
table update; invalid amount is blocked client-side; and confirm the server still
rejects a bad value if client checks were bypassed. Run client tests green. Stop.