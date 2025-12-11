import { describe, it, expect, vi, afterEach } from 'vitest';
import { EventNormalizer } from '../EventNormalizer';
import * as validators from '../validators';

describe('EventNormalizer', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('normalize()', () => {
        it('should normalize single event', () => {
            const raw = {
                id: '123',
                type: 'shot',
                location: [60, 40],
                team: { id: 1, name: 'Home' }
            };

            const normalized = EventNormalizer.normalize(raw);

            expect(normalized).toMatchObject({
                id: '123',
                type: 'shot',
                position: { x: expect.any(Number), y: expect.any(Number) },
                team: { id: 1, name: 'Home' }
            });
        });

        it('should convert position array to Position2D object', () => {
            const raw = {
                location: [52.5, 34],
                type: 'pass',
                team: { id: 1 }
            };

            const normalized = EventNormalizer.normalize(raw);

            expect(normalized.position).toEqual({ x: 52.5, y: 34 });
        });

        it('should generate UUID if id not provided', () => {
            const raw = { type: 'pass', location: [50, 50], team: { id: 1 } };

            const normalized = EventNormalizer.normalize(raw);

            expect(normalized.id).toBeDefined();
            expect(normalized.id.length).toBeGreaterThan(0);
        });

        it('should preserve additional metadata', () => {
            const raw = {
                id: '1',
                type: 'shot',
                location: [90, 45],
                team: { id: 1 },
                xG: 0.76,
                bodyPart: 'right_foot'
            };

            const normalized = EventNormalizer.normalize(raw);

            expect(normalized.metadata).toEqual({
                xG: 0.76,
                bodyPart: 'right_foot'
            });
        });

        it('should handle different field mappings for position', () => {
            const raw = { type: 'pass', coordinates: { x: 10, y: 20 }, team: { id: 1 } };
            const normalized = EventNormalizer.normalize(raw);
            expect(normalized.position).toEqual({ x: 10, y: 20 });
        });

        it('should support sourceDimensions option to scale coordinates', () => {
            const raw = { type: 'pass', location: [60, 40], team: { id: 1 } }; // 60 is 50% of 120
            const normalized = EventNormalizer.normalize(raw, {
                sourceDimensions: { width: 120, height: 80 }
            });
            expect(normalized.position).toEqual({ x: 50, y: 50 });
        });

        it('should not clamp positions if clampPositions is false', () => {
            const raw = { type: 'pass', location: [110, -5], team: { id: 1 } };
            const normalized = EventNormalizer.normalize(raw, { clampPositions: false });
            expect(normalized.position).toEqual({ x: 110, y: -5 });
        });

        it('should throw error if position is missing', () => {
            const raw = { type: 'pass', team: { id: 1 } };
            expect(() => EventNormalizer.normalize(raw)).toThrow('invalid or missing position');
        });

        it('should throw error if team is missing or invalid', () => {
            const raw = { type: 'pass', location: [50, 50] };
            expect(() => EventNormalizer.normalize(raw)).toThrow('invalid or missing team');
        });

        it('should parse optional fields like player, endPosition, timestamps', () => {
            const raw = {
                type: 'pass',
                location: [50, 50],
                team: { id: 1 },
                end_location: [70, 60],
                player: { id: 9, name: 'Striker', jerseyNumber: 9 },
                timestamp: 120,
                minute: 2,
                second: 0,
                period: 1,
                outcome: 'success'
            };
            const normalized = EventNormalizer.normalize(raw);
            expect(normalized.endPosition).toEqual({ x: 70, y: 60 });
            expect(normalized.player).toEqual({ id: 9, name: 'Striker', jerseyNumber: 9 });
            expect(normalized.timestamp).toBe(120);
            expect(normalized.outcome).toBe('success');
        });
    });

    describe('convertCoordinates()', () => {
        it('should convert coordinates based on source dimensions', () => {
            const pos = EventNormalizer.convertCoordinates(60, 40, { width: 120, height: 80 });
            expect(pos).toEqual({ x: 50, y: 50 });
        });
    });

    describe('withOptions()', () => {
        it('should create a normalizer with preset options', () => {
            const customNormalizer = EventNormalizer.withOptions({
                sourceDimensions: { width: 120, height: 80 }
            });

            const raw = { type: 'pass', location: [30, 20], team: { id: 1 } }; // 25% of 120, 25% of 80
            const normalized = customNormalizer.normalize(raw);

            expect(normalized.position).toEqual({ x: 25, y: 25 });

            const batch = customNormalizer.normalizeBatch([raw]);
            expect(batch[0].position).toEqual({ x: 25, y: 25 });
        });
    });

    describe('normalizeBatch()', () => {
        it('should normalize array of events', () => {
            const rawEvents = [
                { id: '1', type: 'pass', location: [30, 50], team: { id: 1 } },
                { id: '2', type: 'shot', location: [85, 45], team: { id: 1 } }
            ];

            const normalized = EventNormalizer.normalizeBatch(rawEvents);

            expect(normalized).toHaveLength(2);
            expect(normalized[0].type).toBe('pass');
            expect(normalized[1].type).toBe('shot');
        });

        it('should filter invalid events with warning (canNormalize check)', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const rawEvents = [
                { id: '1', type: 'pass', location: [30, 50], team: { id: 1 } },
                { id: '2', type: 'invalid' }, // Missing required fields
            ];

            const normalized = EventNormalizer.normalizeBatch(rawEvents);

            expect(normalized).toHaveLength(1);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Skipping invalid event'));
        });

        it('should handle validation errors during normalization (post-normalization)', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            // Mock validateEvent to fail
            const validateSpy = vi.spyOn(validators, 'validateEvent');
            validateSpy.mockReturnValue({ isValid: false, errors: ['Mock validation error'] });

            const rawEvents = [
                { id: '1', type: 'pass', location: [50, 50], team: { id: 1 } }
            ];

            const normalized = EventNormalizer.normalizeBatch(rawEvents);

            expect(normalized).toHaveLength(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid event at index 0'),
                expect.any(Array)
            );
        });

        it('should include invalid events if skipInvalid is false', () => {
            // Mock validateEvent to fail
            const validateSpy = vi.spyOn(validators, 'validateEvent');
            validateSpy.mockReturnValue({ isValid: false, errors: ['Mock validation error'] });

            const rawEvents = [
                { id: '1', type: 'pass', location: [50, 50], team: { id: 1 } }
            ];

            const normalized = EventNormalizer.normalizeBatch(rawEvents, {
                skipInvalid: false
            });

            expect(normalized).toHaveLength(1);
        });

        it('should handle exceptions during normalization', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const rawEvents = [
                { id: '1', type: 'pass', location: [50, 50], team: { id: 1 } }
            ];

            // We can mock normalize to throw
            const mockNormalize = vi.spyOn(EventNormalizer, 'normalize');
            mockNormalize.mockImplementationOnce(() => { throw new Error('Normalization error'); });

            const normalized = EventNormalizer.normalizeBatch(rawEvents);

            expect(normalized).toHaveLength(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Error normalizing event'),
                expect.any(Error)
            );
        });

        it('should throw exception if skipInvalid is false on error', () => {
            const rawEvents = [
                { id: '1', type: 'pass', location: [50, 50], team: { id: 1 } }
            ];

            const mockNormalize = vi.spyOn(EventNormalizer, 'normalize');
            mockNormalize.mockImplementationOnce(() => { throw new Error('Fatal error'); });

            expect(() => {
                EventNormalizer.normalizeBatch(rawEvents, { skipInvalid: false });
            }).toThrow('Fatal error');
        });
    });
});
