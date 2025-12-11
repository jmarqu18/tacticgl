import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SVGRenderer } from '../SVGRenderer';
import type { NormalizedData } from '../../types/data.types';

describe('SVGRenderer', () => {
    let container: HTMLElement;
    let renderer: SVGRenderer;

    beforeEach(() => {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        renderer = new SVGRenderer();
    });

    afterEach(() => {
        renderer.destroy();
        if (container.parentNode) {
            document.body.removeChild(container);
        }
    });

    describe('initialization', () => {
        it('should create SVG element inside container', () => {
            renderer.init(container, { width: 105, height: 68 });

            const svg = container.querySelector('svg');
            expect(svg).not.toBeNull();
        });

        it('should set viewBox based on config dimensions', () => {
            renderer.init(container, { width: 105, height: 68 });

            const svg = container.querySelector('svg');
            expect(svg?.getAttribute('viewBox')).toBe('0 0 105 68');
        });

        it('should set preserveAspectRatio to xMidYMid meet', () => {
            renderer.init(container, { width: 105, height: 68 });

            const svg = container.querySelector('svg');
            expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
        });

        it('should make SVG responsive by default', () => {
            renderer.init(container, { width: 105, height: 68, responsive: true });

            const svg = container.querySelector('svg');
            expect(svg?.style.width).toBe('100%');
            expect(svg?.style.height).toBe('100%');
        });

        it('should use fixed dimensions when responsive is false', () => {
            renderer.init(container, { width: 105, height: 68, responsive: false });

            const svg = container.querySelector('svg');
            expect(svg?.style.width).toBe('105px');
            expect(svg?.style.height).toBe('68px');
        });

        it('should use default dimensions when not specified', () => {
            renderer.init(container, {});

            const svg = container.querySelector('svg');
            expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
        });

        it('should set isInitialized to true after init', () => {
            renderer.init(container, { width: 105, height: 68 });
            expect(renderer.isInitialized).toBe(true);
        });

        it('should emit init event', () => {
            const handler = vi.fn();
            renderer.on('init', handler);

            renderer.init(container, { width: 105, height: 68 });

            expect(handler).toHaveBeenCalledWith({
                container,
                config: { width: 105, height: 68 }
            });
        });
    });

    describe('capabilities', () => {
        it('should report correct capabilities', () => {
            expect(renderer.capabilities).toEqual({
                maxElements: 1000,
                supportsAnimation: true,
                supportsInteractivity: true,
                supportsFilters: true,
                performance: 'medium'
            });
        });
    });

    describe('layer management', () => {
        beforeEach(() => {
            renderer.init(container, { width: 100, height: 100 });
        });

        it('should create <g> element for each layer', () => {
            renderer.addLayer('pitch', 0);
            renderer.addLayer('shots', 10);

            const groups = container.querySelectorAll('svg > g');
            expect(groups).toHaveLength(2);
        });

        it('should set data-layer attribute on group', () => {
            renderer.addLayer('pitch', 0);

            const group = container.querySelector('g[data-layer="pitch"]');
            expect(group).not.toBeNull();
        });

        it('should order groups by zIndex in DOM', () => {
            renderer.addLayer('top', 100);
            renderer.addLayer('bottom', 1);

            const groups = container.querySelectorAll('svg > g');
            expect(groups[0].getAttribute('data-layer')).toBe('bottom');
            expect(groups[1].getAttribute('data-layer')).toBe('top');
        });

        it('should return layer when calling getLayer', () => {
            renderer.addLayer('test', 5);

            const layer = renderer.getLayer('test');
            expect(layer).not.toBeNull();
            expect(layer?.id).toBe('test');
            expect(layer?.zIndex).toBe(5);
        });

        it('should return null for non-existing layer', () => {
            const layer = renderer.getLayer('non-existing');
            expect(layer).toBeNull();
        });

        it('should return all layers sorted by zIndex', () => {
            renderer.addLayer('middle', 50);
            renderer.addLayer('top', 100);
            renderer.addLayer('bottom', 1);

            const layers = renderer.getLayers();
            expect(layers).toHaveLength(3);
            expect(layers[0].id).toBe('bottom');
            expect(layers[1].id).toBe('middle');
            expect(layers[2].id).toBe('top');
        });

        it('should remove layer from DOM when removeLayer is called', () => {
            renderer.addLayer('test', 1);
            expect(container.querySelector('g[data-layer="test"]')).not.toBeNull();

            renderer.removeLayer('test');
            expect(container.querySelector('g[data-layer="test"]')).toBeNull();
        });

        it('should emit layerAdded event', () => {
            const handler = vi.fn();
            renderer.on('layerAdded', handler);

            renderer.addLayer('test', 1);

            expect(handler).toHaveBeenCalled();
            expect(handler.mock.calls[0][0].layer.id).toBe('test');
        });

        it('should emit layerRemoved event', () => {
            renderer.addLayer('test', 1);
            const handler = vi.fn();
            renderer.on('layerRemoved', handler);

            renderer.removeLayer('test');

            expect(handler).toHaveBeenCalledWith({ layerId: 'test' });
        });

        it('should throw error when adding layer before init', () => {
            const uninitializedRenderer = new SVGRenderer();

            expect(() => {
                uninitializedRenderer.addLayer('test', 1);
            }).toThrow('Renderer must be initialized before adding layers');
        });
    });

    describe('render()', () => {
        beforeEach(() => {
            renderer.init(container, { width: 100, height: 100 });
        });

        it('should render circle element to specified layer', () => {
            renderer.addLayer('points', 1);
            const data: NormalizedData = {
                elements: [
                    { type: 'circle', x: 50, y: 50, attributes: { r: 5 } }
                ]
            };

            renderer.render(data, { layer: 'points' });

            const circle = container.querySelector('circle');
            expect(circle).not.toBeNull();
            expect(circle?.getAttribute('cx')).toBe('50');
            expect(circle?.getAttribute('cy')).toBe('50');
            expect(circle?.getAttribute('r')).toBe('5');
        });

        it('should render rect element', () => {
            renderer.addLayer('rects', 1);
            const data: NormalizedData = {
                elements: [
                    { type: 'rect', x: 10, y: 20, attributes: { width: 30, height: 40 } }
                ]
            };

            renderer.render(data, { layer: 'rects' });

            const rect = container.querySelector('rect');
            expect(rect).not.toBeNull();
            expect(rect?.getAttribute('x')).toBe('10');
            expect(rect?.getAttribute('y')).toBe('20');
            expect(rect?.getAttribute('width')).toBe('30');
            expect(rect?.getAttribute('height')).toBe('40');
        });

        it('should render line element', () => {
            renderer.addLayer('lines', 1);
            const data: NormalizedData = {
                elements: [
                    { type: 'line', x: 0, y: 0, attributes: { x2: 100, y2: 100 } }
                ]
            };

            renderer.render(data, { layer: 'lines' });

            const line = container.querySelector('line');
            expect(line).not.toBeNull();
            expect(line?.getAttribute('x1')).toBe('0');
            expect(line?.getAttribute('y1')).toBe('0');
            expect(line?.getAttribute('x2')).toBe('100');
            expect(line?.getAttribute('y2')).toBe('100');
        });

        it('should render path element', () => {
            renderer.addLayer('paths', 1);
            const data: NormalizedData = {
                elements: [
                    { type: 'path', attributes: { d: 'M 0 0 L 100 100' } }
                ]
            };

            renderer.render(data, { layer: 'paths' });

            const path = container.querySelector('path');
            expect(path).not.toBeNull();
            expect(path?.getAttribute('d')).toBe('M 0 0 L 100 100');
        });

        it('should render text element', () => {
            renderer.addLayer('labels', 1);
            const data: NormalizedData = {
                elements: [
                    { type: 'text', x: 50, y: 50, attributes: { fill: 'red' } }
                ]
            };

            renderer.render(data, { layer: 'labels' });

            const text = container.querySelector('text');
            expect(text).not.toBeNull();
            expect(text?.getAttribute('x')).toBe('50');
            expect(text?.getAttribute('y')).toBe('50');
            expect(text?.getAttribute('fill')).toBe('red');
        });

        it('should render group with children', () => {
            renderer.addLayer('groups', 1);
            const data: NormalizedData = {
                elements: [
                    {
                        type: 'group',
                        children: [
                            { type: 'circle', x: 10, y: 10, attributes: { r: 2 } },
                            { type: 'circle', x: 20, y: 20, attributes: { r: 2 } }
                        ]
                    }
                ]
            };

            renderer.render(data, { layer: 'groups' });

            const group = container.querySelector('g[data-layer="groups"] > g');
            expect(group).not.toBeNull();
            expect(group?.querySelectorAll('circle')).toHaveLength(2);
        });

        it('should render to SVG root when no layer specified', () => {
            const data: NormalizedData = {
                elements: [
                    { type: 'circle', x: 50, y: 50, attributes: { r: 5 } }
                ]
            };

            renderer.render(data);

            const circle = container.querySelector('svg > circle');
            expect(circle).not.toBeNull();
        });

        it('should clear layer before rendering when clear option is true', () => {
            renderer.addLayer('test', 1);
            renderer.render({
                elements: [{ type: 'circle', x: 10, y: 10, attributes: { r: 5 } }]
            }, { layer: 'test' });

            expect(container.querySelectorAll('circle')).toHaveLength(1);

            renderer.render({
                elements: [{ type: 'circle', x: 20, y: 20, attributes: { r: 5 } }]
            }, { layer: 'test', clear: true });

            expect(container.querySelectorAll('circle')).toHaveLength(1);
        });

        it('should emit render event with duration', () => {
            const handler = vi.fn();
            renderer.on('render', handler);
            renderer.addLayer('test', 1);

            const data: NormalizedData = {
                elements: [{ type: 'circle', x: 50, y: 50, attributes: { r: 5 } }]
            };

            renderer.render(data, { layer: 'test' });

            expect(handler).toHaveBeenCalled();
            expect(handler.mock.calls[0][0].data).toEqual(data);
            expect(typeof handler.mock.calls[0][0].duration).toBe('number');
        });

        it('should throw error when rendering before initialization', () => {
            const uninitializedRenderer = new SVGRenderer();

            expect(() => {
                uninitializedRenderer.render({ elements: [] });
            }).toThrow('Renderer must be initialized before rendering');
        });
    });

    describe('update()', () => {
        beforeEach(() => {
            renderer.init(container, { width: 100, height: 100 });
        });

        it('should emit update event', () => {
            const handler = vi.fn();
            renderer.on('update', handler);

            const data = { elements: [] };
            renderer.update(data);

            expect(handler).toHaveBeenCalledWith({ data });
        });

        it('should update element with transition when found by id', () => {
            renderer.addLayer('test', 1);
            renderer.render({
                elements: [{ type: 'circle', x: 50, y: 50, attributes: { id: 'my-circle', r: 5 } }]
            }, { layer: 'test' });

            renderer.update({
                elements: [{ type: 'circle', x: 60, y: 60, attributes: { id: 'my-circle', r: 10 } }]
            }, { duration: 500, easing: 'ease-out' });

            const circle = container.querySelector('#my-circle');
            expect(circle).not.toBeNull();
            expect(circle?.getAttribute('cx')).toBe('60');
            expect(circle?.getAttribute('cy')).toBe('60');
        });

        it('should apply CSS transition when transition config is provided', () => {
            renderer.addLayer('test', 1);
            renderer.render({
                elements: [{ type: 'circle', x: 50, y: 50, attributes: { id: 'animated', r: 5 } }]
            }, { layer: 'test' });

            renderer.update({
                elements: [{ type: 'circle', x: 100, y: 100, attributes: { id: 'animated' } }]
            }, { duration: 300, easing: 'ease-in-out' });

            const circle = container.querySelector('#animated') as SVGElement;
            expect(circle?.style.transition).toContain('300ms');
        });

        it('should throw error when updating before initialization', () => {
            const uninitializedRenderer = new SVGRenderer();

            expect(() => {
                uninitializedRenderer.update({ elements: [] });
            }).toThrow('Renderer must be initialized before updating');
        });
    });

    describe('clear()', () => {
        beforeEach(() => {
            renderer.init(container, { width: 100, height: 100 });
        });

        it('should remove all rendered content', () => {
            renderer.addLayer('test', 1);
            renderer.render({
                elements: [{ type: 'circle', x: 50, y: 50, attributes: { r: 5 } }]
            }, { layer: 'test' });

            renderer.clear();

            const circles = container.querySelectorAll('circle');
            expect(circles).toHaveLength(0);
        });

        it('should preserve layer structure', () => {
            renderer.addLayer('test', 1);
            renderer.clear();

            expect(renderer.getLayer('test')).not.toBeNull();
        });

        it('should emit clear event', () => {
            const handler = vi.fn();
            renderer.on('clear', handler);

            renderer.clear();

            expect(handler).toHaveBeenCalled();
        });
    });

    describe('destroy()', () => {
        it('should remove SVG element from DOM', () => {
            renderer.init(container, { width: 100, height: 100 });
            renderer.destroy();

            expect(container.querySelector('svg')).toBeNull();
        });

        it('should emit destroy event', () => {
            renderer.init(container, { width: 100, height: 100 });
            const handler = vi.fn();
            renderer.on('destroy', handler);

            renderer.destroy();

            expect(handler).toHaveBeenCalled();
        });

        it('should clear all layers', () => {
            renderer.init(container, { width: 100, height: 100 });
            renderer.addLayer('test', 1);

            renderer.destroy();

            // After destroy, getLayers should not return the old layer
            expect(renderer.getLayers()).toHaveLength(0);
        });

        it('should set isInitialized to false', () => {
            renderer.init(container, { width: 100, height: 100 });
            renderer.destroy();

            expect(renderer.isInitialized).toBe(false);
        });
    });

    describe('getSVGElement()', () => {
        it('should return SVG element after initialization', () => {
            renderer.init(container, { width: 100, height: 100 });

            const svg = renderer.getSVGElement();
            expect(svg).not.toBeNull();
            expect(svg?.tagName.toLowerCase()).toBe('svg');
        });

        it('should return null before initialization', () => {
            const svg = renderer.getSVGElement();
            expect(svg).toBeNull();
        });
    });

    describe('layer visibility', () => {
        beforeEach(() => {
            renderer.init(container, { width: 100, height: 100 });
        });

        it('should hide layer when hide() is called', () => {
            const layer = renderer.addLayer('test', 1);

            layer.hide();

            const group = container.querySelector('g[data-layer="test"]') as HTMLElement;
            expect(group.style.display).toBe('none');
            expect(layer.visible).toBe(false);
        });

        it('should show layer when show() is called', () => {
            const layer = renderer.addLayer('test', 1);
            layer.hide();

            layer.show();

            const group = container.querySelector('g[data-layer="test"]') as HTMLElement;
            expect(group.style.display).toBe('');
            expect(layer.visible).toBe(true);
        });

        it('should set opacity when setOpacity() is called', () => {
            const layer = renderer.addLayer('test', 1);

            layer.setOpacity(0.5);

            const group = container.querySelector('g[data-layer="test"]') as HTMLElement;
            expect(group.style.opacity).toBe('0.5');
            expect(layer.opacity).toBe(0.5);
        });

        it('should clamp opacity to 0-1 range', () => {
            const layer = renderer.addLayer('test', 1);

            layer.setOpacity(1.5);
            expect(layer.opacity).toBe(1);

            layer.setOpacity(-0.5);
            expect(layer.opacity).toBe(0);
        });
    });

    describe('edge cases', () => {
        beforeEach(() => {
            renderer.init(container, { width: 100, height: 100 });
        });

        it('should do nothing when removing non-existing layer', () => {
            // Should not throw
            renderer.removeLayer('non-existing');
        });

        it('should handle update with element without ID (no match found)', () => {
            renderer.addLayer('test', 1);
            renderer.render({
                elements: [{ type: 'circle', x: 50, y: 50, attributes: { r: 5 } }]
            }, { layer: 'test' });

            // Update with no ID should not throw, just won't find the element
            renderer.update({
                elements: [{ type: 'circle', x: 100, y: 100, attributes: { r: 10 } }]
            }, { duration: 300 });

            // Original circle should be unchanged
            const circle = container.querySelector('circle');
            expect(circle?.getAttribute('cx')).toBe('50');
        });

        it('should handle update with transition but no elements', () => {
            // Should not throw
            renderer.update({}, { duration: 300 });
        });

        it('should handle render with empty elements array', () => {
            renderer.addLayer('test', 1);
            renderer.render({ elements: [] }, { layer: 'test' });

            expect(container.querySelectorAll('circle')).toHaveLength(0);
        });

        it('should handle render without elements property', () => {
            renderer.addLayer('test', 1);
            renderer.render({}, { layer: 'test' });

            expect(container.querySelectorAll('*')).toBeDefined();
        });
    });
});

