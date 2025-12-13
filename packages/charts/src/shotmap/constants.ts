import { ShotOutcome, type ShotMapConfig } from './types';

/**
 * Colores por defecto para cada resultado de tiro
 */
export const SHOT_OUTCOME_COLORS: Record<ShotOutcome, string> = {
    [ShotOutcome.Goal]: '#22c55e',
    [ShotOutcome.Saved]: '#3b82f6',
    [ShotOutcome.Blocked]: '#a855f7',
    [ShotOutcome.OffTarget]: '#ef4444',
    [ShotOutcome.Post]: '#eab308',
};

/**
 * Configuración por defecto para el ShotMap
 */
export const DEFAULT_SHOTMAP_CONFIG: ShotMapConfig = {
    sizeScale: {
        minRadius: 4,
        maxRadius: 20,
        basedOn: 'xG',
    },
    colors: SHOT_OUTCOME_COLORS,
    filter: {},
};

/**
 * Crea una configuración de ShotMap con opciones personalizadas
 * @param options Opciones parciales de configuración
 * @returns Configuración completa de ShotMap
 */
export function createShotMapConfig(options: Partial<ShotMapConfig>): ShotMapConfig {
    return {
        ...DEFAULT_SHOTMAP_CONFIG,
        ...options,
        sizeScale: {
            ...DEFAULT_SHOTMAP_CONFIG.sizeScale,
            ...(options.sizeScale || {}),
        },
        colors: {
            ...DEFAULT_SHOTMAP_CONFIG.colors,
            ...(options.colors || {}),
        },
        filter: {
            ...DEFAULT_SHOTMAP_CONFIG.filter,
            ...(options.filter || {}),
        },
    };
}
