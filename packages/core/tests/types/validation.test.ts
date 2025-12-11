import { describe, it, expect } from 'vitest';
import type { Position2D } from '../../src/types/index';

// Funciones de validación que se implementarán en data/validators.ts
// Aquí definimos los tests que esas funciones deben pasar

describe('Runtime Validation', () => {

    describe('isValidPosition2D', () => {
        // Esta función se implementará en validators.ts
        const isValidPosition2D = (pos: unknown): pos is Position2D => {
            if (typeof pos !== 'object' || pos === null) return false;
            const p = pos as Record<string, unknown>;
            return (
                typeof p.x === 'number' &&
                typeof p.y === 'number' &&
                p.x >= 0 && p.x <= 100 &&
                p.y >= 0 && p.y <= 100
            );
        };

        it('should accept valid position', () => {
            expect(isValidPosition2D({ x: 50, y: 50 })).toBe(true);
            expect(isValidPosition2D({ x: 0, y: 0 })).toBe(true);
            expect(isValidPosition2D({ x: 100, y: 100 })).toBe(true);
        });

        it('should reject position out of range', () => {
            expect(isValidPosition2D({ x: -1, y: 50 })).toBe(false);
            expect(isValidPosition2D({ x: 50, y: 101 })).toBe(false);
            expect(isValidPosition2D({ x: 150, y: 50 })).toBe(false);
        });

        it('should reject non-object', () => {
            expect(isValidPosition2D(null)).toBe(false);
            expect(isValidPosition2D(undefined)).toBe(false);
            expect(isValidPosition2D([50, 50])).toBe(false);
            expect(isValidPosition2D('50,50')).toBe(false);
        });

        it('should reject missing properties', () => {
            expect(isValidPosition2D({ x: 50 })).toBe(false);
            expect(isValidPosition2D({ y: 50 })).toBe(false);
            expect(isValidPosition2D({})).toBe(false);
        });
    });

    describe('isValidEventType', () => {
        const VALID_EVENT_TYPES = new Set([
            'shot', 'goal', 'pass', 'carry', 'duel', 'interception',
            'clearance', 'block', 'foul', 'pressure', 'ball_receipt',
            'ball_recovery', 'dispossessed', 'dribble', 'goalkeeper',
            'miscontrol', 'tactical_shift', 'substitution', 'custom'
        ]);

        const isValidEventType = (type: unknown): boolean => {
            return typeof type === 'string' && VALID_EVENT_TYPES.has(type);
        };

        it('should accept valid event types', () => {
            expect(isValidEventType('shot')).toBe(true);
            expect(isValidEventType('pass')).toBe(true);
            expect(isValidEventType('goal')).toBe(true);
            expect(isValidEventType('custom')).toBe(true);
        });

        it('should reject invalid event types', () => {
            expect(isValidEventType('invalid')).toBe(false);
            expect(isValidEventType('')).toBe(false);
            expect(isValidEventType(123)).toBe(false);
            expect(isValidEventType(null)).toBe(false);
        });
    });

    describe('validateTacticGLEvent', () => {
        interface ValidationResult {
            isValid: boolean;
            errors: string[];
        }

        const validateTacticGLEvent = (event: unknown): ValidationResult => {
            const errors: string[] = [];

            if (typeof event !== 'object' || event === null) {
                return { isValid: false, errors: ['Event must be an object'] };
            }

            const e = event as Record<string, unknown>;

            // Required: id
            if (typeof e.id !== 'string' || e.id.length === 0) {
                errors.push('id is required and must be a non-empty string');
            }

            // Required: type
            if (typeof e.type !== 'string') {
                errors.push('type is required');
            }

            // Required: position
            if (!e.position || typeof e.position !== 'object') {
                errors.push('position is required');
            } else {
                const pos = e.position as Record<string, unknown>;
                if (typeof pos.x !== 'number' || pos.x < 0 || pos.x > 100) {
                    errors.push('position.x must be a number between 0 and 100');
                }
                if (typeof pos.y !== 'number' || pos.y < 0 || pos.y > 100) {
                    errors.push('position.y must be a number between 0 and 100');
                }
            }

            // Required: team
            if (!e.team || typeof e.team !== 'object') {
                errors.push('team is required');
            } else {
                const team = e.team as Record<string, unknown>;
                if (team.id === undefined) {
                    errors.push('team.id is required');
                }
            }

            return { isValid: errors.length === 0, errors };
        };

        it('should validate correct event', () => {
            const event = {
                id: '123',
                type: 'shot',
                position: { x: 90, y: 45 },
                team: { id: 1 },
            };
            const result = validateTacticGLEvent(event);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail on missing id', () => {
            const event = {
                type: 'shot',
                position: { x: 90, y: 45 },
                team: { id: 1 },
            };
            const result = validateTacticGLEvent(event);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('id is required and must be a non-empty string');
        });

        it('should fail on missing type', () => {
            const event = {
                id: '123',
                position: { x: 90, y: 45 },
                team: { id: 1 },
            };
            const result = validateTacticGLEvent(event);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('type is required');
        });

        it('should fail on invalid position range', () => {
            const event = {
                id: '123',
                type: 'shot',
                position: { x: 150, y: 45 },
                team: { id: 1 },
            };
            const result = validateTacticGLEvent(event);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('position.x must be a number between 0 and 100');
        });

        it('should fail on missing team', () => {
            const event = {
                id: '123',
                type: 'shot',
                position: { x: 90, y: 45 },
            };
            const result = validateTacticGLEvent(event);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('team is required');
        });

        it('should collect multiple errors', () => {
            const event = {
                type: 'shot',
                position: { x: 150, y: -10 },
            };
            const result = validateTacticGLEvent(event);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });
});
