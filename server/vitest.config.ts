import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    env: {
      DATABASE_URL: 'file:./test.db',
    },
    globalSetup: './src/test/global-setup.ts',
    // All test files share one SQLite file (test.db); running files in
    // parallel races their reset/seed beforeEach hooks against each other.
    fileParallelism: false,
  },
});
