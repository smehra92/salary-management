import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client.js';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./test.db' });

/** Shared PrismaClient for integration tests, pointed at the throwaway test database. */
export const testDb = new PrismaClient({ adapter });

/** Deletes all rows so each test starts from a known, empty state. */
export async function resetDb(): Promise<void> {
  await testDb.employee.deleteMany();
  await testDb.currencyRate.deleteMany();
}
