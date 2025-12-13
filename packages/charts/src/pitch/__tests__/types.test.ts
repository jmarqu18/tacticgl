import { describe, it, expect } from 'vitest';
import { createPitchConfig } from '../config';
import {
    FIFA_DIMENSIONS,
    LIGHT_THEME,
    DARK_THEME,
    PENALTY_AREA,
    GOAL_AREA,
    CENTER_CIRCLE_RADIUS
} from '../constants';

describe('PitchConfig', () => {
    describe('defaults', () => {
        it('should use FIFA dimensions by default', () => {
            const config = createPitchConfig({});
            expect(config.dimensions).toEqual(FIFA_DIMENSIONS);
        });

        it('should default to horizontal orientation', () => {
            const config = createPitchConfig({});
            expect(config.orientation).toBe('horizontal');
        });

        it('should default to light theme', () => {
            const config = createPitchConfig({});
            expect(config.theme.name).toBe('light');
        });
    });

    describe('custom dimensions', () => {
        it('should accept custom width and height', () => {
            const config = createPitchConfig({
                dimensions: { width: 100, height: 64 }
            });
            // FIFA_DIMENSIONS has lineThickness, so we need to match that as well since we merge
            expect(config.dimensions).toEqual({
                width: 100,
                height: 64,
                lineThickness: FIFA_DIMENSIONS.lineThickness
            });
        });

        it('should validate minimum dimensions', () => {
            expect(() => createPitchConfig({
                dimensions: { width: 50, height: 29.9 }
            })).toThrow('Pitch dimensions too small');
        });
    });
});

describe('PitchTheme', () => {
    it('should define all required colors for light theme', () => {
        expect(LIGHT_THEME).toMatchObject({
            grass: expect.any(String),
            lines: expect.any(String),
            goalLine: expect.any(String),
            penaltyArc: expect.any(String),
            centerCircle: expect.any(String)
        });
    });

    it('should define all required colors for dark theme', () => {
        expect(DARK_THEME).toMatchObject({
            grass: expect.any(String),
            lines: expect.any(String),
            goalLine: expect.any(String),
            penaltyArc: expect.any(String),
            centerCircle: expect.any(String)
        });
    });
});

describe('Pitch Constants', () => {
    it('should export FIFA standard dimensions', () => {
        expect(FIFA_DIMENSIONS).toEqual({ width: 105, height: 68, lineThickness: 0.12 });
    });

    it('should export penalty area dimensions', () => {
        expect(PENALTY_AREA).toMatchObject({
            width: 16.5,
            // height: 40.32 in implementation (16.5*2 + 7.32)
            height: 40.32
        });
    });

    it('should export goal area dimensions', () => {
        expect(GOAL_AREA).toMatchObject({
            width: 5.5,
            // height: 18.32 in implementation (5.5*2 + 7.32)
            height: 18.32
        });
    });

    it('should export center circle radius', () => {
        expect(CENTER_CIRCLE_RADIUS).toBe(9.15);
    });
});
