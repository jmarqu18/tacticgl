import type { Padding, PitchOrientation } from './geometry.types';

/**
 * Tema visual
 * Define el esquema de colores de la aplicación
 */
export type Theme = 'light' | 'dark' | 'custom';

/**
 * Configuración de dimensiones del campo
 * Dimensiones reales en metros
 * 
 * @example
 * ```ts
 * const standardPitch: PitchDimensions = {
 *   width: 105,  // metros
 *   height: 68   // metros
 * };
 * ```
 */
export interface PitchDimensions {
    readonly width: number;   // metros (default: 105)
    readonly height: number;  // metros (default: 68)
}

/**
 * Configuración base de renderizado
 * Define cómo se debe renderizar el contenido
 * 
 * @example
 * ```ts
 * const config: RenderConfig = {
 *   width: 1280,
 *   height: 720,
 *   responsive: true,
 *   pitchDimensions: { width: 105, height: 68 },
 *   orientation: 'horizontal',
 *   padding: { top: 20, right: 20, bottom: 20, left: 20 },
 *   theme: 'dark',
 *   backgroundColor: '#1a1a1a',
 *   pixelRatio: 2
 * };
 * ```
 */
export interface RenderConfig {
    readonly width?: number;            // Ancho del canvas/SVG en píxeles
    readonly height?: number;           // Alto del canvas/SVG en píxeles
    readonly responsive?: boolean;      // Ajustar al contenedor (default: true)
    readonly pitchDimensions?: PitchDimensions;
    readonly orientation?: PitchOrientation;
    readonly padding?: Partial<Padding>;
    readonly theme?: Theme;
    readonly backgroundColor?: string;
    readonly pixelRatio?: number;       // Para HiDPI displays
}

/**
 * Opciones de renderizado por frame
 * Define comportamientos específicos al renderizar
 * 
 * @example
 * ```ts
 * const options: RenderOptions = {
 *   layer: 'events-layer',
 *   clear: true,
 *   animate: true
 * };
 * ```
 */
export interface RenderOptions {
    readonly layer?: string;            // ID de la capa destino
    readonly clear?: boolean;           // Limpiar capa antes de renderizar
    readonly animate?: boolean;         // Aplicar animación de entrada
}

/**
 * Funciones de easing disponibles
 * Define las curvas de animación
 */
export type EasingFunction =
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'ease-in-quad'
    | 'ease-out-quad'
    | 'ease-in-cubic'
    | 'ease-out-cubic';

/**
 * Configuración de transiciones/animaciones
 * Define parámetros de animación
 * 
 * @example
 * ```ts
 * const transition: TransitionConfig = {
 *   duration: 500,
 *   easing: 'ease-in-out',
 *   delay: 100
 * };
 * ```
 */
export interface TransitionConfig {
    readonly duration?: number;         // ms (default: 300)
    readonly easing?: EasingFunction;
    readonly delay?: number;            // ms
}

/**
 * Configuración de una capa
 * Define propiedades de una capa de renderizado
 * 
 * @example
 * ```ts
 * const layerConfig: LayerConfig = {
 *   id: 'background',
 *   zIndex: 0,
 *   visible: true,
 *   opacity: 1,
 *   interactive: false
 * };
 * ```
 */
export interface LayerConfig {
    readonly id: string;
    readonly zIndex: number;
    readonly visible?: boolean;
    readonly opacity?: number;          // 0-1
    readonly interactive?: boolean;     // Responde a eventos de mouse
}
