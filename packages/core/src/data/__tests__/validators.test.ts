import { describe, it, expect } from 'vitest';
import { validateEvent, validatePosition, validateTeamRef, validateEventBatch, canNormalize } from '../validators';
import type { TacticGLEvent } from '../../types/data.types';

describe('Event Validators', () => {
    describe('validateEvent()', () => {
        it('should pass for valid event', () => {
            const event: TacticGLEvent = {
                id: '123',
                timestamp: 1234567890,
                type: 'shot',
                position: { x: 50, y: 50 },
                team: { id: 1, name: 'Home', side: 'home' }
            };

            const result = validateEvent(event);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail if event is not an object', () => {
            const result = validateEvent(null);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Event must be a valid object');
        });

        it('should fail for missing ID', () => {
            const event = {
                type: 'shot',
                position: { x: 50, y: 50 },
                team: { id: 1 }
            };
            const result = validateEvent(event as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('id is required');
        });

        it('should fail for invalid ID type', () => {
            const event = {
                id: {},
                type: 'shot',
                position: { x: 50, y: 50 },
                team: { id: 1 }
            };
            const result = validateEvent(event as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('id must be a string or number');
        });

        it('should fail for missing type', () => {
            const event = {
                id: '123',
                position: { x: 50, y: 50 },
                team: { id: 1 }
            };
            const result = validateEvent(event as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('type is required');
        });

        it('should fail for invalid type (not string)', () => {
            const event = {
                id: '123',
                type: 123,
                position: { x: 50, y: 50 },
                team: { id: 1 }
            };
            const result = validateEvent(event as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('type must be a string');
        });

        it('should fail for unknown event type if validateEventType is true', () => {
            const event = {
                id: '123',
                type: 'invalid_type',
                position: { x: 50, y: 50 },
                team: { id: 1 }
            };
            const result = validateEvent(event, { validateEventType: true });
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toMatch(/is not a valid event type/);
        });

        it('should pass for unknown event type if validateEventType is false', () => {
            const event = {
                id: '123',
                type: 'custom_event',
                position: { x: 50, y: 50 },
                team: { id: 1, name: 'Home' }
            };
            const result = validateEvent(event as any, { validateEventType: false });
            expect(result.isValid).toBe(true);
        });

        it('should fail for missing position', () => {
            const event = {
                id: '123',
                type: 'shot',
                team: { id: 1 }
            };
            const result = validateEvent(event as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('position is required');
        });

        it('should fail for position out of range', () => {
            const event = {
                id: '123',
                type: 'shot',
                position: { x: 150, y: 50 },
                team: { id: 1 }
            };
            const result = validateEvent(event as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('position.x must be between 0 and 100');
        });

        it('should fail for missing team', () => {
            const event = {
                id: '123',
                type: 'shot',
                position: { x: 50, y: 50 }
            };
            const result = validateEvent(event as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('team is required');
        });

        it('should validate endPosition if provided', () => {
            const event = {
                id: '123',
                type: 'pass',
                position: { x: 50, y: 50 },
                team: { id: 1 },
                endPosition: { x: 200, y: 200 } // Invalid
            };
            const result = validateEvent(event as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('endPosition.x must be between 0 and 100');
        });

        it('should validate numeric fields', () => {
            const event = {
                id: '123',
                type: 'shot',
                position: { x: 50, y: 50 },
                team: { id: 1 },
                minute: '45' // Invalid, should be number
            };
            const result = validateEvent(event as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('minute must be a number if provided');
        });
    });

    describe('validatePosition()', () => {
        it('should return errors for invalid object', () => {
            const errors = validatePosition(null);
            expect(errors).toContain('position must be a valid Position2D object');
        });

        it('should return errors for missing x or y', () => {
            const errors = validatePosition({ x: 50 });
            expect(errors).toContain('position.y must be a number');
        });

        it('should return errors for non-number coordinates', () => {
            const errors = validatePosition({ x: '50', y: 50 });
            expect(errors).toContain('position.x must be a number');
        });

        it('should respect custom bounds', () => {
            const errors = validatePosition(
                { x: 50, y: 50 },
                'pos',
                { min: 0, max: 10 }
            );
            expect(errors).toContain('pos.x must be between 0 and 10');
            expect(errors).toContain('pos.y must be between 0 and 10');
        });
    });

    describe('validateTeamRef()', () => {
        it('should return errors for missing team', () => {
            const errors = validateTeamRef(null);
            expect(errors).toContain('team is required');
        });

        it('should return errors for missing id', () => {
            const errors = validateTeamRef({ name: 'Team' });
            expect(errors).toContain('team.id is required');
        });

        it('should return errors for invalid id type', () => {
            const errors = validateTeamRef({ id: {} });
            expect(errors).toContain('team.id must be a string or number');
        });

        it('should return errors for invalid name type', () => {
            const errors = validateTeamRef({ id: 1, name: 123 });
            expect(errors).toContain('team.name must be a string if provided');
        });

        it('should return errors for invalid side', () => {
            const errors = validateTeamRef({ id: 1, side: 'top' });
            expect(errors).toContain('team.side must be "home" or "away" if provided');
        });
    });

    describe('validateEventBatch()', () => {
        it('should fail if input is not array', () => {
            const result = validateEventBatch({} as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Events must be an array');
        });

        it('should validate all events in batch', () => {
            const events = [
                { id: '1', type: 'shot', position: { x: 50, y: 50 }, team: { id: 1 } },
                { id: '2', type: 'pass', position: { x: 200, y: 50 }, team: { id: 1 } }, // Invalid pos
                { id: '3', type: 'goal', position: { x: 50, y: 50 }, team: { id: 1 } }
            ];

            const result = validateEventBatch(events as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toMatch(/Event\[1\]: position.x must be between/);
        });

        it('should pass for valid batch', () => {
            const events = [
                { id: '1', type: 'shot', position: { x: 50, y: 50 }, team: { id: 1 } },
                { id: '2', type: 'pass', position: { x: 60, y: 60 }, team: { id: 1 } }
            ];

            const result = validateEventBatch(events as any);
            expect(result.isValid).toBe(true);
        });
    });

    describe('canNormalize()', () => {
        it('should return false for null/undefined', () => {
            expect(canNormalize(null)).toBe(false);
            expect(canNormalize(undefined)).toBe(false);
        });

        it('should return false if type is missing', () => {
            expect(canNormalize({ team: { id: 1 }, position: { x: 0, y: 0 } })).toBe(false);
        });

        it('should return false if team is missing', () => {
            expect(canNormalize({ type: 'shot', position: { x: 0, y: 0 } })).toBe(false);
        });

        it('should return false if team id is missing', () => {
            expect(canNormalize({ type: 'shot', team: { name: 'Team' }, position: { x: 0, y: 0 } })).toBe(false);
        });

        it('should return false if position is missing', () => {
            expect(canNormalize({ type: 'shot', team: { id: 1 } })).toBe(false);
        });

        it('should return true if minimal fields are present (using aliases)', () => {
            // Using aliases found in FIELD_MAPPINGS
            expect(canNormalize({ type: 'shot', team: { id: 1 }, location: [0, 0] })).toBe(true);
            expect(canNormalize({ type: 'shot', team: { id: 1 }, coordinates: [0, 0] })).toBe(true);
            expect(canNormalize({ type: 'shot', team: { id: 1 }, pos: [0, 0] })).toBe(true);
        });
    });
});
