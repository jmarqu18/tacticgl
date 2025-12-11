/**
 * PitchScale - Sistema de conversión de coordenadas para campos de fútbol
 * 
 * Convierte coordenadas normalizadas (0-100) a coordenadas de píxeles/SVG units
 * y viceversa, manejando las dimensiones estándar de un campo de fútbol.
 * 
 * @example
 * ```ts
 * const scale = new PitchScale({ width: 105, height: 68 });
 * 
 * // Convertir coordenadas normalizadas a píxeles
 * const pixel = scale.toPixel({ x: 50, y: 50 });
 * // => { x: 52.5, y: 34 }
 * 
 * // Convertir píxeles a coordenadas normalizadas
 * const normalized = scale.toNormalized({ x: 52.5, y: 34 });
 * // => { x: 50, y: 50 }
 * ```
 * 
 * @module scales
 */

import type {
    Position2D,
    PixelPosition,
    Dimensions,
    Padding,
    PitchOrientation
} from '../types/index';

/**
 * Configuración para crear una instancia de PitchScale
 */
export interface PitchScaleConfig {
    /** Ancho del campo en unidades de renderizado (default: 105 - FIFA estándar) */
    readonly width?: number;
    /** Alto del campo en unidades de renderizado (default: 68 - FIFA estándar) */
    readonly height?: number;
    /** Orientación del campo (default: 'horizontal') */
    readonly orientation?: PitchOrientation;
    /** Padding alrededor del campo */
    readonly padding?: Partial<Padding>;
}

/**
 * Padding por defecto (sin márgenes)
 */
const DEFAULT_PADDING: Readonly<Padding> = Object.freeze({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
});

/**
 * Dimensiones FIFA estándar para un campo de fútbol
 * - Largo: 105 metros
 * - Ancho: 68 metros
 */
const FIFA_STANDARD_DIMENSIONS: Readonly<Dimensions> = Object.freeze({
    width: 105,
    height: 68,
});

/**
 * Distancia del punto de penalti desde la línea de gol (11 metros)
 * Expresada como porcentaje del largo total del campo
 */
const PENALTY_SPOT_DISTANCE_PERCENT = (11 / 105) * 100;

/**
 * PitchScale: Clase inmutable para conversión de coordenadas en campos de fútbol
 * 
 * Esta clase proporciona:
 * - Conversión bidireccional entre coordenadas normalizadas (0-100) y píxeles
 * - Soporte para orientación horizontal y vertical
 * - Padding configurable
 * - Métodos helper para landmarks del campo (centro, penaltis, porterías)
 * 
 * La clase es completamente inmutable después de su creación.
 */
export class PitchScale {
    /** Dimensiones del campo en unidades de renderizado */
    readonly #dimensions: Readonly<Dimensions>;

    /** Orientación del campo */
    readonly #orientation: PitchOrientation;

    /** Padding alrededor del campo */
    readonly #padding: Readonly<Padding>;

    /**
     * Crea una nueva instancia de PitchScale
     * 
     * @param config - Configuración opcional para el scale
     */
    constructor(config: PitchScaleConfig = {}) {
        const {
            width = FIFA_STANDARD_DIMENSIONS.width,
            height = FIFA_STANDARD_DIMENSIONS.height,
            orientation = 'horizontal',
            padding = {},
        } = config;

        // Crear objetos inmutables para dimensiones y padding
        this.#dimensions = Object.freeze({
            width,
            height,
        });

        this.#padding = Object.freeze({
            ...DEFAULT_PADDING,
            ...padding,
        });

        this.#orientation = orientation;
    }

    /**
     * Obtiene las dimensiones del campo (readonly)
     * 
     * @returns Dimensiones inmutables del campo
     */
    get dimensions(): Readonly<Dimensions> {
        // Retornamos el objeto frozen directamente
        return this.#dimensions;
    }

    /**
     * Obtiene la orientación del campo
     * 
     * @returns 'horizontal' o 'vertical'
     */
    get orientation(): PitchOrientation {
        return this.#orientation;
    }

    /**
     * Obtiene el padding configurado (readonly)
     * 
     * @returns Padding inmutable
     */
    get padding(): Readonly<Padding> {
        return this.#padding;
    }

    /**
     * Obtiene las dimensiones totales incluyendo padding
     * 
     * @returns Dimensiones totales con padding
     */
    get totalDimensions(): Readonly<Dimensions> {
        return Object.freeze({
            width: this.#dimensions.width + this.#padding.left + this.#padding.right,
            height: this.#dimensions.height + this.#padding.top + this.#padding.bottom,
        });
    }

    /**
     * Convierte coordenadas normalizadas (0-100) a coordenadas de renderizado (píxeles/SVG units)
     * 
     * En orientación horizontal:
     * - x: 0-100 → 0-width
     * - y: 0-100 → 0-height
     * 
     * En orientación vertical:
     * - x: 0-100 → 0-width (que es más corto)
     * - y: 0-100 → 0-height (que es más largo)
     * 
     * @param point - Coordenadas normalizadas (0-100)
     * @returns Coordenadas en unidades de renderizado
     * 
     * @example
     * ```ts
     * const scale = new PitchScale({ width: 105, height: 68 });
     * scale.toPixel({ x: 50, y: 50 }); // { x: 52.5, y: 34 }
     * scale.toPixel({ x: 0, y: 0 });   // { x: 0, y: 0 }
     * scale.toPixel({ x: 100, y: 100 }); // { x: 105, y: 68 }
     * ```
     */
    toPixel(point: Position2D): PixelPosition {
        const { x: normX, y: normY } = point;

        // Calcular coordenadas base (sin padding)
        const baseX = (normX / 100) * this.#dimensions.width;
        const baseY = (normY / 100) * this.#dimensions.height;

        // Aplicar padding
        const pixelX = baseX + this.#padding.left;
        const pixelY = baseY + this.#padding.top;

        return { x: pixelX, y: pixelY };
    }

    /**
     * Convierte coordenadas de renderizado a coordenadas normalizadas (0-100)
     * 
     * Esta operación es la inversa de toPixel().
     * Las coordenadas fuera del rango válido NO se restringen (no se hace clamping),
     * permitiendo detectar elementos fuera del campo.
     * 
     * @param pixel - Coordenadas en unidades de renderizado
     * @returns Coordenadas normalizadas (pueden ser < 0 o > 100 si están fuera del campo)
     * 
     * @example
     * ```ts
     * const scale = new PitchScale({ width: 105, height: 68 });
     * scale.toNormalized({ x: 52.5, y: 34 }); // { x: 50, y: 50 }
     * scale.toNormalized({ x: 200, y: 200 }); // { x: ~190, y: ~294 } (fuera de bounds)
     * ```
     */
    toNormalized(pixel: PixelPosition): Position2D {
        const { x: pixelX, y: pixelY } = pixel;

        // Restar padding y convertir a coordenadas normalizadas
        const baseX = pixelX - this.#padding.left;
        const baseY = pixelY - this.#padding.top;

        const normX = (baseX / this.#dimensions.width) * 100;
        const normY = (baseY / this.#dimensions.height) * 100;

        return { x: normX, y: normY };
    }

    /**
     * Obtiene las coordenadas del centro del campo en unidades de renderizado
     * 
     * @returns Posición del centro del campo (punto central)
     * 
     * @example
     * ```ts
     * const scale = new PitchScale({ width: 105, height: 68 });
     * scale.getCenterSpot(); // { x: 52.5, y: 34 }
     * ```
     */
    getCenterSpot(): PixelPosition {
        return this.toPixel({ x: 50, y: 50 });
    }

    /**
     * Obtiene las coordenadas del punto de penalti
     * 
     * El punto de penalti está a 11 metros de la línea de gol.
     * En coordenadas normalizadas, esto equivale aproximadamente a:
     * - Izquierdo: x ≈ 10.48 (11/105 * 100)
     * - Derecho: x ≈ 89.52 (100 - 11/105 * 100)
     * 
     * @param side - 'left' para portería izquierda, 'right' para portería derecha
     * @returns Posición del punto de penalti en unidades de renderizado
     * 
     * @example
     * ```ts
     * const scale = new PitchScale({ width: 105, height: 68 });
     * scale.getPenaltySpot('left');  // { x: ~11, y: 34 }
     * scale.getPenaltySpot('right'); // { x: ~94, y: 34 }
     * ```
     */
    getPenaltySpot(side: 'left' | 'right'): PixelPosition {
        const normalizedX = side === 'left'
            ? PENALTY_SPOT_DISTANCE_PERCENT
            : 100 - PENALTY_SPOT_DISTANCE_PERCENT;

        return this.toPixel({ x: normalizedX, y: 50 });
    }

    /**
     * Obtiene las coordenadas del centro de la portería
     * 
     * @param side - 'left' para portería izquierda, 'right' para portería derecha
     * @returns Posición del centro de la portería en unidades de renderizado
     * 
     * @example
     * ```ts
     * const scale = new PitchScale({ width: 105, height: 68 });
     * scale.getGoalCenter('left');  // { x: 0, y: 34 }
     * scale.getGoalCenter('right'); // { x: 105, y: 34 }
     * ```
     */
    getGoalCenter(side: 'left' | 'right'): PixelPosition {
        const normalizedX = side === 'left' ? 0 : 100;
        return this.toPixel({ x: normalizedX, y: 50 });
    }

    /**
     * Obtiene las coordenadas de una esquina del campo
     * 
     * @param corner - Esquina del campo ('top-left', 'top-right', 'bottom-left', 'bottom-right')
     * @returns Posición de la esquina en unidades de renderizado
     * 
     * @example
     * ```ts
     * const scale = new PitchScale({ width: 105, height: 68 });
     * scale.getCorner('top-left');     // { x: 0, y: 0 }
     * scale.getCorner('bottom-right'); // { x: 105, y: 68 }
     * ```
     */
    getCorner(corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): PixelPosition {
        const positions: Record<string, Position2D> = {
            'top-left': { x: 0, y: 0 },
            'top-right': { x: 100, y: 0 },
            'bottom-left': { x: 0, y: 100 },
            'bottom-right': { x: 100, y: 100 },
        };

        return this.toPixel(positions[corner]);
    }

    /**
     * Crea una nueva instancia de PitchScale con padding diferente
     * 
     * Como PitchScale es inmutable, este método retorna una nueva instancia.
     * 
     * @param padding - Nuevo padding a aplicar
     * @returns Nueva instancia de PitchScale con el padding actualizado
     * 
     * @example
     * ```ts
     * const scale = new PitchScale({ width: 105, height: 68 });
     * const withPadding = scale.withPadding({ top: 10, left: 10 });
     * ```
     */
    withPadding(padding: Partial<Padding>): PitchScale {
        return new PitchScale({
            width: this.#dimensions.width,
            height: this.#dimensions.height,
            orientation: this.#orientation,
            padding: { ...this.#padding, ...padding },
        });
    }

    /**
     * Crea una nueva instancia de PitchScale con dimensiones diferentes
     * 
     * Como PitchScale es inmutable, este método retorna una nueva instancia.
     * 
     * @param dimensions - Nuevas dimensiones a aplicar
     * @returns Nueva instancia de PitchScale con las dimensiones actualizadas
     * 
     * @example
     * ```ts
     * const scale = new PitchScale();
     * const custom = scale.withDimensions({ width: 120, height: 75 });
     * ```
     */
    withDimensions(dimensions: Partial<Dimensions>): PitchScale {
        return new PitchScale({
            width: dimensions.width ?? this.#dimensions.width,
            height: dimensions.height ?? this.#dimensions.height,
            orientation: this.#orientation,
            padding: this.#padding,
        });
    }

    /**
     * Crea una nueva instancia de PitchScale con orientación diferente
     * 
     * Como PitchScale es inmutable, este método retorna una nueva instancia.
     * 
     * @param orientation - Nueva orientación
     * @returns Nueva instancia de PitchScale con la orientación actualizada
     * 
     * @example
     * ```ts
     * const scale = new PitchScale();
     * const vertical = scale.withOrientation('vertical');
     * ```
     */
    withOrientation(orientation: PitchOrientation): PitchScale {
        return new PitchScale({
            width: this.#dimensions.width,
            height: this.#dimensions.height,
            orientation,
            padding: this.#padding,
        });
    }
}
