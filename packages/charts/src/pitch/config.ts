import { PitchConfig, DeepPartialPitchConfig } from './types';
import { FIFA_DIMENSIONS, LIGHT_THEME } from './constants';

export function createPitchConfig(config: DeepPartialPitchConfig): PitchConfig {
    const dimensions = {
        ...FIFA_DIMENSIONS,
        ...(config.dimensions || {}),
    };

    if (dimensions.width < 50 || dimensions.height < 30) {
        throw new Error('Pitch dimensions too small');
    }

    const theme = {
        ...LIGHT_THEME,
        ...(config.theme || {}),
    };

    return {
        container: config.container,
        orientation: config.orientation || 'horizontal',
        dimensions,
        theme,
    };
}
