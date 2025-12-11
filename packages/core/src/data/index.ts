/**
 * TacticGL Data Module
 * Event normalization and validation utilities
 * 
 * @module data
 */

// Schema constants and utilities
export {
    REQUIRED_EVENT_FIELDS,
    OPTIONAL_EVENT_FIELDS,
    POSITION_BOUNDS,
    VALID_EVENT_TYPES,
    VALID_EVENT_OUTCOMES,
    KNOWN_SCHEMA_FIELDS,
    FIELD_MAPPINGS,
    isValidEventType,
    isValidEventOutcome,
    isPositionInBounds
} from './Schema';

// Validators
export {
    validateEvent,
    validatePosition,
    validateTeamRef,
    validateEventBatch,
    canNormalize
} from './validators';

export type {
    ValidationResult,
    ValidationOptions
} from './validators';

// Event Normalizer
export { EventNormalizer } from './EventNormalizer';

export type {
    NormalizationOptions,
    RawEvent
} from './EventNormalizer';
