/**
 * @fileoverview Tests for PitchScale coordinate conversion system
 * 
 * These tests verify:
 * - Default configuration uses FIFA standard dimensions (105x68)
 * - Conversion between normalized (0-100) and pixel coordinates
 * - Support for horizontal and vertical orientations
 * - Configurable padding
 * - Immutability guarantees
 * - Pitch landmark helper methods
 */

import { describe, it, expect } from 'vitest';
import { PitchScale } from '../PitchScale';

describe('PitchScale', () => {
    describe('default configuration', () => {
        const scale = new PitchScale();

        it('should use FIFA standard dimensions (105x68)', () => {
            expect(scale.dimensions).toEqual({ width: 105, height: 68 });
        });

        it('should default to horizontal orientation', () => {
            expect(scale.orientation).toBe('horizontal');
        });

        it('should have zero padding by default', () => {
            expect(scale.padding).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
        });

        it('should calculate total dimensions correctly with no padding', () => {
            expect(scale.totalDimensions).toEqual({ width: 105, height: 68 });
        });
    });

    describe('custom configuration', () => {
        it('should accept custom dimensions', () => {
            const scale = new PitchScale({ width: 120, height: 75 });
            expect(scale.dimensions).toEqual({ width: 120, height: 75 });
        });

        it('should accept custom orientation', () => {
            const scale = new PitchScale({ orientation: 'vertical' });
            expect(scale.orientation).toBe('vertical');
        });

        it('should accept partial padding', () => {
            const scale = new PitchScale({ padding: { top: 10, left: 5 } });
            expect(scale.padding).toEqual({ top: 10, right: 0, bottom: 0, left: 5 });
        });

        it('should accept full padding', () => {
            const scale = new PitchScale({
                padding: { top: 10, right: 20, bottom: 30, left: 40 }
            });
            expect(scale.padding).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
        });

        it('should calculate total dimensions correctly with padding', () => {
            const scale = new PitchScale({
                width: 100,
                height: 50,
                padding: { top: 5, right: 10, bottom: 5, left: 10 }
            });
            expect(scale.totalDimensions).toEqual({ width: 120, height: 60 });
        });
    });

    describe('toPixel()', () => {
        it('should convert origin (0,0) correctly', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            const result = scale.toPixel({ x: 0, y: 0 });

            expect(result).toEqual({ x: 0, y: 0 });
        });

        it('should convert center (50,50) correctly', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            const result = scale.toPixel({ x: 50, y: 50 });

            expect(result.x).toBeCloseTo(52.5, 1);
            expect(result.y).toBeCloseTo(34, 1);
        });

        it('should convert corner (100,100) correctly', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            const result = scale.toPixel({ x: 100, y: 100 });

            expect(result).toEqual({ x: 105, y: 68 });
        });

        it('should convert arbitrary point correctly', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            const result = scale.toPixel({ x: 25, y: 75 });

            expect(result.x).toBeCloseTo(26.25, 2);
            expect(result.y).toBeCloseTo(51, 2);
        });

        it('should handle padding', () => {
            const scale = new PitchScale({
                width: 105,
                height: 68,
                padding: { top: 5, right: 5, bottom: 5, left: 5 }
            });
            const result = scale.toPixel({ x: 0, y: 0 });

            expect(result).toEqual({ x: 5, y: 5 });
        });

        it('should handle asymmetric padding', () => {
            const scale = new PitchScale({
                width: 100,
                height: 50,
                padding: { top: 10, right: 5, bottom: 15, left: 20 }
            });

            // Origin should be at padding offset
            const origin = scale.toPixel({ x: 0, y: 0 });
            expect(origin).toEqual({ x: 20, y: 10 });

            // Corner should be at dimensions + left/top padding
            const corner = scale.toPixel({ x: 100, y: 100 });
            expect(corner).toEqual({ x: 120, y: 60 });
        });

        it('should handle values outside 0-100 range', () => {
            const scale = new PitchScale({ width: 105, height: 68 });

            // Negative values
            const negResult = scale.toPixel({ x: -10, y: -10 });
            expect(negResult.x).toBeCloseTo(-10.5, 1);
            expect(negResult.y).toBeCloseTo(-6.8, 1);

            // Values > 100
            const overResult = scale.toPixel({ x: 110, y: 110 });
            expect(overResult.x).toBeCloseTo(115.5, 1);
            expect(overResult.y).toBeCloseTo(74.8, 1);
        });
    });

    describe('toNormalized()', () => {
        it('should reverse toPixel conversion', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            const pixel = { x: 52.5, y: 34 };
            const normalized = scale.toNormalized(pixel);

            expect(normalized.x).toBeCloseTo(50, 1);
            expect(normalized.y).toBeCloseTo(50, 1);
        });

        it('should convert origin correctly', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            const result = scale.toNormalized({ x: 0, y: 0 });

            expect(result).toEqual({ x: 0, y: 0 });
        });

        it('should convert corner correctly', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            const result = scale.toNormalized({ x: 105, y: 68 });

            expect(result.x).toBeCloseTo(100, 1);
            expect(result.y).toBeCloseTo(100, 1);
        });

        it('should handle out-of-bounds coordinates gracefully', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            const result = scale.toNormalized({ x: 200, y: 200 });

            // Debería clampar o retornar valores > 100
            expect(result.x).toBeGreaterThan(100);
            expect(result.y).toBeGreaterThan(100);
        });

        it('should handle negative coordinates', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            const result = scale.toNormalized({ x: -10, y: -10 });

            expect(result.x).toBeLessThan(0);
            expect(result.y).toBeLessThan(0);
        });

        it('should handle padding correctly', () => {
            const scale = new PitchScale({
                width: 105,
                height: 68,
                padding: { top: 5, right: 5, bottom: 5, left: 5 }
            });

            // Pixel at (5,5) should be normalized (0,0)
            const result = scale.toNormalized({ x: 5, y: 5 });
            expect(result).toEqual({ x: 0, y: 0 });

            // Pixel at (110, 73) should be normalized (100, 100)
            const corner = scale.toNormalized({ x: 110, y: 73 });
            expect(corner.x).toBeCloseTo(100, 1);
            expect(corner.y).toBeCloseTo(100, 1);
        });

        it('should be inverse of toPixel for any point', () => {
            const scale = new PitchScale({ width: 105, height: 68 });

            const testPoints = [
                { x: 0, y: 0 },
                { x: 50, y: 50 },
                { x: 100, y: 100 },
                { x: 25, y: 75 },
                { x: 33.33, y: 66.66 },
            ];

            for (const point of testPoints) {
                const pixel = scale.toPixel(point);
                const backToNormalized = scale.toNormalized(pixel);

                expect(backToNormalized.x).toBeCloseTo(point.x, 5);
                expect(backToNormalized.y).toBeCloseTo(point.y, 5);
            }
        });

        it('should be inverse of toPixel with padding', () => {
            const scale = new PitchScale({
                width: 105,
                height: 68,
                padding: { top: 10, right: 15, bottom: 10, left: 15 }
            });

            const testPoints = [
                { x: 0, y: 0 },
                { x: 50, y: 50 },
                { x: 100, y: 100 },
            ];

            for (const point of testPoints) {
                const pixel = scale.toPixel(point);
                const backToNormalized = scale.toNormalized(pixel);

                expect(backToNormalized.x).toBeCloseTo(point.x, 5);
                expect(backToNormalized.y).toBeCloseTo(point.y, 5);
            }
        });
    });

    describe('vertical orientation', () => {
        it('should swap x and y axes', () => {
            const scale = new PitchScale({
                width: 68, // Nota: invertido para vertical
                height: 105,
                orientation: 'vertical'
            });

            // En vertical, x=0 y=50 debería mapear diferente
            const result = scale.toPixel({ x: 0, y: 50 });
            expect(result.x).toBe(0);
            expect(result.y).toBeCloseTo(52.5, 1);
        });

        it('should work correctly for center in vertical orientation', () => {
            const scale = new PitchScale({
                width: 68,
                height: 105,
                orientation: 'vertical'
            });

            const result = scale.toPixel({ x: 50, y: 50 });
            expect(result.x).toBeCloseTo(34, 1);
            expect(result.y).toBeCloseTo(52.5, 1);
        });

        it('should report vertical orientation', () => {
            const scale = new PitchScale({ orientation: 'vertical' });
            expect(scale.orientation).toBe('vertical');
        });
    });

    describe('immutability', () => {
        it('should not allow dimension changes after creation', () => {
            const scale = new PitchScale({ width: 105, height: 68 });

            // @ts-expect-error - Verificar que es readonly
            expect(() => { scale.dimensions.width = 100; }).toThrow();
        });

        it('should not allow padding changes after creation', () => {
            const scale = new PitchScale({
                padding: { top: 5, right: 5, bottom: 5, left: 5 }
            });

            // @ts-expect-error - Verificar que es readonly
            expect(() => { scale.padding.top = 100; }).toThrow();
        });

        it('should not allow totalDimensions changes', () => {
            const scale = new PitchScale({ width: 105, height: 68 });

            // @ts-expect-error - Verificar que es readonly
            expect(() => { scale.totalDimensions.width = 200; }).toThrow();
        });

        it('should return frozen dimensions object', () => {
            const scale = new PitchScale({ width: 105, height: 68 });
            expect(Object.isFrozen(scale.dimensions)).toBe(true);
        });

        it('should return frozen padding object', () => {
            const scale = new PitchScale({
                padding: { top: 5, right: 5, bottom: 5, left: 5 }
            });
            expect(Object.isFrozen(scale.padding)).toBe(true);
        });
    });

    describe('pitch landmarks', () => {
        const scale = new PitchScale({ width: 105, height: 68 });

        it('should provide center circle center point', () => {
            const center = scale.getCenterSpot();
            expect(center).toEqual({ x: 52.5, y: 34 });
        });

        it('should provide penalty spot positions', () => {
            const leftPenalty = scale.getPenaltySpot('left');
            const rightPenalty = scale.getPenaltySpot('right');

            expect(leftPenalty.x).toBeCloseTo(11, 1);
            expect(leftPenalty.y).toBeCloseTo(34, 1);

            expect(rightPenalty.x).toBeCloseTo(94, 1);
            expect(rightPenalty.y).toBeCloseTo(34, 1);
        });

        it('should provide goal line positions', () => {
            const leftGoal = scale.getGoalCenter('left');
            expect(leftGoal).toEqual({ x: 0, y: 34 });

            const rightGoal = scale.getGoalCenter('right');
            expect(rightGoal).toEqual({ x: 105, y: 34 });
        });

        it('should provide corner positions', () => {
            expect(scale.getCorner('top-left')).toEqual({ x: 0, y: 0 });
            expect(scale.getCorner('top-right')).toEqual({ x: 105, y: 0 });
            expect(scale.getCorner('bottom-left')).toEqual({ x: 0, y: 68 });
            expect(scale.getCorner('bottom-right')).toEqual({ x: 105, y: 68 });
        });

        it('should calculate landmarks with padding', () => {
            const paddedScale = new PitchScale({
                width: 105,
                height: 68,
                padding: { top: 10, right: 10, bottom: 10, left: 10 }
            });

            const center = paddedScale.getCenterSpot();
            expect(center.x).toBeCloseTo(62.5, 1); // 52.5 + 10 padding
            expect(center.y).toBeCloseTo(44, 1);   // 34 + 10 padding
        });
    });

    describe('factory methods for immutable updates', () => {
        it('withPadding should create new instance with updated padding', () => {
            const original = new PitchScale({ width: 105, height: 68 });
            const withPadding = original.withPadding({ top: 20, left: 20 });

            // Original unchanged
            expect(original.padding).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });

            // New instance has updated padding
            expect(withPadding.padding).toEqual({ top: 20, right: 0, bottom: 0, left: 20 });

            // Dimensions preserved
            expect(withPadding.dimensions).toEqual({ width: 105, height: 68 });
        });

        it('withDimensions should create new instance with updated dimensions', () => {
            const original = new PitchScale({ width: 105, height: 68 });
            const withDimensions = original.withDimensions({ width: 120 });

            // Original unchanged
            expect(original.dimensions).toEqual({ width: 105, height: 68 });

            // New instance has updated dimensions
            expect(withDimensions.dimensions).toEqual({ width: 120, height: 68 });
        });

        it('withDimensions should update only height when width is not provided', () => {
            const original = new PitchScale({ width: 105, height: 68 });
            const withDimensions = original.withDimensions({ height: 80 });

            // Original unchanged
            expect(original.dimensions).toEqual({ width: 105, height: 68 });

            // New instance has updated height, width preserved
            expect(withDimensions.dimensions).toEqual({ width: 105, height: 80 });
        });

        it('withDimensions should update both dimensions when provided', () => {
            const original = new PitchScale({ width: 105, height: 68 });
            const withDimensions = original.withDimensions({ width: 120, height: 80 });

            // Both dimensions updated
            expect(withDimensions.dimensions).toEqual({ width: 120, height: 80 });
        });

        it('withOrientation should create new instance with updated orientation', () => {
            const original = new PitchScale({ orientation: 'horizontal' });
            const vertical = original.withOrientation('vertical');

            // Original unchanged
            expect(original.orientation).toBe('horizontal');

            // New instance has updated orientation
            expect(vertical.orientation).toBe('vertical');
        });

        it('factory methods should preserve other properties', () => {
            const original = new PitchScale({
                width: 100,
                height: 50,
                orientation: 'vertical',
                padding: { top: 5, right: 5, bottom: 5, left: 5 }
            });

            const updated = original.withDimensions({ width: 120 });

            expect(updated.dimensions).toEqual({ width: 120, height: 50 });
            expect(updated.orientation).toBe('vertical');
            expect(updated.padding).toEqual({ top: 5, right: 5, bottom: 5, left: 5 });
        });
    });

    describe('edge cases', () => {
        it('should handle very small dimensions', () => {
            const scale = new PitchScale({ width: 1, height: 1 });

            const result = scale.toPixel({ x: 50, y: 50 });
            expect(result.x).toBeCloseTo(0.5, 5);
            expect(result.y).toBeCloseTo(0.5, 5);
        });

        it('should handle very large dimensions', () => {
            const scale = new PitchScale({ width: 10000, height: 6800 });

            const result = scale.toPixel({ x: 50, y: 50 });
            expect(result.x).toBeCloseTo(5000, 1);
            expect(result.y).toBeCloseTo(3400, 1);
        });

        it('should handle zero dimensions gracefully', () => {
            const scale = new PitchScale({ width: 0, height: 0 });

            const result = scale.toPixel({ x: 50, y: 50 });
            expect(result).toEqual({ x: 0, y: 0 });
        });

        it('should handle floating point precision', () => {
            const scale = new PitchScale({ width: 105, height: 68 });

            // Test with a value that could cause floating point issues
            const pixel = scale.toPixel({ x: 33.333333, y: 66.666666 });
            const normalized = scale.toNormalized(pixel);

            expect(normalized.x).toBeCloseTo(33.333333, 4);
            expect(normalized.y).toBeCloseTo(66.666666, 4);
        });
    });
});
