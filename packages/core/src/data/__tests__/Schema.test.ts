
import { describe, it, expect } from 'vitest';
import {
    isValidEventType,
    isValidEventOutcome,
    isPositionInBounds,
    REQUIRED_EVENT_FIELDS,
    VALID_EVENT_TYPES,
    VALID_EVENT_OUTCOMES
} from '../Schema';

describe('Schema', () => {
    describe('isValidEventType()', () => {
        it('should return true for valid event types', () => {
            expect(isValidEventType('shot')).toBe(true);
            expect(isValidEventType('pass')).toBe(true);
            expect(isValidEventType('custom')).toBe(true);
        });

        it('should return false for invalid event types', () => {
            expect(isValidEventType('invalid_type')).toBe(false);
            expect(isValidEventType(123)).toBe(false);
            expect(isValidEventType(null)).toBe(false);
        });
    });

    describe('isValidEventOutcome()', () => {
        it('should return true for valid outcomes', () => {
            expect(isValidEventOutcome('goal')).toBe(true);
            expect(isValidEventOutcome('success')).toBe(true);
        });

        it('should return false for invalid outcomes', () => {
            expect(isValidEventOutcome('unexpected')).toBe(false);
            expect(isValidEventOutcome(123)).toBe(false);
            expect(isValidEventOutcome(undefined)).toBe(false);
        });
    });

    describe('isPositionInBounds()', () => {
        it('should return true for values within 0-100', () => {
            expect(isPositionInBounds(0)).toBe(true);
            expect(isPositionInBounds(50)).toBe(true);
            expect(isPositionInBounds(100)).toBe(true);
        });

        it('should return false for values outside 0-100', () => {
            expect(isPositionInBounds(-1)).toBe(false);
            expect(isPositionInBounds(101)).toBe(false);
        });
    });

    describe('Constants', () => {
        it('should have required fields defined', () => {
            expect(REQUIRED_EVENT_FIELDS).toContain('id');
            expect(REQUIRED_EVENT_FIELDS).toContain('type');
            expect(REQUIRED_EVENT_FIELDS).toContain('position');
            expect(REQUIRED_EVENT_FIELDS).toContain('team');
        });

        it('should have valid event types defined', () => {
            expect(VALID_EVENT_TYPES.length).toBeGreaterThan(0);
        });

        it('should have valid outcomes defined', () => {
            expect(VALID_EVENT_OUTCOMES.length).toBeGreaterThan(0);
        });
    });
});
