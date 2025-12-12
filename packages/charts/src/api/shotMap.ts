import { Pitch } from '../pitch';
import { ShotMap, ShotMapConfig, Shot } from '../shotmap';

/**
 * Añade una visualización de mapa de tiros a un Pitch existente
 * 
 * @param pitch Instancia de Pitch donde renderizar el mapa
 * @param data Array de tiros a visualizar
 * @param config Configuración opcional del mapa de tiros (colores, filtros, etc.)
 * @returns La instancia de ShotMap creada
 * 
 * @example
 * ```ts
 * const pitch = createPitch('#container');
 * const shots = [...];
 * const map = shotMap(pitch, shots, { filter: { teamId: 1 } });
 * ```
 */
export function shotMap(
    pitch: Pitch,
    data: Shot[],
    config: Partial<ShotMapConfig> = {}
): ShotMap {
    // Combinamos data y config para crear las opciones
    const map = new ShotMap({
        data,
        ...config
    });

    // Añadimos la visualización al pitch
    pitch.add(map);

    return map;
}
