/**
 * TacticGL Event Schema
 * Defines the structure and constants for normalized events
 * 
 * @module data/Schema
 */

import type { EventType, EventOutcome } from '../types/data.types';

/**
 * Required fields for a valid TacticGLEvent
 * These fields must be present after normalization
 */
export const REQUIRED_EVENT_FIELDS = ['id', 'type', 'position', 'team'] as const;

/**
 * Optional fields that may be present in a TacticGLEvent
 */
export const OPTIONAL_EVENT_FIELDS = [
    'timestamp',
    'minute',
    'second',
    'period',
    'endPosition',
    'player',
    'outcome',
    'metadata'
] as const;

/**
 * Position coordinate bounds (normalized 0-100)
 */
export const POSITION_BOUNDS = {
    min: 0,
    max: 100
} as const;

/**
 * Valid event types supported by TacticGL
 */
export const VALID_EVENT_TYPES: readonly EventType[] = [
    'shot',
    'goal',
    'pass',
    'carry',
    'duel',
    'interception',
    'clearance',
    'block',
    'foul',
    'pressure',
    'ball_receipt',
    'ball_recovery',
    'dispossessed',
    'dribble',
    'goalkeeper',
    'miscontrol',
    'tactical_shift',
    'substitution',
    'injury_stoppage',
    'referee_ball_drop',
    'starting_xi',
    'half_start',
    'half_end',
    'own_goal',
    'bad_behaviour',
    'player_on',
    'player_off',
    'error',
    'offside',
    'fifty_fifty',
    'shield',
    'custom'
] as const;

/**
 * Valid event outcomes
 */
export const VALID_EVENT_OUTCOMES: readonly EventOutcome[] = [
    'success',
    'failure',
    'goal',
    'saved',
    'blocked',
    'off_target',
    'post',
    'wayward',
    'incomplete',
    'complete',
    'won',
    'lost'
] as const;

/**
 * Known fields that are part of the normalized schema
 * Used to separate metadata from core fields
 */
export const KNOWN_SCHEMA_FIELDS = new Set([
    'id',
    'timestamp',
    'minute',
    'second',
    'period',
    'type',
    'position',
    'endPosition',
    'player',
    'team',
    'outcome',
    'metadata',
    // Common raw field aliases
    'location',
    'end_location',
    'endLocation'
]);

/**
 * Field mapping from common data provider formats to TacticGL schema
 * Supports StatsBomb and other popular formats
 */
export const FIELD_MAPPINGS: Record<string, string> = {
    // Position mappings
    'location': 'position',
    'coordinates': 'position',
    'pos': 'position',
    'start_location': 'position',
    'startLocation': 'position',

    // End position mappings
    'end_location': 'endPosition',
    'endLocation': 'endPosition',
    'end_coordinates': 'endPosition',
    'target': 'endPosition',

    // Time mappings
    'time': 'timestamp',
    'match_timestamp': 'timestamp',
    'matchTimestamp': 'timestamp',

    // Other common mappings
    'event_type': 'type',
    'eventType': 'type',
    'result': 'outcome'
} as const;

/**
 * Check if a value is a valid event type
 */
export function isValidEventType(type: unknown): type is EventType {
    return typeof type === 'string' && VALID_EVENT_TYPES.includes(type as EventType);
}

/**
 * Check if a value is a valid event outcome
 */
export function isValidEventOutcome(outcome: unknown): outcome is EventOutcome {
    return typeof outcome === 'string' && VALID_EVENT_OUTCOMES.includes(outcome as EventOutcome);
}

/**
 * Check if a position value is within valid bounds (0-100)
 */
export function isPositionInBounds(value: number): boolean {
    return value >= POSITION_BOUNDS.min && value <= POSITION_BOUNDS.max;
}
