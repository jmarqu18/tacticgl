/**
 * TacticGL Event Normalizer
 * Transforms events from various formats into the unified TacticGL schema
 * 
 * @module data/EventNormalizer
 */

import type { TacticGLEvent, TeamRef, PlayerRef, Position2D, EventType } from '../types/data.types';
import { KNOWN_SCHEMA_FIELDS, FIELD_MAPPINGS, POSITION_BOUNDS } from './Schema';
import { canNormalize, validateEvent } from './validators';

/**
 * Options for the normalization process
 */
export interface NormalizationOptions {
    /** Whether to clamp positions to 0-100 range (default: true) */
    readonly clampPositions?: boolean;
    /** Whether to generate IDs for events without them (default: true) */
    readonly generateIds?: boolean;
    /** Custom source dimensions for coordinate conversion */
    readonly sourceDimensions?: { width: number; height: number };
    /** Whether to preserve unknown fields in metadata (default: true) */
    readonly preserveMetadata?: boolean;
    /** Whether to skip invalid events in batch processing (default: true) */
    readonly skipInvalid?: boolean;
    /** Whether to warn about invalid events in batch processing (default: true) */
    readonly warnOnInvalid?: boolean;
}

const DEFAULT_OPTIONS: NormalizationOptions = {
    clampPositions: true,
    generateIds: true,
    preserveMetadata: true,
    skipInvalid: true,
    warnOnInvalid: true
};

/**
 * Raw event input type - accepts any object-like structure
 */
export type RawEvent = Record<string, unknown>;

/**
 * Generate a unique identifier
 * Uses crypto.randomUUID if available, falls back to custom implementation
 */
function generateUniqueId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Clamp a value to a specified range
 */
function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Convert raw position data to Position2D
 * Supports arrays [x, y] and objects { x, y }
 */
function parsePosition(
    raw: unknown,
    options: NormalizationOptions
): Position2D | null {
    if (raw === null || raw === undefined) {
        return null;
    }

    let x: number;
    let y: number;

    if (Array.isArray(raw) && raw.length >= 2) {
        x = Number(raw[0]);
        y = Number(raw[1]);
    } else if (typeof raw === 'object' && raw !== null) {
        const pos = raw as Record<string, unknown>;
        x = Number(pos.x);
        y = Number(pos.y);
    } else {
        return null;
    }

    if (isNaN(x) || isNaN(y)) {
        return null;
    }

    // Apply coordinate conversion if source dimensions provided
    if (options.sourceDimensions) {
        x = (x / options.sourceDimensions.width) * 100;
        y = (y / options.sourceDimensions.height) * 100;
    }

    // Clamp to valid range if enabled
    if (options.clampPositions) {
        x = clamp(x, POSITION_BOUNDS.min, POSITION_BOUNDS.max);
        y = clamp(y, POSITION_BOUNDS.min, POSITION_BOUNDS.max);
    }

    return { x, y };
}

/**
 * Parse team reference from raw data
 */
function parseTeamRef(raw: unknown): TeamRef | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const team = raw as Record<string, unknown>;

    if (team.id === undefined || team.id === null) {
        return null;
    }

    const result: TeamRef = {
        id: typeof team.id === 'number' ? team.id : String(team.id)
    };

    // Add optional fields if present
    const teamResult = result as unknown as Record<string, unknown>;

    if (team.name !== undefined && team.name !== null) {
        teamResult.name = String(team.name);
    }

    if (team.side === 'home' || team.side === 'away') {
        teamResult.side = team.side;
    }

    return teamResult as unknown as TeamRef;
}

/**
 * Parse player reference from raw data
 */
function parsePlayerRef(raw: unknown): PlayerRef | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const player = raw as Record<string, unknown>;

    if (player.id === undefined || player.id === null) {
        return null;
    }

    const result: PlayerRef = {
        id: typeof player.id === 'number' ? player.id : String(player.id)
    };

    const playerResult = result as unknown as Record<string, unknown>;

    if (player.name !== undefined && player.name !== null) {
        playerResult.name = String(player.name);
    }

    if (player.jerseyNumber !== undefined && player.jerseyNumber !== null) {
        playerResult.jerseyNumber = Number(player.jerseyNumber);
    } else if (player.jersey_number !== undefined && player.jersey_number !== null) {
        playerResult.jerseyNumber = Number(player.jersey_number);
    }

    return playerResult as unknown as PlayerRef;
}

/**
 * Get a field from raw event, checking mapped field names
 */
function getField(raw: RawEvent, fieldName: string): unknown {
    // First check direct field name
    if (raw[fieldName] !== undefined) {
        return raw[fieldName];
    }

    // Then check mapped field names
    for (const [sourceKey, targetKey] of Object.entries(FIELD_MAPPINGS)) {
        if (targetKey === fieldName && raw[sourceKey] !== undefined) {
            return raw[sourceKey];
        }
    }

    return undefined;
}

/**
 * Extract metadata from raw event
 * Collects all fields that are not part of the core schema
 */
function extractMetadata(raw: RawEvent): Record<string, unknown> | undefined {
    const metadata: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(raw)) {
        if (!KNOWN_SCHEMA_FIELDS.has(key) && value !== undefined) {
            metadata[key] = value;
        }
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
}

/**
 * Event Normalizer class
 * Provides static methods for normalizing events from various formats
 * 
 * @example
 * ```ts
 * // Normalize a single event
 * const normalized = EventNormalizer.normalize({
 *   id: '123',
 *   type: 'shot',
 *   location: [90, 45],
 *   team: { id: 1, name: 'Home' },
 *   xG: 0.76
 * });
 * 
 * // Normalize multiple events
 * const batch = EventNormalizer.normalizeBatch(rawEvents);
 * ```
 */
export class EventNormalizer {
    /**
     * Normalize a single raw event to TacticGLEvent format
     * 
     * @param raw - Raw event data in any supported format
     * @param options - Normalization options
     * @returns Normalized TacticGLEvent
     * @throws Error if required fields cannot be determined
     * 
     * @example
     * ```ts
     * const normalized = EventNormalizer.normalize({
     *   id: '123',
     *   type: 'shot',
     *   location: [60, 40],
     *   team: { id: 1, name: 'Home' }
     * });
     * ```
     */
    static normalize(raw: RawEvent, options: NormalizationOptions = {}): TacticGLEvent {
        const opts = { ...DEFAULT_OPTIONS, ...options };

        // Resolve ID
        let id = raw.id;
        if ((id === undefined || id === null || id === '') && opts.generateIds) {
            id = generateUniqueId();
        }

        // Resolve type
        const typeValue = getField(raw, 'type');
        const type = typeof typeValue === 'string' ? typeValue : String(typeValue);

        // Resolve position (check multiple possible field names)
        const positionRaw = getField(raw, 'position') ??
            raw.location ??
            raw.coordinates ??
            raw.pos ??
            raw.start_location ??
            raw.startLocation;

        const position = parsePosition(positionRaw, opts);
        if (!position) {
            throw new Error('Cannot normalize event: invalid or missing position');
        }

        // Resolve team
        const team = parseTeamRef(raw.team);
        if (!team) {
            throw new Error('Cannot normalize event: invalid or missing team');
        }

        // Build the normalized event
        const normalized: Record<string, unknown> = {
            id: String(id),
            type: type as EventType,
            position,
            team
        };

        // Optional: endPosition
        const endPositionRaw = getField(raw, 'endPosition') ??
            raw.end_location ??
            raw.endLocation ??
            raw.end_coordinates ??
            raw.target;

        if (endPositionRaw !== undefined) {
            const endPosition = parsePosition(endPositionRaw, opts);
            if (endPosition) {
                normalized.endPosition = endPosition;
            }
        }

        // Optional: player
        if (raw.player !== undefined) {
            const player = parsePlayerRef(raw.player);
            if (player) {
                normalized.player = player;
            }
        }

        // Optional: timestamp
        const timestampRaw = getField(raw, 'timestamp') ?? raw.time ?? raw.match_timestamp;
        if (timestampRaw !== undefined && timestampRaw !== null) {
            normalized.timestamp = Number(timestampRaw);
        }

        // Optional: minute
        if (raw.minute !== undefined && raw.minute !== null) {
            normalized.minute = Number(raw.minute);
        }

        // Optional: second
        if (raw.second !== undefined && raw.second !== null) {
            normalized.second = Number(raw.second);
        }

        // Optional: period
        if (raw.period !== undefined && raw.period !== null) {
            normalized.period = Number(raw.period);
        }

        // Optional: outcome
        const outcomeRaw = getField(raw, 'outcome') ?? raw.result;
        if (outcomeRaw !== undefined && outcomeRaw !== null && typeof outcomeRaw === 'string') {
            normalized.outcome = outcomeRaw;
        }

        // Optional: metadata (preserve additional fields)
        if (opts.preserveMetadata) {
            const metadata = extractMetadata(raw);
            if (metadata) {
                normalized.metadata = metadata;
            }
        }

        return normalized as unknown as TacticGLEvent;
    }

    /**
     * Normalize an array of raw events
     * Invalid events are filtered out with optional warnings
     * 
     * @param rawEvents - Array of raw events
     * @param options - Normalization options
     * @returns Array of normalized TacticGLEvents
     * 
     * @example
     * ```ts
     * const normalized = EventNormalizer.normalizeBatch([
     *   { id: '1', type: 'pass', location: [30, 50], team: { id: 1 } },
     *   { id: '2', type: 'shot', location: [85, 45], team: { id: 1 } }
     * ]);
     * ```
     */
    static normalizeBatch(
        rawEvents: RawEvent[],
        options: NormalizationOptions = {}
    ): TacticGLEvent[] {
        const opts = { ...DEFAULT_OPTIONS, ...options };
        const results: TacticGLEvent[] = [];

        for (let i = 0; i < rawEvents.length; i++) {
            const raw = rawEvents[i];

            // Quick check if event can be normalized
            if (!canNormalize(raw)) {
                if (opts.warnOnInvalid) {
                    console.warn(`EventNormalizer: Skipping invalid event at index ${i} - missing required fields`);
                }
                if (opts.skipInvalid) {
                    continue;
                }
            }

            try {
                const normalized = EventNormalizer.normalize(raw, opts);

                // Validate the normalized event
                const validation = validateEvent(normalized, {
                    validatePositionBounds: opts.clampPositions,
                    validateEventType: false // Allow custom types
                });

                if (!validation.isValid) {
                    if (opts.warnOnInvalid) {
                        console.warn(`EventNormalizer: Invalid event at index ${i}:`, validation.errors);
                    }
                    if (opts.skipInvalid) {
                        continue;
                    }
                }

                results.push(normalized);
            } catch (error) {
                if (opts.warnOnInvalid) {
                    console.warn(`EventNormalizer: Error normalizing event at index ${i}:`, error);
                }
                if (!opts.skipInvalid) {
                    throw error;
                }
            }
        }

        return results;
    }

    /**
     * Convert coordinates from source dimensions to normalized 0-100 range
     * Useful for converting StatsBomb (120x80) or other coordinate systems
     * 
     * @param x - X coordinate in source dimensions
     * @param y - Y coordinate in source dimensions
     * @param sourceDimensions - Source coordinate system dimensions
     * @returns Normalized Position2D with x and y in 0-100 range
     * 
     * @example
     * ```ts
     * // Convert StatsBomb coordinates (120x80) to normalized
     * const pos = EventNormalizer.convertCoordinates(60, 40, { width: 120, height: 80 });
     * // Result: { x: 50, y: 50 }
     * ```
     */
    static convertCoordinates(
        x: number,
        y: number,
        sourceDimensions: { width: number; height: number }
    ): Position2D {
        return {
            x: (x / sourceDimensions.width) * 100,
            y: (y / sourceDimensions.height) * 100
        };
    }

    /**
     * Create a normalization function with preset options
     * Useful for processing multiple events with the same configuration
     * 
     * @param options - Preset normalization options
     * @returns A normalize function with preset options
     * 
     * @example
     * ```ts
     * const statsBombNormalizer = EventNormalizer.withOptions({
     *   sourceDimensions: { width: 120, height: 80 }
     * });
     * 
     * const normalized = statsBombNormalizer.normalize(rawEvent);
     * ```
     */
    static withOptions(options: NormalizationOptions): {
        normalize: (raw: RawEvent) => TacticGLEvent;
        normalizeBatch: (rawEvents: RawEvent[]) => TacticGLEvent[];
    } {
        return {
            normalize: (raw: RawEvent) => EventNormalizer.normalize(raw, options),
            normalizeBatch: (rawEvents: RawEvent[]) => EventNormalizer.normalizeBatch(rawEvents, options)
        };
    }
}
