import 'dotenv/config';
import { faker } from '@faker-js/faker';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client.js';

const TOTAL_EMPLOYEES = 10_000;
const BATCH_SIZE = 1_000;

const CURRENCY_RATES = [
  { currencyCode: 'USD', rateToUsd: 1 },
  { currencyCode: 'INR', rateToUsd: 0.012 },
  { currencyCode: 'EUR', rateToUsd: 1.08 },
  { currencyCode: 'GBP', rateToUsd: 1.27 },
  { currencyCode: 'SGD', rateToUsd: 0.74 },
  { currencyCode: 'AUD', rateToUsd: 0.66 },
];

// Country/currency pairs, weighted so India and the USA dominate headcount —
// this keeps the overall distribution realistic rather than flat across countries.
// costOfLiving scales the USD base salary band before converting to the
// employee's native currency.
const COUNTRIES = [
  { weight: 35, country: 'India', currencyCode: 'INR', costOfLiving: 0.35 },
  { weight: 35, country: 'USA', currencyCode: 'USD', costOfLiving: 1.0 },
  { weight: 10, country: 'Germany', currencyCode: 'EUR', costOfLiving: 0.8 },
  { weight: 10, country: 'UK', currencyCode: 'GBP', costOfLiving: 0.85 },
  { weight: 5, country: 'Singapore', currencyCode: 'SGD', costOfLiving: 0.95 },
  { weight: 5, country: 'Australia', currencyCode: 'AUD', costOfLiving: 0.9 },
];

const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations',
  'Support',
  'Product',
];

// Annual base salary band in USD major units, by seniority.
const ROLE_BANDS: Record<string, [number, number]> = {
  Junior: [35_000, 50_000],
  Mid: [55_000, 75_000],
  Senior: [80_000, 110_000],
  Lead: [110_000, 140_000],
  Manager: [130_000, 170_000],
};
const ROLES = Object.keys(ROLE_BANDS);

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

function pickCountry() {
  return faker.helpers.weightedArrayElement(
    COUNTRIES.map(({ weight, ...rest }) => ({ weight, value: rest })),
  );
}

/** Base salary band scaled by cost of living and jitter, converted to minor units of currencyCode. */
function buildSalaryAmount(role: string, costOfLiving: number, rateToUsd: number): number {
  const [min, max] = ROLE_BANDS[role];
  const baseUsd = faker.number.int({ min, max });
  const jitter = faker.number.float({ min: 0.92, max: 1.08, fractionDigits: 4 });
  const nativeAmountMajor = (baseUsd * costOfLiving * jitter) / rateToUsd;
  return Math.round(nativeAmountMajor * 100);
}

/** Appends a numeric suffix on collision so 10k generated emails stay unique. */
function uniqueEmail(firstName: string, lastName: string, used: Set<string>): string {
  const base = faker.internet.email({ firstName, lastName }).toLowerCase();
  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  const [local, domain] = base.split('@');
  let suffix = 1;
  let candidate = `${local}${suffix}@${domain}`;
  while (used.has(candidate)) {
    suffix += 1;
    candidate = `${local}${suffix}@${domain}`;
  }
  used.add(candidate);
  return candidate;
}

async function main() {
  faker.seed(42);

  console.log('Clearing existing data...');
  await prisma.currencyRate.deleteMany();
  await prisma.employee.deleteMany();

  console.log('Seeding currency rates...');
  await prisma.currencyRate.createMany({ data: CURRENCY_RATES });

  const rateByCode = new Map(CURRENCY_RATES.map((r) => [r.currencyCode, r.rateToUsd]));
  const usedEmails = new Set<string>();
  const countryCounts = new Map<string, number>();

  console.log(`Seeding ${TOTAL_EMPLOYEES} employees...`);
  for (let start = 0; start < TOTAL_EMPLOYEES; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, TOTAL_EMPLOYEES);
    const batch = [];

    for (let i = start; i < end; i++) {
      const { country, currencyCode, costOfLiving } = pickCountry();
      const department = faker.helpers.arrayElement(DEPARTMENTS);
      const role = faker.helpers.arrayElement(ROLES);
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const rateToUsd = rateByCode.get(currencyCode);
      if (rateToUsd === undefined) {
        throw new Error(`No rate configured for currency: ${currencyCode}`);
      }

      batch.push({
        name: `${firstName} ${lastName}`,
        email: uniqueEmail(firstName, lastName, usedEmails),
        department,
        country,
        role,
        salaryAmount: buildSalaryAmount(role, costOfLiving, rateToUsd),
        salaryCurrency: currencyCode,
        joinedAt: faker.date.past({ years: 8 }),
      });

      countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
    }

    await prisma.employee.createMany({ data: batch });
    console.log(`  inserted ${end}/${TOTAL_EMPLOYEES}`);
  }

  const total = await prisma.employee.count();
  console.log(`\nSeed complete: ${total} employees created.`);
  console.log('Employees per country:');
  for (const [country, count] of [...countryCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${country.padEnd(12)} ${count}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
