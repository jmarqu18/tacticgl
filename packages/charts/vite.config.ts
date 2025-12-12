/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
    },
    plugins: [
        dts({
            include: ['src/**/*.ts'],
            outDir: 'dist',
            rollupTypes: true,
        }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'TacticGLCharts',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: ['@tacticgl/core', '@tacticgl/shared', 'd3', 'd3-selection', 'd3-scale', 'd3-shape'],
            output: {
                preserveModules: false,
            },
        },
        sourcemap: true,
        minify: false,
    },
});
