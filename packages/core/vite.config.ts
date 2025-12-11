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
        }) as any,
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'TacticGLCore',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: ['@tacticgl/shared'],
            output: {
                preserveModules: false,
            },
        },
        sourcemap: true,
        minify: false,
    },
});
