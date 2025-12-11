import { describe, it, expectTypeOf } from 'vitest';
import type {
    Position2D,
    TacticGLEvent,
    IRenderer,
    RendererCapabilities,
    RenderConfig,
    Layer,
    NormalizedData,
    EventType,
    Theme,
} from '../../src/types/index';

describe('Type Definitions', () => {

    describe('Position2D', () => {
        it('should have x and y as numbers', () => {
            expectTypeOf<Position2D>().toMatchTypeOf<{ x: number; y: number }>();
        });

        it('should be readonly', () => {
            expectTypeOf<Position2D['x']>().toBeNumber();
            // Verificar que no se puede asignar
            const pos: Position2D = { x: 50, y: 50 };
            // @ts-expect-error - readonly property
            pos.x = 60;
        });
    });

    describe('TacticGLEvent', () => {
        it('should require id, type, position, and team', () => {
            const validEvent: TacticGLEvent = {
                id: '123',
                type: 'shot',
                position: { x: 50, y: 50 },
                team: { id: 1 },
            };
            expectTypeOf(validEvent).toMatchTypeOf<TacticGLEvent>();
        });

        it('should reject event without required fields', () => {
            // @ts-expect-error - missing required fields
            const invalidEvent: TacticGLEvent = {
                id: '123',
            };
        });

        it('should accept optional fields', () => {
            const fullEvent: TacticGLEvent = {
                id: '123',
                type: 'shot',
                position: { x: 90, y: 45 },
                team: { id: 1, name: 'Home', side: 'home' },
                player: { id: 10, name: 'Messi', jerseyNumber: 10 },
                timestamp: 1234,
                minute: 45,
                second: 30,
                period: 1,
                outcome: 'goal',
                endPosition: { x: 100, y: 50 },
                metadata: { xG: 0.76 },
            };
            expectTypeOf(fullEvent).toMatchTypeOf<TacticGLEvent>();
        });
    });

    describe('EventType', () => {
        it('should accept valid event types', () => {
            const types: EventType[] = [
                'shot', 'goal', 'pass', 'duel', 'interception',
                'clearance', 'pressure', 'carry', 'dribble'
            ];
            expectTypeOf(types).toMatchTypeOf<EventType[]>();
        });

        it('should reject invalid event type', () => {
            // @ts-expect-error - invalid event type
            const invalid: EventType = 'invalid_type';
        });
    });

    describe('IRenderer', () => {
        it('should define all lifecycle methods', () => {
            expectTypeOf<IRenderer>().toHaveProperty('init');
            expectTypeOf<IRenderer>().toHaveProperty('render');
            expectTypeOf<IRenderer>().toHaveProperty('update');
            expectTypeOf<IRenderer>().toHaveProperty('clear');
            expectTypeOf<IRenderer>().toHaveProperty('destroy');
        });

        it('should define layer management methods', () => {
            expectTypeOf<IRenderer>().toHaveProperty('addLayer');
            expectTypeOf<IRenderer>().toHaveProperty('getLayer');
            expectTypeOf<IRenderer>().toHaveProperty('getLayers');
            expectTypeOf<IRenderer>().toHaveProperty('removeLayer');
        });

        it('should have readonly capabilities', () => {
            expectTypeOf<IRenderer['capabilities']>()
                .toMatchTypeOf<RendererCapabilities>();
        });

        it('should have readonly isInitialized', () => {
            expectTypeOf<IRenderer['isInitialized']>().toBeBoolean();
        });
    });

    describe('RendererCapabilities', () => {
        it('should have all required properties', () => {
            const caps: RendererCapabilities = {
                maxElements: 1000,
                supportsAnimation: true,
                supportsInteractivity: true,
                supportsFilters: false,
                performance: 'medium',
            };
            expectTypeOf(caps).toMatchTypeOf<RendererCapabilities>();
        });

        it('should only accept valid performance values', () => {
            // @ts-expect-error - invalid performance value
            const invalid: RendererCapabilities['performance'] = 'ultra';
        });
    });

    describe('RenderConfig', () => {
        it('should accept empty config (all optional)', () => {
            const config: RenderConfig = {};
            expectTypeOf(config).toMatchTypeOf<RenderConfig>();
        });

        it('should accept full config', () => {
            const config: RenderConfig = {
                width: 800,
                height: 600,
                responsive: true,
                pitchDimensions: { width: 105, height: 68 },
                orientation: 'horizontal',
                padding: { top: 10, right: 10, bottom: 10, left: 10 },
                theme: 'dark',
                backgroundColor: '#1a1a1a',
                pixelRatio: 2,
            };
            expectTypeOf(config).toMatchTypeOf<RenderConfig>();
        });
    });

    describe('Theme', () => {
        it('should only accept valid themes', () => {
            const themes: Theme[] = ['light', 'dark', 'custom'];
            expectTypeOf(themes).toMatchTypeOf<Theme[]>();

            // @ts-expect-error - invalid theme
            const invalid: Theme = 'blue';
        });
    });

    describe('Layer', () => {
        it('should have required properties', () => {
            expectTypeOf<Layer>().toHaveProperty('id');
            expectTypeOf<Layer>().toHaveProperty('zIndex');
            expectTypeOf<Layer>().toHaveProperty('visible');
            expectTypeOf<Layer>().toHaveProperty('opacity');
        });

        it('should have control methods', () => {
            expectTypeOf<Layer>().toHaveProperty('show');
            expectTypeOf<Layer>().toHaveProperty('hide');
            expectTypeOf<Layer>().toHaveProperty('setOpacity');
            expectTypeOf<Layer>().toHaveProperty('clear');
        });
    });

    describe('NormalizedData', () => {
        it('should accept events array', () => {
            const data: NormalizedData = {
                events: [{
                    id: '1',
                    type: 'shot',
                    position: { x: 50, y: 50 },
                    team: { id: 1 },
                }],
            };
            expectTypeOf(data).toMatchTypeOf<NormalizedData>();
        });

        it('should have readonly arrays', () => {
            const data: NormalizedData = { events: [] };
            // @ts-expect-error - readonly array
            data.events?.push({ id: '1', type: 'shot', position: { x: 0, y: 0 }, team: { id: 1 } });
        });
    });
});
