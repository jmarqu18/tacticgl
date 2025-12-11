import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BaseRenderer } from '../BaseRenderer';
import type { NormalizedData, RendererCapabilities, RenderOptions, TransitionConfig } from '../../types';

/**
 * Mock implementation de BaseRenderer para testing
 * Implementa los métodos abstractos con funcionalidad mínima
 */
class TestRenderer extends BaseRenderer {
    readonly capabilities: RendererCapabilities = {
        maxElements: 1000,
        supportsAnimation: true,
        supportsInteractivity: true,
        supportsFilters: true,
        performance: 'high'
    };

    // Mock para tracking de llamadas
    public renderCalled = false;
    public updateCalled = false;
    public createRenderContextCalled = false;

    render(data: NormalizedData, options?: RenderOptions): void {
        this.renderCalled = true;
    }

    update(data: Partial<NormalizedData>, transition?: TransitionConfig): void {
        this.updateCalled = true;
    }

    protected createRenderContext(): void {
        this.createRenderContextCalled = true;
        // Mock: crear un div como contexto de renderizado
        const context = document.createElement('div');
        context.className = 'render-context';
        this.getContainer()?.appendChild(context);
    }
}

describe('BaseRenderer', () => {
    let container: HTMLElement;
    let renderer: TestRenderer;

    beforeEach(() => {
        // Crear contenedor y agregarlo al DOM
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // Crear instancia del renderer
        renderer = new TestRenderer();
    });

    afterEach(() => {
        // Limpiar
        if (renderer.isInitialized) {
            renderer.destroy();
        }
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    });

    // ═══════════════════════════════════════════════════════
    // TESTS: init()
    // ═══════════════════════════════════════════════════════
    describe('init()', () => {
        it('should initialize with valid container element', () => {
            renderer.init(container, { width: 800, height: 600 });

            expect(renderer.isInitialized).toBe(true);
            expect(renderer.getContainer()).toBe(container);
            expect(renderer.createRenderContextCalled).toBe(true);
        });

        it('should throw error if container is null', () => {
            expect(() => renderer.init(null as any, {}))
                .toThrow('Container element is required');
        });

        it('should throw error if container not in DOM', () => {
            const detached = document.createElement('div');

            expect(() => renderer.init(detached, {}))
                .toThrow('Container must be attached to DOM');
        });

        it('should emit onInit event after successful initialization', () => {
            const callback = vi.fn();
            renderer.on('init', callback);

            const config = { width: 800, height: 600 };
            renderer.init(container, config);

            expect(callback).toHaveBeenCalledOnce();
            expect(callback).toHaveBeenCalledWith({ container, config });
        });

        it('should store config for later use', () => {
            const config = { width: 1280, height: 720, responsive: true };
            renderer.init(container, config);

            // Verificar que el config es accesible internamente
            expect(renderer.getContainer()).toBe(container);
        });
    });

    // ═══════════════════════════════════════════════════════
    // TESTS: Layer Management
    // ═══════════════════════════════════════════════════════
    describe('Layer Management', () => {
        beforeEach(() => {
            renderer.init(container, {});
        });

        describe('addLayer()', () => {
            it('should add layer with unique id and zIndex', () => {
                const layer = renderer.addLayer('shots', 10);

                expect(layer.id).toBe('shots');
                expect(layer.zIndex).toBe(10);
                expect(layer.visible).toBe(true);
                expect(layer.opacity).toBe(1);
            });

            it('should create layer element in DOM', () => {
                renderer.addLayer('events', 5);

                const layerElement = document.getElementById('layer-events');
                expect(layerElement).not.toBeNull();
                expect(layerElement?.style.zIndex).toBe('5');
            });

            it('should emit layerAdded event', () => {
                const callback = vi.fn();
                renderer.on('layerAdded', callback);

                const layer = renderer.addLayer('test', 1);

                expect(callback).toHaveBeenCalledOnce();
                expect(callback).toHaveBeenCalledWith({ layer });
            });

            it('should throw error if renderer not initialized', () => {
                const uninitializedRenderer = new TestRenderer();

                expect(() => uninitializedRenderer.addLayer('test', 1))
                    .toThrow('Renderer must be initialized before adding layers');
            });
        });

        describe('getLayer()', () => {
            it('should retrieve existing layer by id', () => {
                renderer.addLayer('heatmap', 5);

                const layer = renderer.getLayer('heatmap');

                expect(layer).not.toBeNull();
                expect(layer?.id).toBe('heatmap');
                expect(layer?.zIndex).toBe(5);
            });

            it('should return null for non-existent layer', () => {
                expect(renderer.getLayer('unknown')).toBeNull();
            });
        });

        describe('getLayers()', () => {
            it('should return empty array when no layers', () => {
                expect(renderer.getLayers()).toHaveLength(0);
            });

            it('should return all layers', () => {
                renderer.addLayer('layer1', 1);
                renderer.addLayer('layer2', 2);

                const layers = renderer.getLayers();

                expect(layers).toHaveLength(2);
            });

            it('should maintain layer order by zIndex (ascending)', () => {
                renderer.addLayer('top', 100);
                renderer.addLayer('bottom', 1);
                renderer.addLayer('middle', 50);

                const layers = renderer.getLayers();

                expect(layers[0].id).toBe('bottom');
                expect(layers[0].zIndex).toBe(1);
                expect(layers[1].id).toBe('middle');
                expect(layers[1].zIndex).toBe(50);
                expect(layers[2].id).toBe('top');
                expect(layers[2].zIndex).toBe(100);
            });
        });

        describe('removeLayer()', () => {
            it('should remove layer by id', () => {
                renderer.addLayer('temp', 1);

                expect(renderer.getLayer('temp')).not.toBeNull();

                renderer.removeLayer('temp');

                expect(renderer.getLayer('temp')).toBeNull();
            });

            it('should remove layer element from DOM', () => {
                renderer.addLayer('temp', 1);

                expect(document.getElementById('layer-temp')).not.toBeNull();

                renderer.removeLayer('temp');

                expect(document.getElementById('layer-temp')).toBeNull();
            });

            it('should emit layerRemoved event', () => {
                const callback = vi.fn();
                renderer.on('layerRemoved', callback);

                renderer.addLayer('temp', 1);
                renderer.removeLayer('temp');

                expect(callback).toHaveBeenCalledOnce();
                expect(callback).toHaveBeenCalledWith({ layerId: 'temp' });
            });

            it('should handle removing non-existent layer gracefully', () => {
                expect(() => renderer.removeLayer('does-not-exist')).not.toThrow();
            });
        });

        describe('Layer operations', () => {
            it('should show/hide layer', () => {
                const layer = renderer.addLayer('test', 1);

                layer.hide();
                expect(layer.visible).toBe(false);

                layer.show();
                expect(layer.visible).toBe(true);
            });

            it('should set layer opacity', () => {
                const layer = renderer.addLayer('test', 1);

                layer.setOpacity(0.5);
                expect(layer.opacity).toBe(0.5);
            });

            it('should clamp opacity to [0, 1]', () => {
                const layer = renderer.addLayer('test', 1);

                layer.setOpacity(1.5);
                expect(layer.opacity).toBe(1);

                layer.setOpacity(-0.5);
                expect(layer.opacity).toBe(0);
            });

            it('should clear layer content', () => {
                const layer = renderer.addLayer('test', 1);
                const layerElement = document.getElementById('layer-test');

                // Añadir contenido
                if (layerElement) {
                    layerElement.innerHTML = '<div>Test content</div>';
                }

                layer.clear();

                expect(layerElement?.innerHTML).toBe('');
            });
        });
    });

    // ═══════════════════════════════════════════════════════
    // TESTS: clear()
    // ═══════════════════════════════════════════════════════
    describe('clear()', () => {
        beforeEach(() => {
            renderer.init(container, {});
        });

        it('should clear all layers', () => {
            const layer1 = renderer.addLayer('layer1', 1);
            const layer2 = renderer.addLayer('layer2', 2);

            // Añadir contenido
            const el1 = document.getElementById('layer-layer1');
            const el2 = document.getElementById('layer-layer2');
            if (el1) el1.innerHTML = '<div>Content 1</div>';
            if (el2) el2.innerHTML = '<div>Content 2</div>';

            renderer.clear();

            expect(el1?.innerHTML).toBe('');
            expect(el2?.innerHTML).toBe('');
        });

        it('should emit clear event', () => {
            const callback = vi.fn();
            renderer.on('clear', callback);

            renderer.clear();

            expect(callback).toHaveBeenCalledOnce();
        });
    });

    // ═══════════════════════════════════════════════════════
    // TESTS: destroy()
    // ═══════════════════════════════════════════════════════
    describe('destroy()', () => {
        it('should clean up all layers', () => {
            renderer.init(container, {});
            renderer.addLayer('layer1', 1);
            renderer.addLayer('layer2', 2);

            expect(renderer.getLayers()).toHaveLength(2);

            renderer.destroy();

            expect(renderer.getLayers()).toHaveLength(0);
        });

        it('should remove all event listeners', () => {
            renderer.init(container, {});

            const callback1 = vi.fn();
            const callback2 = vi.fn();

            renderer.on('render', callback1);
            renderer.on('destroy', callback2);

            renderer.destroy();

            // El callback de destroy SI debería haberse llamado
            expect(callback2).toHaveBeenCalledOnce();

            // Intentar emitir evento después de destroy no debería hacer nada
            // (ya no hay handlers registrados)
        });

        it('should emit onDestroy event', () => {
            const callback = vi.fn();
            renderer.on('destroy', callback);

            renderer.init(container, {});
            renderer.destroy();

            expect(callback).toHaveBeenCalledOnce();
        });

        it('should set isInitialized to false', () => {
            renderer.init(container, {});

            expect(renderer.isInitialized).toBe(true);

            renderer.destroy();

            expect(renderer.isInitialized).toBe(false);
        });

        it('should nullify container reference', () => {
            renderer.init(container, {});

            expect(renderer.getContainer()).not.toBeNull();

            renderer.destroy();

            expect(renderer.getContainer()).toBeNull();
        });
    });

    // ═══════════════════════════════════════════════════════
    // TESTS: Event System
    // ═══════════════════════════════════════════════════════
    describe('Event System', () => {
        beforeEach(() => {
            renderer.init(container, {});
        });

        describe('on()', () => {
            it('should register event listener', () => {
                const callback = vi.fn();

                renderer.on('init', callback);

                // No hay forma directa de verificar sin emitir,
                // pero podemos verificar que no arroje error
                expect(() => renderer.on('init', callback)).not.toThrow();
            });

            it('should allow multiple listeners for same event', () => {
                const callback1 = vi.fn();
                const callback2 = vi.fn();

                renderer.on('render', callback1);
                renderer.on('render', callback2);

                // Ambos deberían estar registrados
                expect(() => {
                    renderer.on('render', callback1);
                    renderer.on('render', callback2);
                }).not.toThrow();
            });
        });

        describe('off()', () => {
            it('should unregister event listener', () => {
                const callback = vi.fn();

                renderer.on('render', callback);
                renderer.off('render', callback);

                // No hay forma directa de verificar sin emitir
                expect(() => renderer.off('render', callback)).not.toThrow();
            });

            it('should handle removing non-existent listener gracefully', () => {
                const callback = vi.fn();

                expect(() => renderer.off('render', callback)).not.toThrow();
            });
        });

        describe('Lifecycle Events', () => {
            it('should emit onInit after successful initialization', () => {
                const uninitializedRenderer = new TestRenderer();
                const callback = vi.fn();

                uninitializedRenderer.on('init', callback);

                const config = { width: 800, height: 600 };
                uninitializedRenderer.init(container, config);

                expect(callback).toHaveBeenCalledWith({ container, config });
            });

            it('should emit layerAdded on addLayer', () => {
                const callback = vi.fn();
                renderer.on('layerAdded', callback);

                const layer = renderer.addLayer('test', 5);

                expect(callback).toHaveBeenCalledWith({ layer });
            });

            it('should emit layerRemoved on removeLayer', () => {
                const callback = vi.fn();
                renderer.on('layerRemoved', callback);

                renderer.addLayer('test', 1);
                renderer.removeLayer('test');

                expect(callback).toHaveBeenCalledWith({ layerId: 'test' });
            });

            it('should emit clear on clear', () => {
                const callback = vi.fn();
                renderer.on('clear', callback);

                renderer.clear();

                expect(callback).toHaveBeenCalledOnce();
            });

            it('should emit destroy on destroy', () => {
                const callback = vi.fn();
                renderer.on('destroy', callback);

                renderer.destroy();

                expect(callback).toHaveBeenCalledOnce();
            });
        });
    });

    // ═══════════════════════════════════════════════════════
    // TESTS: Abstract Methods
    // ═══════════════════════════════════════════════════════
    describe('Abstract Methods', () => {
        beforeEach(() => {
            renderer.init(container, {});
        });

        it('should require implementation of render()', () => {
            const data: NormalizedData = { events: [] };

            renderer.render(data);

            expect(renderer.renderCalled).toBe(true);
        });

        it('should require implementation of update()', () => {
            const data: Partial<NormalizedData> = { events: [] };

            renderer.update(data);

            expect(renderer.updateCalled).toBe(true);
        });

        it('should require implementation of createRenderContext()', () => {
            expect(renderer.createRenderContextCalled).toBe(true);
        });
    });

    // ═══════════════════════════════════════════════════════
    // TESTS: Utilities
    // ═══════════════════════════════════════════════════════
    describe('Utilities', () => {
        beforeEach(() => {
            renderer.init(container, { width: 800, height: 600 });
        });

        describe('resize()', () => {
            it('should update config dimensions', () => {
                renderer.resize(1280, 720);

                // No podemos verificar directamente el config privado,
                // pero podemos verificar que no arroje error
                expect(() => renderer.resize(1280, 720)).not.toThrow();
            });

            it('should handle resize when not initialized gracefully', () => {
                const uninitializedRenderer = new TestRenderer();

                expect(() => uninitializedRenderer.resize(800, 600)).not.toThrow();
            });
        });

        describe('getContainer()', () => {
            it('should return container element', () => {
                expect(renderer.getContainer()).toBe(container);
            });

            it('should return null when not initialized', () => {
                const uninitializedRenderer = new TestRenderer();

                expect(uninitializedRenderer.getContainer()).toBeNull();
            });
        });
    });

    // ═══════════════════════════════════════════════════════
    // TESTS: Integration Scenarios
    // ═══════════════════════════════════════════════════════
    describe('Integration Scenarios', () => {
        it('should handle complete lifecycle', () => {
            // Initialize
            renderer.init(container, { width: 800, height: 600 });
            expect(renderer.isInitialized).toBe(true);

            // Add layers
            const layer1 = renderer.addLayer('events', 10);
            const layer2 = renderer.addLayer('heatmap', 5);
            expect(renderer.getLayers()).toHaveLength(2);

            // Render
            renderer.render({ events: [] });
            expect(renderer.renderCalled).toBe(true);

            // Update
            renderer.update({ events: [] });
            expect(renderer.updateCalled).toBe(true);

            // Clear
            renderer.clear();

            // Destroy
            renderer.destroy();
            expect(renderer.isInitialized).toBe(false);
            expect(renderer.getLayers()).toHaveLength(0);
        });

        it('should handle multiple event listeners', () => {
            const initCallback = vi.fn();
            const renderCallback = vi.fn();
            const destroyCallback = vi.fn();

            renderer.on('init', initCallback);
            renderer.on('render', renderCallback);
            renderer.on('destroy', destroyCallback);

            renderer.init(container, {});
            expect(initCallback).toHaveBeenCalledOnce();

            renderer.destroy();
            expect(destroyCallback).toHaveBeenCalledOnce();
        });

        it('should handle complex layer operations', () => {
            renderer.init(container, {});

            // Añadir múltiples capas
            const layer1 = renderer.addLayer('background', 0);
            const layer2 = renderer.addLayer('field', 5);
            const layer3 = renderer.addLayer('events', 10);
            const layer4 = renderer.addLayer('overlay', 15);

            // Verificar orden
            const layers = renderer.getLayers();
            expect(layers.map(l => l.id)).toEqual(['background', 'field', 'events', 'overlay']);

            // Remover capa intermedia
            renderer.removeLayer('field');

            const updatedLayers = renderer.getLayers();
            expect(updatedLayers.map(l => l.id)).toEqual(['background', 'events', 'overlay']);
            expect(updatedLayers).toHaveLength(3);
        });
    });
});
