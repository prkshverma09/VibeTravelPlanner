import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts'],
    },
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@vibe-travel/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
