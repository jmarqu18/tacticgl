/**
 * @module @tacticgl/core/engine/RenderEngine
 * 
 * Factory para selección automática del renderer basado en
 * capacidades del navegador y preferencias del usuario.
 */

import { SVGRenderer } from '../renderer/SVGRenderer';
import { isWebGLSupported, isCanvasSupported, isSVGSupported } from './capabilities';
import type { IRenderer, RendererType, RendererPreference, RenderEngineInfo, RenderEngineOptions } from '../types/renderer.types';

/**
 * Error thrown when a renderer is not available and force mode is enabled
 */
export class RendererNotSupportedError extends Error {
    constructor(type: RendererType) {
        super(`${type.toUpperCase()} is not supported`);
        this.name = 'RendererNotSupportedError';
    }
}

/**
 * RenderEngine - Factory inteligente para selección de renderers
 * 
 * Selecciona automáticamente el mejor renderer disponible basándose en:
 * - Preferencia del usuario (webgl/canvas/svg/auto)
 * - Capacidades detectadas del navegador
 * - Sistema de fallback automático: WebGL → Canvas → SVG
 * 
 * @example
 * ```ts
 * // Modo automático - selecciona el mejor disponible
 * const engine = new RenderEngine('auto');
 * console.log(engine.rendererType); // 'webgl' | 'canvas' | 'svg'
 * 
 * // Forzar un renderer específico
 * const svgEngine = new RenderEngine('svg');
 * 
 * // Forzar sin fallback (lanza error si no disponible)
 * const webglEngine = new RenderEngine('webgl', { force: true });
 * ```
 */
export class RenderEngine {
    private _renderer: IRenderer;
    private _rendererType: RendererType;
    private _requestedType: RendererPreference;
    private _fallbackUsed: boolean = false;

    /**
     * Crea una nueva instancia del RenderEngine
     * 
     * @param preference - Tipo de renderer preferido o 'auto'
     * @param options - Opciones de configuración
     * @throws RendererNotSupportedError si force=true y el renderer no está disponible
     */
    constructor(preference: RendererPreference = 'auto', options: RenderEngineOptions = {}) {
        this._requestedType = preference;

        // Seleccionar y crear el renderer apropiado
        const { renderer, type, fallbackUsed } = this._selectRenderer(preference, options);

        this._renderer = renderer;
        this._rendererType = type;
        this._fallbackUsed = fallbackUsed;
    }

    // ─── Getters Públicos ────────────────────────────────────

    /**
     * Obtiene el renderer seleccionado
     */
    get renderer(): IRenderer {
        return this._renderer;
    }

    /**
     * Obtiene el tipo de renderer actualmente en uso
     */
    get rendererType(): RendererType {
        return this._rendererType;
    }

    /**
     * Obtiene información completa sobre el renderer seleccionado
     */
    get info(): RenderEngineInfo {
        return {
            type: this._rendererType,
            capabilities: this._renderer.capabilities,
            fallbackUsed: this._fallbackUsed,
            requestedType: this._requestedType
        };
    }

    // ─── Métodos de Capacidades ──────────────────────────────

    /**
     * Verifica si WebGL está soportado en el navegador actual
     * 
     * @returns true si WebGL está disponible
     */
    isWebGLSupported(): boolean {
        return isWebGLSupported();
    }

    /**
     * Verifica si Canvas 2D está soportado en el navegador actual
     * 
     * @returns true si Canvas está disponible
     */
    isCanvasSupported(): boolean {
        return isCanvasSupported();
    }

    /**
     * Verifica si SVG está soportado en el navegador actual
     * 
     * @returns true si SVG está disponible
     */
    isSVGSupported(): boolean {
        return isSVGSupported();
    }

    // ─── Métodos Privados ────────────────────────────────────

    /**
     * Selecciona el renderer apropiado basado en preferencias y capacidades
     */
    private _selectRenderer(
        preference: RendererPreference,
        options: RenderEngineOptions
    ): { renderer: IRenderer; type: RendererType; fallbackUsed: boolean } {

        // Modo automático: seleccionar el mejor disponible
        if (preference === 'auto') {
            return this._selectBestAvailable();
        }

        // Renderer específico solicitado
        const isSupported = this._isRendererSupported(preference);

        // Si está soportado, usarlo directamente
        if (isSupported) {
            return {
                renderer: this._createRenderer(preference),
                type: preference,
                fallbackUsed: false
            };
        }

        // Si force=true y no está soportado, lanzar error
        if (options.force) {
            throw new RendererNotSupportedError(preference);
        }

        // Usar fallback
        return this._fallback(preference);
    }

    /**
     * Selecciona el mejor renderer disponible en modo automático
     * Orden de preferencia: WebGL → Canvas → SVG
     */
    private _selectBestAvailable(): { renderer: IRenderer; type: RendererType; fallbackUsed: boolean } {
        // Intentar WebGL primero (mejor rendimiento)
        if (this.isWebGLSupported()) {
            // Por ahora, fallback a SVG ya que WebGLRenderer no está implementado
            // TODO: Usar WebGLRenderer cuando esté disponible
        }

        // Intentar Canvas (buen rendimiento)
        if (this.isCanvasSupported()) {
            // Por ahora, fallback a SVG ya que CanvasRenderer no está implementado
            // TODO: Usar CanvasRenderer cuando esté disponible
        }

        // SVG como fallback final (siempre disponible en navegadores modernos)
        if (this.isSVGSupported()) {
            return {
                renderer: new SVGRenderer(),
                type: 'svg',
                fallbackUsed: false
            };
        }

        // Si nada está disponible (muy improbable), usar SVG por defecto
        return {
            renderer: new SVGRenderer(),
            type: 'svg',
            fallbackUsed: false
        };
    }

    /**
     * Aplica el sistema de fallback cuando el renderer solicitado no está disponible
     * Secuencia: WebGL → Canvas → SVG
     */
    private _fallback(
        requested: RendererType
    ): { renderer: IRenderer; type: RendererType; fallbackUsed: boolean } {

        const fallbackOrder = this._getFallbackOrder(requested);

        for (const type of fallbackOrder) {
            if (this._isRendererSupported(type)) {
                return {
                    renderer: this._createRenderer(type),
                    type,
                    fallbackUsed: true
                };
            }
        }

        // Si todo falla, usar SVG (siempre debería funcionar)
        return {
            renderer: new SVGRenderer(),
            type: 'svg',
            fallbackUsed: true
        };
    }

    /**
     * Obtiene el orden de fallback basado en el renderer solicitado
     */
    private _getFallbackOrder(requested: RendererType): RendererType[] {
        switch (requested) {
            case 'webgl':
                return ['canvas', 'svg'];
            case 'canvas':
                return ['svg'];
            case 'svg':
            default:
                return ['svg'];
        }
    }

    /**
     * Verifica si un tipo de renderer está soportado
     */
    private _isRendererSupported(type: RendererType): boolean {
        switch (type) {
            case 'webgl':
                return this.isWebGLSupported();
            case 'canvas':
                return this.isCanvasSupported();
            case 'svg':
                return this.isSVGSupported();
            default:
                return false;
        }
    }

    /**
     * Crea una instancia del renderer especificado
     * 
     * @throws Error si el renderer no está implementado
     */
    private _createRenderer(type: RendererType): IRenderer {
        switch (type) {
            case 'svg':
                return new SVGRenderer();
            case 'canvas':
                // TODO: Implementar CanvasRenderer
                throw new Error('CanvasRenderer is not yet implemented');
            case 'webgl':
                // TODO: Implementar WebGLRenderer
                throw new Error('WebGLRenderer is not yet implemented');
            default:
                throw new Error(`Unknown renderer type: ${type}`);
        }
    }
}
