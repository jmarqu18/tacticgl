/**
 * @module @tacticgl/core/engine/capabilities
 * 
 * Detección de capacidades de renderizado del navegador
 * Proporciona funciones para detectar soporte de WebGL, Canvas y SVG
 */

/**
 * Información sobre las capacidades de WebGL del navegador
 */
export interface WebGLCapabilities {
    readonly supported: boolean;
    readonly version: 1 | 2 | null;
    readonly renderer: string | null;
    readonly vendor: string | null;
    readonly maxTextureSize: number | null;
}

/**
 * Información sobre las capacidades de Canvas del navegador
 */
export interface CanvasCapabilities {
    readonly supported: boolean;
    readonly supportsHardwareAcceleration: boolean;
}

/**
 * Información sobre las capacidades de SVG del navegador
 */
export interface SVGCapabilities {
    readonly supported: boolean;
    readonly supportsFilters: boolean;
    readonly supportsTransforms: boolean;
}

/**
 * Información completa de las capacidades del navegador
 */
export interface BrowserCapabilities {
    readonly webgl: WebGLCapabilities;
    readonly canvas: CanvasCapabilities;
    readonly svg: SVGCapabilities;
}

/**
 * Detecta si WebGL está disponible y funcional
 * 
 * @returns Información sobre las capacidades de WebGL
 * 
 * @example
 * ```ts
 * const webgl = detectWebGL();
 * if (webgl.supported) {
 *   console.log(`WebGL ${webgl.version} available`);
 * }
 * ```
 */
export function detectWebGL(): WebGLCapabilities {
    try {
        const canvas = document.createElement('canvas');

        // Intentar WebGL 2 primero
        let gl: WebGLRenderingContext | WebGL2RenderingContext | null = canvas.getContext('webgl2');
        let version: 1 | 2 = 2;

        // Si no hay WebGL 2, intentar WebGL 1
        if (!gl) {
            gl = canvas.getContext('webgl');
            version = 1;
        }

        // Intentar experimental-webgl como fallback
        if (!gl) {
            gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
            version = 1;
        }

        if (!gl) {
            return {
                supported: false,
                version: null,
                renderer: null,
                vendor: null,
                maxTextureSize: null
            };
        }

        // Obtener información del driver
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

        return {
            supported: true,
            version,
            renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : null,
            vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : null,
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE)
        };
    } catch {
        return {
            supported: false,
            version: null,
            renderer: null,
            vendor: null,
            maxTextureSize: null
        };
    }
}

/**
 * Detecta si Canvas 2D está disponible
 * 
 * @returns Información sobre las capacidades de Canvas
 * 
 * @example
 * ```ts
 * const canvas = detectCanvas();
 * if (canvas.supported) {
 *   console.log('Canvas 2D available');
 * }
 * ```
 */
export function detectCanvas(): CanvasCapabilities {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return {
                supported: false,
                supportsHardwareAcceleration: false
            };
        }

        // Intenta detectar aceleración por hardware
        // Esta es una detección heurística basada en características
        const supportsHardwareAcceleration = typeof (ctx as unknown as Record<string, unknown>).drawFocusIfNeeded === 'function';

        return {
            supported: true,
            supportsHardwareAcceleration
        };
    } catch {
        return {
            supported: false,
            supportsHardwareAcceleration: false
        };
    }
}

/**
 * Detecta si SVG está disponible y funcional
 * 
 * @returns Información sobre las capacidades de SVG
 * 
 * @example
 * ```ts
 * const svg = detectSVG();
 * if (svg.supported) {
 *   console.log('SVG available with filters:', svg.supportsFilters);
 * }
 * ```
 */
export function detectSVG(): SVGCapabilities {
    try {
        // Verificar que el navegador soporta SVG
        const supported = typeof document.createElementNS === 'function' &&
            typeof SVGElement !== 'undefined';

        if (!supported) {
            return {
                supported: false,
                supportsFilters: false,
                supportsTransforms: false
            };
        }

        // Crear un SVG de prueba para verificar características
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        // Verificar soporte de filtros
        const supportsFilters = typeof (svg as unknown as Record<string, unknown>).createSVGPoint === 'function';

        // Verificar soporte de transformaciones
        const supportsTransforms = 'transform' in svg.style || 'webkitTransform' in svg.style;

        return {
            supported: true,
            supportsFilters,
            supportsTransforms
        };
    } catch {
        return {
            supported: false,
            supportsFilters: false,
            supportsTransforms: false
        };
    }
}

/**
 * Detecta todas las capacidades de renderizado del navegador
 * 
 * @returns Información completa de capacidades
 * 
 * @example
 * ```ts
 * const caps = detectAllCapabilities();
 * console.log('WebGL:', caps.webgl.supported);
 * console.log('Canvas:', caps.canvas.supported);
 * console.log('SVG:', caps.svg.supported);
 * ```
 */
export function detectAllCapabilities(): BrowserCapabilities {
    return {
        webgl: detectWebGL(),
        canvas: detectCanvas(),
        svg: detectSVG()
    };
}

/**
 * Verifica si WebGL está soportado (versión simplificada)
 * Útil para checks rápidos sin obtener detalles
 * 
 * @returns true si WebGL está disponible
 */
export function isWebGLSupported(): boolean {
    try {
        const canvas = document.createElement('canvas');
        return !!(
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')
        );
    } catch {
        return false;
    }
}

/**
 * Verifica si Canvas 2D está soportado
 * 
 * @returns true si Canvas 2D está disponible
 */
export function isCanvasSupported(): boolean {
    try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('2d');
    } catch {
        return false;
    }
}

/**
 * Verifica si SVG está soportado
 * 
 * @returns true si SVG está disponible
 */
export function isSVGSupported(): boolean {
    return typeof document.createElementNS === 'function' &&
        typeof SVGElement !== 'undefined';
}
