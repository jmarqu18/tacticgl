import type { Position2D } from './geometry.types';

/**
 * Tipos de eventos soportados en TacticGL
 * Compatible con el formato StatsBomb Open Data y extensible con eventos personalizados
 */
export type EventType =
    | 'shot'
    | 'goal'
    | 'pass'
    | 'carry'
    | 'duel'
    | 'interception'
    | 'clearance'
    | 'block'
    | 'foul'
    | 'pressure'
    | 'ball_receipt'
    | 'ball_recovery'
    | 'dispossessed'
    | 'dribble'
    | 'goalkeeper'
    | 'miscontrol'
    | 'tactical_shift'
    | 'substitution'
    | 'injury_stoppage'
    | 'referee_ball_drop'
    | 'starting_xi'
    | 'half_start'
    | 'half_end'
    | 'own_goal'
    | 'bad_behaviour'
    | 'player_on'
    | 'player_off'
    | 'error'
    | 'offside'
    | 'fifty_fifty'
    | 'shield'
    | 'custom';

/**
 * Resultado de un evento
 * Indica el resultado final de una acción
 */
export type EventOutcome =
    | 'success'
    | 'failure'
    | 'goal'
    | 'saved'
    | 'blocked'
    | 'off_target'
    | 'post'
    | 'wayward'
    | 'incomplete'
    | 'complete'
    | 'won'
    | 'lost';

/**
 * Referencia a un jugador
 * Identificación mínima de un jugador en el sistema
 * 
 * @example
 * ```ts
 * const player: PlayerRef = {
 *   id: 5503,
 *   name: 'Lionel Messi',
 *   jerseyNumber: 10
 * };
 * ```
 */
export interface PlayerRef {
    readonly id: string | number;
    readonly name?: string;
    readonly jerseyNumber?: number;
}

/**
 * Referencia a un equipo
 * Identificación mínima de un equipo en el sistema
 * 
 * @example
 * ```ts
 * const team: TeamRef = {
 *   id: 217,
 *   name: 'Barcelona',
 *   side: 'home'
 * };
 * ```
 */
export interface TeamRef {
    readonly id: string | number;
    readonly name?: string;
    readonly side?: 'home' | 'away';
}

/**
 * Evento normalizado de TacticGL
 * Schema unificado para todos los eventos deportivos
 * 
 * @example
 * ```ts
 * const shotEvent: TacticGLEvent = {
 *   id: 'evt_001',
 *   type: 'shot',
 *   position: { x: 90, y: 45 },
 *   endPosition: { x: 100, y: 50 },
 *   player: { id: 5503, name: 'Lionel Messi', jerseyNumber: 10 },
 *   team: { id: 217, name: 'Barcelona', side: 'home' },
 *   timestamp: 1234,
 *   minute: 45,
 *   second: 30,
 *   period: 1,
 *   outcome: 'goal',
 *   metadata: { xG: 0.76, bodyPart: 'left_foot' }
 * };
 * ```
 */
export interface TacticGLEvent {
    readonly id: string;
    readonly timestamp?: number;        // Segundos desde inicio del partido
    readonly minute?: number;           // Minuto de partido
    readonly second?: number;           // Segundo dentro del minuto
    readonly period?: number;           // 1 = primera parte, 2 = segunda, etc.
    readonly type: EventType;
    readonly position: Position2D;
    readonly endPosition?: Position2D;  // Para pases, carries, etc.
    readonly player?: PlayerRef;
    readonly team: TeamRef;
    readonly outcome?: EventOutcome;
    readonly metadata?: Record<string, unknown>;
}

/**
 * Metadatos de un partido
 * Información general sobre el partido
 * 
 * @example
 * ```ts
 * const matchMeta: MatchMetadata = {
 *   id: 3788741,
 *   date: '2023-05-14T20:00:00Z',
 *   competition: 'La Liga',
 *   season: '2022/2023',
 *   homeTeam: { id: 217, name: 'Barcelona', side: 'home' },
 *   awayTeam: { id: 206, name: 'Espanyol', side: 'away' },
 *   score: { home: 4, away: 2 },
 *   venue: 'Camp Nou'
 * };
 * ```
 */
export interface MatchMetadata {
    readonly id: string | number;
    readonly date?: string;             // ISO 8601
    readonly competition?: string;
    readonly season?: string;
    readonly homeTeam: TeamRef;
    readonly awayTeam: TeamRef;
    readonly score?: {
        readonly home: number;
        readonly away: number;
    };
    readonly venue?: string;
}

/**
 * Alineación de un equipo
 * Define la formación y lista de jugadores
 * 
 * @example
 * ```ts
 * const lineup: TeamLineup = {
 *   team: { id: 217, name: 'Barcelona' },
 *   formation: '4-3-3',
 *   players: [
 *     {
 *       player: { id: 5503, name: 'Lionel Messi', jerseyNumber: 10 },
 *       position: 'RW',
 *       starter: true
 *     }
 *   ]
 * };
 * ```
 */
export interface TeamLineup {
    readonly team: TeamRef;
    readonly formation?: string;        // e.g., "4-3-3"
    readonly players: ReadonlyArray<{
        readonly player: PlayerRef;
        readonly position?: string;       // e.g., "GK", "CB", "CM"
        readonly starter: boolean;
    }>;
}

/**
 * Frame de tracking (datos posicionales)
 * Captura la posición de todos los jugadores y el balón en un momento específico
 * 
 * @example
 * ```ts
 * const frame: TrackingFrame = {
 *   timestamp: 1234.5,
 *   positions: [
 *     {
 *       player: { id: 5503, name: 'Messi' },
 *       team: { id: 217 },
 *       position: { x: 65, y: 45 },
 *       speed: 5.2
 *     },
 *     {
 *       position: { x: 70, y: 50 },
 *       isBall: true
 *     }
 *   ]
 * };
 * ```
 */
export interface TrackingFrame {
    readonly timestamp: number;
    readonly positions: ReadonlyArray<{
        readonly player?: PlayerRef;
        readonly team?: TeamRef;
        readonly position: Position2D;
        readonly speed?: number;          // m/s
        readonly isBall?: boolean;
    }>;
}

/**
 * Partido normalizado completo
 * Contiene todos los datos de un partido: metadata, eventos, alineaciones y tracking
 * 
 * @example
 * ```ts
 * const match: NormalizedMatch = {
 *   meta: { ... },
 *   events: [ ... ],
 *   lineups: [ ... ],
 *   tracking: [ ... ]
 * };
 * ```
 */
export interface NormalizedMatch {
    readonly meta: MatchMetadata;
    readonly events: ReadonlyArray<TacticGLEvent>;
    readonly lineups: ReadonlyArray<TeamLineup>;
    readonly tracking?: ReadonlyArray<TrackingFrame>;
}

/**
 * Elemento primitivo de renderizado
 * Define los elementos básicos que se pueden renderizar
 * 
 * @example
 * ```ts
 * const circle: RenderElement = {
 *   type: 'circle',
 *   x: 50,
 *   y: 50,
 *   attributes: { r: 5, fill: 'red' }
 * };
 * 
 * const group: RenderElement = {
 *   type: 'group',
 *   children: [circle]
 * };
 * ```
 */
export interface RenderElement {
    readonly type: 'circle' | 'rect' | 'line' | 'path' | 'text' | 'group';
    readonly x?: number;
    readonly y?: number;
    readonly attributes?: Record<string, string | number>;
    readonly children?: ReadonlyArray<RenderElement>;
}

/**
 * Datos normalizados para renderizado
 * Estructura genérica que acepta el renderer
 * 
 * @example
 * ```ts
 * const data: NormalizedData = {
 *   events: [ ... ],
 *   tracking: [ ... ],
 *   elements: [ ... ]
 * };
 * ```
 */
export interface NormalizedData {
    readonly events?: ReadonlyArray<TacticGLEvent>;
    readonly tracking?: ReadonlyArray<TrackingFrame>;
    readonly elements?: ReadonlyArray<RenderElement>;
}
