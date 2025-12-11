/**
 * @module data/validators
 */

import { POSITION_BOUNDS, isValidEventType } from './Schema';

/**
 * Result of a validation operation
 */
export interface ValidationResult {
    /** Whether the validation passed */
    readonly isValid: boolean;
    /** Array of error messages if validation failed */
    readonly errors: readonly string[];
}

/**
 * Options for event validation
 */
export interface ValidationOptions {
    /** Whether to validate position bounds (default: true) */
    readonly validatePositionBounds?: boolean;
    /** Whether to validate event type against known types (default: true) */
    readonly validateEventType?: boolean;
    /** Custom position bounds to validate against */
    readonly positionBounds?: { min: number; max: number };
}

const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
    validatePositionBounds: true,
    validateEventType: true
};

/**
 * Validate a Position2D object
 * 
 * @param position - Position to validate
 * @param fieldName - Name of the field for error messages
 * @param bounds - Position bounds to validate against
 * @returns Array of error messages (empty if valid)
 */
export function validatePosition(
    position: unknown,
    fieldName = 'position',
    bounds: { readonly min: number; readonly max: number } = POSITION_BOUNDS
): string[] {
    const errors: string[] = [];

    if (!position || typeof position !== 'object') {
        errors.push(`${fieldName} must be a valid Position2D object`);
        return errors;
    }

    const pos = position as Record<string, unknown>;

    if (typeof pos.x !== 'number') {
        errors.push(`${fieldName}.x must be a number`);
    } else if (pos.x < bounds.min || pos.x > bounds.max) {
        errors.push(`${fieldName}.x must be between ${bounds.min} and ${bounds.max}`);
    }

    if (typeof pos.y !== 'number') {
        errors.push(`${fieldName}.y must be a number`);
    } else if (pos.y < bounds.min || pos.y > bounds.max) {
        errors.push(`${fieldName}.y must be between ${bounds.min} and ${bounds.max}`);
    }

    return errors;
}

/**
 * Validate a TeamRef object
 * 
 * @param team - Team reference to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateTeamRef(team: unknown): string[] {
    const errors: string[] = [];

    if (!team || typeof team !== 'object') {
        errors.push('team is required');
        return errors;
    }

    const teamObj = team as Record<string, unknown>;

    if (teamObj.id === undefined || teamObj.id === null) {
        errors.push('team.id is required');
    } else if (typeof teamObj.id !== 'string' && typeof teamObj.id !== 'number') {
        errors.push('team.id must be a string or number');
    }

    if (teamObj.name !== undefined && typeof teamObj.name !== 'string') {
        errors.push('team.name must be a string if provided');
    }

    if (teamObj.side !== undefined && !['home', 'away'].includes(teamObj.side as string)) {
        errors.push('team.side must be "home" or "away" if provided');
    }

    return errors;
}

/**
 * Validate a TacticGLEvent object
 * 
 * @param event - Event to validate
 * @param options - Validation options
 * @returns Validation result with isValid flag and error messages
 * 
 * @example
 * ```ts
 * const result = validateEvent({
 *   id: '123',
 *   type: 'shot',
 *   position: { x: 50, y: 50 },
 *   team: { id: 1, name: 'Home' }
 * });
 * 
 * if (!result.isValid) {
 *   console.error('Invalid event:', result.errors);
 * }
 * ```
 */
export function validateEvent(
    event: unknown,
    options: ValidationOptions = {}
): ValidationResult {
    const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
    const errors: string[] = [];

    // Check if event is an object
    if (!event || typeof event !== 'object') {
        return {
            isValid: false,
            errors: ['Event must be a valid object']
        };
    }

    const evt = event as Record<string, unknown>;

    // Validate id (required)
    if (evt.id === undefined || evt.id === null || evt.id === '') {
        errors.push('id is required');
    } else if (typeof evt.id !== 'string' && typeof evt.id !== 'number') {
        errors.push('id must be a string or number');
    }

    // Validate type (required)
    if (evt.type === undefined || evt.type === null || evt.type === '') {
        errors.push('type is required');
    } else if (typeof evt.type !== 'string') {
        errors.push('type must be a string');
    } else if (opts.validateEventType && !isValidEventType(evt.type)) {
        errors.push(`type "${evt.type}" is not a valid event type`);
    }

    // Validate position (required)
    if (evt.position === undefined || evt.position === null) {
        errors.push('position is required');
    } else {
        const positionBounds = opts.positionBounds ?? POSITION_BOUNDS;
        const positionErrors = opts.validatePositionBounds
            ? validatePosition(evt.position, 'position', positionBounds)
            : validatePosition(evt.position, 'position', { min: -Infinity, max: Infinity });
        errors.push(...positionErrors);
    }

    // Validate team (required)
    if (evt.team === undefined || evt.team === null) {
        errors.push('team is required');
    } else {
        errors.push(...validateTeamRef(evt.team));
    }

    // Validate endPosition (optional)
    if (evt.endPosition !== undefined && evt.endPosition !== null) {
        const positionBounds = opts.positionBounds ?? POSITION_BOUNDS;
        const endPositionErrors = opts.validatePositionBounds
            ? validatePosition(evt.endPosition, 'endPosition', positionBounds)
            : validatePosition(evt.endPosition, 'endPosition', { min: -Infinity, max: Infinity });
        errors.push(...endPositionErrors);
    }

    // Validate timestamp, minute, second, period (optional numeric fields)
    const numericFields = ['timestamp', 'minute', 'second', 'period'] as const;
    for (const field of numericFields) {
        if (evt[field] !== undefined && evt[field] !== null && typeof evt[field] !== 'number') {
            errors.push(`${field} must be a number if provided`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate an array of events
 * 
 * @param events - Array of events to validate
 * @param options - Validation options
 * @returns Validation result for the entire batch
 * 
 * @example
 * ```ts
 * const result = validateEventBatch([event1, event2, event3]);
 * if (!result.isValid) {
 *   result.errors.forEach((err, idx) => {
 *     console.error(`Event ${idx}:`, err);
 *   });
 * }
 * ```
 */
export function validateEventBatch(
    events: unknown[],
    options: ValidationOptions = {}
): ValidationResult {
    if (!Array.isArray(events)) {
        return {
            isValid: false,
            errors: ['Events must be an array']
        };
    }

    const allErrors: string[] = [];

    events.forEach((event, index) => {
        const result = validateEvent(event, options);
        if (!result.isValid) {
            allErrors.push(`Event[${index}]: ${result.errors.join(', ')}`);
        }
    });

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
}

/**
 * Check if a raw event has the minimum required fields for normalization
 * This is a quick check before attempting full normalization
 * 
 * @param event - Raw event to check
 * @returns Whether the event can potentially be normalized
 */
export function canNormalize(event: unknown): boolean {
    if (!event || typeof event !== 'object') {
        return false;
    }

    const evt = event as Record<string, unknown>;

    // Must have type
    if (!evt.type) {
        return false;
    }

    // Must have team with at least an id
    if (!evt.team || typeof evt.team !== 'object') {
        return false;
    }

    const team = evt.team as Record<string, unknown>;
    if (team.id === undefined || team.id === null) {
        return false;
    }

    // Must have some form of position
    if (
        !evt.position &&
        !evt.location &&
        !evt.coordinates &&
        !evt.pos &&
        !evt.start_location &&
        !evt.startLocation
    ) {
        return false;
    }

    return true;
}
