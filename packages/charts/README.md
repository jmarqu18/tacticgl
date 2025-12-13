# @tacticgl/charts

Visualizaciones de datos deportivos de alto rendimiento para la web. Construido sobre `@tacticgl/core`.

## 📖 Índice

- [Instalación](#instalación)
- [Guía de Inicio Rápido](#guía-de-inicio-rápido)
- [API Reference](#api-reference)
  - [createPitch](#createpitch)
  - [Clase Pitch](#clase-pitch)
  - [Clase ShotMap](#clase-shotmap)
- [Ejemplos Completos](#ejemplos-completos)
- [Configuración Avanzada](#configuración-avanzada)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)

## 🚀 Instalación

### Prerrequisitos

Asegúrate de tener instalado `d3@^7.0.0` como peer dependency:

```bash
npm install d3@^7.0.0
# o
pnpm add d3@^7.0.0
# o
yarn add d3@^7.0.0
```

### Instalar @tacticgl/charts

```bash
npm install @tacticgl/charts
# o
pnpm add @tacticgl/charts
# o
yarn add @tacticgl/charts
```

### Verificación de instalación

```typescript
import { createPitch, ShotOutcome } from '@tacticgl/charts';

// Verificar que los exports están disponibles
console.log('✅ @tacticgl/charts instalado correctamente');
```

## 🎯 Guía de Inicio Rápido

### Ejemplo Básico

```typescript
import { createPitch } from '@tacticgl/charts';

// 1. Crear un contenedor HTML
const container = document.getElementById('pitch');

// 2. Crear y renderizar el campo
const pitch = createPitch(container);

// 3. ¡Listo! Tu campo está disponible
console.log('Campo renderizado:', pitch);
```

### Ejemplo con ShotMap

```typescript
import { createPitch, shotMap, ShotOutcome } from '@tacticgl/charts';

// Datos de ejemplo
const shotsData = [
    {
        id: 'shot-1',
        position: { x: 88, y: 45 },
        outcome: ShotOutcome.Goal,
        xG: 0.76,
        team: { id: 1, name: 'Home Team' },
        player: { id: 'p1', name: 'Messi' }
    },
    {
        id: 'shot-2',
        position: { x: 92, y: 55 },
        outcome: ShotOutcome.Saved,
        xG: 0.23,
        team: { id: 1, name: 'Home Team' }
    }
];

// Crear campo con datos
const pitch = createPitch('#pitch');
const shotMapViz = shotMap(pitch, shotsData);

// Filtrar solo goles
shotMapViz.setFilter({ teamId: 1 });
```

## 📚 API Reference

### `createPitch`

Función helper para crear y renderizar rápidamente un campo de fútbol.

```typescript
function createPitch(
    container: HTMLElement | string,
    config?: DeepPartialPitchConfig
): Pitch
```

#### Parámetros

- `container`: Elemento DOM o selector CSS
- `config` (opcional): Configuración parcial del campo

#### Ejemplos

```typescript
// Selector CSS
const pitch1 = createPitch('#my-pitch');

// Elemento DOM
const container = document.getElementById('my-pitch');
const pitch2 = createPitch(container);

// Con configuración personalizada
const customPitch = createPitch('#pitch', {
    theme: { name: 'dark' },
    orientation: 'vertical',
    dimensions: { width: 120, height: 80 }
});
```

#### Configuración Disponible

```typescript
interface DeepPartialPitchConfig {
    container?: HTMLElement | string;
    dimensions?: Partial<PitchDimensions>;
    orientation?: 'horizontal' | 'vertical';
    theme?: Partial<PitchTheme>;
}
```

### Clase `Pitch`

Clase principal para crear campos de fútbol con control granular.

```typescript
import { Pitch, FIFA_DIMENSIONS, DARK_THEME } from '@tacticgl/charts';

const pitch = new Pitch({
    container: document.getElementById('my-pitch'),
    dimensions: FIFA_DIMENSIONS,
    theme: DARK_THEME,
    orientation: 'horizontal'
});

pitch.render();
```

#### Métodos Principales

##### `render()`

Renderiza el campo en el contenedor.

```typescript
pitch.render();
```

##### `setTheme(theme)`

Cambia el tema dinámicamente.

```typescript
// Usar tema predefinido
pitch.setTheme('light');

// Usar tema personalizado
pitch.setTheme({
    name: 'custom',
    grass: '#2d5a27',
    lines: '#ffffff',
    goalLine: '#ffffff',
    penaltyArc: '#ffffff',
    centerCircle: '#ffffff'
});
```

##### `setOrientation(orientation)`

Cambia la orientación del campo.

```typescript
pitch.setOrientation('vertical'); // o 'horizontal'
```

##### `add(visualization)`

Añade una capa de visualización al campo.

```typescript
import { shotMap } from '@tacticgl/charts';

const shotViz = shotMap(pitch, shotsData);
pitch.add(shotViz);
```

##### `remove(id)`

Elimina una visualización del campo.

```typescript
pitch.remove('shot-map');
```

##### `destroy()`

Limpia recursos y destruye el campo.

```typescript
pitch.destroy();
```

##### `getScale()`

Obtiene la escala actual para conversiones de coordenadas.

```typescript
const scale = pitch.getScale();
const pixelPosition = scale.toPixel({ x: 50, y: 50 });
const pitchPosition = scale.toScale({ x: 100, y: 100 });
```

### Clase `ShotMap`

Componente para visualizar mapas de tiros.

```typescript
import { ShotMap, ShotOutcome } from '@tacticgl/charts';

const shotMapViz = new ShotMap({
    data: shotsData,
    sizeScale: {
        minRadius: 4,
        maxRadius: 20,
        basedOn: 'xG'
    },
    colors: {
        [ShotOutcome.Goal]: '#22c55e',
        [ShotOutcome.Saved]: '#3b82f6',
        [ShotOutcome.Blocked]: '#a855f7',
        [ShotOutcome.OffTarget]: '#ef4444',
        [ShotOutcome.Post]: '#eab308'
    },
    filter: {
        teamId: 1
    }
});

pitch.add(shotMapViz);
```

#### Métodos Principales

##### `setData(data)`

Actualiza los datos de tiros.

```typescript
const newShots = [...existingShots, newShot];
shotMapViz.setData(newShots);
```

##### `setFilter(filter)`

Aplica filtros a los datos mostrados.

```typescript
// Filtrar por equipo
shotMapViz.setFilter({ teamId: 1 });

// Filtrar por jugador
shotMapViz.setFilter({ playerId: 'p1' });

// Filtrar por múltiples criterios
shotMapViz.setFilter({ teamId: 1, playerId: 'p1' });

// Limpiar filtros
shotMapViz.setFilter({});
```

##### `highlight(shotId)`

Resalta un tiro específico.

```typescript
shotMapViz.highlight('shot-1');
```

##### `removeHighlight()`

Quita el resaltado actual.

```typescript
shotMapViz.removeHighlight();
```

##### `setColors(colors)`

Personaliza los colores por resultado.

```typescript
shotMapViz.setColors({
    [ShotOutcome.Goal]: '#00ff00',
    [ShotOutcome.Saved]: '#0088ff',
    [ShotOutcome.Blocked]: '#8800ff',
    [ShotOutcome.OffTarget]: '#ff0000',
    [ShotOutcome.Post]: '#ffff00'
});
```

##### `setSizeScale(scaleConfig)`

Configura el tamaño de los círculos basado en xG.

```typescript
shotMapViz.setSizeScale({
    minRadius: 2,
    maxRadius: 25,
    basedOn: 'xG'
});
```

## 💡 Ejemplos Completos

### Ejemplo 1: Dashboard de Análisis de Tiros

```typescript
import { createPitch, shotMap, ShotOutcome } from '@tacticgl/charts';

// Simulación de datos reales de partido
const matchShots = [
    // Tiros del equipo local
    {
        id: 'home-1',
        position: { x: 88, y: 45 },
        outcome: ShotOutcome.Goal,
        xG: 0.76,
        team: { id: 1, name: 'FC Barcelona' },
        player: { id: 'messi', name: 'Lionel Messi' }
    },
    {
        id: 'home-2',
        position: { x: 92, y: 35 },
        outcome: ShotOutcome.Saved,
        xG: 0.23,
        team: { id: 1, name: 'FC Barcelona' },
        player: { id: 'lewandowski', name: 'Robert Lewandowski' }
    },
    {
        id: 'home-3',
        position: { x: 85, y: 60 },
        outcome: ShotOutcome.Blocked,
        xG: 0.15,
        team: { id: 1, name: 'FC Barcelona' },
        player: { id: 'pedri', name: 'Pedri' }
    },
    
    // Tiros del equipo visitante
    {
        id: 'away-1',
        position: { x: 15, y: 40 },
        outcome: ShotOutcome.OffTarget,
        xG: 0.08,
        team: { id: 2, name: 'Real Madrid' },
        player: { id: 'benzema', name: 'Karim Benzema' }
    },
    {
        id: 'away-2',
        position: { x: 18, y: 50 },
        outcome: ShotOutcome.Goal,
        xG: 0.45,
        team: { id: 2, name: 'Real Madrid' },
        player: { id: 'vinicius', name: 'Vinicius Jr.' }
    }
];

// Crear dashboard
class ShotAnalysisDashboard {
    private pitch: Pitch;
    private shotMapViz: ShotMap;
    private currentFilter: { teamId?: number; playerId?: string } = {};

    constructor(containerId: string) {
        // Crear campo con tema personalizado
        this.pitch = createPitch(containerId, {
            theme: { name: 'dark' },
            dimensions: { width: 105, height: 68 }
        });

        // Añadir ShotMap
        this.shotMapViz = shotMap(this.pitch, matchShots, {
            filter: { teamId: 1 }, // Por defecto equipo local
            colors: {
                [ShotOutcome.Goal]: '#22c55e',
                [ShotOutcome.Saved]: '#3b82f6',
                [ShotOutcome.Blocked]: '#a855f7',
                [ShotOutcome.OffTarget]: '#ef4444',
                [ShotOutcome.Post]: '#eab308'
            }
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        // Simulación de controles de UI
        const teamFilter = document.getElementById('team-filter');
        const playerFilter = document.getElementById('player-filter');
        
        teamFilter?.addEventListener('change', (e) => {
            const teamId = parseInt(e.target.value);
            this.filterByTeam(teamId);
        });

        playerFilter?.addEventListener('change', (e) => {
            const playerId = e.target.value;
            this.filterByPlayer(playerId);
        });
    }

    filterByTeam(teamId: number): void {
        this.currentFilter.teamId = teamId;
        this.shotMapViz.setFilter(this.currentFilter);
        
        // Cambiar tema según el equipo
        const theme = teamId === 1 ? 
            { name: 'barcelona', grass: '#004d98', lines: '#a50044' } :
            { name: 'madrid', grass: '#ffffff', lines: '#000000' };
        
        this.pitch.setTheme(theme);
    }

    filterByPlayer(playerId: string): void {
        if (playerId === 'all') {
            delete this.currentFilter.playerId;
        } else {
            this.currentFilter.playerId = playerId;
        }
        this.shotMapViz.setFilter(this.currentFilter);
    }

    highlightPlayerShots(playerId: string): void {
        // Filtrar por jugador
        this.shotMapViz.setFilter({ playerId });
        
        // Obtener todos los tiros del jugador
        const playerShots = matchShots.filter(shot => shot.player?.id === playerId);
        
        // Resaltar cada tiro secuencialmente
        playerShots.forEach((shot, index) => {
            setTimeout(() => {
                this.shotMapViz.highlight(shot.id);
            }, index * 500);
        });
    }

    showGoalsOnly(): void {
        // Filtrar solo goles (requiere filtrado manual ya que no hay enum para goals)
        const goals = matchShots.filter(shot => shot.outcome === ShotOutcome.Goal);
        this.shotMapViz.setData(goals);
    }

    showAllShots(): void {
        this.shotMapViz.setData(matchShots);
        this.shotMapViz.setFilter({});
    }

    exportData(): void {
        const currentData = this.shotMapViz.getFilteredData();
        console.log('Datos actuales:', currentData);
        return currentData;
    }
}

// Usar el dashboard
const dashboard = new ShotAnalysisDashboard('pitch-container');
```

### Ejemplo 2: Campo Vertical con Múltiples Visualizaciones

```typescript
import { 
    createPitch, 
    shotMap, 
    ShotOutcome, 
    Pitch,
    LIGHT_THEME,
    DARK_THEME 
} from '@tacticgl/charts';

// Crear campo vertical (más apropiado para análisis)
const verticalPitch = new Pitch({
    container: '#vertical-pitch',
    dimensions: { width: 68, height: 105 }, // Altura > anchura
    orientation: 'vertical',
    theme: {
        ...DARK_THEME,
        grass: '#1a472a' // Verde más oscuro
    }
});

verticalPitch.render();

// Añadir datos de tiros con diferentes outcomes
const tacticalShots = [
    // Tiros desde diferentes zonas
    {
        id: 'penalty-1',
        position: { x: 88.5, y: 50 }, // Área de penalty
        outcome: ShotOutcome.Goal,
        xG: 0.85,
        team: { id: 1, name: 'Team A' }
    },
    {
        id: 'long-range-1',
        position: { x: 65, y: 30 }, // Tiro de larga distancia
        outcome: ShotOutcome.OffTarget,
        xG: 0.12,
        team: { id: 1, name: 'Team A' }
    },
    {
        id: 'close-range-1',
        position: { x: 95, y: 45 }, // Tiro muy cerca
        outcome: ShotOutcome.Saved,
        xG: 0.65,
        team: { id: 2, name: 'Team B' }
    }
];

// Crear ShotMap con configuración avanzada
const tacticalShotMap = shotMap(verticalPitch, tacticalShots, {
    sizeScale: {
        minRadius: 3,
        maxRadius: 25,
        basedOn: 'xG'
    },
    colors: {
        [ShotOutcome.Goal]: '#10b981', // Verde esmeralda
        [ShotOutcome.Saved]: '#3b82f6', // Azul
        [ShotOutcome.Blocked]: '#8b5cf6', // Púrpura
        [ShotOutcome.OffTarget]: '#ef4444', // Rojo
        [ShotOutcome.Post]: '#f59e0b' // Ámbar
    }
});

// Función para cambiar entre vistas tácticas
class TacticalView {
    constructor(private pitch: Pitch, private shotMap: ShotMap) {}

    showAttackingZone(): void {
        // Mostrar solo tiros en zona de ataque (x > 70)
        const attackingShots = tacticalShots.filter(shot => shot.position.x > 70);
        this.shotMap.setData(attackingShots);
    }

    showDefensiveActions(): void {
        // Simular acciones defensivas con diferentes colores
        const defensiveShots = tacticalShots.filter(shot => shot.position.x < 35);
        this.shotMap.setData(defensiveShots);
    }

    showHighxGShots(): void {
        // Solo tiros con alta probabilidad de gol
        const highxGShots = tacticalShots.filter(shot => shot.xG > 0.5);
        this.shotMap.setData(highxGShots);
    }

    resetView(): void {
        this.shotMap.setData(tacticalShots);
    }
}

// Usar vista táctica
const tacticalView = new TacticalView(verticalPitch, tacticalShotMap);

// Cambiar vistas según análisis
tacticalView.showAttackingZone(); // Solo zona de ataque
```

### Ejemplo 3: Animaciones y Transiciones

```typescript
import { createPitch, shotMap, ShotOutcome } from '@tacticgl/charts';

class AnimatedShotAnalysis {
    private pitch: Pitch;
    private shotMap: ShotMap;
    private animationQueue: Array<() => void> = [];
    private isAnimating = false;

    constructor(containerId: string) {
        this.pitch = createPitch(containerId, {
            theme: { name: 'light' },
            dimensions: { width: 105, height: 68 }
        });

        this.shotMap = shotMap(this.pitch, []);
        this.pitch.add(this.shotMap);
    }

    // Animar aparición progresiva de tiros
    animateShotProgression(shots: any[], delay: number = 500): void {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.animationQueue = [];

        // Limpiar datos actuales
        this.shotMap.setData([]);

        shots.forEach((shot, index) => {
            this.animationQueue.push(() => {
                const currentData = this.shotMap.getFilteredData();
                this.shotMap.setData([...currentData, shot]);

                // Resaltar el nuevo tiro
                setTimeout(() => {
                    this.shotMap.highlight(shot.id);
                }, 100);

                // Quitar resaltado después de un tiempo
                setTimeout(() => {
                    this.shotMap.removeHighlight();
                }, delay - 100);
            });
        });

        this.processAnimationQueue(delay);
    }

    private async processAnimationQueue(delay: number): Promise<void> {
        for (const animationStep of this.animationQueue) {
            animationStep();
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        this.isAnimating = false;
    }

    // Animar por outcome
    animateByOutcome(shots: any[]): void {
        const outcomes = Object.values(ShotOutcome);
        let currentIndex = 0;

        const animateNext = () => {
            if (currentIndex >= outcomes.length) return;

            const outcome = outcomes[currentIndex];
            const outcomeShots = shots.filter(shot => shot.outcome === outcome);
            
            this.shotMap.setData(outcomeShots);
            this.shotMap.highlight(outcomeShots[0]?.id || '');

            currentIndex++;
            setTimeout(animateNext, 2000);
        };

        animateNext();
    }

    // Crear efecto de "calor" basado en frecuencia de tiros
    createHeatEffect(shots: any[]): void {
        // Agrupar tiros por zona (dividir campo en cuadrantes)
        const zones = this.divideFieldIntoZones(4, 4);
        const zoneCounts = new Array(16).fill(0);

        shots.forEach(shot => {
            const zoneIndex = this.getZoneIndex(shot.position, zones);
            zoneCounts[zoneIndex]++;
        });

        // Aplicar colores basados en densidad
        const maxCount = Math.max(...zoneCounts);
        const heatColors = zoneCounts.map(count => {
            const intensity = count / maxCount;
            return `rgba(255, 0, 0, ${intensity * 0.3})`;
        });

        console.log('Mapa de calor creado:', { zones, zoneCounts, heatColors });
    }

    private divideFieldIntoZones(xDivisions: number, yDivisions: number): number[][] {
        const zones = [];
        for (let i = 0; i < xDivisions; i++) {
            for (let j = 0; j < yDivisions; j++) {
                zones.push([
                    (i * 105) / xDivisions,
                    (j * 68) / yDivisions,
                    ((i + 1) * 105) / xDivisions,
                    ((j + 1) * 68) / yDivisions
                ]);
            }
        }
        return zones;
    }

    private getZoneIndex(position: { x: number; y: number }, zones: number[][]): number {
        for (let i = 0; i < zones.length; i++) {
            const [x1, y1, x2, y2] = zones[i];
            if (position.x >= x1 && position.x <= x2 && 
                position.y >= y1 && position.y <= y2) {
                return i;
            }
        }
        return 0;
    }
}

// Ejemplo de uso
const animatedAnalysis = new AnimatedShotAnalysis('#animated-pitch');

const sampleShots = [
    {
        id: '1',
        position: { x: 20, y: 30 },
        outcome: ShotOutcome.Goal,
        xG: 0.7,
        team: { id: 1, name: 'Team A' }
    },
    {
        id: '2',
        position: { x: 50, y: 40 },
        outcome: ShotOutcome.Saved,
        xG: 0.3,
        team: { id: 1, name: 'Team A' }
    }
];

// Iniciar animación progresiva
animatedAnalysis.animateShotProgression(sampleShots, 1000);
```

## ⚙️ Configuración Avanzada

### Temas Personalizados

```typescript
import { Pitch } from '@tacticgl/charts';

// Tema personalizado para equipo
const teamTheme = {
    name: 'barcelona',
    grass: '#004d98',      // Azulgrana
    lines: '#a50044',      // Grana
    goalLine: '#a50044',
    penaltyArc: '#a50044',
    centerCircle: '#a50044'
};

// Tema para modo nocturno
const nightMode = {
    name: 'night',
    grass: '#0f172a',      // Azul muy oscuro
    lines: '#475569',      // Gris azulado
    goalLine: '#475569',
    penaltyArc: '#475569',
    centerCircle: '#475569'
};

const pitch = new Pitch({
    container: '#custom-pitch',
    theme: teamTheme
});
```

### Dimensiones Personalizadas

```typescript
import { Pitch, FIFA_DIMENSIONS } from '@tacticgl/charts';

// Campo más pequeño para entrenamiento
const trainingField = {
    width: 70,
    height: 50,
    lineThickness: 0.08
};

// Campo FIFA estándar
const fifaField = FIFA_DIMENSIONS;

// Campo muy grande
const megaField = {
    width: 150,
    height: 100,
    lineThickness: 0.15
};

const pitch = new Pitch({
    container: '#dim-pitch',
    dimensions: trainingField
});
```

### Configuración de ShotMap Avanzada

```typescript
import { ShotMap, ShotOutcome } from '@tacticgl/charts';

const advancedShotMap = new ShotMap({
    data: shotsData,
    sizeScale: {
        minRadius: 2,
        maxRadius: 30,
        basedOn: 'xG' // Solo se soporta xG actualmente
    },
    colors: {
        [ShotOutcome.Goal]: '#22c55e',
        [ShotOutcome.Saved]: '#3b82f6',
        [ShotOutcome.Blocked]: '#a855f7',
        [ShotOutcome.OffTarget]: '#ef4444',
        [ShotOutcome.Post]: '#eab308'
    },
    filter: {
        teamId: 1,
        playerId: 'messi'
    }
});
```

## 🎯 Mejores Prácticas

### 1. Gestión de Recursos

```typescript
// ✅ Correcto: Limpiar recursos cuando ya no se necesiten
class MatchAnalysis {
    private pitch: Pitch;

    constructor() {
        this.pitch = createPitch('#pitch');
    }

    destroy(): void {
        this.pitch.destroy();
        // Limpiar event listeners, timers, etc.
    }
}

// ❌ Incorrecto: No limpiar recursos
// Esto puede causar memory leaks
function badExample() {
    const pitch = createPitch('#pitch');
    // ... usar pitch
    // Sin pitch.destroy()
}
```

### 2. Manejo de Datos

```typescript
// ✅ Correcto: Validar datos antes de usar
function validateShotData(shot: any): shot is Shot {
    return (
        shot &&
        typeof shot.id === 'string' &&
        shot.position &&
        typeof shot.position.x === 'number' &&
        typeof shot.position.y === 'number' &&
        Object.values(ShotOutcome).includes(shot.outcome)
    );
}

function safeAddShots(pitch: Pitch, rawData: any[]): void {
    const validShots = rawData.filter(validateShotData);
    if (validShots.length === 0) {
        console.warn('No valid shot data found');
        return;
    }
    
    shotMap(pitch, validShots);
}

// ❌ Incorrecto: Usar datos sin validar
function badDataHandling() {
    const badData = [
        { id: 1, position: 'invalid' }, // Esto causará errores
        { position: { x: 50, y: 50 } }  // Falta id
    ];
    
    shotMap(pitch, badData as any); // ¡Peligroso!
}
```

### 3. Performance con Grandes Datasets

```typescript
// ✅ Correcto: Implementar paginación para grandes datasets
class EfficientShotMap {
    private currentPage = 0;
    private pageSize = 100;
    private allData: Shot[] = [];

    constructor(private pitch: Pitch, private data: Shot[]) {
        this.allData = data;
        this.loadPage(0);
    }

    loadPage(page: number): void {
        const start = page * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.allData.slice(start, end);
        
        shotMap(this.pitch, pageData);
        this.currentPage = page;
    }

    nextPage(): void {
        if ((this.currentPage + 1) * this.pageSize < this.allData.length) {
            this.loadPage(this.currentPage + 1);
        }
    }

    previousPage(): void {
        if (this.currentPage > 0) {
            this.loadPage(this.currentPage - 1);
        }
    }
}
```

### 4. Responsive Design

```typescript
// ✅ Correcto: Adaptar a cambios de tamaño
class ResponsivePitch {
    private pitch: Pitch;
    private resizeObserver: ResizeObserver;

    constructor(container: HTMLElement) {
        this.pitch = createPitch(container, {
            dimensions: { width: 105, height: 68 }
        });

        this.setupResizeHandling(container);
    }

    private setupResizeHandling(container: HTMLElement): void {
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                this.adjustPitchSize(width, height);
            }
        });

        this.resizeObserver.observe(container);
    }

    private adjustPitchSize(containerWidth: number, containerHeight: number): void {
        // Calcular dimensiones óptimas
        const aspectRatio = 105 / 68; // Relación de aspecto FIFA
        let pitchWidth, pitchHeight;

        if (containerWidth / containerHeight > aspectRatio) {
            // Contenedor más ancho - limitar por altura
            pitchHeight = Math.min(containerHeight, containerWidth / aspectRatio);
            pitchWidth = pitchHeight * aspectRatio;
        } else {
            // Contenedor más alto - limitar por ancho
            pitchWidth = Math.min(containerWidth, containerHeight * aspectRatio);
            pitchHeight = pitchWidth / aspectRatio;
        }

        // Actualizar dimensiones
        this.pitch.setDimensions({
            width: pitchWidth,
            height: pitchHeight
        });
    }

    destroy(): void {
        this.resizeObserver.disconnect();
        this.pitch.destroy();
    }
}
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Campo no se renderiza

```typescript
// ❌ Problema: Contenedor no existe
const pitch = createPitch('#non-existent-id');

// ✅ Solución: Verificar que el contenedor existe
function safeCreatePitch(containerId: string): Pitch | null {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id '${containerId}' not found`);
        return null;
    }
    
    return createPitch(container);
}
```

#### 2. Error: "Pitch has been destroyed"

```typescript
// ❌ Problema: Usar pitch después de destruirlo
const pitch = createPitch('#pitch');
pitch.destroy();
pitch.render(); // Error!

// ✅ Solución: Verificar estado antes de usar
function safeRender(pitch: Pitch): void {
    try {
        pitch.render();
    } catch (error) {
        if (error instanceof Error && error.message.includes('destroyed')) {
            console.warn('Pitch has been destroyed, recreating...');
            return createPitch('#pitch');
        }
        throw error;
    }
}
```

#### 3. ShotMap no muestra datos

```typescript
// ❌ Problema: Datos malformados
const badShots = [
    {
        id: '1',
        position: { x: 100, y: 100 }, // Fuera del campo
        outcome: 'invalid_outcome',   // Outcome inválido
        xG: 'invalid'                // xG no numérico
    }
];
shotMap(pitch, badShots);

// ✅ Solución: Validar y limpiar datos
function normalizeShotData(rawShots: any[]): Shot[] {
    return rawShots
        .filter(shot => 
            shot.position &&
            shot.position.x >= 0 && shot.position.x <= 105 &&
            shot.position.y >= 0 && shot.position.y <= 68 &&
            Object.values(ShotOutcome).includes(shot.outcome)
        )
        .map(shot => ({
            ...shot,
            xG: Number(shot.xG) || 0,
            position: {
                x: Math.max(0, Math.min(105, shot.position.x)),
                y: Math.max(0, Math.min(68, shot.position.y))
            }
        }));
}

const normalizedShots = normalizeShotData(badShots);
shotMap(pitch, normalizedShots);
```

#### 4. Problemas de performance

```typescript
// ❌ Problema: Actualizar datos muy frecuentemente
function badPerformanceExample() {
    setInterval(() => {
        shotMap.setData(newRandomShots()); // Actualiza cada frame
    }, 16); // 60fps - ¡Demasiado frecuente!
}

// ✅ Solución: Throttle de actualizaciones
function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return function (this: any, ...args: Parameters<T>) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

// Usar throttling
const throttledUpdate = throttle((newData: Shot[]) => {
    shotMap.setData(newData);
}, 100); // Máximo 10 updates por segundo

setInterval(() => {
    throttledUpdate(newRandomShots());
}, 50);
```

### Debugging

#### Habilitar logs de debug

```typescript
import { createPitch, DEBUG_MODE } from '@tacticgl/charts';

// Habilitar modo debug (si está disponible)
if (DEBUG_MODE) {
    console.log('Debug mode enabled');
}

const pitch = createPitch('#pitch', {
    // Esto puede habilitar logs adicionales
    debug: true
});
```

#### Inspeccionar estado interno

```typescript
// Obtener información de debug del pitch
function debugPitch(pitch: Pitch): void {
    console.group('Pitch Debug Info');
    console.log('Dimensions:', pitch.config.dimensions);
    console.log('Orientation:', pitch.config.orientation);
    console.log('Theme:', pitch.config.theme);
    console.log('Container:', pitch.config.container);
    console.log('Scale:', pitch.getScale());
    console.log('Visualizations:', Array.from(pitch.visualizations.keys()));
    console.groupEnd();
}

debugPitch(pitch);
```

### Compatibilidad de Navegadores

- **Chrome/Edge**: ✅ Soporte completo
- **Firefox**: ✅ Soporte completo  
- **Safari**: ✅ Soporte completo (iOS 12+)
- **IE 11**: ❌ No soportado

### Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para detalles de versiones.

### Contribuir

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) para guidelines de contribución.

### Licencia

MIT License - ver [LICENSE](../LICENSE) para detalles.

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tacticgl/charts/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tacticgl/charts/discussions)
- **Email**: <support@tacticgl.com>

¡Gracias por usar @tacticgl/charts! 🎉
