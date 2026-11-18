import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    // Run test files one at a time. Vitest 4 removed `poolOptions.forks.singleFork`,
    // so files ran in parallel and each one started (and, on a cold CI cache,
    // downloaded) its own MongoDB binary at the same time, which races in
    // mongodb-memory-server ("ENOENT ... rename ... .tgz.downloading").
    pool: 'forks',
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 30000,
    // The first run downloads the MongoDB binary (~hundreds of MB), so allow time.
    hookTimeout: 300000,
  },
});
