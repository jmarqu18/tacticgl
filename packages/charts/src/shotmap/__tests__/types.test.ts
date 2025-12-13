import { describe, it, expect } from 'vitest';
import { ShotOutcome, type Shot } from '../types';
import { createShotMapConfig } from '../constants';

describe('Shot Interface', () => {
    it('should require position', () => {
        // TypeScript check mostly, but runtime object structure check
        const shot: Shot = {
            id: '1',
            position: { x: 85, y: 50 },
            outcome: ShotOutcome.Goal,
            xG: 0.76,
            team: { id: 1, name: 'Home' }
        };

        expect(shot.position).toBeDefined();
        expect(shot.position.x).toBe(85);
        expect(shot.position.y).toBe(50);
    });

    it('should have optional player', () => {
        const shot: Shot = {
            id: '1',
            position: { x: 85, y: 50 },
            outcome: ShotOutcome.Saved,
            xG: 0.15,
            team: { id: 1, name: 'Home' }
        };

        expect(shot.player).toBeUndefined();
    });
});

describe('ShotMapConfig', () => {
    it('should define default size scale', () => {
        const config = createShotMapConfig({});

        expect(config.sizeScale).toEqual({
            minRadius: 4,
            maxRadius: 20,
            basedOn: 'xG'
        });
    });

    it('should define default color mapping', () => {
        const config = createShotMapConfig({});

        expect(config.colors[ShotOutcome.Goal]).toBe('#22c55e');
        expect(config.colors[ShotOutcome.Saved]).toBe('#3b82f6');
        expect(config.colors[ShotOutcome.OffTarget]).toBe('#ef4444');
    });

    it('should allow filtering by team', () => {
        const config = createShotMapConfig({
            filter: { teamId: 1 }
        });

        expect(config.filter.teamId).toBe(1);
    });

    it('should allow filtering by player', () => {
        const config = createShotMapConfig({
            filter: { playerId: 'messi' }
        });

        expect(config.filter.playerId).toBe('messi');
    });
});
