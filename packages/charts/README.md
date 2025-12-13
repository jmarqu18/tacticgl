# @tacticgl/charts

Visualizaciones de datos deportivos de alto rendimiento para la web. Construido sobre `@tacticgl/core`.

## Instalación

```bash
pnpm add @tacticgl/charts
```

## Uso Rápido (`createPitch`)

La forma más sencilla de crear un campo de fútbol interactivo es usando la función `createPitch`.

```typescript
import { createPitch } from '@tacticgl/charts';

// Renderizar un campo básico en el contenedor con ID 'pitch'
const pitch = createPitch('#pitch');

// Con configuración personalizada
const darkPitch = createPitch('#dark-pitch-container', {
  theme: { name: 'dark' },
  orientation: 'vertical',
  dimensions: { width: 105, height: 68 } // Opcional, por defecto FIFA
});
```

## Clase `Pitch`

Para un control más granular, puedes instanciar la clase `Pitch` directamente.

```typescript
import { Pitch, DARK_THEME } from '@tacticgl/charts';

const pitch = new Pitch({
  container: document.getElementById('my-pitch'),
  theme: DARK_THEME,
  orientation: 'horizontal'
});

pitch.render();

// Cambiar tema dinámicamente
pitch.setTheme('light');

// Cambiar orientación
pitch.setOrientation('vertical');

// Limpiar recursos
pitch.destroy();
```

## Visualizaciones

Puedes añadir capas de visualización al campo (como mapas de calor, mapas de tiros, etc.) usando el método `add()`.

```typescript
// Encadenamiento soportado por createPitch
const pitch = createPitch('#pitch');

// Añadir un ShotMap
import { shotMap, ShotOutcome } from '@tacticgl/charts';

shotMap(pitch, shotsData, {
  filter: { teamId: 1 },
  colors: { [ShotOutcome.Goal]: '#00ff00' }
});
```

## API `shotMap`

Helper para añadir rápidamente una visualización de tiros.

```typescript
import { createPitch, shotMap } from '@tacticgl/charts';

const pitch = createPitch('#container');

// Añadir visualización y obtener la instancia
const map = shotMap(pitch, myShots);

// Interactuar con la instancia
map.highlight('shot-1');
map.setFilter({ playerId: 10 });

