import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Pitch } from '../../pitch';
import { createPitch } from '../createPitch';
import { shotMap } from '../shotMap';
import { Shot, ShotOutcome, ShotMap } from '../../shotmap';

describe('shotMap function', () => {
    let container: HTMLElement;
    let pitch: Pitch;

    beforeEach(() => {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        pitch = createPitch(container);
    });

    afterEach(() => {
        pitch.destroy();
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    it('should add shots to pitch', () => {
        const shots: Shot[] = [
            { id: '1', position: { x: 90, y: 50 }, outcome: ShotOutcome.Goal, xG: 0.8, team: { id: 1 } }
        ];

        shotMap(pitch, shots);

        expect(container.querySelector('[data-shot-id="1"]')).not.toBeNull();
    });

    it('should accept config', () => {
        const shots: Shot[] = [
            { id: '1', position: { x: 90, y: 50 }, outcome: ShotOutcome.Goal, xG: 0.8, team: { id: 1 } },
            { id: '2', position: { x: 85, y: 45 }, outcome: ShotOutcome.Saved, xG: 0.3, team: { id: 2 } }
        ];

        shotMap(pitch, shots, { filter: { teamId: 1 } });

        const elements = container.querySelectorAll('[data-shot-id]');
        // Should only have 1 element because of filter
        expect(elements).toHaveLength(1);
        expect(elements[0].getAttribute('data-shot-id')).toBe('1');
    });

    it('should return ShotMap instance', () => {
        const result = shotMap(pitch, []);

        expect(result).toBeInstanceOf(ShotMap);
    });
});
