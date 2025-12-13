import { SVGRenderer, PitchScale, BaseRenderer, RenderElement } from '@tacticgl/core';
import { PitchConfig, PitchTheme, DeepPartialPitchConfig } from './types';
import { createPitchConfig } from './config';
import { PitchGeometry, GeometryObject } from './PitchGeometry';
import { LIGHT_THEME, DARK_THEME } from './constants';

export interface Visualization {
    id: string;
    render(renderer: BaseRenderer, scale: PitchScale): void;
    destroy?(): void;
}

/**
 * Componente principal para renderizar un campo de fútbol interactivo.
 * Maneja la geometría, el renderizado SVG y la orquestación de capas de visualización.
 * 
 * @example
 * ```typescript
 * const pitch = new Pitch({
 *   container: '#pitch',
 *   theme: DARK_THEME,
 *   orientation: 'vertical'
 * });
 * pitch.render();
 * ```
 */
export class Pitch {
    public config: PitchConfig;
    public scale: PitchScale;

    private renderer: SVGRenderer;
    private geometry: PitchGeometry;
    private container: HTMLElement;
    private visualizations: Map<string, Visualization> = new Map();
    private isDestroyed = false;

    constructor(config: DeepPartialPitchConfig) {
        this.container = this.resolveContainer(config.container);
        this.config = createPitchConfig({ ...config, container: this.container });

        // Initialize geometry
        this.geometry = new PitchGeometry(this.config.dimensions, this.config.orientation);

        // Initialize renderer
        this.renderer = new SVGRenderer();
        this.renderer.init(this.container, {
            width: this.config.dimensions.width,
            height: this.config.dimensions.height,
            responsive: true
        });

        // Create base layer for pitch
        this.renderer.addLayer('pitch', 0);

        // Initialize scale
        this.scale = new PitchScale({
            width: this.config.dimensions.width,
            height: this.config.dimensions.height
        });
    }

    private resolveContainer(container?: HTMLElement | string): HTMLElement {
        if (!container) throw new Error('Container is required');
        if (typeof container === 'string') {
            const element = document.querySelector(container);
            if (!element) throw new Error('Container not found');
            return element as HTMLElement;
        }
        return container;
    }

    public render(): void {
        if (this.isDestroyed) throw new Error('Pitch has been destroyed');

        const { width, height } = this.config.dimensions;
        const isVertical = this.config.orientation === 'vertical';

        const renderWidth = isVertical ? height : width;
        const renderHeight = isVertical ? width : height;

        const svg = this.renderer.getSVGElement();
        if (svg) {
            svg.setAttribute('viewBox', `0 0 ${renderWidth} ${renderHeight}`);
        }

        this.renderGeometries();
        this.renderVisualizations();
    }

    private renderGeometries(): void {
        const elements = this.buildRenderElements();
        this.renderer.render(
            { elements },
            { layer: 'pitch', clear: true }
        );
    }

    private buildRenderElements(): RenderElement[] {
        const geometries = this.geometry.getAllGeometries();
        const theme = this.config.theme;

        const { width, height } = this.config.dimensions;
        const isVertical = this.config.orientation === 'vertical';
        const viewWidth = isVertical ? height : width;
        const viewHeight = isVertical ? width : height;

        const sx = viewWidth / 100;
        const sy = viewHeight / 100;

        return geometries.map(geo => {
            const style = this.getStyleForGeometry(geo, theme);

            const attributes = {
                'data-element': geo.id,
                id: geo.id,
                fill: style.fill,
                stroke: style.stroke,
                'stroke-width': String(style.strokeWidth),
            };

            if (geo.type === 'rect') {
                const x = (geo.x || 0) * sx;
                const y = (geo.y || 0) * sy;
                const w = (geo.width || 0) * sx;
                const h = (geo.height || 0) * sy;

                return {
                    type: 'rect',
                    x,
                    y,
                    attributes: { ...attributes, width: w, height: h }
                };
            } else if (geo.type === 'line') {
                return {
                    type: 'line',
                    attributes: {
                        ...attributes,
                        x1: (geo.x1 || 0) * sx,
                        y1: (geo.y1 || 0) * sy,
                        x2: (geo.x2 || 0) * sx,
                        y2: (geo.y2 || 0) * sy,
                    }
                };
            } else if (geo.type === 'circle') {
                return {
                    type: 'circle',
                    x: (geo.cx || 0) * sx,
                    y: (geo.cy || 0) * sy,
                    attributes: {
                        ...attributes,
                        r: (geo.r || 0) * sx
                    }
                };
            } else if (geo.type === 'arc') {
                const rx = (geo.r || 0) * sx;
                const cx = (geo.cx || 0) * sx;
                const cy = (geo.cy || 0) * sy;
                const r = rx;
                const start = geo.startAngle || 0;
                const end = geo.endAngle || 0;

                const x1 = cx + r * Math.cos(start);
                const y1 = cy + r * Math.sin(start);
                const x2 = cx + r * Math.cos(end);
                const y2 = cy + r * Math.sin(end);

                const largeArc = Math.abs(end - start) > Math.PI ? 1 : 0;
                const sweep = end > start ? 1 : 0;

                const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;

                return {
                    type: 'path',
                    attributes: {
                        ...attributes,
                        d,
                        fill: 'none'
                    }
                };
            }

            return { type: 'group' };
        });
    }

    private getStyleForGeometry(geo: GeometryObject, theme: PitchTheme) {
        const isOutline = geo.id === 'outline';
        const fill = isOutline ? theme.grass : 'none';
        const stroke = isOutline ? theme.lines : (theme.lines || 'white');
        const strokeWidth = isOutline ? 0 : (this.config.dimensions.lineThickness || 0.12);

        return {
            fill,
            stroke,
            strokeWidth,
        };
    }

    private renderVisualizations(): void {
        this.visualizations.forEach(viz => {
            viz.render(this.renderer, this.scale);
        });
    }

    public setTheme(theme: string | PitchTheme): void {
        if (typeof theme === 'string') {
            this.config.theme = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
        } else {
            this.config.theme = theme;
        }

        this.renderGeometries();
    }

    public setOrientation(orientation: 'horizontal' | 'vertical'): void {
        if (this.config.orientation === orientation) return;
        this.config.orientation = orientation;
        this.geometry = new PitchGeometry(this.config.dimensions, orientation);
        this.render();
    }

    public add(visualization: Visualization): this {
        this.visualizations.set(visualization.id, visualization);
        visualization.render(this.renderer, this.scale);
        return this;
    }

    public getVisualization(id: string): Visualization | undefined {
        return this.visualizations.get(id);
    }

    public destroy(): void {
        this.visualizations.forEach(v => v.destroy?.());
        this.visualizations.clear();
        this.renderer.destroy();
        this.isDestroyed = true;
    }
}
