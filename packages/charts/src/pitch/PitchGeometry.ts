import { PitchDimensions, PitchOrientation } from './types';
import {
    FIFA_DIMENSIONS,
    PENALTY_AREA,
    GOAL_AREA,
    CENTER_CIRCLE_RADIUS,
    PENALTY_SPOT_DISTANCE
} from './constants';

export interface GeometryObject {
    id: string;
    type: 'rect' | 'circle' | 'line' | 'arc';
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    cx?: number;
    cy?: number;
    r?: number;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    startAngle?: number;
    endAngle?: number;
}

export class PitchGeometry {
    private dimensions: PitchDimensions;
    private orientation: PitchOrientation;

    constructor(dimensions: PitchDimensions = FIFA_DIMENSIONS, orientation: PitchOrientation = 'horizontal') {
        this.dimensions = dimensions;
        this.orientation = orientation;
    }

    private normalizeX(val: number): number {
        return (val / this.dimensions.width) * 100;
    }

    private normalizeY(val: number): number {
        return (val / this.dimensions.height) * 100;
    }

    private transform(geo: GeometryObject): GeometryObject {
        if (this.orientation === 'horizontal') return geo;

        // Transform for vertical orientation (swapping axes)
        // Assume horizontal X axis becomes Vertical Y axis.
        // Assume horizontal Y axis becomes Vertical X axis.
        // Top-Left (0,0) stays (0,0)?
        // If "vertical" usually means the goals are at top/bottom.
        // Left Goal (x=0) -> Top Goal (y=0).
        // Right Goal (x=100) -> Bottom Goal (y=100).

        const newGeo: GeometryObject = { ...geo };

        if (geo.type === 'rect') {
            newGeo.x = geo.y;
            newGeo.y = geo.x;
            newGeo.width = geo.height;
            newGeo.height = geo.width;
        } else if (geo.type === 'circle') {
            newGeo.cx = geo.cy;
            newGeo.cy = geo.cx;
            // Radius is relative to what?
            // Usually circles are uniform. 
            // However, if the aspect ratio changes, circles might look like ellipses if we just scale.
            // But we are returning normalized percentages.
            // If aspect ratio is preserved in the final rendering view, checks out.
            // But here we are just swapping coordinate systems.
        } else if (geo.type === 'line') {
            newGeo.x1 = geo.y1;
            newGeo.y1 = geo.x1;
            newGeo.x2 = geo.y2;
            newGeo.y2 = geo.x2;
        } else if (geo.type === 'arc') {
            newGeo.cx = geo.cy;
            newGeo.cy = geo.cx;
            // Angles need to be rotated by 90 degrees?
            // startAngle 0 (Right) -> 90 (Down)
            // But usually arcs are defined in radians relative to X-axis.
            // If we swap X/Y, the reference frame changes.
            if (geo.startAngle !== undefined) newGeo.startAngle = geo.startAngle + Math.PI / 2;
            if (geo.endAngle !== undefined) newGeo.endAngle = geo.endAngle + Math.PI / 2;
        }

        return newGeo;
    }

    getOutline(): GeometryObject {
        return this.transform({
            id: 'outline',
            type: 'rect',
            x: 0,
            y: 0,
            width: 100,
            height: 100
        });
    }

    getCenterLine(): GeometryObject {
        return this.transform({
            id: 'centerLine',
            type: 'line',
            x1: 50,
            y1: 0,
            x2: 50,
            y2: 100
        });
    }

    getCenterCircle(): GeometryObject {
        // Radius validation: 9.15m normalized to Width%
        return this.transform({
            id: 'centerCircle',
            type: 'circle',
            cx: 50,
            cy: 50,
            r: this.normalizeX(CENTER_CIRCLE_RADIUS)
        });
    }

    getPenaltyArea(side: 'left' | 'right'): GeometryObject {
        const w = this.normalizeX(PENALTY_AREA.width);
        const h = this.normalizeY(PENALTY_AREA.height);
        const y = (100 - h) / 2;
        const x = side === 'left' ? 0 : 100 - w;

        return this.transform({
            id: `penaltyArea${side === 'left' ? 'Left' : 'Right'}`,
            type: 'rect',
            x,
            y,
            width: w,
            height: h
        });
    }

    getGoalArea(side: 'left' | 'right'): GeometryObject {
        const w = this.normalizeX(GOAL_AREA.width);
        const h = this.normalizeY(GOAL_AREA.height);
        const y = (100 - h) / 2;
        const x = side === 'left' ? 0 : 100 - w;

        return this.transform({
            id: `goalArea${side === 'left' ? 'Left' : 'Right'}`,
            type: 'rect',
            x,
            y,
            width: w,
            height: h
        });
    }

    getPenaltySpot(side: 'left' | 'right'): GeometryObject {
        const dist = this.normalizeX(PENALTY_SPOT_DISTANCE);
        const x = side === 'left' ? dist : 100 - dist;

        return this.transform({
            id: `penaltySpot${side === 'left' ? 'Left' : 'Right'}`,
            type: 'circle',
            cx: x,
            cy: 50,
            r: 0.4 // Small fixed radius for spot? Or use lineThickness? Use a small default.
        });
    }

    getCenterSpot(): GeometryObject {
        return this.transform({
            id: 'centerSpot',
            type: 'circle',
            cx: 50,
            cy: 50,
            r: 0.4
        });
    }

    getPenaltyArc(side: 'left' | 'right'): GeometryObject {
        const rMeters = CENTER_CIRCLE_RADIUS; // 9.15m
        const r = this.normalizeX(rMeters);

        // Spot X position in meters from left
        const spotX = side === 'left' ? PENALTY_SPOT_DISTANCE : (this.dimensions.width - PENALTY_SPOT_DISTANCE);

        // Penalty Area Line X position in meters from left
        const areaX = side === 'left' ? PENALTY_AREA.width : (this.dimensions.width - PENALTY_AREA.width);

        // Horizontal distance from spot to intersection
        // abs(16.5 - 11) = 5.5
        const dist = Math.abs(areaX - spotX);

        // Angle alpha = acos(dist/r)
        // If dist > r (should not happen in standard pitch), angle is 0
        const angle = Math.acos(dist / rMeters);

        const cx = side === 'left' ? this.normalizeX(PENALTY_SPOT_DISTANCE) : 100 - this.normalizeX(PENALTY_SPOT_DISTANCE);
        const cy = 50;

        // Angles. 0 is Right (East). PI/2 is Down (South).
        // Left Arc: Opens to the Right.
        // Needs to be drawn from -angle to +angle. 
        // Right Arc: Opens to the Left.
        // Needs to be drawn roughly from PI - angle to PI + angle.

        let startAngle: number, endAngle: number;

        if (side === 'left') {
            // For SVG, angles might be different, but mathematically:
            // We want the part of circle > 16.5
            startAngle = -angle;
            endAngle = angle;
        } else {
            // We want the part of circle < (Width - 16.5)
            startAngle = Math.PI - angle;
            endAngle = Math.PI + angle;
        }

        return this.transform({
            id: `penaltyArc${side === 'left' ? 'Left' : 'Right'}`,
            type: 'arc',
            cx,
            cy,
            r,
            startAngle,
            endAngle
        });
    }

    getAllGeometries(): GeometryObject[] {
        // Order matters for rendering layers
        // 1. Outline (grass/field) - handled separately usually, but here provided.
        // 2. Areas
        // 3. Lines / Arcs
        // 4. Spots

        return [
            this.getOutline(),
            this.getPenaltyArea('left'),
            this.getPenaltyArea('right'),
            this.getGoalArea('left'),
            this.getGoalArea('right'),
            this.getCenterCircle(),
            this.getPenaltyArc('left'),
            this.getPenaltyArc('right'),
            this.getCenterLine(),
            this.getCenterSpot(),
            this.getPenaltySpot('left'),
            this.getPenaltySpot('right'),
        ];
    }
}
