import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RenderEngine, RendererNotSupportedError } from '../RenderEngine';
import { SVGRenderer } from '../../renderer/SVGRenderer';
import * as capabilities from '../capabilities';

describe('RenderEngine', () => {
    // Guardamos las implementaciones originales
    const originalIsWebGLSupported = capabilities.isWebGLSupported;
    const originalIsCanvasSupported = capabilities.isCanvasSupported;
    const originalIsSVGSupported = capabilities.isSVGSupported;

    afterEach(() => {
        // Restaurar mocks después de cada test
        vi.restoreAllMocks();
    });

    describe('renderer selection', () => {
        it('should create SVGRenderer when svg is specified', () => {
            const engine = new RenderEngine('svg');

            expect(engine.rendererType).toBe('svg');
            expect(engine.renderer).toBeInstanceOf(SVGRenderer);
        });

        it('should create SVGRenderer as fallback when WebGL unavailable', () => {
            // Mock WebGL como no disponible
            vi.spyOn(capabilities, 'isWebGLSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isCanvasSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            const engine = new RenderEngine('webgl');

            expect(engine.rendererType).toBe('svg');
            expect(engine.info.fallbackUsed).toBe(true);
        });

        it('should select SVG in auto mode (WebGL/Canvas not implemented yet)', () => {
            // En el estado actual, auto siempre devuelve SVG porque
            // WebGLRenderer y CanvasRenderer no están implementados
            vi.spyOn(capabilities, 'isWebGLSupported').mockReturnValue(true);
            vi.spyOn(capabilities, 'isCanvasSupported').mockReturnValue(true);
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            const engine = new RenderEngine('auto');

            // Por ahora siempre SVG hasta que se implementen los otros renderers
            expect(engine.rendererType).toBe('svg');
        });

        it('should fallback to SVG in auto mode when WebGL unavailable', () => {
            vi.spyOn(capabilities, 'isWebGLSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isCanvasSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            const engine = new RenderEngine('auto');

            expect(engine.rendererType).toBe('svg');
        });

        it('should use default preference of auto when not specified', () => {
            const engine = new RenderEngine();

            expect(engine.info.requestedType).toBe('auto');
            expect(engine.renderer).toBeDefined();
        });
    });

    describe('capability detection', () => {
        it('should detect WebGL support correctly', () => {
            // Crear un canvas y comprobar WebGL
            const canvas = document.createElement('canvas');
            const hasWebGL = !!(
                canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl')
            );

            const engine = new RenderEngine('auto');
            expect(engine.isWebGLSupported()).toBe(hasWebGL);
        });

        it('should detect Canvas support correctly', () => {
            const canvas = document.createElement('canvas');
            const hasCanvas = !!canvas.getContext('2d');

            const engine = new RenderEngine('auto');
            expect(engine.isCanvasSupported()).toBe(hasCanvas);
        });

        it('should detect SVG support correctly', () => {
            const hasSVG = typeof document.createElementNS === 'function' &&
                typeof SVGElement !== 'undefined';

            const engine = new RenderEngine('auto');
            expect(engine.isSVGSupported()).toBe(hasSVG);
        });

        it('should expose capability detection methods', () => {
            const engine = new RenderEngine('svg');

            expect(typeof engine.isWebGLSupported).toBe('function');
            expect(typeof engine.isCanvasSupported).toBe('function');
            expect(typeof engine.isSVGSupported).toBe('function');
        });
    });

    describe('force mode', () => {
        it('should throw RendererNotSupportedError when forcing unavailable WebGL renderer', () => {
            vi.spyOn(capabilities, 'isWebGLSupported').mockReturnValue(false);

            expect(() => new RenderEngine('webgl', { force: true }))
                .toThrow(RendererNotSupportedError);
            expect(() => new RenderEngine('webgl', { force: true }))
                .toThrow('WEBGL is not supported');
        });

        it('should throw RendererNotSupportedError when forcing unavailable Canvas renderer', () => {
            vi.spyOn(capabilities, 'isCanvasSupported').mockReturnValue(false);

            expect(() => new RenderEngine('canvas', { force: true }))
                .toThrow(RendererNotSupportedError);
            expect(() => new RenderEngine('canvas', { force: true }))
                .toThrow('CANVAS is not supported');
        });

        it('should not throw when forcing available SVG renderer', () => {
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            expect(() => new RenderEngine('svg', { force: true })).not.toThrow();
        });

        it('should use fallback when force is not enabled', () => {
            vi.spyOn(capabilities, 'isWebGLSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isCanvasSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            // Sin force, debe usar fallback
            const engine = new RenderEngine('webgl', { force: false });

            expect(engine.rendererType).toBe('svg');
            expect(engine.info.fallbackUsed).toBe(true);
        });
    });

    describe('renderer info', () => {
        it('should expose renderer capabilities', () => {
            const engine = new RenderEngine('svg');

            expect(engine.info).toEqual({
                type: 'svg',
                capabilities: expect.objectContaining({
                    maxElements: expect.any(Number),
                    supportsAnimation: expect.any(Boolean),
                    supportsInteractivity: expect.any(Boolean),
                    supportsFilters: expect.any(Boolean),
                    performance: expect.any(String)
                }),
                fallbackUsed: false,
                requestedType: 'svg'
            });
        });

        it('should indicate when fallback was used', () => {
            vi.spyOn(capabilities, 'isWebGLSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isCanvasSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            const engine = new RenderEngine('webgl');

            expect(engine.info.fallbackUsed).toBe(true);
            expect(engine.info.requestedType).toBe('webgl');
            expect(engine.info.type).toBe('svg');
        });

        it('should not indicate fallback when requested renderer is available', () => {
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            const engine = new RenderEngine('svg');

            expect(engine.info.fallbackUsed).toBe(false);
            expect(engine.info.requestedType).toBe('svg');
            expect(engine.info.type).toBe('svg');
        });

        it('should include SVGRenderer capabilities', () => {
            const engine = new RenderEngine('svg');

            expect(engine.info.capabilities).toEqual({
                maxElements: 1000,
                supportsAnimation: true,
                supportsInteractivity: true,
                supportsFilters: true,
                performance: 'medium'
            });
        });
    });

    describe('fallback chain', () => {
        it('should fallback from WebGL to Canvas to SVG', () => {
            vi.spyOn(capabilities, 'isWebGLSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isCanvasSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            const engine = new RenderEngine('webgl');

            expect(engine.rendererType).toBe('svg');
            expect(engine.info.fallbackUsed).toBe(true);
        });

        it('should fallback from Canvas to SVG', () => {
            vi.spyOn(capabilities, 'isCanvasSupported').mockReturnValue(false);
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            const engine = new RenderEngine('canvas');

            expect(engine.rendererType).toBe('svg');
            expect(engine.info.fallbackUsed).toBe(true);
        });

        it('should use SVG directly when SVG is requested', () => {
            vi.spyOn(capabilities, 'isSVGSupported').mockReturnValue(true);

            const engine = new RenderEngine('svg');

            expect(engine.rendererType).toBe('svg');
            expect(engine.info.fallbackUsed).toBe(false);
        });
    });

    describe('renderer instance', () => {
        it('should provide access to the underlying renderer', () => {
            const engine = new RenderEngine('svg');

            expect(engine.renderer).toBeDefined();
            expect(engine.renderer).toBeInstanceOf(SVGRenderer);
        });

        it('should provide a functional renderer instance', () => {
            const engine = new RenderEngine('svg');
            const container = document.createElement('div');
            document.body.appendChild(container);

            // El renderer debe ser funcional
            expect(() => {
                engine.renderer.init(container, { width: 100, height: 100 });
            }).not.toThrow();

            expect(engine.renderer.isInitialized).toBe(true);

            // Cleanup
            engine.renderer.destroy();
            document.body.removeChild(container);
        });
    });

    describe('RendererNotSupportedError', () => {
        it('should have correct name property', () => {
            const error = new RendererNotSupportedError('webgl');

            expect(error.name).toBe('RendererNotSupportedError');
        });

        it('should have correct message format', () => {
            const error = new RendererNotSupportedError('canvas');

            expect(error.message).toBe('CANVAS is not supported');
        });

        it('should be instance of Error', () => {
            const error = new RendererNotSupportedError('svg');

            expect(error).toBeInstanceOf(Error);
        });
    });
});

describe('capabilities module', () => {
    describe('detectWebGL', () => {
        it('should return capability object', () => {
            const result = capabilities.detectWebGL();

            expect(result).toHaveProperty('supported');
            expect(result).toHaveProperty('version');
            expect(result).toHaveProperty('renderer');
            expect(result).toHaveProperty('vendor');
            expect(result).toHaveProperty('maxTextureSize');
        });
    });

    describe('detectCanvas', () => {
        it('should return capability object', () => {
            const result = capabilities.detectCanvas();

            expect(result).toHaveProperty('supported');
            expect(result).toHaveProperty('supportsHardwareAcceleration');
        });

        it('should detect Canvas 2D support in jsdom', () => {
            const result = capabilities.detectCanvas();

            // jsdom tiene soporte básico de Canvas
            expect(typeof result.supported).toBe('boolean');
        });
    });

    describe('detectSVG', () => {
        it('should return capability object', () => {
            const result = capabilities.detectSVG();

            expect(result).toHaveProperty('supported');
            expect(result).toHaveProperty('supportsFilters');
            expect(result).toHaveProperty('supportsTransforms');
        });

        it('should detect SVG support in jsdom', () => {
            const result = capabilities.detectSVG();

            // jsdom soporta SVG
            expect(result.supported).toBe(true);
        });
    });

    describe('detectAllCapabilities', () => {
        it('should return complete browser capabilities', () => {
            const result = capabilities.detectAllCapabilities();

            expect(result).toHaveProperty('webgl');
            expect(result).toHaveProperty('canvas');
            expect(result).toHaveProperty('svg');
        });

        it('should include all sub-capabilities', () => {
            const result = capabilities.detectAllCapabilities();

            expect(result.webgl).toHaveProperty('supported');
            expect(result.canvas).toHaveProperty('supported');
            expect(result.svg).toHaveProperty('supported');
        });
    });

    describe('isWebGLSupported', () => {
        it('should return boolean', () => {
            const result = capabilities.isWebGLSupported();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('isCanvasSupported', () => {
        it('should return boolean', () => {
            const result = capabilities.isCanvasSupported();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('isSVGSupported', () => {
        it('should return boolean', () => {
            const result = capabilities.isSVGSupported();
            expect(typeof result).toBe('boolean');
        });

        it('should return true in jsdom environment', () => {
            const result = capabilities.isSVGSupported();
            expect(result).toBe(true);
        });
    });
});
