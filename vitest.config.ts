import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '*.config.ts'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@tacticgl/core': resolve(fileURLToPath(new URL('./packages/core/src', import.meta.url))),
      '@tacticgl/charts': resolve(fileURLToPath(new URL('./packages/charts/src', import.meta.url))),
      '@tacticgl/adapters': resolve(fileURLToPath(new URL('./packages/adapters/src', import.meta.url))),
      '@tacticgl/shared': resolve(fileURLToPath(new URL('./packages/shared/src', import.meta.url))),
    },
  },
});