import type { Position2D, PlayerRef, TeamRef } from '@tacticgl/core';

/**
 * Enumeración de los posibles resultados de un tiro
 */
export enum ShotOutcome {
    Goal = 'goal',
    Saved = 'saved',
    Blocked = 'blocked',
    OffTarget = 'off_target',
    Post = 'post',
}

/**
 * Interfaz que representa un tiro a portería
 */
export interface Shot {
    id: string;
    position: Position2D;
    outcome: ShotOutcome;
    xG: number;
    team: TeamRef;
    player?: PlayerRef;
}

/**
 * Configuración para el componente ShotMap
 */
export interface ShotMapConfig {
    /** Configuración de escala de tamaño basada en xG */
    sizeScale: {
        minRadius: number;
        maxRadius: number;
        basedOn: 'xG';
    };
    /** Mapeo de colores por resultado */
    colors: Record<ShotOutcome, string>;
    /** Filtros activos */
    filter: {
        teamId?: string | number;
        playerId?: string | number;
    };
}
