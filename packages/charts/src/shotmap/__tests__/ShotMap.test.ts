import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Pitch } from '../../pitch/Pitch';
import { ShotMap } from '../ShotMap';
import { ShotOutcome, Shot } from '../types';

describe('ShotMap', () => {
    let container: HTMLElement;
    let pitch: Pitch;
    let shotMap: ShotMap | undefined;

    const mockShots: Shot[] = [
        {
            id: '1',
            position: { x: 88, y: 45 },
            outcome: ShotOutcome.Goal,
            xG: 0.76,
            team: { id: 1, name: 'Home' },
            player: { id: 'p1', name: 'Player 1' }
        },
        {
            id: '2',
            position: { x: 92, y: 55 },
            outcome: ShotOutcome.Saved,
            xG: 0.23,
            team: { id: 1, name: 'Home' }
        },
        {
            id: '3',
            position: { x: 85, y: 30 },
            outcome: ShotOutcome.OffTarget,
            xG: 0.08,
            team: { id: 2, name: 'Away' }
        }
    ];

    beforeEach(() => {
        // Basic DOM setup
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        // Must attach to body for getBoundingClientRect to work in some environments, though jsdom is usually fine.
        document.body.appendChild(container);

        // Pitch requires container
        pitch = new Pitch({ container });
        pitch.render();
    });

    afterEach(() => {
        shotMap?.destroy();
        pitch.destroy();
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('render', () => {
        it('should render circles for each shot', () => {
            shotMap = new ShotMap({ data: mockShots });
            pitch.add(shotMap);

            const circles = container.querySelectorAll('[data-shot-id]');
            expect(circles).toHaveLength(3);
        });

        it('should position shots correctly', () => {
            shotMap = new ShotMap({ data: [mockShots[0]] });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="1"]');
            // x: 88% de 105 = 92.4, y: 45% de 68 = 30.6
            // PitchScale.toPixel is used. with 105 width.
            expect(parseFloat(circle?.getAttribute('cx') || '0')).toBeCloseTo(92.4, 0);
            expect(parseFloat(circle?.getAttribute('cy') || '0')).toBeCloseTo(30.6, 0);
        });
    });

    describe('size scale', () => {
        it('should size based on xG value', () => {
            shotMap = new ShotMap({
                data: mockShots,
                sizeScale: { minRadius: 4, maxRadius: 20, basedOn: 'xG' }
            });
            pitch.add(shotMap);

            const goalCircle = container.querySelector('[data-shot-id="1"]');
            const lowXgCircle = container.querySelector('[data-shot-id="3"]');

            const goalRadius = parseFloat(goalCircle?.getAttribute('r') || '0');
            const lowRadius = parseFloat(lowXgCircle?.getAttribute('r') || '0');

            expect(goalRadius).toBeGreaterThan(lowRadius);
        });

        it('should use min radius for xG near 0', () => {
            const lowXgShot: Shot = {
                ...mockShots[0],
                id: 'low',
                xG: 0.01
            };

            shotMap = new ShotMap({
                data: [lowXgShot],
                sizeScale: { minRadius: 4, maxRadius: 20, basedOn: 'xG' }
            });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="low"]');
            // 4 + (0.01 * 16) = 4.16
            expect(parseFloat(circle?.getAttribute('r') || '0')).toBeCloseTo(4.16, 1);
        });

        it('should use max radius for xG = 1', () => {
            const highXgShot: Shot = {
                ...mockShots[0],
                id: 'high',
                xG: 1.0
            };

            shotMap = new ShotMap({
                data: [highXgShot],
                sizeScale: { minRadius: 4, maxRadius: 20, basedOn: 'xG' }
            });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="high"]');
            expect(parseFloat(circle?.getAttribute('r') || '0')).toBeCloseTo(20, 1);
        });
    });

    describe('color by outcome', () => {
        it('should color goals green', () => {
            shotMap = new ShotMap({ data: [mockShots[0]] });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="1"]');
            // Check constants colors
            expect(circle?.getAttribute('fill')).toBe('#22c55e');
        });

        it('should color saved shots blue', () => {
            shotMap = new ShotMap({ data: [mockShots[1]] });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="2"]');
            expect(circle?.getAttribute('fill')).toBe('#3b82f6');
        });

        it('should color off-target shots red', () => {
            shotMap = new ShotMap({ data: [mockShots[2]] });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="3"]');
            expect(circle?.getAttribute('fill')).toBe('#ef4444');
        });
    });

    describe('filtering', () => {
        it('should filter by team', () => {
            shotMap = new ShotMap({
                data: mockShots,
                filter: { teamId: 1 }
            });
            pitch.add(shotMap);

            const circles = container.querySelectorAll('[data-shot-id]');
            expect(circles).toHaveLength(2); // Only team 1
        });

        it('should filter by player', () => {
            shotMap = new ShotMap({
                data: mockShots,
                filter: { playerId: 'p1' }
            });
            pitch.add(shotMap);

            const circles = container.querySelectorAll('[data-shot-id]');
            expect(circles).toHaveLength(1);
        });

        it('should update filter dynamically', () => {
            shotMap = new ShotMap({ data: mockShots });
            pitch.add(shotMap);

            expect(container.querySelectorAll('[data-shot-id]')).toHaveLength(3);

            shotMap.setFilter({ teamId: 2 });

            expect(container.querySelectorAll('[data-shot-id]')).toHaveLength(1);
        });
    });

    describe('tooltip', () => {
        it('should show tooltip on hover', async () => {
            // Force static position to test simple logic in ShotMap (line 174 coverage)
            container.style.position = 'static';

            shotMap = new ShotMap({ data: mockShots, tooltip: true });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="1"]');
            if (!circle) throw new Error('Circle not found');

            // Dispatch mouseover on the circle. 
            // The container listener should catch it (bubbling).
            circle.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

            await vi.waitFor(() => {
                const tooltip = container.querySelector('.tacticgl-tooltip') as HTMLElement;
                expect(tooltip).not.toBeNull();
                expect(tooltip.style.display).toBe('block');

                // Verify it ensured relative position
                expect(container.style.position).toBe('relative');
            });
        });

        it('should display shot info in tooltip', async () => {
            shotMap = new ShotMap({ data: mockShots, tooltip: true });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="1"]');
            if (!circle) throw new Error('Circle not found');

            circle.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

            await vi.waitFor(() => {
                const tooltip = container.querySelector('.tacticgl-tooltip');
                expect(tooltip?.textContent).toContain('Player 1');
                expect(tooltip?.textContent).toContain('0.76');
                expect(tooltip?.textContent).toContain('Goal');
            });
        });

        it('should hide tooltip on mouse leave', async () => {
            shotMap = new ShotMap({ data: mockShots, tooltip: true });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="1"]');
            if (!circle) throw new Error('Circle not found');

            circle.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            circle.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));

            await vi.waitFor(() => {
                const tooltip = container.querySelector('.tacticgl-tooltip') as HTMLElement;
                expect(tooltip.style.display).toBe('none');
            });
        });

        it('should update position on mouse move', async () => {
            shotMap = new ShotMap({ data: mockShots, tooltip: true });
            pitch.add(shotMap);

            const circle = container.querySelector('[data-shot-id="1"]');
            if (!circle) throw new Error('Circle not found');

            // Trigger show
            circle.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

            // Trigger move
            const moveEvent = new MouseEvent('mousemove', {
                bubbles: true,
                clientX: 100,
                clientY: 100
            });
            container.dispatchEvent(moveEvent);

            await vi.waitFor(() => {
                const tooltip = container.querySelector('.tacticgl-tooltip') as HTMLElement;
                // Logic: clientX (100) - rect.left (0) + 10 = 110
                expect(tooltip.style.left).toBe('110px');
                expect(tooltip.style.top).toBe('110px');
            });
        });
    });

    describe('setData', () => {
        it('should update shots without recreating pitch', () => {
            shotMap = new ShotMap({ data: mockShots });
            pitch.add(shotMap);

            const newShots: Shot[] = [
                {
                    id: 'new1',
                    position: { x: 90, y: 50 },
                    outcome: ShotOutcome.Goal,
                    xG: 0.9,
                    team: { id: 1, name: 'Home' }
                }
            ];

            shotMap.setData(newShots);

            const circles = container.querySelectorAll('[data-shot-id]');
            expect(circles).toHaveLength(1);
            expect(container.querySelector('[data-shot-id="new1"]')).not.toBeNull();
        });
    });

    describe('highlight', () => {
        it('should highlight specific shot', () => {
            shotMap = new ShotMap({ data: mockShots });
            pitch.add(shotMap);

            shotMap.highlight('1');

            const circle = container.querySelector('[data-shot-id="1"]');
            // Check opacity
            expect(circle?.getAttribute('opacity')).toBe('1');
        });

        it('should dim non-highlighted shots', () => {
            shotMap = new ShotMap({ data: mockShots });
            pitch.add(shotMap);

            shotMap.highlight('1');

            const otherCircle = container.querySelector('[data-shot-id="2"]');
            expect(otherCircle?.getAttribute('opacity')).toBe('0.3');
        });

        it('should clear highlight', () => {
            shotMap = new ShotMap({ data: mockShots });
            pitch.add(shotMap);

            shotMap.highlight('1');
            shotMap.clearHighlight();

            const circles = container.querySelectorAll('[data-shot-id]');
            circles.forEach(circle => {
                expect(circle.getAttribute('opacity')).toBe('1');
            });
        });
    });
});
