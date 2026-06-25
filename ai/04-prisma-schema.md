Set up Prisma with SQLite in server/. This step is schema + migration ONLY —
no queries, no seed data, no services.

1. Install and init Prisma (provider = sqlite). Database URL via env, e.g.
   DATABASE_URL="file:./dev.db". Add a .env.example documenting it (do NOT commit
   a real .env — it's gitignored).

2. Define this schema in prisma/schema.prisma:

   model Employee {
     id             String   @id @default(uuid())
     name           String
     email          String   @unique
     department     String
     country        String
     role           String
     // money stored in MINOR units (e.g. cents/paise) as an integer to avoid
     // floating-point drift
     salaryAmount   Int
     salaryCurrency String   // ISO 4217 code, e.g. "USD", "INR", "EUR"
     joinedAt       DateTime
     createdAt      DateTime @default(now())
     updatedAt      DateTime @updatedAt

     @@index([department])
     @@index([country])
   }

   model CurrencyRate {
     currencyCode String   @id   // ISO 4217 code
     rateToUsd    Float          // 1 unit of this currency = rateToUsd USD
     updatedAt    DateTime @updatedAt
   }

3. Create the initial migration (name it "init"). Confirm it generates the SQLite
   db and the Prisma client without error.

4. Add a short comment block at the top of schema.prisma noting: money is stored
   in minor units as Int; the schema is intentionally open to a future
   SalaryChange history table without altering Employee.

Do not write any seed script or repository code yet. Stop after the migration
runs successfully so I can review.