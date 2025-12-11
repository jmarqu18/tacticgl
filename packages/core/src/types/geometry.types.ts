/**
 * Coordenadas 2D normalizadas (0-100)
 * Representan posición relativa en el campo de fútbol
 * - x: 0 = línea de fondo izquierda, 100 = línea de fondo derecha
 * - y: 0 = banda inferior, 100 = banda superior
 * 
 * @example
 * ```ts
 * const centerField: Position2D = { x: 50, y: 50 };
 * const topRightCorner: Position2D = { x: 100, y: 100 };
 * ```
 */
export interface Position2D {
    readonly x: number;  // 0-100
    readonly y: number;  // 0-100
}

/**
 * Coordenadas en píxeles/unidades de renderizado
 * 
 * @example
 * ```ts
 * const screenPos: PixelPosition = { x: 640, y: 480 };
 * ```
 */
export interface PixelPosition {
    readonly x: number;
    readonly y: number;
}

/**
 * Dimensiones de un área rectangular
 * 
 * @example
 * ```ts
 * const canvasSize: Dimensions = { width: 1280, height: 720 };
 * ```
 */
export interface Dimensions {
    readonly width: number;
    readonly height: number;
}

/**
 * Padding/márgenes en las 4 direcciones
 * 
 * @example
 * ```ts
 * const padding: Padding = { top: 20, right: 20, bottom: 20, left: 20 };
 * ```
 */
export interface Padding {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
}

/**
 * Bounding box de un elemento
 * Define la posición y dimensiones de un rectángulo
 * 
 * @example
 * ```ts
 * const box: BoundingBox = { x: 100, y: 50, width: 200, height: 150 };
 * ```
 */
export interface BoundingBox {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}

/**
 * Orientación del campo
 * - horizontal: Campo apaisado (ancho > alto)
 * - vertical: Campo vertical (alto > ancho)
 */
export type PitchOrientation = 'horizontal' | 'vertical';
