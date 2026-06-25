Create a seed script in server/ that populates the database with currency rates
and 10,000 realistic employees. Use @faker-js/faker for names/emails.

Requirements:

1. File: prisma/seed.ts. Wire it up so `npx prisma db seed` runs it (add the
   prisma.seed config to package.json).

2. Make it DETERMINISTIC: set a fixed faker seed (e.g. faker.seed(42)) so re-runs
   produce the same data.

3. Make it IDEMPOTENT: clear existing CurrencyRate and Employee rows at the start
   (deleteMany), then insert fresh. So running it twice gives exactly 10,000
   employees, never 20,000.

4. Seed CurrencyRate first with these fixed rates (reuse, don't invent new ones):
   USD 1, INR 0.012, EUR 1.08, GBP 1.27, SGD 0.74, AUD 0.66

5. Generate 10,000 employees with a REALISTIC, varied distribution:
   - country/currency pairs drawn from a weighted list, e.g.
     India/INR, USA/USD, Germany/EUR, UK/GBP, Singapore/SGD, Australia/AUD
     (India and USA weighted heavier so departments aren't uniform).
   - department from a fixed set: Engineering, Sales, Marketing, Finance, HR,
     Operations, Support, Product.
   - role from a small set per seniority: Junior, Mid, Senior, Lead, Manager.
   - salaryAmount in MINOR units (Int): pick a base salary band by role/seniority,
     apply a country cost-of-living multiplier, add some random jitter, then
     convert to minor units (amount * 100). Salaries should differ meaningfully
     across roles and countries — NOT all the same.
   - email must be unique (faker can collide at 10k; ensure uniqueness, e.g. add
     an index suffix).
   - joinedAt: a random date within the last ~8 years.

6. PERFORMANCE: insert in batches using createMany (e.g. chunks of 1,000), not
   10,000 individual awaits. Log progress and the final count.

7. Print a short summary at the end: total employees, and a count per country, so
   I can eyeball the distribution.

Run `npx prisma db seed` and confirm it completes and prints ~10,000 with a
sensible country spread. Stop after I can review the output.