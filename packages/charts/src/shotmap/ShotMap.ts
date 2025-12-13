import { BaseRenderer, PitchScale, RenderElement } from '@tacticgl/core';
import { Visualization } from '../pitch/Pitch'; // Import Visualization interface
import { createShotMapConfig } from './constants';
import { Shot, ShotMapConfig } from './types';

export interface ShotMapOptions extends Partial<ShotMapConfig> {
    data: Shot[];
    tooltip?: boolean;
}

/**
 * Visualización de mapa de tiros (Shot Map).
 * Renderiza los tiros como círculos con tamaño basado en xG y color basado en resultado.
 * Incluye soporte para tooltips e interacciones (hover).
 */
export class ShotMap implements Visualization {
    public readonly id = 'shotmap';
    private config: ShotMapConfig;
    private data: Shot[];
    private tooltipEnabled: boolean;
    private highlightedShotId: string | null = null;

    private renderer: BaseRenderer | null = null;
    private scale: PitchScale | null = null;
    private tooltipElement: HTMLElement | null = null;

    constructor(options: ShotMapOptions) {
        const { data, tooltip, ...configOptions } = options;
        this.data = data;
        this.tooltipEnabled = !!tooltip;
        this.config = createShotMapConfig(configOptions);
    }

    public render(renderer: BaseRenderer, scale: PitchScale): void {
        this.renderer = renderer;
        this.scale = scale;

        // Add layer if not exists (using a high z-index to be on top of pitch components)
        // We assume 'shotmap' layer might handle multiple shotmaps or just one.
        // Ideally we assume this visualization owns the layer 'shotmap'.
        if (!renderer.getLayer(this.id)) {
            renderer.addLayer(this.id, 50);
        }

        this.draw();

        if (this.tooltipEnabled) {
            this.setupTooltip();
        }
    }

    public setData(data: Shot[]): void {
        this.data = data;
        this.draw();
    }

    public setFilter(filter: Partial<ShotMapConfig['filter']>): void {
        this.config.filter = { ...this.config.filter, ...filter };
        this.draw();
    }

    public highlight(shotId: string): void {
        this.highlightedShotId = shotId;
        this.draw();
    }

    public clearHighlight(): void {
        this.highlightedShotId = null;
        this.draw();
    }

    public destroy(): void {
        // Remove event listeners
        const container = this.renderer?.getContainer();
        if (container) {
            container.removeEventListener('mouseover', this.handleMouseOver);
            container.removeEventListener('mousemove', this.handleMouseMove);
            container.removeEventListener('mouseout', this.handleMouseOut);
        }

        if (this.tooltipElement && this.tooltipElement.parentNode) {
            this.tooltipElement.parentNode.removeChild(this.tooltipElement);
        }
        this.tooltipElement = null;

        // Clean up layer
        if (this.renderer) {
            this.renderer.removeLayer(this.id);
        }
    }

    private draw(): void {
        if (!this.renderer || !this.scale) return;

        const filteredData = this.getFilteredData();
        const elements = this.buildRenderElements(filteredData);

        this.renderer.render({ elements }, { layer: this.id, clear: true });
    }

    private getFilteredData(): Shot[] {
        return this.data.filter(shot => {
            // Filter by team
            if (this.config.filter.teamId !== undefined) {
                if (shot.team.id != this.config.filter.teamId) return false;
            }
            // Filter by player
            if (this.config.filter.playerId !== undefined) {
                if (shot.player?.id != this.config.filter.playerId) return false;
            }
            return true;
        });
    }

    private buildRenderElements(shots: Shot[]): RenderElement[] {
        if (!this.scale) return [];

        return shots.map(shot => {
            const { x, y } = this.scale!.toPixel(shot.position);
            const radius = this.calculateRadius(shot.xG);
            const color = this.config.colors[shot.outcome];

            let opacity = 1;
            if (this.highlightedShotId) {
                opacity = shot.id === this.highlightedShotId ? 1 : 0.3;
            }

            return {
                type: 'circle',
                x,
                y,
                attributes: {
                    r: radius,
                    fill: color,
                    opacity,
                    'data-shot-id': shot.id,
                    stroke: 'white',
                    'stroke-width': 1,
                    style: 'cursor: pointer;' // Indicate interactivity
                }
            };
        });
    }

    private calculateRadius(xG: number): number {
        const { minRadius, maxRadius } = this.config.sizeScale;
        // Simple linear interpolation
        // Clamp xG between 0 and 1 just in case
        const clampedXG = Math.max(0, Math.min(1, xG));
        return minRadius + (clampedXG * (maxRadius - minRadius));
    }

    private setupTooltip(): void {
        const container = this.renderer?.getContainer();
        if (!container) return;

        // Create tooltip element if not exists
        if (!this.tooltipElement) {
            this.tooltipElement = document.createElement('div');
            this.tooltipElement.className = 'tacticgl-tooltip';
            this.tooltipElement.style.position = 'absolute';
            this.tooltipElement.style.padding = '8px';
            this.tooltipElement.style.background = 'rgba(0,0,0,0.8)';
            this.tooltipElement.style.color = 'white';
            this.tooltipElement.style.borderRadius = '4px';
            this.tooltipElement.style.pointerEvents = 'none';
            this.tooltipElement.style.fontSize = '12px';
            this.tooltipElement.style.zIndex = '1000';
            this.tooltipElement.style.display = 'none';
            container.appendChild(this.tooltipElement);

            // Ensure container is relative so tooltip positions correctly
            if (getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
        }

        // Attach event listeners using delegation
        // We attach to container to catch events from SVG elements
        container.addEventListener('mouseover', this.handleMouseOver);
        container.addEventListener('mousemove', this.handleMouseMove);
        container.addEventListener('mouseout', this.handleMouseOut);
    }

    private handleMouseOver = (e: MouseEvent) => {
        const target = e.target as Element;
        const shotId = target.getAttribute('data-shot-id');

        if (shotId && this.tooltipElement) {
            const shot = this.data.find(s => s.id === shotId);
            if (shot) {
                this.updateTooltipContent(shot);
                this.tooltipElement.style.display = 'block';
            }
        }
    };

    private handleMouseMove = (e: MouseEvent) => {
        if (this.tooltipElement && this.tooltipElement.style.display === 'block') {
            // Positioning relative to container
            // We can use offsetX/Y if the event target is the container, but here target is the circle.
            // Better to use layer coordinates or specialized logic.
            // For simplicity, we stick to mouse cursor with offset.
            // Note: e.offsetX/Y are relative to target (the circle).

            const container = this.renderer?.getContainer();
            if (container) {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left + 10;
                const y = e.clientY - rect.top + 10;
                this.tooltipElement.style.left = `${x}px`;
                this.tooltipElement.style.top = `${y}px`;
            }
        }
    };

    private handleMouseOut = (e: MouseEvent) => {
        const target = e.target as Element;
        if (target.getAttribute('data-shot-id')) {
            if (this.tooltipElement) {
                this.tooltipElement.style.display = 'none';
            }
        }
    };

    private updateTooltipContent(shot: Shot): void {
        if (!this.tooltipElement) return;

        const playerName = shot.player?.name || 'Unknown Player';
        const outcome = shot.outcome.charAt(0).toUpperCase() + shot.outcome.slice(1).replace('_', ' ');

        this.tooltipElement.textContent = `${playerName} | ${outcome} | xG: ${shot.xG.toFixed(2)}`;
    }
}
