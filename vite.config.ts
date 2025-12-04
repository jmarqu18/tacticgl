import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@tacticgl/core': resolve(fileURLToPath(new URL('./packages/core/src', import.meta.url))),
      '@tacticgl/charts': resolve(fileURLToPath(new URL('./packages/charts/src', import.meta.url))),
      '@tacticgl/adapters': resolve(fileURLToPath(new URL('./packages/adapters/src', import.meta.url))),
      '@tacticgl/shared': resolve(fileURLToPath(new URL('./packages/shared/src', import.meta.url))),
    },
  },
  build: {
    target: 'es2015',
    lib: {
      entry: resolve(fileURLToPath(new URL('packages/charts/src/index.ts', import.meta.url))),
      name: 'tacticgl',
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: ['d3'],
      output: {
        globals: {
          d3: 'd3',
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});