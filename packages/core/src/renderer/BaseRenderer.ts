import type {
    IRenderer,
    Layer,
    RendererCapabilities,
    RendererEvents,
    RendererEventCallback
} from '../types/renderer.types';
import type { RenderConfig, RenderOptions, TransitionConfig } from '../types/config.types';
import type { NormalizedData } from '../types/data.types';

/**
 * Implementación de una capa de renderizado
 * Cada capa puede tener su propio contenido, visibilidad y opacidad
 */
class BaseLayer implements Layer {
    public visible: boolean = true;
    public opacity: number = 1;

    constructor(
        public readonly id: string,
        public readonly zIndex: number,
        private readonly element: HTMLElement
    ) { }

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
        this.element.innerHTML = '';
    }
}

/**
 * Clase abstracta base para todos los renderers de TacticGL
 * Proporciona funcionalidad común: gestión de capas, eventos y ciclo de vida
 * 
 * @example
 * ```ts
 * class SVGRenderer extends BaseRenderer {
 *   readonly capabilities = {
 *     maxElements: 5000,
 *     supportsAnimation: true,
 *     supportsInteractivity: true,
 *     supportsFilters: true,
 *     performance: 'high'
 *   };
 * 
 *   render(data: NormalizedData): void {
 *     // Implementación específica de SVG
 *   }
 * 
 *   update(data: Partial<NormalizedData>): void {
 *     // Implementación específica de SVG
 *   }
 * 
 *   protected createRenderContext(): void {
 *     // Crear elemento SVG raíz
 *   }
 * }
 * ```
 */
export abstract class BaseRenderer implements IRenderer {
    // ─── Estado ────────────────────────────────────────────
    private _isInitialized: boolean = false;
    private _container: HTMLElement | null = null;
    private _config: RenderConfig = {};

    // ─── Gestión de Capas ──────────────────────────────────
    private _layers: Map<string, BaseLayer> = new Map();

    // ─── Sistema de Eventos ────────────────────────────────
    private _eventHandlers: Map<keyof RendererEvents, Set<RendererEventCallback<any>>> = new Map();

    // ─── Propiedades Abstractas ────────────────────────────
    abstract readonly capabilities: RendererCapabilities;

    // ─── Getters ───────────────────────────────────────────
    /**
     * Indica si el renderer ha sido inicializado
     */
    get isInitialized(): boolean {
        return this._isInitialized;
    }

    // ─── Ciclo de Vida ─────────────────────────────────────
    /**
     * Inicializa el renderer en el contenedor especificado
     * 
     * @param container - Elemento HTML que contendrá el renderizado
     * @param config - Configuración de renderizado
     * @throws Error si el container es null o no está en el DOM
     * 
     * @example
     * ```ts
     * const container = document.getElementById('pitch');
     * renderer.init(container, { width: 800, height: 600 });
     * ```
     */
    init(container: HTMLElement, config: RenderConfig): void {
        // Validación del contenedor
        if (!container) {
            throw new Error('Container element is required');
        }

        if (!document.body.contains(container)) {
            throw new Error('Container must be attached to DOM');
        }

        this._container = container;
        this._config = config;

        // Crear contexto de renderizado específico del renderer
        this.createRenderContext();

        this._isInitialized = true;

        // Emitir evento de inicialización
        this.emit('init', { container, config });
    }

    /**
     * Renderiza los datos proporcionados
     * Método abstracto que debe ser implementado por cada renderer específico
     * 
     * @param data - Datos normalizados a renderizar
     * @param options - Opciones de renderizado (opcional)
     */
    abstract render(data: NormalizedData, options?: RenderOptions): void;

    /**
     * Actualiza parcialmente el renderizado existente
     * Método abstracto que debe ser implementado por cada renderer específico
     * 
     * @param data - Datos parciales a actualizar
     * @param transition - Configuración de transición (opcional)
     */
    abstract update(data: Partial<NormalizedData>, transition?: TransitionConfig): void;

    /**
     * Limpia el contenido renderizado manteniendo la estructura
     */
    clear(): void {
        this._layers.forEach(layer => layer.clear());
        this.emit('clear');
    }

    /**
     * Destruye el renderer y libera todos los recursos
     * Limpia capas, eventos y resetea el estado
     */
    destroy(): void {
        // Emitir evento de destrucción ANTES de limpiar handlers
        this.emit('destroy');

        // Limpiar todas las capas
        this._layers.forEach(layer => layer.clear());
        this._layers.clear();

        // Limpiar todos los event handlers
        this._eventHandlers.clear();

        // Resetear estado
        this._container = null;
        this._config = {};
        this._isInitialized = false;
    }

    // ─── Gestión de Capas ──────────────────────────────────
    /**
     * Añade una nueva capa de renderizado
     * 
     * @param id - Identificador único de la capa
     * @param zIndex - Orden de apilamiento (mayor = más al frente)
     * @returns La capa creada
     * 
     * @example
     * ```ts
     * const eventsLayer = renderer.addLayer('events', 10);
     * const heatmapLayer = renderer.addLayer('heatmap', 5);
     * ```
     */
    addLayer(id: string, zIndex: number): Layer {
        if (!this._container) {
            throw new Error('Renderer must be initialized before adding layers');
        }

        // Crear elemento para la capa
        const layerElement = document.createElement('div');
        layerElement.id = `layer-${id}`;
        layerElement.style.position = 'absolute';
        layerElement.style.top = '0';
        layerElement.style.left = '0';
        layerElement.style.width = '100%';
        layerElement.style.height = '100%';
        layerElement.style.zIndex = String(zIndex);
        layerElement.style.pointerEvents = 'none';

        this._container.appendChild(layerElement);

        // Crear capa
        const layer = new BaseLayer(id, zIndex, layerElement);
        this._layers.set(id, layer);

        // Emitir evento
        this.emit('layerAdded', { layer });

        return layer;
    }

    /**
     * Obtiene una capa por su ID
     * 
     * @param id - Identificador de la capa
     * @returns La capa o null si no existe
     */
    getLayer(id: string): Layer | null {
        return this._layers.get(id) ?? null;
    }

    /**
     * Obtiene todas las capas ordenadas por zIndex (ascendente)
     * 
     * @returns Array de capas ordenadas
     */
    getLayers(): ReadonlyArray<Layer> {
        return Array.from(this._layers.values()).sort((a, b) => a.zIndex - b.zIndex);
    }

    /**
     * Elimina una capa y su contenido
     * 
     * @param id - Identificador de la capa a eliminar
     */
    removeLayer(id: string): void {
        const layer = this._layers.get(id);
        if (!layer) {
            return;
        }

        // Remover elemento del DOM
        const layerElement = document.getElementById(`layer-${id}`);
        if (layerElement && layerElement.parentNode) {
            layerElement.parentNode.removeChild(layerElement);
        }

        this._layers.delete(id);

        // Emitir evento
        this.emit('layerRemoved', { layerId: id });
    }

    // ─── Sistema de Eventos ────────────────────────────────
    /**
     * Suscribe a un evento del renderer
     * 
     * @param event - Nombre del evento
     * @param callback - Función a ejecutar cuando ocurra el evento
     * 
     * @example
     * ```ts
     * renderer.on('init', ({ container, config }) => {
     *   console.log('Renderer initialized');
     * });
     * ```
     */
    on<K extends keyof RendererEvents>(
        event: K,
        callback: RendererEventCallback<K>
    ): void {
        if (!this._eventHandlers.has(event)) {
            this._eventHandlers.set(event, new Set());
        }
        this._eventHandlers.get(event)!.add(callback);
    }

    /**
     * Desuscribe de un evento
     * 
     * @param event - Nombre del evento
     * @param callback - Función previamente suscrita
     */
    off<K extends keyof RendererEvents>(
        event: K,
        callback: RendererEventCallback<K>
    ): void {
        const handlers = this._eventHandlers.get(event);
        if (handlers) {
            handlers.delete(callback);
        }
    }

    /**
     * Emite un evento a todos los suscriptores
     * 
     * @param event - Nombre del evento
     * @param payload - Datos del evento
     */
    protected emit<K extends keyof RendererEvents>(
        event: K,
        ...args: RendererEvents[K] extends void ? [] : [RendererEvents[K]]
    ): void {
        const handlers = this._eventHandlers.get(event);
        if (handlers) {
            const payload = args[0];
            handlers.forEach(handler => handler(payload));
        }
    }

    // ─── Utilidades ────────────────────────────────────────
    /**
     * Redimensiona el renderer al nuevo tamaño
     * 
     * @param width - Nuevo ancho en píxeles
     * @param height - Nueva altura en píxeles
     */
    resize(width: number, height: number): void {
        if (!this._container) {
            return;
        }

        this._config = {
            ...this._config,
            width,
            height
        };

        // Subclases pueden sobrescribir para implementar lógica específica
    }

    /**
     * Obtiene el elemento DOM raíz del renderer
     * 
     * @returns El contenedor o null si no está inicializado
     */
    getContainer(): HTMLElement | null {
        return this._container;
    }

    /**
     * Obtiene la configuración actual
     * 
     * @returns La configuración de renderizado
     */
    protected getConfig(): Readonly<RenderConfig> {
        return this._config;
    }

    // ─── Métodos Abstractos Protegidos ────────────────────
    /**
     * Crea el contexto de renderizado específico del renderer
     * Cada implementación concreta debe crear su elemento raíz (SVG, Canvas, etc.)
     * 
     * @example
     * ```ts
     * // En SVGRenderer
     * protected createRenderContext(): void {
     *   const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
     *   this.getContainer()?.appendChild(svg);
     * }
     * ```
     */
    protected abstract createRenderContext(): void;
}
