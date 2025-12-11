/**
 * @module @tacticgl/core/engine
 * 
 * Módulo del motor de renderizado de TacticGL
 * Proporciona factory para selección automática de renderers
 * y detección de capacidades del navegador
 */

// RenderEngine - Factory principal
export { RenderEngine, RendererNotSupportedError } from './RenderEngine';

// Capabilities - Detección de capacidades del navegador
export {
    detectWebGL,
    detectCanvas,
    detectSVG,
    detectAllCapabilities,
    isWebGLSupported,
    isCanvasSupported,
    isSVGSupported
} from './capabilities';

// Re-export types for convenience
export type {
    WebGLCapabilities,
    CanvasCapabilities,
    SVGCapabilities,
    BrowserCapabilities
} from './capabilities';
