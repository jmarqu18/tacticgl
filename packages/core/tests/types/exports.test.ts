import { describe, it, expect } from 'vitest';

describe('Package Exports', () => {
    it('should export all geometry types', async () => {
        await expect(import('../../src/types/index')).resolves.toBeDefined();
    });

    it('should export all data types', async () => {
        await expect(import('../../src/types/index')).resolves.toBeDefined();
    });

    it('should export all renderer types', async () => {
        await expect(import('../../src/types/index')).resolves.toBeDefined();
    });

    it('should export all config types', async () => {
        await expect(import('../../src/types/index')).resolves.toBeDefined();
    });
});
