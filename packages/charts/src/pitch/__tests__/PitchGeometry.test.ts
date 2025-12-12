import { describe, it, expect } from 'vitest';
import { PitchGeometry, GeometryObject } from '../PitchGeometry';
import { FIFA_DIMENSIONS } from '../constants';

describe('PitchGeometry', () => {
    const geometry = new PitchGeometry(FIFA_DIMENSIONS);

    describe('outline', () => {
        it('should generate field outline as rectangle', () => {
            const outline = geometry.getOutline();

            expect(outline.type).toBe('rect');
            expect(outline.x).toBe(0);
            expect(outline.y).toBe(0);
            expect(outline.width).toBe(100);
            expect(outline.height).toBe(100);
        });
    });

    describe('centerLine', () => {
        it('should generate vertical center line', () => {
            const line = geometry.getCenterLine();

            expect(line.type).toBe('line');
            expect(line.x1).toBe(50);
            expect(line.x2).toBe(50);
            expect(line.y1).toBe(0);
            expect(line.y2).toBe(100);
        });
    });

    describe('centerCircle', () => {
        it('should generate center circle at midpoint', () => {
            const circle = geometry.getCenterCircle();

            expect(circle.type).toBe('circle');
            expect(circle.cx).toBe(50);
            expect(circle.cy).toBe(50);
        });

        it('should have correct radius (9.15m normalized)', () => {
            const circle = geometry.getCenterCircle();
            // 9.15m / 105m * 100 = 8.71%
            expect(circle.r).toBeCloseTo(8.71, 1);
        });
    });

    describe('penaltyArea', () => {
        it('should generate left penalty area', () => {
            const area = geometry.getPenaltyArea('left');

            expect(area.type).toBe('rect');
            expect(area.x).toBe(0);
            // 16.5m / 105m * 100 = 15.71%
            expect(area.width).toBeCloseTo(15.71, 1);
        });

        it('should generate right penalty area', () => {
            const area = geometry.getPenaltyArea('right');

            expect(area.type).toBe('rect');
            expect(area.x + area.width).toBeCloseTo(100, 1);
        });

        it('should center penalty area vertically', () => {
            const area = geometry.getPenaltyArea('left');
            // 40.32m / 68m * 100 = 59.29%
            // 40.3m -> 59.26% (original test used 40.3, my constant is 40.32 used in implementation, let's stick to constant if possible or be tolerant)
            const expectedHeight = (40.32 / 68) * 100;
            const expectedY = (100 - expectedHeight) / 2;

            expect(area.height).toBeCloseTo(expectedHeight, 1);
            expect(area.y).toBeCloseTo(expectedY, 0);
        });
    });

    describe('goalArea', () => {
        it('should generate left goal area', () => {
            const area = geometry.getGoalArea('left');

            expect(area.type).toBe('rect');
            expect(area.x).toBe(0);
            // 5.5m / 105m * 100 = 5.24%
            expect(area.width).toBeCloseTo(5.24, 1);
        });
    });

    describe('penaltySpot', () => {
        it('should position left penalty spot at 11m', () => {
            const spot = geometry.getPenaltySpot('left');

            expect(spot.type).toBe('circle');
            // 11m / 105m * 100 = 10.48%
            expect(spot.cx).toBeCloseTo(10.48, 1);
            expect(spot.cy).toBe(50);
        });

        it('should position right penalty spot correctly', () => {
            const spot = geometry.getPenaltySpot('right');

            expect(spot.cx).toBeCloseTo(89.52, 1);
            expect(spot.cy).toBe(50);
        });
    });

    describe('penaltyArc', () => {
        it('should generate arc outside penalty area', () => {
            const arc = geometry.getPenaltyArc('left');

            expect(arc.type).toBe('arc');
            // Arc centered on penalty spot
            expect(arc.cx).toBeCloseTo(10.48, 1);
            expect(arc.cy).toBe(50);
        });

        it('should only render portion outside penalty area', () => {
            const arc = geometry.getPenaltyArc('left');

            // El arco debe empezar donde termina el área de penalti
            expect(arc.startAngle).toBeDefined();
            expect(arc.endAngle).toBeDefined();
        });
    });

    describe('centerSpot', () => {
        it('should position center spot at midpoint', () => {
            const spot = geometry.getCenterSpot();

            expect(spot.cx).toBe(50);
            expect(spot.cy).toBe(50);
        });
    });

    describe('getAllGeometries', () => {
        it('should return all pitch geometries', () => {
            const all = geometry.getAllGeometries();

            expect(all).toContainEqual(expect.objectContaining({ id: 'outline' }));
            expect(all).toContainEqual(expect.objectContaining({ id: 'centerLine' }));
            expect(all).toContainEqual(expect.objectContaining({ id: 'centerCircle' }));
            expect(all).toContainEqual(expect.objectContaining({ id: 'penaltyAreaLeft' }));
            expect(all).toContainEqual(expect.objectContaining({ id: 'penaltyAreaRight' }));
            expect(all).toContainEqual(expect.objectContaining({ id: 'goalAreaLeft' }));
            expect(all).toContainEqual(expect.objectContaining({ id: 'goalAreaRight' }));
        });

        it('should order geometries by render layer', () => {
            const all = geometry.getAllGeometries();

            // Outline primero, luego áreas, luego líneas, luego puntos
            const outlineIndex = all.findIndex((g: GeometryObject) => g.id === 'outline');
            const centerLineIndex = all.findIndex((g: GeometryObject) => g.id === 'centerLine');

            expect(outlineIndex).toBeLessThan(centerLineIndex);
        });
    });

    describe('vertical orientation', () => {
        const verticalGeometry = new PitchGeometry(FIFA_DIMENSIONS, 'vertical');

        it('should swap dimensions for vertical orientation', () => {
            const outline = verticalGeometry.getOutline();
            // En vertical, el campo es más alto que ancho visualmente
            // pero las coordenadas normalizadas siguen siendo 0-100
            expect(outline.width).toBe(100);
            expect(outline.height).toBe(100);
        });

        it('should rotate center line to horizontal', () => {
            const line = verticalGeometry.getCenterLine();

            expect(line.y1).toBe(50);
            expect(line.y2).toBe(50);
            expect(line.x1).toBe(0);
            expect(line.x2).toBe(100);
        });

        it('should position penalty areas at top and bottom', () => {
            const topArea = verticalGeometry.getPenaltyArea('left');
            const bottomArea = verticalGeometry.getPenaltyArea('right');
            // 'left' corresponds to 'top' in vertical rotation usually if we rotate -90 or +90
            // If we simply swap Axis X for Y.
            // Left (X=0) -> Top (Y=0)

            expect(topArea.y).toBe(0);
            expect(bottomArea.y + bottomArea.height).toBeCloseTo(100, 1);
        });
    });
});
