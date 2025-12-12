import { Pitch } from '../pitch/Pitch';
import { DeepPartialPitchConfig } from '../pitch/types';

/**
 * Creates and renders a new Pitch instance.
 * 
 * @param container - The DOM element or selector string to render the pitch into.
 * @param config - Optional configuration for the pitch (dimensions, theme, orientation).
 * @returns The initialized and rendered Pitch instance.
 * 
 * @example
 * ```typescript
 * const pitch = createPitch('#pitch-container', { theme: 'dark' });
 * pitch.add(myShotMap);
 * ```
 */
export function createPitch(
    container: HTMLElement | string,
    config?: Omit<DeepPartialPitchConfig, 'container'>
): Pitch {
    const pitch = new Pitch({
        container,
        ...config
    });

    pitch.render();

    return pitch;
}
