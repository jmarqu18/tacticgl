import type { RenderConfig, RenderOptions, TransitionConfig } from './config.types';
import type { NormalizedData } from './data.types';

/**
 * Capacidades reportadas por un renderer
 * Define las características técnicas y limitaciones del renderer
 * 
 * @example
 * ```ts
 * const svgCapabilities: RendererCapabilities = {
 *   maxElements: 5000,
 *   supportsAnimation: true,
 *   supportsInteractivity: true,
 *   supportsFilters: true,
 *   performance: 'high'
 * };
 * ```
 */
export interface RendererCapabilities {
    readonly maxElements: number;           // Elementos antes de degradación
    readonly supportsAnimation: boolean;
    readonly supportsInteractivity: boolean;
    readonly supportsFilters: boolean;      // CSS filters / WebGL effects
    readonly performance: 'low' | 'medium' | 'high';
}

/**
 * Tipo de renderer disponible
 * - svg: Renderizado vectorial SVG
 * - canvas: Renderizado Canvas 2D
 * - webgl: Renderizado acelerado por hardware
 */
export type RendererType = 'svg' | 'canvas' | 'webgl';

/**
 * Preferencia de renderer
 * - 'auto': Selección automática según capacidades del navegador
 * - RendererType: Forzar un tipo específico
 */
export type RendererPreference = RendererType | 'auto';

/**
 * Información sobre una capa de renderizado
 * Define el estado y comportamiento de una capa
 * 
 * @example
 * ```ts
 * const layer: Layer = {
 *   id: 'events',
 *   zIndex: 10,
 *   visible: true,
 *   opacity: 1,
 *   show() { ... },
 *   hide() { ... },
 *   setOpacity(0.5) { ... },
 *   clear() { ... }
 * };
 * ```
 */
export interface Layer {
    readonly id: string;
    readonly zIndex: number;
    readonly visible: boolean;
    readonly opacity: number;

    // Métodos de la capa (implementación en clase concreta)
    show(): void;
    hide(): void;
    setOpacity(value: number): void;
    clear(): void;
}

/**
 * Eventos del ciclo de vida del renderer
 * Define los eventos que el renderer puede emitir
 */
export interface RendererEvents {
    init: { container: HTMLElement; config: RenderConfig };
    render: { data: NormalizedData; duration: number };
    update: { data: Partial<NormalizedData> };
    clear: void;
    destroy: void;
    error: { error: Error; context: string };
    layerAdded: { layer: Layer };
    layerRemoved: { layerId: string };
}

/**
 * Callback para eventos del renderer
 * Tipado estricto para event handlers
 */
export type RendererEventCallback<K extends keyof RendererEvents> =
    (payload: RendererEvents[K]) => void;

/**
 * Interfaz principal del Renderer
 * Contrato que deben cumplir SVGRenderer, CanvasRenderer, WebGLRenderer
 * 
 * @example
 * ```ts
 * class SVGRenderer implements IRenderer {
 *   readonly isInitialized = false;
 *   readonly capabilities = { ... };
 *   
 *   init(container: HTMLElement, config: RenderConfig) { ... }
 *   render(data: NormalizedData, options?: RenderOptions) { ... }
 *   // ... resto de métodos
 * }
 * ```
 */
export interface IRenderer {
    // ─── Estado ────────────────────────────────────────────
    readonly isInitialized: boolean;
    readonly capabilities: RendererCapabilities;

    // ─── Ciclo de vida ─────────────────────────────────────
    /**
     * Inicializa el renderer en el contenedor especificado
     * @throws Error si el contenedor no es válido
     */
    init(container: HTMLElement, config: RenderConfig): void;

    /**
     * Renderiza los datos proporcionados
     */
    render(data: NormalizedData, options?: RenderOptions): void;

    /**
     * Actualiza parcialmente el renderizado existente
     * Optimizado para cambios incrementales
     */
    update(data: Partial<NormalizedData>, transition?: TransitionConfig): void;

    /**
     * Limpia el contenido renderizado (mantiene estructura)
     */
    clear(): void;

    /**
     * Destruye el renderer y libera recursos
     */
    destroy(): void;

    // ─── Gestión de Capas ──────────────────────────────────
    /**
     * Añade una nueva capa de renderizado
     */
    addLayer(id: string, zIndex: number): Layer;

    /**
     * Obtiene una capa por su ID
     */
    getLayer(id: string): Layer | null;

    /**
     * Obtiene todas las capas ordenadas por zIndex
     */
    getLayers(): ReadonlyArray<Layer>;

    /**
     * Elimina una capa y su contenido
     */
    removeLayer(id: string): void;

    // ─── Eventos ───────────────────────────────────────────
    /**
     * Suscribe a un evento del renderer
     */
    on<K extends keyof RendererEvents>(
        event: K,
        callback: RendererEventCallback<K>
    ): void;

    /**
     * Desuscribe de un evento
     */
    off<K extends keyof RendererEvents>(
        event: K,
        callback: RendererEventCallback<K>
    ): void;

    // ─── Utilidades ────────────────────────────────────────
    /**
     * Redimensiona el renderer al nuevo tamaño
     */
    resize(width: number, height: number): void;

    /**
     * Obtiene el elemento DOM raíz del renderer
     */
    getContainer(): HTMLElement | null;
}

/**
 * Información del RenderEngine sobre el renderer seleccionado
 * 
 * @example
 * ```ts
 * const info: RenderEngineInfo = {
 *   type: 'svg',
 *   capabilities: { ... },
 *   fallbackUsed: false,
 *   requestedType: 'auto'
 * };
 * ```
 */
export interface RenderEngineInfo {
    readonly type: RendererType;
    readonly capabilities: RendererCapabilities;
    readonly fallbackUsed: boolean;
    readonly requestedType: RendererPreference;
}

/**
 * Opciones del RenderEngine
 * 
 * @example
 * ```ts
 * const options: RenderEngineOptions = {
 *   force: true  // No usar fallback si el renderer falla
 * };
 * ```
 */
export interface RenderEngineOptions {
    readonly force?: boolean;  // Forzar renderer sin fallback
}
