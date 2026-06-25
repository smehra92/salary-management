import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client.js';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });

/** Shared PrismaClient for repositories. Connects to DATABASE_URL (test runs override this to test.db). */
export const db = new PrismaClient({ adapter });
