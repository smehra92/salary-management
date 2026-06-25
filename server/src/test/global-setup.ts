import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TEST_DATABASE_URL = 'file:./test.db';

function removeTestDbFiles(): void {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const file = path.join(serverRoot, `test.db${suffix}`);
    if (existsSync(file)) {
      rmSync(file);
    }
  }
}

/**
 * Vitest globalSetup runs once, in its own process, before any test file.
 * It provisions a throwaway SQLite database for tests by pushing the current
 * schema directly (no migration history needed). DATABASE_URL is overridden
 * only for the `prisma db push` subprocess, so dev.db is never touched.
 */
export async function setup(): Promise<void> {
  removeTestDbFiles();
  execSync('npx prisma db push --accept-data-loss', {
    cwd: serverRoot,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}

export async function teardown(): Promise<void> {
  removeTestDbFiles();
}
