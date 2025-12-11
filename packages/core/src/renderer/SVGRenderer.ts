import { BaseRenderer } from './BaseRenderer';
import type { RendererCapabilities, Layer } from '../types/renderer.types';
import type { RenderOptions, TransitionConfig } from '../types/config.types';
import type { NormalizedData, RenderElement } from '../types/data.types';

/**
 * Namespace SVG estándar
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Implementación de una capa SVG usando elemento <g>
 * Cada capa se representa como un grupo SVG con transformaciones
 */
class SVGLayer implements Layer {
    public visible: boolean = true;
    public opacity: number = 1;

    constructor(
        public readonly id: string,
        public readonly zIndex: number,
        private readonly element: SVGGElement
    ) {
        // Configurar atributos del grupo
        this.element.setAttribute('data-layer', id);
    }

    /**
     * Muestra la capa
     */
    show(): void {
        this.visible = true;
        this.element.style.display = '';
    }

    /**
     * Oculta la capa
     */
    hide(): void {
        this.visible = false;
        this.element.style.display = 'none';
    }

    /**
     * Establece la opacidad de la capa
     * @param value - Valor entre 0 y 1
     */
    setOpacity(value: number): void {
        this.opacity = Math.max(0, Math.min(1, value));
        this.element.style.opacity = String(this.opacity);
    }

    /**
     * Limpia el contenido de la capa
     */
    clear(): void {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }

    /**
     * Obtiene el elemento SVG de la capa
     */
    getElement(): SVGGElement {
        return this.element;
    }
}

/**
 * SVGRenderer - Renderer basado en SVG para TacticGL
 * 
 * Proporciona renderizado vectorial de alta calidad usando SVG nativo.
 * Ideal para visualizaciones de campo (Pitch) y mapas de tiros (ShotMap).
 * 
 * Características:
 * - ViewBox responsivo que mantiene aspect ratio
 * - Sistema de capas usando elementos <g>
 * - Soporte para animaciones CSS
 * - Interactividad completa con eventos DOM
 * 
 * @example
 * ```ts
 * const renderer = new SVGRenderer();
 * renderer.init(container, { width: 105, height: 68, responsive: true });
 * 
 * renderer.addLayer('pitch', 0);
 * renderer.addLayer('events', 10);
 * 
 * renderer.render({ elements: [...] }, { layer: 'events' });
 * ```
 */
export class SVGRenderer extends BaseRenderer {
    // ─── Capacidades del Renderer ───────────────────────────
    readonly capabilities: RendererCapabilities = {
        maxElements: 1000,
        supportsAnimation: true,
        supportsInteractivity: true,
        supportsFilters: true,
        performance: 'medium'
    };

    // ─── Estado Interno SVG ─────────────────────────────────
    private _svg: SVGSVGElement | null = null;
    private _svgLayers: Map<string, SVGLayer> = new Map();

    // ─── Implementación del Contexto ────────────────────────
    /**
     * Crea el elemento SVG raíz con viewBox configurado
     */
    protected createRenderContext(): void {
        const container = this.getContainer();
        const config = this.getConfig();

        if (!container) {
            return;
        }

        // Crear elemento SVG
        this._svg = document.createElementNS(SVG_NS, 'svg');

        // Configurar viewBox basado en dimensiones de config
        const width = config.width ?? 100;
        const height = config.height ?? 100;
        this._svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Configurar preserveAspectRatio para mantener proporciones
        this._svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // Configurar dimensiones responsivas por defecto
        if (config.responsive !== false) {
            this._svg.style.width = '100%';
            this._svg.style.height = '100%';
        } else {
            this._svg.style.width = `${width}px`;
            this._svg.style.height = `${height}px`;
        }

        // Estilos adicionales
        this._svg.style.display = 'block';

        // Añadir al contenedor
        container.appendChild(this._svg);
    }

    // ─── Override de Gestión de Capas ───────────────────────
    /**
     * Añade una nueva capa SVG (<g>) con el zIndex especificado
     * Las capas se ordenan automáticamente en el DOM por zIndex
     * 
     * @param id - Identificador único de la capa
     * @param zIndex - Orden de apilamiento
     * @returns La capa creada
     */
    addLayer(id: string, zIndex: number): Layer {
        if (!this._svg) {
            throw new Error('Renderer must be initialized before adding layers');
        }

        // Crear elemento <g> para la capa
        const group = document.createElementNS(SVG_NS, 'g');

        // Crear la capa
        const layer = new SVGLayer(id, zIndex, group);
        this._svgLayers.set(id, layer);

        // Insertar en orden por zIndex
        this._insertLayerInOrder(layer);

        // Emitir evento
        this.emit('layerAdded', { layer });

        return layer;
    }

    /**
     * Obtiene una capa por su ID
     */
    getLayer(id: string): Layer | null {
        return this._svgLayers.get(id) ?? null;
    }

    /**
     * Obtiene todas las capas ordenadas por zIndex
     */
    getLayers(): ReadonlyArray<Layer> {
        return Array.from(this._svgLayers.values()).sort((a, b) => a.zIndex - b.zIndex);
    }

    /**
     * Elimina una capa y su contenido
     */
    removeLayer(id: string): void {
        const layer = this._svgLayers.get(id);
        if (!layer) {
            return;
        }

        // Remover del DOM
        const element = layer.getElement();
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }

        this._svgLayers.delete(id);

        // Emitir evento
        this.emit('layerRemoved', { layerId: id });
    }

    // ─── Renderizado ────────────────────────────────────────
    /**
     * Renderiza datos en la capa especificada
     * 
     * @param data - Datos normalizados a renderizar
     * @param options - Opciones de renderizado
     */
    render(data: NormalizedData, options?: RenderOptions): void {
        if (!this._svg || !this.isInitialized) {
            throw new Error('Renderer must be initialized before rendering');
        }

        const startTime = performance.now();
        const targetLayer = options?.layer ? this._svgLayers.get(options.layer) : null;

        // Limpiar capa si se solicita
        if (options?.clear && targetLayer) {
            targetLayer.clear();
        }

        // Renderizar elementos
        if (data.elements) {
            const target = targetLayer?.getElement() ?? this._svg;
            for (const element of data.elements) {
                const svgElement = this._createSVGElement(element);
                if (svgElement) {
                    target.appendChild(svgElement);
                }
            }
        }

        // Calcular duración
        const duration = performance.now() - startTime;

        // Emitir evento
        this.emit('render', { data, duration });
    }

    /**
     * Actualiza parcialmente el renderizado con transiciones opcionales
     * 
     * @param data - Datos parciales a actualizar
     * @param transition - Configuración de transición
     */
    update(data: Partial<NormalizedData>, transition?: TransitionConfig): void {
        if (!this._svg || !this.isInitialized) {
            throw new Error('Renderer must be initialized before updating');
        }

        // Aplicar transición CSS si se especifica
        if (transition && data.elements) {
            const duration = transition.duration ?? 300;
            const easing = this._mapEasing(transition.easing ?? 'ease-in-out');

            // Actualizar elementos con transición
            for (const element of data.elements) {
                const svgElement = this._findElement(element);
                if (svgElement) {
                    svgElement.style.transition = `all ${duration}ms ${easing}`;
                    this._updateElementAttributes(svgElement, element);
                }
            }
        }

        // Emitir evento
        this.emit('update', { data });
    }

    /**
     * Limpia el contenido de todas las capas sin eliminar la estructura
     */
    clear(): void {
        this._svgLayers.forEach(layer => layer.clear());
        this.emit('clear');
    }

    /**
     * Destruye el renderer y libera recursos
     */
    destroy(): void {
        // Emitir evento antes de limpiar
        this.emit('destroy');

        // Limpiar todas las capas
        this._svgLayers.forEach(layer => layer.clear());
        this._svgLayers.clear();

        // Remover SVG del DOM
        if (this._svg && this._svg.parentNode) {
            this._svg.parentNode.removeChild(this._svg);
        }
        this._svg = null;

        // Llamar a destroy del padre para limpiar eventos y estado
        super.destroy();
    }

    // ─── Métodos Privados ───────────────────────────────────
    /**
     * Inserta una capa en el SVG manteniendo el orden por zIndex
     */
    private _insertLayerInOrder(layer: SVGLayer): void {
        if (!this._svg) return;

        const group = layer.getElement();
        const orderedLayers = this.getLayers() as SVGLayer[];

        // Encontrar la posición correcta
        let insertBefore: SVGGElement | null = null;
        for (const existingLayer of orderedLayers) {
            if (existingLayer.zIndex > layer.zIndex && existingLayer !== layer) {
                insertBefore = existingLayer.getElement();
                break;
            }
        }

        if (insertBefore) {
            this._svg.insertBefore(group, insertBefore);
        } else {
            this._svg.appendChild(group);
        }
    }

    /**
     * Crea un elemento SVG a partir de un RenderElement
     */
    private _createSVGElement(element: RenderElement): SVGElement | null {
        let svgElement: SVGElement;

        switch (element.type) {
            case 'circle':
                svgElement = document.createElementNS(SVG_NS, 'circle');
                if (element.x !== undefined) svgElement.setAttribute('cx', String(element.x));
                if (element.y !== undefined) svgElement.setAttribute('cy', String(element.y));
                break;

            case 'rect':
                svgElement = document.createElementNS(SVG_NS, 'rect');
                if (element.x !== undefined) svgElement.setAttribute('x', String(element.x));
                if (element.y !== undefined) svgElement.setAttribute('y', String(element.y));
                break;

            case 'line':
                svgElement = document.createElementNS(SVG_NS, 'line');
                if (element.x !== undefined) svgElement.setAttribute('x1', String(element.x));
                if (element.y !== undefined) svgElement.setAttribute('y1', String(element.y));
                break;

            case 'path':
                svgElement = document.createElementNS(SVG_NS, 'path');
                break;

            case 'text':
                svgElement = document.createElementNS(SVG_NS, 'text');
                if (element.x !== undefined) svgElement.setAttribute('x', String(element.x));
                if (element.y !== undefined) svgElement.setAttribute('y', String(element.y));
                break;

            case 'group':
                svgElement = document.createElementNS(SVG_NS, 'g');
                // Renderizar hijos del grupo
                if (element.children) {
                    for (const child of element.children) {
                        const childElement = this._createSVGElement(child);
                        if (childElement) {
                            svgElement.appendChild(childElement);
                        }
                    }
                }
                break;

            default:
                return null;
        }

        // Aplicar atributos adicionales
        if (element.attributes) {
            for (const [key, value] of Object.entries(element.attributes)) {
                svgElement.setAttribute(key, String(value));
            }
        }

        return svgElement;
    }

    /**
     * Busca un elemento existente para actualizarlo
     * Por ahora, búsqueda simple por tipo y posición
     */
    private _findElement(element: RenderElement): SVGElement | null {
        if (!this._svg) return null;

        // Buscar por ID si existe
        if (element.attributes?.id) {
            return this._svg.querySelector(`#${element.attributes.id}`) as SVGElement | null;
        }

        return null;
    }

    /**
     * Actualiza los atributos de un elemento SVG existente
     */
    private _updateElementAttributes(svgElement: SVGElement, element: RenderElement): void {
        if (element.x !== undefined) {
            const attrName = element.type === 'circle' ? 'cx' : 'x';
            svgElement.setAttribute(attrName, String(element.x));
        }

        if (element.y !== undefined) {
            const attrName = element.type === 'circle' ? 'cy' : 'y';
            svgElement.setAttribute(attrName, String(element.y));
        }

        if (element.attributes) {
            for (const [key, value] of Object.entries(element.attributes)) {
                svgElement.setAttribute(key, String(value));
            }
        }
    }

    /**
     * Mapea funciones de easing a valores CSS
     */
    private _mapEasing(easing: string): string {
        const easingMap: Record<string, string> = {
            'linear': 'linear',
            'ease-in': 'ease-in',
            'ease-out': 'ease-out',
            'ease-in-out': 'ease-in-out',
            'ease-in-quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
            'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            'ease-in-cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
            'ease-out-cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)'
        };

        return easingMap[easing] ?? 'ease-in-out';
    }

    /**
     * Obtiene el elemento SVG raíz
     */
    getSVGElement(): SVGSVGElement | null {
        return this._svg;
    }
}
