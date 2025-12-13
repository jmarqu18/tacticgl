# @tacticgl/core

Núcleo de tipos, interfaces y utilidades fundamentales para la librería TacticGL. Proporciona el sistema de tipos unificado, normalización de datos, renderizado y conversión de coordenadas para visualizaciones deportivas.

## 📖 Índice

- [Instalación](#instalación)
- [Arquitectura del Paquete](#arquitectura-del-paquete)
- [Guía de Inicio Rápido](#guía-de-inicio-rápido)
- [Módulos Principales](#módulos-principales)
  - [Types Module](#types-module)
  - [Data Module](#data-module)
  - [Renderer Module](#renderer-module)
  - [Engine Module](#engine-module)
  - [Scales Module](#scales-module)
- [API Reference Completa](#api-reference-completa)
- [Ejemplos Avanzados](#ejemplos-avanzados)
- [Patrones de Uso](#patrones-de-uso)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)
- [Contribuir](#contribuir)

## 🚀 Instalación

### Prerrequisitos

```bash
npm install @tacticgl/shared
# o
pnpm add @tacticgl/shared
# o
yarn add @tacticgl/shared
```

### Instalar @tacticgl/core

```bash
npm install @tacticgl/core
# o
pnpm add @tacticgl/core
# o
yarn add @tacticgl/core
```

### Verificación de instalación

```typescript
import type { 
    Position2D, 
    TacticGLEvent, 
    IRenderer 
} from '@tacticgl/core';

// Verificar que los tipos están disponibles
const testPosition: Position2D = { x: 50, y: 50 };
console.log('✅ @tacticgl/core instalado correctamente');
```

## 🏗️ Arquitectura del Paquete

```
packages/core/
├── src/                        # Código fuente de producción
│   ├── types/                  # Definiciones de tipos TypeScript
│   │   ├── geometry.types.ts   # Tipos geométricos (Position2D, Dimensions, etc.)
│   │   ├── data.types.ts       # Tipos de datos deportivos (TacticGLEvent, etc.)
│   │   ├── config.types.ts     # Tipos de configuración (RenderConfig, etc.)
│   │   ├── renderer.types.ts   # Tipos de renderizado (IRenderer, Layer, etc.)
│   │   └── index.ts            # Re-export de todos los tipos
│   ├── data/                   # Normalización y validación de datos
│   │   ├── Schema.ts           # Schema de eventos y constantes
│   │   ├── validators.ts       # Validadores de datos
│   │   ├── EventNormalizer.ts  # Normalizador de eventos
│   │   └── index.ts            # Re-export del módulo data
│   ├── renderer/               # Sistema de renderizado
│   │   ├── BaseRenderer.ts     # Clase abstracta base
│   │   ├── SVGRenderer.ts      # Implementación SVG
│   │   └── index.ts            # Re-export del módulo renderer
│   ├── engine/                 # Motor de renderizado
│   │   ├── RenderEngine.ts     # Factory de renderers
│   │   ├── capabilities.ts     # Detección de capacidades
│   │   └── index.ts            # Re-export del módulo engine
│   ├── scales/                 # Sistema de escalas
│   │   ├── PitchScale.ts       # Conversión de coordenadas
│   │   └── index.ts            # Re-export del módulo scales
│   └── index.ts                # Punto de entrada principal
├── tests/                      # Archivos de test
│   └── types/                  # Tests de tipos y exports
├── dist/                       # Archivos compilados (generado)
└── package.json
```

## 🎯 Guía de Inicio Rápido

### Ejemplo Básico: Normalización de Datos

```typescript
import { 
    EventNormalizer,
    validateEvent,
    detectAllCapabilities 
} from '@tacticgl/core';

// 1. Normalizar datos de eventos desde formato StatsBomb
const rawEvents = [
    {
        id: 'evt_001',
        type: 'shot',
        location: [90, 45],  // Formato StatsBomb
        team: { id: 1, name: 'Barcelona' },
        player: { id: 5503, name: 'Messi' },
        xG: 0.76
    },
    {
        type: 'pass',
        coordinates: { x: 30, y: 50 },  // Formato alternativo
        team: { id: 1, name: 'Barcelona' }
    }
];

// 2. Normalizar eventos
const normalizedEvents = EventNormalizer.normalizeBatch(rawEvents, {
    sourceDimensions: { width: 120, height: 80 }, // StatsBomb coordinates
    generateIds: true,
    preserveMetadata: true
});

console.log('Eventos normalizados:', normalizedEvents);

// 3. Validar eventos
normalizedEvents.forEach(event => {
    const result = validateEvent(event);
    if (!result.isValid) {
        console.error('Evento inválido:', result.errors);
    }
});
```

### Ejemplo Básico: Sistema de Renderizado

```typescript
import { 
    RenderEngine,
    PitchScale,
    RenderElement 
} from '@tacticgl/core';

// 1. Detectar capacidades del navegador
const capabilities = detectAllCapabilities();
console.log('Capacidades:', capabilities);

// 2. Crear motor de renderizado
const engine = new RenderEngine('auto'); // Auto-selección del mejor renderer
console.log('Renderer seleccionado:', engine.rendererType);

// 3. Inicializar renderer
const container = document.getElementById('pitch');
engine.renderer.init(container, {
    width: 105,
    height: 68,
    responsive: true
});

// 4. Crear escala de coordenadas
const scale = new PitchScale({
    width: 105,
    height: 68,
    padding: { top: 20, right: 20, bottom: 20, left: 20 }
});

// 5. Crear elementos de renderizado
const elements: RenderElement[] = [
    {
        type: 'circle',
        x: scale.toPixel({ x: 50, y: 50 }).x, // Centro del campo
        attributes: {
            r: 5,
            fill: 'red',
            'data-player': 'messi'
        }
    }
];

// 6. Renderizar
engine.renderer.render({ elements });
```

## 📚 Módulos Principales

### Types Module

Sistema de tipos unificado para toda la librería TacticGL.

**Categorías principales:**

- **Geometry Types**: Coordenadas y dimensiones
- **Data Types**: Eventos deportivos y estructuras de datos
- **Config Types**: Configuración de renderizado
- **Renderer Types**: Interfaces de renderizado

### Data Module

Procesamiento y normalización de datos deportivos.

**Funcionalidades:**

- Normalización de eventos desde múltiples formatos
- Validación de integridad de datos
- Schema unificado compatible con StatsBomb
- Conversión de coordenadas

### Renderer Module

Sistema de renderizado extensible y modular.

**Características:**

- Interface común para múltiples backends
- Sistema de capas
- Animaciones y transiciones
- Gestión de eventos tipada

### Engine Module

Motor inteligente de selección de renderers.

**Capacidades:**

- Auto-detección de soporte del navegador
- Sistema de fallback: WebGL → Canvas → SVG
- Métricas de rendimiento
- Selección optimizada

### Scales Module

Sistema de conversión de coordenadas para campos de fútbol.

**Funcionalidades:**

- Conversión bidireccional normalizada ↔ píxeles
- Soporte para orientaciones horizontal/vertical
- Cálculo de landmarks del campo
- Padding configurable

## 📖 API Reference Completa

### Tipos Geométricos

#### `Position2D`

Coordenadas 2D normalizadas (0-100) para posición en el campo.

```typescript
interface Position2D {
    readonly x: number;  // 0-100 (horizontal: 0=línea izquierda, 100=línea derecha)
    readonly y: number;  // 0-100 (vertical: 0=banda inferior, 100=banda superior)
}

// Ejemplos de uso
const centerField: Position2D = { x: 50, y: 50 };
const topRightCorner: Position2D = { x: 100, y: 100 };
const bottomLeftCorner: Position2D = { x: 0, y: 0 };

// Convertir a píxeles
const scale = new PitchScale();
const pixel = scale.toPixel(centerField); // { x: 52.5, y: 34 }
```

#### `PixelPosition`

Coordenadas en unidades de renderizado (píxeles/SVG units).

```typescript
interface PixelPosition {
    readonly x: number;
    readonly y: number;
}
```

#### `Dimensions`

Dimensiones de un área rectangular.

```typescript
interface Dimensions {
    readonly width: number;
    readonly height: number;
}

// Uso común
const fieldDimensions: Dimensions = { width: 105, height: 68 };
const canvasSize: Dimensions = { width: 800, height: 600 };
```

#### `Padding`

Márgenes en las cuatro direcciones.

```typescript
interface Padding {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
}

// Ejemplo
const standardPadding: Padding = { top: 20, right: 20, bottom: 20, left: 20 };
```

### Tipos de Datos

#### `TacticGLEvent`

Evento deportivo normalizado unificado.

```typescript
interface TacticGLEvent {
    readonly id: string;                    // Identificador único
    readonly timestamp?: number;            // Segundos desde inicio del partido
    readonly minute?: number;               // Minuto del partido
    readonly second?: number;               // Segundo dentro del minuto
    readonly period?: number;               // 1=primera parte, 2=segunda, etc.
    readonly type: EventType;               // Tipo de evento
    readonly position: Position2D;          // Posición principal
    readonly endPosition?: Position2D;      // Posición final (pases, carries)
    readonly player?: PlayerRef;            // Referencia del jugador
    readonly team: TeamRef;                 // Referencia del equipo
    readonly outcome?: EventOutcome;        // Resultado del evento
    readonly metadata?: Record<string, unknown>; // Metadatos adicionales
}

// Ejemplo completo
const shotEvent: TacticGLEvent = {
    id: 'evt_001',
    type: 'shot',
    position: { x: 88, y: 45 },
    team: { id: 1, name: 'Barcelona', side: 'home' },
    player: { id: 5503, name: 'Messi', jerseyNumber: 10 },
    timestamp: 1234,
    minute: 45,
    second: 30,
    period: 1,
    outcome: 'goal',
    metadata: { xG: 0.76, bodyPart: 'left_foot' }
};
```

#### `EventType`

Tipos de eventos soportados (33+ tipos).

```typescript
type EventType = 
    | 'shot' | 'goal' | 'pass' | 'carry' | 'duel'
    | 'interception' | 'clearance' | 'block' | 'foul' | 'pressure'
    | 'ball_receipt' | 'ball_recovery' | 'dispossessed' | 'dribble'
    | 'goalkeeper' | 'miscontrol' | 'tactical_shift' | 'substitution'
    | 'injury_stoppage' | 'referee_ball_drop' | 'starting_xi'
    | 'half_start' | 'half_end' | 'own_goal' | 'bad_behaviour'
    | 'player_on' | 'player_off' | 'error' | 'offside' | 'fifty_fifty'
    | 'shield' | 'custom';

// Uso
const eventType: EventType = 'shot';
```

#### `EventOutcome`

Resultados posibles de eventos.

```typescript
type EventOutcome = 
    | 'success' | 'failure' | 'goal' | 'saved' | 'blocked'
    | 'off_target' | 'post' | 'wayward' | 'incomplete' | 'complete'
    | 'won' | 'lost';
```

#### `PlayerRef`

Referencia mínima de un jugador.

```typescript
interface PlayerRef {
    readonly id: string | number;
    readonly name?: string;
    readonly jerseyNumber?: number;
}

// Ejemplos
const messi: PlayerRef = {
    id: 5503,
    name: 'Lionel Messi',
    jerseyNumber: 10
};

const unknownPlayer: PlayerRef = {
    id: 'player_123'
};
```

#### `TeamRef`

Referencia mínima de un equipo.

```typescript
interface TeamRef {
    readonly id: string | number;
    readonly name?: string;
    readonly side?: 'home' | 'away';
}

// Ejemplos
const barcelona: TeamRef = {
    id: 217,
    name: 'Barcelona',
    side: 'home'
};

const opponent: TeamRef = {
    id: 'away_team',
    side: 'away'
};
```

#### `NormalizedMatch`

Estructura completa de un partido normalizado.

```typescript
interface NormalizedMatch {
    readonly meta: MatchMetadata;
    readonly events: ReadonlyArray<TacticGLEvent>;
    readonly lineups: ReadonlyArray<TeamLineup>;
    readonly tracking?: ReadonlyArray<TrackingFrame>;
}
```

### Tipos de Configuración

#### `RenderConfig`

Configuración base de renderizado.

```typescript
interface RenderConfig {
    readonly width?: number;            // Ancho del canvas/SVG en píxeles
    readonly height?: number;           // Alto del canvas/SVG en píxeles
    readonly responsive?: boolean;      // Ajustar al contenedor (default: true)
    readonly pitchDimensions?: PitchDimensions;
    readonly orientation?: PitchOrientation;
    readonly padding?: Partial<Padding>;
    readonly theme?: Theme;
    readonly backgroundColor?: string;
    readonly pixelRatio?: number;       // Para HiDPI displays
}

// Ejemplo completo
const config: RenderConfig = {
    width: 1280,
    height: 720,
    responsive: true,
    pitchDimensions: { width: 105, height: 68 },
    orientation: 'horizontal',
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
    theme: 'dark',
    backgroundColor: '#1a1a1a',
    pixelRatio: 2
};
```

#### `Theme`

Temas visuales disponibles.

```typescript
type Theme = 'light' | 'dark' | 'custom';
```

#### `TransitionConfig`

Configuración de animaciones.

```typescript
interface TransitionConfig {
    readonly duration?: number;         // ms (default: 300)
    readonly easing?: EasingFunction;
    readonly delay?: number;            // ms
}

type EasingFunction = 
    | 'linear'
    | 'ease-in' | 'ease-out' | 'ease-in-out'
    | 'ease-in-quad' | 'ease-out-quad'
    | 'ease-in-cubic' | 'ease-out-cubic';

// Ejemplo
const fadeTransition: TransitionConfig = {
    duration: 500,
    easing: 'ease-in-out',
    delay: 100
};
```

### Tipos de Renderizado

#### `IRenderer`

Interface principal del renderer.

```typescript
interface IRenderer {
    // Estado
    readonly isInitialized: boolean;
    readonly capabilities: RendererCapabilities;

    // Ciclo de vida
    init(container: HTMLElement, config: RenderConfig): void;
    render(data: NormalizedData, options?: RenderOptions): void;
    update(data: Partial<NormalizedData>, transition?: TransitionConfig): void;
    clear(): void;
    destroy(): void;

    // Gestión de capas
    addLayer(id: string, zIndex: number): Layer;
    getLayer(id: string): Layer | null;
    getLayers(): ReadonlyArray<Layer>;
    removeLayer(id: string): void;

    // Eventos
    on<K extends keyof RendererEvents>(
        event: K,
        callback: RendererEventCallback<K>
    ): void;
    off<K extends keyof RendererEvents>(
        event: K,
        callback: RendererEventCallback<K>
    ): void;

    // Utilidades
    resize(width: number, height: number): void;
    getContainer(): HTMLElement | null;
}
```

#### `RendererCapabilities`

Capacidades técnicas del renderer.

```typescript
interface RendererCapabilities {
    readonly maxElements: number;           // Elementos antes de degradación
    readonly supportsAnimation: boolean;
    readonly supportsInteractivity: boolean;
    readonly supportsFilters: boolean;
    readonly performance: 'low' | 'medium' | 'high';
}

// Ejemplo
const svgCapabilities: RendererCapabilities = {
    maxElements: 1000,
    supportsAnimation: true,
    supportsInteractivity: true,
    supportsFilters: true,
    performance: 'medium'
};
```

#### `Layer`

Información de una capa de renderizado.

```typescript
interface Layer {
    readonly id: string;
    readonly zIndex: number;
    readonly visible: boolean;
    readonly opacity: number;

    // Métodos
    show(): void;
    hide(): void;
    setOpacity(value: number): void;
    clear(): void;
}
```

### Módulo Data

#### `EventNormalizer`

Normalizador de eventos desde múltiples formatos.

```typescript
class EventNormalizer {
    // Normalizar un solo evento
    static normalize(raw: RawEvent, options?: NormalizationOptions): TacticGLEvent;
    
    // Normalizar array de eventos
    static normalizeBatch(rawEvents: RawEvent[], options?: NormalizationOptions): TacticGLEvent[];
    
    // Convertir coordenadas de sistema externo
    static convertCoordinates(
        x: number, 
        y: number, 
        sourceDimensions: { width: number; height: number }
    ): Position2D;
    
    // Crear normalizador con opciones predefinidas
    static withOptions(options: NormalizationOptions): {
        normalize: (raw: RawEvent) => TacticGLEvent;
        normalizeBatch: (rawEvents: RawEvent[]) => TacticGLEvent[];
    };
}

interface NormalizationOptions {
    readonly clampPositions?: boolean;           // default: true
    readonly generateIds?: boolean;              // default: true
    readonly sourceDimensions?: { width: number; height: number };
    readonly preserveMetadata?: boolean;         // default: true
    readonly skipInvalid?: boolean;              // default: true
    readonly warnOnInvalid?: boolean;            // default: true
}
```

**Ejemplos de uso:**

```typescript
import { EventNormalizer } from '@tacticgl/core';

// 1. Normalización básica
const normalized = EventNormalizer.normalize({
    type: 'shot',
    location: [90, 45],  // Formato StatsBomb
    team: { id: 1 },
    xG: 0.76
});

// 2. Con opciones personalizadas
const statsBombNormalizer = EventNormalizer.withOptions({
    sourceDimensions: { width: 120, height: 80 },
    clampPositions: true,
    preserveMetadata: true
});

const batch = statsBombNormalizer.normalizeBatch([
    { type: 'shot', location: [85, 30], team: { id: 1 } },
    { type: 'pass', coordinates: { x: 40, y: 50 }, team: { id: 1 } }
]);

// 3. Conversión de coordenadas
const converted = EventNormalizer.convertCoordinates(60, 40, { width: 120, height: 80 });
// Result: { x: 50, y: 50 }
```

#### `validateEvent`

Validación de eventos con opciones configurables.

```typescript
function validateEvent(event: unknown, options?: ValidationOptions): ValidationResult;

interface ValidationOptions {
    readonly validatePositionBounds?: boolean;
    readonly validateEventType?: boolean;
    readonly positionBounds?: { min: number; max: number };
}

interface ValidationResult {
    readonly isValid: boolean;
    readonly errors: readonly string[];
}

// Ejemplo
const event = {
    id: '123',
    type: 'shot',
    position: { x: 50, y: 50 },
    team: { id: 1 }
};

const result = validateEvent(event, {
    validatePositionBounds: true,
    validateEventType: true
});

if (!result.isValid) {
    console.error('Errores de validación:', result.errors);
}
```

### Módulo Engine

#### `RenderEngine`

Factory inteligente para selección automática de renderers.

```typescript
class RenderEngine {
    constructor(preference?: RendererPreference, options?: RenderEngineOptions);
    
    // Getters
    get renderer(): IRenderer;
    get rendererType(): RendererType;
    get info(): RenderEngineInfo;
    
    // Métodos de capacidades
    isWebGLSupported(): boolean;
    isCanvasSupported(): boolean;
    isSVGSupported(): boolean;
}

type RendererPreference = RendererType | 'auto';
type RendererType = 'svg' | 'canvas' | 'webgl';

interface RenderEngineOptions {
    readonly force?: boolean;  // Sin fallback
}

interface RenderEngineInfo {
    readonly type: RendererType;
    readonly capabilities: RendererCapabilities;
    readonly fallbackUsed: boolean;
    readonly requestedType: RendererPreference;
}
```

**Ejemplos de uso:**

```typescript
import { RenderEngine, detectAllCapabilities } from '@tacticgl/core';

// 1. Auto-selección (recomendado)
const autoEngine = new RenderEngine('auto');
console.log('Renderer seleccionado:', autoEngine.rendererType);

// 2. Forzar renderer específico
try {
    const webglEngine = new RenderEngine('webgl', { force: true });
} catch (error) {
    console.error('WebGL no disponible:', error);
}

// 3. Detectar capacidades manualmente
const capabilities = detectAllCapabilities();
console.log('Capacidades del navegador:', capabilities);

// 4. Información detallada
const engineInfo = autoEngine.info;
console.log('Información del engine:', {
    type: engineInfo.type,
    capabilities: engineInfo.capabilities,
    fallbackUsed: engineInfo.fallbackUsed
});
```

#### `detectAllCapabilities`

Detección completa de capacidades del navegador.

```typescript
function detectAllCapabilities(): BrowserCapabilities;

interface BrowserCapabilities {
    readonly webgl: WebGLCapabilities;
    readonly canvas: CanvasCapabilities;
    readonly svg: SVGCapabilities;
}

interface WebGLCapabilities {
    readonly supported: boolean;
    readonly version: 1 | 2 | null;
    readonly renderer: string | null;
    readonly vendor: string | null;
    readonly maxTextureSize: number | null;
}

interface CanvasCapabilities {
    readonly supported: boolean;
    readonly supportsHardwareAcceleration: boolean;
}

interface SVGCapabilities {
    readonly supported: boolean;
    readonly supportsFilters: boolean;
    readonly supportsTransforms: boolean;
}

// Ejemplo completo
const capabilities = detectAllCapabilities();

// WebGL
if (capabilities.webgl.supported) {
    console.log(`WebGL ${capabilities.webgl.version} disponible`);
    console.log('GPU:', capabilities.webgl.renderer);
}

// Canvas
if (capabilities.canvas.supported) {
    console.log('Canvas 2D disponible');
    console.log('Aceleración por hardware:', capabilities.canvas.supportsHardwareAcceleration);
}

// SVG
if (capabilities.svg.supported) {
    console.log('SVG disponible');
    console.log('Soporte de filtros:', capabilities.svg.supportsFilters);
}
```

### Módulo Scales

#### `PitchScale`

Sistema de conversión de coordenadas para campos de fútbol.

```typescript
class PitchScale {
    constructor(config?: PitchScaleConfig);
    
    // Propiedades (readonly)
    readonly dimensions: Readonly<Dimensions>;
    readonly orientation: PitchOrientation;
    readonly padding: Readonly<Padding>;
    readonly totalDimensions: Readonly<Dimensions>;
    
    // Conversión de coordenadas
    toPixel(point: Position2D): PixelPosition;
    toNormalized(pixel: PixelPosition): Position2D;
    
    // Landmarks del campo
    getCenterSpot(): PixelPosition;
    getPenaltySpot(side: 'left' | 'right'): PixelPosition;
    getGoalCenter(side: 'left' | 'right'): PixelPosition;
    getCorner(corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): PixelPosition;
    
    // Métodos inmutables
    withPadding(padding: Partial<Padding>): PitchScale;
    withDimensions(dimensions: Partial<Dimensions>): PitchScale;
    withOrientation(orientation: PitchOrientation): PitchScale;
}

interface PitchScaleConfig {
    readonly width?: number;
    readonly height?: number;
    readonly orientation?: PitchOrientation;
    readonly padding?: Partial<Padding>;
}
```

**Ejemplos de uso:**

```typescript
import { PitchScale } from '@tacticgl/core';

// 1. Configuración básica
const scale = new PitchScale(); // FIFA standard: 105x68
const pixel = scale.toPixel({ x: 50, y: 50 }); // { x: 52.5, y: 34 }

// 2. Con padding
const scaleWithPadding = new PitchScale({
    width: 105,
    height: 68,
    padding: { top: 20, right: 20, bottom: 20, left: 20 }
});

const padded = scaleWithPadding.toPixel({ x: 50, y: 50 });
// { x: 72.5, y: 54 } (con padding aplicado)

// 3. Orientación vertical
const verticalScale = new PitchScale({
    width: 68,
    height: 105,
    orientation: 'vertical'
});

const vertical = verticalScale.toPixel({ x: 50, y: 50 });
// { x: 34, y: 52.5 }

// 4. Landmarks del campo
const center = scale.getCenterSpot(); // Centro del campo
const penaltyLeft = scale.getPenaltySpot('left'); // Punto de penalti izquierdo
const penaltyRight = scale.getPenaltySpot('right'); // Punto de penalti derecho
const goalLeft = scale.getGoalCenter('left'); // Centro portería izquierda
const topLeft = scale.getCorner('top-left'); // Esquina superior izquierda

// 5. Métodos inmutables
const originalScale = new PitchScale();
const withCustomPadding = originalScale.withPadding({ top: 30, bottom: 30 });
const verticalOrientation = originalScale.withOrientation('vertical');
const customDimensions = originalScale.withDimensions({ width: 120, height: 80 });

// Conversión inversa
const normalized = scale.toNormalized({ x: 52.5, y: 34 }); // { x: 50, y: 50 }
```

## 💡 Ejemplos Avanzados

### Ejemplo 1: Pipeline Completo de Normalización y Renderizado

```typescript
import {
    EventNormalizer,
    validateEvent,
    RenderEngine,
    PitchScale,
    detectAllCapabilities,
    type TacticGLEvent,
    type RenderElement
} from '@tacticgl/core';

// Clase para manejar datos de partido completos
class MatchProcessor {
    private engine: RenderEngine;
    private scale: PitchScale;
    private capabilities: ReturnType<typeof detectAllCapabilities>;

    constructor(container: HTMLElement) {
        // 1. Detectar capacidades
        this.capabilities = detectAllCapabilities();
        console.log('Capacidades detectadas:', this.capabilities);

        // 2. Crear engine con selección automática
        this.engine = new RenderEngine('auto');
        
        // 3. Inicializar renderer
        this.engine.renderer.init(container, {
            width: 105,
            height: 68,
            responsive: true,
            backgroundColor: '#2d5a27'
        });

        // 4. Crear escala de coordenadas
        this.scale = new PitchScale({
            width: 105,
            height: 68,
            padding: { top: 20, right: 20, bottom: 20, left: 20 }
        });

        // 5. Configurar capas
        this.setupLayers();
        
        // 6. Configurar eventos
        this.setupEventHandlers();
    }

    private setupLayers(): void {
        // Capa base del campo
        this.engine.renderer.addLayer('pitch', 0);
        
        // Capa de eventos
        this.engine.renderer.addLayer('events', 10);
        
        // Capa de overlay/interfaz
        this.engine.renderer.addLayer('ui', 20);
    }

    private setupEventHandlers(): void {
        // Evento de inicialización
        this.engine.renderer.on('init', ({ container, config }) => {
            console.log('Renderer inicializado en:', container.id);
        });

        // Evento de renderizado
        this.engine.renderer.on('render', ({ data, duration }) => {
            console.log(`Renderizado completado en ${duration.toFixed(2)}ms`);
        });

        // Evento de error
        this.engine.renderer.on('error', ({ error, context }) => {
            console.error(`Error en ${context}:`, error);
        });
    }

    // Procesar datos desde múltiples fuentes
    processMatchData(rawData: {
        statsBombEvents?: any[];
        customEvents?: any[];
        trackingData?: any[];
    }): void {
        const allEvents: TacticGLEvent[] = [];

        // 1. Normalizar eventos StatsBomb
        if (rawData.statsBombEvents) {
            const statsBombEvents = EventNormalizer.normalizeBatch(
                rawData.statsBombEvents,
                {
                    sourceDimensions: { width: 120, height: 80 },
                    preserveMetadata: true,
                    generateIds: true
                }
            );
            allEvents.push(...statsBombEvents);
        }

        // 2. Normalizar eventos personalizados
        if (rawData.customEvents) {
            const customEvents = EventNormalizer.normalizeBatch(
                rawData.customEvents,
                {
                    clampPositions: true,
                    preserveMetadata: true
                }
            );
            allEvents.push(...customEvents);
        }

        // 3. Validar todos los eventos
        const validEvents = this.validateEvents(allEvents);
        
        // 4. Renderizar eventos
        this.renderEvents(validEvents);
    }

    private validateEvents(events: TacticGLEvent[]): TacticGLEvent[] {
        const validEvents: TacticGLEvent[] = [];
        const errors: string[] = [];

        events.forEach((event, index) => {
            const result = validateEvent(event);
            if (result.isValid) {
                validEvents.push(event);
            } else {
                errors.push(`Evento ${index}: ${result.errors.join(', ')}`);
            }
        });

        if (errors.length > 0) {
            console.warn('Eventos inválidos encontrados:', errors);
        }

        console.log(`Validación: ${validEvents.length}/${events.length} eventos válidos`);
        return validEvents;
    }

    private renderEvents(events: TacticGLEvent[]): void {
        // 1. Crear elementos de renderizado
        const elements: RenderElement[] = events
            .filter(event => event.type === 'shot' || event.type === 'goal')
            .map((event, index) => {
                const pixelPos = this.scale.toPixel(event.position);
                
                // Color basado en outcome
                let color = '#ffffff'; // default
                if (event.outcome === 'goal') {
                    color = '#22c55e'; // verde
                } else if (event.outcome === 'saved') {
                    color = '#3b82f6'; // azul
                } else if (event.outcome === 'blocked') {
                    color = '#a855f7'; // púrpura
                } else if (event.outcome === 'off_target') {
                    color = '#ef4444'; // rojo
                }

                return {
                    type: 'circle',
                    x: pixelPos.x,
                    y: pixelPos.y,
                    attributes: {
                        r: 6,
                        fill: color,
                        stroke: '#000000',
                        'stroke-width': 1,
                        'data-event-id': event.id,
                        'data-event-type': event.type,
                        'data-player': event.player?.name || 'Unknown',
                        opacity: 0.8,
                        class: 'shot-marker'
                    }
                };
            });

        // 2. Renderizar en capa de eventos
        this.engine.renderer.render(
            { elements },
            { 
                layer: 'events',
                clear: true,
                animate: true 
            }
        );

        // 3. Añadir interactividad
        this.addInteractivity(elements);
    }

    private addInteractivity(elements: RenderElement[]): void {
        const container = this.engine.renderer.getContainer();
        if (!container) return;

        // Event listeners para elementos de tiro
        container.addEventListener('click', (event) => {
            const target = event.target as Element;
            if (target.classList.contains('shot-marker')) {
                const eventId = target.getAttribute('data-event-id');
                const player = target.getAttribute('data-player');
                const eventType = target.getAttribute('data-event-type');
                
                console.log(`Tiro seleccionado: ${player} - ${eventType} (${eventId})`);
                
                // Resaltar elemento
                this.highlightShot(eventId!);
            }
        });
    }

    private highlightShot(eventId: string): void {
        // Implementar lógica de resaltado
        console.log('Resaltando tiro:', eventId);
    }

    // Métodos públicos para interacción externa
    public filterByTeam(teamId: string | number): void {
        // Implementar filtrado por equipo
        console.log('Filtrando por equipo:', teamId);
    }

    public filterByPlayer(playerId: string | number): void {
        // Implementar filtrado por jugador
        console.log('Filtrando por jugador:', playerId);
    }

    public exportData(): { 
        rendererType: string; 
        capabilities: any;
        scale: any;
    } {
        return {
            rendererType: this.engine.rendererType,
            capabilities: this.capabilities,
            scale: {
                dimensions: this.scale.dimensions,
                orientation: this.scale.orientation,
                padding: this.scale.padding
            }
        };
    }
}

// Uso del procesador
const processor = new MatchProcessor(document.getElementById('pitch')!);

// Simular datos de entrada
const rawMatchData = {
    statsBombEvents: [
        {
            id: 'shot_001',
            type: 'shot',
            location: [90, 45],
            team: { id: 1, name: 'Home Team' },
            player: { id: 'player1', name: 'Striker 1' },
            xG: 0.76,
            outcome: 'Goal'
        },
        {
            id: 'shot_002',
            type: 'shot',
            location: [85, 30],
            team: { id: 1, name: 'Home Team' },
            player: { id: 'player2', name: 'Striker 2' },
            xG: 0.23,
            outcome: 'Saved'
        }
    ],
    customEvents: [
        {
            type: 'pass',
            coordinates: { x: 30, y: 50 },
            team: { id: 2, name: 'Away Team' },
            player: { id: 'player3', name: 'Midfielder 1' }
        }
    ]
};

// Procesar datos
processor.processMatchData(rawMatchData);
```

### Ejemplo 2: Sistema de Coordenadas Avanzado

```typescript
import {
    PitchScale,
    Position2D,
    PixelPosition,
    EventNormalizer
} from '@tacticgl/core';

// Sistema de coordenadas múltiples para diferentes proveedores de datos
class CoordinateSystemManager {
    private scales: Map<string, PitchScale> = new Map();

    constructor() {
        this.initializeScales();
    }

    private initializeScales(): void {
        // FIFA Standard
        this.scales.set('fifa', new PitchScale({
            width: 105,
            height: 68,
            orientation: 'horizontal'
        }));

        // StatsBomb
        this.scales.set('statsbomb', new PitchScale({
            width: 120,
            height: 80,
            orientation: 'horizontal'
        }));

        // Opta
        this.scales.set('opta', new PitchScale({
            width: 100,
            height: 64,
            orientation: 'horizontal'
        }));

        // Campo personalizado (training)
        this.scales.set('training', new PitchScale({
            width: 70,
            height: 50,
            orientation: 'horizontal',
            padding: { top: 10, right: 10, bottom: 10, left: 10 }
        }));

        // Campo vertical (análisis táctico)
        this.scales.set('vertical', new PitchScale({
            width: 68,
            height: 105,
            orientation: 'vertical'
        }));
    }

    // Convertir desde cualquier sistema a normalizado
    convertToNormalized(
        source: string,
        x: number,
        y: number,
        target: string = 'fifa'
    ): Position2D {
        const sourceScale = this.scales.get(source);
        const targetScale = this.scales.get(target);

        if (!sourceScale || !targetScale) {
            throw new Error(`Scale not found: ${source} or ${target}`);
        }

        // 1. Convertir fuente a normalizado
        const normalized = sourceScale.toNormalized({ x, y });
        
        // 2. Convertir normalizado a destino
        const targetPixels = targetScale.toPixel(normalized);
        
        return targetScale.toNormalized(targetPixels);
    }

    // Convertir múltiples puntos en lote
    convertBatch(
        source: string,
        points: Array<{ x: number; y: number }>,
        target: string = 'fifa'
    ): Position2D[] {
        return points.map(point => 
            this.convertToNormalized(source, point.x, point.y, target)
        );
    }

    // Obtener landmarks para todos los sistemas
    getAllLandmarks(): Record<string, {
        center: PixelPosition;
        penaltyLeft: PixelPosition;
        penaltyRight: PixelPosition;
        corners: Record<string, PixelPosition>;
    }> {
        const landmarks: Record<string, any> = {};

        this.scales.forEach((scale, name) => {
            landmarks[name] = {
                center: scale.getCenterSpot(),
                penaltyLeft: scale.getPenaltySpot('left'),
                penaltyRight: scale.getPenaltySpot('right'),
                corners: {
                    'top-left': scale.getCorner('top-left'),
                    'top-right': scale.getCorner('top-right'),
                    'bottom-left': scale.getCorner('bottom-left'),
                    'bottom-right': scale.getCorner('bottom-right')
                }
            };
        });

        return landmarks;
    }

    // Verificar si una posición está dentro de los bounds
    isValidPosition(
        system: string,
        x: number,
        y: number
    ): boolean {
        const scale = this.scales.get(system);
        if (!scale) return false;

        const normalized = scale.toNormalized({ x, y });
        return normalized.x >= 0 && normalized.x <= 100 &&
               normalized.y >= 0 && normalized.y <= 100;
    }

    // Crear escala híbrida para análisis comparativo
    createHybridScale(
        primarySystem: string,
        overlaySystem: string
    ): {
        primary: PitchScale;
        overlay: PitchScale;
        convert: (pos: Position2D) => {
            primary: PixelPosition;
            overlay: PixelPosition;
        };
    } {
        const primary = this.scales.get(primarySystem)!;
        const overlay = this.scales.get(overlaySystem)!;

        return {
            primary,
            overlay,
            convert: (pos: Position2D) => ({
                primary: primary.toPixel(pos),
                overlay: overlay.toPixel(pos)
            })
        };
    }

    // Analizar densidad de eventos por zona
    analyzeEventDensity(
        system: string,
        events: Array<{ x: number; y: number }>,
        gridSize: number = 4
    ): number[][] {
        const scale = this.scales.get(system);
        if (!scale) throw new Error(`Scale not found: ${system}`);

        // Crear grid
        const density = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
        
        // Contar eventos por celda
        events.forEach(event => {
            if (!this.isValidPosition(system, event.x, event.y)) return;

            const normalized = scale.toNormalized(event);
            const gridX = Math.floor((normalized.x / 100) * gridSize);
            const gridY = Math.floor((normalized.y / 100) * gridSize);

            if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
                density[gridY][gridX]++;
            }
        });

        return density;
    }

    // Exportar configuración de escalas
    exportScaleConfigs(): Record<string, any> {
        const configs: Record<string, any> = {};

        this.scales.forEach((scale, name) => {
            configs[name] = {
                dimensions: scale.dimensions,
                orientation: scale.orientation,
                padding: scale.padding,
                totalDimensions: scale.totalDimensions
            };
        });

        return configs;
    }
}

// Uso del sistema de coordenadas
const coordManager = new CoordinateSystemManager();

// 1. Convertir desde StatsBomb a FIFA
const normalized = coordManager.convertToNormalized('statsbomb', 60, 40, 'fifa');
console.log('StatsBomb (60,40) → FIFA:', normalized); // { x: 50, y: 50 }

// 2. Convertir lote de puntos
const batch = coordManager.convertBatch('opta', [
    { x: 50, y: 32 },
    { x: 75, y: 48 }
], 'fifa');
console.log('Conversión en lote:', batch);

// 3. Obtener landmarks
const landmarks = coordManager.getAllLandmarks();
console.log('Landmarks FIFA:', landmarks.fifa);

// 4. Verificar validez de posiciones
console.log('Posición válida (statsbomb):', coordManager.isValidPosition('statsbomb', 90, 45));

// 5. Crear escala híbrida
const hybrid = coordManager.createHybridScale('fifa', 'statsbomb');
const converted = hybrid.convert({ x: 50, y: 50 });
console.log('Escala híbrida:', converted);

// 6. Analizar densidad de eventos
const events = [
    { x: 90, y: 45 }, { x: 88, y: 50 }, { x: 92, y: 40 },
    { x: 20, y: 30 }, { x: 25, y: 35 }
];
const density = coordManager.analyzeEventDensity('fifa', events, 4);
console.log('Densidad de eventos:', density);

// 7. Exportar configuraciones
const configs = coordManager.exportScaleConfigs();
console.log('Configuraciones exportadas:', configs);
```

### Ejemplo 3: Sistema de Validación Avanzado

```typescript
import {
    validateEvent,
    validateEventBatch,
    validatePosition,
    validateTeamRef,
    POSITION_BOUNDS,
    VALID_EVENT_TYPES,
    VALID_EVENT_OUTCOMES,
    isValidEventType,
    isValidEventOutcome,
    isPositionInBounds
} from '@tacticgl/core';

// Validador avanzado con reglas personalizadas
class AdvancedEventValidator {
    private customRules: Array<(event: any) => string[]> = [];
    private positionBounds: { min: number; max: number } = POSITION_BOUNDS;

    constructor() {
        this.setupDefaultRules();
    }

    private setupDefaultRules(): void {
        // Regla 1: Validar coordenadas de tiros realistas
        this.addRule((event) => {
            if (event.type === 'shot') {
                const errors: string[] = [];
                
                // Los tiros deben estar en campo ofensivo
                if (event.team?.side === 'home' && event.position.x < 50) {
                    errors.push('Shot by home team should be in attacking half');
                }
                if (event.team?.side === 'away' && event.position.x > 50) {
                    errors.push('Shot by away team should be in attacking half');
                }

                // xG debe estar en rango válido
                if (event.metadata?.xG !== undefined) {
                    const xG = Number(event.metadata.xG);
                    if (isNaN(xG) || xG < 0 || xG > 1) {
                        errors.push('xG must be a number between 0 and 1');
                    }
                }

                return errors;
            }
            return [];
        });

        // Regla 2: Validar timing de eventos
        this.addRule((event) => {
            const errors: string[] = [];

            // Validar timestamp vs minute/second
            if (event.timestamp !== undefined && event.minute !== undefined) {
                const expectedTimestamp = (event.minute * 60) + (event.second || 0);
                if (Math.abs(event.timestamp - expectedTimestamp) > 5) {
                    errors.push('Timestamp does not match minute/second');
                }
            }

            // Validar periodo válido
            if (event.period !== undefined && (event.period < 1 || event.period > 4)) {
                errors.push('Period must be between 1 and 4');
            }

            return errors;
        });

        // Regla 3: Validar referencias de jugador/equipo
        this.addRule((event) => {
            const errors: string[] = [];

            // Si hay player, debe haber team
            if (event.player && !event.team) {
                errors.push('Player reference requires team reference');
            }

            // Validar side consistency
            if (event.player?.teamId && event.team?.id) {
                if (event.player.teamId !== event.team.id) {
                    errors.push('Player teamId does not match team id');
                }
            }

            return errors;
        });
    }

    // Añadir regla personalizada
    addRule(rule: (event: any) => string[]): void {
        this.customRules.push(rule);
    }

    // Validar evento con reglas personalizadas
    validateAdvanced(event: any, options?: {
        customBounds?: { min: number; max: number };
        strictMode?: boolean;
        preserveUnknownFields?: boolean;
    }): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        normalized?: any;
    } {
        const allErrors: string[] = [];
        const warnings: string[] = [];

        // 1. Validación básica con opciones personalizadas
        const bounds = options?.customBounds || this.positionBounds;
        const basicResult = validateEvent(event, {
            validatePositionBounds: true,
            validateEventType: true,
            positionBounds: bounds
        });

        allErrors.push(...basicResult.errors);

        // 2. Aplicar reglas personalizadas
        this.customRules.forEach(rule => {
            const ruleErrors = rule(event);
            allErrors.push(...ruleErrors);
        });

        // 3. Validaciones adicionales en modo estricto
        if (options?.strictMode) {
            // Validar que no hay campos unknown innecesarios
            const knownFields = [
                'id', 'timestamp', 'minute', 'second', 'period', 'type',
                'position', 'endPosition', 'player', 'team', 'outcome', 'metadata'
            ];

            const unknownFields = Object.keys(event).filter(
                key => !knownFields.includes(key) && key !== 'metadata'
            );

            if (unknownFields.length > 0) {
                warnings.push(`Unknown fields in strict mode: ${unknownFields.join(', ')}`);
            }
        }

        // 4. Normalizar evento si es válido
        let normalized;
        if (allErrors.length === 0 && options?.preserveUnknownFields !== false) {
            normalized = this.normalizeEvent(event);
        }

        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            warnings,
            normalized
        };
    }

    // Validar lote con estadísticas
    validateBatchAdvanced(
        events: any[],
        options?: Parameters<typeof this.validateAdvanced>[1] & {
            parallel?: boolean;
            maxConcurrency?: number;
        }
    ): {
        results: Array<ReturnType<typeof this.validateAdvanced>>;
        statistics: {
            total: number;
            valid: number;
            invalid: number;
            warnings: number;
            errorTypes: Record<string, number>;
        };
    } {
        const results: Array<ReturnType<typeof this.validateAdvanced>> = [];
        const errorTypes: Record<string, number> = {};

        // Procesamiento secuencial o paralelo
        const processEvent = async (event: any, index: number) => {
            const result = this.validateAdvanced(event, options);
            results[index] = result;

            // Contar tipos de errores
            result.errors.forEach(error => {
                const errorType = error.split(':')[0];
                errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
            });

            return result;
        };

        // Ejecutar validación
        if (options?.parallel && typeof Worker !== 'undefined') {
            // Implementación con Web Workers para grandes lotes
            return this.processInParallel(events, processEvent, options.maxConcurrency || 4);
        } else {
            // Procesamiento secuencial
            for (let i = 0; i < events.length; i++) {
                await processEvent(events[i], i);
            }
        }

        // Calcular estadísticas
        const statistics = {
            total: events.length,
            valid: results.filter(r => r.isValid).length,
            invalid: results.filter(r => !r.isValid).length,
            warnings: results.filter(r => r.warnings.length > 0).length,
            errorTypes
        };

        return { results, statistics };
    }

    private async processInParallel(
        events: any[],
        processEvent: (event: any, index: number) => Promise<any>,
        maxConcurrency: number
    ): Promise<{
        results: any[];
        statistics: any;
    }> {
        const results: any[] = [];
        const chunks = this.chunkArray(events, maxConcurrency);

        for (const chunk of chunks) {
            const chunkPromises = chunk.map((event, chunkIndex) => 
                processEvent(event, events.indexOf(event))
            );
            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);
        }

        const statistics = {
            total: events.length,
            valid: results.filter(r => r.isValid).length,
            invalid: results.filter(r => !r.isValid).length,
            warnings: results.filter(r => r.warnings.length > 0).length,
            errorTypes: {}
        };

        return { results, statistics };
    }

    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    private normalizeEvent(event: any): any {
        // Normalización básica del evento
        const normalized = { ...event };

        // Asegurar tipos correctos
        if (normalized.id !== undefined) {
            normalized.id = String(normalized.id);
        }

        if (normalized.position) {
            normalized.position = {
                x: Number(normalized.position.x),
                y: Number(normalized.position.y)
            };
        }

        // Limpiar campos undefined
        Object.keys(normalized).forEach(key => {
            if (normalized[key] === undefined) {
                delete normalized[key];
            }
        });

        return normalized;
    }

    // Utilidades de validación rápida
    static quickValidate(event: any): {
        isPositionValid: boolean;
        isTeamValid: boolean;
        isTypeValid: boolean;
        hasRequiredFields: boolean;
    } {
        return {
            isPositionValid: validatePosition(event?.position).length === 0,
            isTeamValid: validateTeamRef(event?.team).length === 0,
            isTypeValid: event?.type ? isValidEventType(event.type) : false,
            hasRequiredFields: !!(
                event?.id && 
                event?.type && 
                event?.position && 
                event?.team
            )
        };
    }

    // Generar reporte de calidad de datos
    generateQualityReport(events: any[]): {
        completeness: number;
        accuracy: number;
        consistency: number;
        validity: number;
        recommendations: string[];
    } {
        const total = events.length;
        if (total === 0) {
            return {
                completeness: 0,
                accuracy: 0,
                consistency: 0,
                validity: 0,
                recommendations: ['No events to analyze']
            };
        }

        // Métricas de completitud
        const completeness = events.filter(event => 
            event.id && event.type && event.position && event.team
        ).length / total;

        // Métricas de precisión (posiciones válidas)
        const accuracy = events.filter(event => 
            validatePosition(event?.position).length === 0
        ).length / total;

        // Métricas de consistencia (tipos válidos)
        const consistency = events.filter(event => 
            event.type ? isValidEventType(event.type) : false
        ).length / total;

        // Métricas de validez general
        const validity = events.filter(event => 
            validateEvent(event).isValid
        ).length / total;

        // Generar recomendaciones
        const recommendations: string[] = [];
        
        if (completeness < 0.9) {
            recommendations.push('Improve data completeness - missing required fields');
        }
        
        if (accuracy < 0.95) {
            recommendations.push('Review position data - some coordinates are invalid');
        }
        
        if (consistency < 0.95) {
            recommendations.push('Standardize event types - some are not recognized');
        }
        
        if (validity < 0.9) {
            recommendations.push('Overall data quality needs improvement');
        }

        return {
            completeness: Math.round(completeness * 100),
            accuracy: Math.round(accuracy * 100),
            consistency: Math.round(consistency * 100),
            validity: Math.round(validity * 100),
            recommendations
        };
    }
}

// Uso del validador avanzado
const validator = new AdvancedEventValidator();

// 1. Añadir regla personalizada
validator.addRule((event) => {
    const errors: string[] = [];
    
    // Validar que los tiros de penalti tienen xG alto
    if (event.type === 'shot' && event.position) {
        if (event.position.x > 85 && event.metadata?.xG < 0.5) {
            errors.push('Penalty shots should have high xG (>0.5)');
        }
    }
    
    return errors;
});

// 2. Validar evento individual
const testEvent = {
    id: 'shot_001',
    type: 'shot',
    position: { x: 88, y: 45 },
    team: { id: 1, name: 'Home Team', side: 'home' },
    player: { id: 'player1', name: 'Striker' },
    timestamp: 1234,
    minute: 45,
    second: 30,
    period: 1,
    outcome: 'goal',
    metadata: { xG: 0.76 }
};

const result = validator.validateAdvanced(testEvent, {
    strictMode: true,
    preserveUnknownFields: true
});

console.log('Validación avanzada:', result);

// 3. Validar lote con estadísticas
const eventBatch = [
    testEvent,
    {
        id: 'pass_001',
        type: 'pass',
        position: { x: 30, y: 50 },
        team: { id: 1, name: 'Home Team' }
    },
    {
        type: 'invalid_type',
        position: { x: 150, y: 200 }, // Fuera de bounds
        team: { id: 1 }
    }
];

const batchResult = validator.validateBatchAdvanced(eventBatch, {
    strictMode: true
});

console.log('Estadísticas de lote:', batchResult.statistics);

// 4. Reporte de calidad
const qualityReport = validator.generateQualityReport(eventBatch);
console.log('Reporte de calidad:', qualityReport);

// 5. Validación rápida
const quickCheck = AdvancedEventValidator.quickValidate(testEvent);
console.log('Check rápido:', quickCheck);
```

## 🎯 Patrones de Uso

### Patrón 1: Factory Pattern con RenderEngine

```typescript
// Factory para crear renderers configurados
class RendererFactory {
    static createSportsRenderer(
        container: HTMLElement,
        type: 'pitch' | 'analysis' | 'realtime' = 'pitch'
    ): {
        engine: RenderEngine;
        scale: PitchScale;
        renderer: IRenderer;
    } {
        const config = this.getConfigForType(type);
        
        const engine = new RenderEngine('auto');
        engine.renderer.init(container, config.render);
        
        const scale = new PitchScale(config.scale);
        
        return {
            engine,
            scale,
            renderer: engine.renderer
        };
    }

    private static getConfigForType(type: string) {
        const configs = {
            pitch: {
                render: {
                    width: 105,
                    height: 68,
                    responsive: true,
                    backgroundColor: '#2d5a27'
                },
                scale: {
                    width: 105,
                    height: 68,
                    padding: { top: 20, right: 20, bottom: 20, left: 20 }
                }
            },
            analysis: {
                render: {
                    width: 800,
                    height: 600,
                    responsive: false,
                    backgroundColor: '#1a1a1a'
                },
                scale: {
                    width: 120,
                    height: 80,
                    orientation: 'horizontal'
                }
            },
            realtime: {
                render: {
                    width: 400,
                    height: 300,
                    responsive: true,
                    backgroundColor: '#000000'
                },
                scale: {
                    width: 105,
                    height: 68,
                    orientation: 'horizontal'
                }
            }
        };

        return configs[type] || configs.pitch;
    }
}

// Uso
const { engine, scale, renderer } = RendererFactory.createSportsRenderer(
    document.getElementById('pitch')!,
    'analysis'
);
```

### Patrón 2: Observer Pattern para Eventos de Datos

```typescript
// Observable para eventos normalizados
class EventObservable {
    private observers: Array<(events: TacticGLEvent[]) => void> = [];
    private buffer: TacticGLEvent[] = [];
    private normalizer: ReturnType<typeof EventNormalizer.withOptions>;

    constructor() {
        this.normalizer = EventNormalizer.withOptions({
            sourceDimensions: { width: 120, height: 80 },
            preserveMetadata: true,
            skipInvalid: true
        });
    }

    subscribe(observer: (events: TacticGLEvent[]) => void): () => void {
        this.observers.push(observer);
        
        // Enviar buffer actual al nuevo observador
        if (this.buffer.length > 0) {
            observer([...this.buffer]);
        }

        // Retornar función de unsubscribe
        return () => {
            const index = this.observers.indexOf(observer);
            if (index > -1) {
                this.observers.splice(index, 1);
            }
        };
    }

    addRawEvents(rawEvents: any[]): void {
        const normalized = this.normalizer.normalizeBatch(rawEvents);
        this.buffer.push(...normalized);
        
        // Notificar a todos los observadores
        this.observers.forEach(observer => observer([...this.buffer]));
    }

    getEvents(): ReadonlyArray<TacticGLEvent> {
        return [...this.buffer];
    }

    clear(): void {
        this.buffer = [];
        this.observers.forEach(observer => observer([]));
    }
}

// Uso
const eventStream = new EventObservable();

const unsubscribe = eventStream.subscribe((events) => {
    console.log(`Received ${events.length} events`);
    // Renderizar eventos...
});

// Añadir datos
eventStream.addRawEvents([
    { type: 'shot', location: [90, 45], team: { id: 1 } }
]);

// Limpiar cuando sea necesario
unsubscribe();
```

### Patrón 3: Strategy Pattern para Diferentes Proveedores de Datos

```typescript
// Estrategias para diferentes proveedores de datos
interface DataProvider {
    normalize(raw: any): TacticGLEvent[];
    validate(data: any[]): { valid: any[]; invalid: any[] };
}

class StatsBombProvider implements DataProvider {
    normalize(raw: any[]): TacticGLEvent[] {
        return EventNormalizer.normalizeBatch(raw, {
            sourceDimensions: { width: 120, height: 80 },
            preserveMetadata: true
        });
    }

    validate(data: any[]): { valid: any[]; invalid: any[] } {
        const valid: any[] = [];
        const invalid: any[] = [];

        data.forEach(item => {
            const result = validateEvent(item);
            (result.isValid ? valid : invalid).push(item);
        });

        return { valid, invalid };
    }
}

class OptaProvider implements DataProvider {
    normalize(raw: any[]): TacticGLEvent[] {
        return EventNormalizer.normalizeBatch(raw, {
            sourceDimensions: { width: 100, height: 64 },
            clampPositions: true
        });
    }

    validate(data: any[]): { valid: any[]; invalid: any[] } {
        // Validación específica para Opta
        return {
            valid: data.filter(item => item.type && item.team),
            invalid: data.filter(item => !item.type || !item.team)
        };
    }
}

// Context que usa la estrategia
class DataProcessingContext {
    private provider: DataProvider;

    constructor(provider: DataProvider) {
        this.provider = provider;
    }

    setProvider(provider: DataProvider): void {
        this.provider = provider;
    }

    process(rawData: any[]): TacticGLEvent[] {
        const validation = this.provider.validate(rawData);
        console.log(`Validation: ${validation.valid.length}/${rawData.length} valid`);
        
        return this.provider.normalize(validation.valid);
    }
}

// Uso
const statsBombData = []; // Datos de StatsBomb
const optaData = []; // Datos de Opta

const context = new DataProcessingContext(new StatsBombProvider());
const normalizedEvents = context.process(statsBombData);

context.setProvider(new OptaProvider());
const optaEvents = context.process(optaData);
```

## 🔧 Mejores Prácticas

### 1. Gestión de Memoria y Recursos

```typescript
// ✅ Correcto: Limpiar recursos adecuadamente
class PitchVisualization {
    private engine: RenderEngine;
    private scale: PitchScale;
    private eventHandlers: Array<() => void> = [];

    constructor(container: HTMLElement) {
        this.engine = new RenderEngine('auto');
        this.scale = new PitchScale();
        this.engine.renderer.init(container, { width: 105, height: 68 });
        
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        // Guardar referencias para cleanup
        const resizeHandler = () => this.handleResize();
        window.addEventListener('resize', resizeHandler);
        this.eventHandlers.push(() => window.removeEventListener('resize', resizeHandler));
    }

    public destroy(): void {
        // Limpiar event handlers
        this.eventHandlers.forEach(cleanup => cleanup());
        this.eventHandlers = [];
        
        // Destruir renderer
        this.engine.renderer.destroy();
        
        // Limpiar referencias
        this.scale = null as any;
        this.engine = null as any;
    }
}

// ❌ Incorrecto: No limpiar recursos
function badExample() {
    const engine = new RenderEngine('auto');
    // ... usar engine
    // Sin cleanup - puede causar memory leaks
}
```

### 2. Validación de Datos Robusta

```typescript
// ✅ Correcto: Validar datos antes de procesar
function safeProcessEvents(rawEvents: any[]): TacticGLEvent[] {
    // 1. Validación rápida inicial
    const potentiallyValid = rawEvents.filter(canNormalize);
    
    if (potentiallyValid.length === 0) {
        throw new Error('No valid events found in input data');
    }
    
    // 2. Normalización con manejo de errores
    try {
        const normalized = EventNormalizer.normalizeBatch(potentiallyValid, {
            skipInvalid: true,
            warnOnInvalid: true
        });
        
        // 3. Validación post-normalización
        const validEvents = normalized.filter(event => 
            validateEvent(event).isValid
        );
        
        if (validEvents.length === 0) {
            throw new Error('All normalized events failed validation');
        }
        
        return validEvents;
    } catch (error) {
        throw new Error(`Event processing failed: ${error}`);
    }
}

// ❌ Incorrecto: Procesar datos sin validar
function badDataProcessing() {
    const events = EventNormalizer.normalizeBatch(badData);
    // Sin validación - puede causar errores en runtime
}
```

### 3. Manejo de Errores y Fallbacks

```typescript
// ✅ Correcto: Sistema de fallback robusto
class RobustRenderer {
    private engines: RenderEngine[] = [];
    private currentEngine: RenderEngine | null = null;

    constructor(container: HTMLElement, preference: RendererPreference = 'auto') {
        this.setupEngines(container, preference);
    }

    private setupEngines(container: HTMLElement, preference: RendererPreference): void {
        // Intentar renderer preferido primero
        try {
            this.currentEngine = new RenderEngine(preference, { force: true });
            this.engines.push(this.currentEngine);
        } catch (error) {
            console.warn(`Preferred renderer ${preference} not available, falling back`);
            
            // Fallback a auto-selección
            this.currentEngine = new RenderEngine('auto');
            this.engines.push(this.currentEngine);
        }
    }

    public getRenderer(): IRenderer {
        if (!this.currentEngine) {
            throw new Error('No renderer available');
        }
        
        return this.currentEngine.renderer;
    }

    public getInfo(): RenderEngineInfo | null {
        return this.currentEngine?.info || null;
    }
}
```

### 4. Performance con Grandes Datasets

```typescript
// ✅ Correcto: Procesamiento por chunks para grandes datasets
async function processLargeDataset(
    events: TacticGLEvent[],
    batchSize: number = 1000,
    onProgress?: (processed: number, total: number) => void
): Promise<TacticGLEvent[]> {
    const processed: TacticGLEvent[] = [];
    const total = events.length;
    
    for (let i = 0; i < total; i += batchSize) {
        const batch = events.slice(i, i + batchSize);
        
        // Procesar batch
        const normalized = EventNormalizer.normalizeBatch(batch);
        processed.push(...normalized);
        
        // Reportar progreso
        if (onProgress) {
            onProgress(Math.min(i + batchSize, total), total);
        }
        
        // Yield al event loop para mantener UI responsiva
        if (i % (batchSize * 4) === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    return processed;
}

// ❌ Incorrecto: Procesar todo de una vez
async function badPerformanceExample() {
    const allEvents = await EventNormalizer.normalizeBatch(hugeDataset);
    // Esto puede bloquear la UI con datasets grandes
}
```

### 5. Type Safety y IntelliSense

```typescript
// ✅ Correcto: Usar tipos específicos para mejor IntelliSense
interface ShotEvent extends TacticGLEvent {
    readonly type: 'shot';
    readonly outcome?: 'goal' | 'saved' | 'blocked' | 'off_target' | 'post';
    readonly metadata?: {
        readonly xG?: number;
        readonly bodyPart?: string;
        readonly technique?: string;
    };
}

// Validación específica para tiros
function validateShotEvent(event: TacticGLEvent): event is ShotEvent {
    return event.type === 'shot' && 
           validateEvent(event).isValid &&
           isValidEventOutcome(event.outcome || 'success');
}

// ❌ Incorrecto: Usar tipos genéricos siempre
function badTyping(event: any) {
    // Sin tipos específicos - menos IntelliSense
}
```

## 🔍 Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Error: "Container must be attached to DOM"

```typescript
// ❌ Problema: Inicializar antes de que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('pitch');
    const engine = new RenderEngine('auto');
    engine.renderer.init(container!, { width: 105, height: 68 });
});

// ✅ Solución: Verificar que el contenedor está en el DOM
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('pitch');
    
    if (!container || !document.body.contains(container)) {
        console.error('Container not found or not in DOM');
        return;
    }
    
    const engine = new RenderEngine('auto');
    engine.renderer.init(container, { width: 105, height: 68 });
});
```

#### 2. Error: "Cannot normalize event: invalid or missing position"

```typescript
// ❌ Problema: Datos con formatos de posición inconsistentes
const badEvents = [
    { type: 'shot', location: 'invalid', team: { id: 1 } },
    { type: 'pass', coordinates: null, team: { id: 1 } }
];

// ✅ Solución: Normalizar con validación previa
function safeNormalizeEvents(rawEvents: any[]): TacticGLEvent[] {
    const validRawEvents = rawEvents.filter(event => {
        return event.type && 
               event.team && 
               event.team.id && 
               (event.location || event.coordinates || event.position);
    });
    
    return EventNormalizer.normalizeBatch(validRawEvents, {
        skipInvalid: true,
        warnOnInvalid: true,
        clampPositions: true
    });
}
```

#### 3. Problemas de Performance con SVG

```typescript
// ❌ Problema: Renderizar demasiados elementos SVG
const tooManyElements = Array(10000).fill(null).map((_, i) => ({
    type: 'circle',
    x: Math.random() * 105,
    y: Math.random() * 68,
    attributes: { r: 2, fill: 'red' }
}));

engine.renderer.render({ elements: tooManyElements }); // Lento

// ✅ Solución: Usar Canvas para grandes volúmenes o implementar virtualización
function optimizeForLargeDatasets(
    events: TacticGLEvent[], 
    threshold: number = 1000
): 'svg' | 'canvas' | 'virtualized' {
    if (events.length > threshold * 2) {
        return 'canvas'; // O implementar virtualización
    } else if (events.length > threshold) {
        return 'canvas';
    } else {
        return 'svg';
    }
}

// Implementar virtualización para SVG
function virtualizedRender(
    renderer: IRenderer,
    allElements: RenderElement[],
    visibleArea: { x: number; y: number; width: number; height: number }
): void {
    // Solo renderizar elementos en el área visible
    const visibleElements = allElements.filter(element => 
        element.x >= visibleArea.x && 
        element.x <= visibleArea.x + visibleArea.width &&
        element.y >= visibleArea.y && 
        element.y <= visibleArea.y + visibleArea.height
    );
    
    renderer.render({ elements: visibleElements }, { clear: true });
}
```

#### 4. Problemas de Coordenadas

```typescript
// ❌ Problema: Confusión entre sistemas de coordenadas
const scale = new PitchScale({ width: 105, height: 68 });

// Asumiendo coordenadas en sistema StatsBomb
const statsBombPosition = { x: 90, y: 45 };
const pixel = scale.toPixel(statsBombPosition); // ❌ Resultado incorrecto

// ✅ Solución: Usar el normalizador para conversión de coordenadas
const normalized = EventNormalizer.convertCoordinates(
    90, 45, 
    { width: 120, height: 80 } // Dimensiones StatsBomb
);
const correctPixel = scale.toPixel(normalized);

// ✅ O crear escala específica para el sistema de datos
const statsBombScale = new PitchScale({
    width: 120,
    height: 80
});
const directPixel = statsBombScale.toPixel({ x: 90, y: 45 });
```

#### 5. Memory Leaks con Event Listeners

```typescript
// ❌ Problema: No limpiar event listeners
class BadExample {
    constructor(container: HTMLElement) {
        this.engine = new RenderEngine('auto');
        this.engine.renderer.init(container, {});
        
        // Event listener sin referencia para cleanup
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    // No hay método destroy - memory leak
}

// ✅ Solución: Mantener referencias para cleanup
class GoodExample {
    private engine: RenderEngine;
    private eventHandlers: Array<() => void> = [];

    constructor(container: HTMLElement) {
        this.engine = new RenderEngine('auto');
        this.engine.renderer.init(container, {});
        
        // Guardar referencia para cleanup
        const resizeHandler = () => this.handleResize();
        window.addEventListener('resize', resizeHandler);
        this.eventHandlers.push(() => 
            window.removeEventListener('resize', resizeHandler)
        );
    }
    
    public destroy(): void {
        // Limpiar todos los event handlers
        this.eventHandlers.forEach(cleanup => cleanup());
        this.eventHandlers = [];
        
        // Destruir renderer
        this.engine.renderer.destroy();
    }
}
```

### Debug y Logging

#### Habilitar Debug Mode

```typescript
import { DEBUG_MODE } from '@tacticgl/core';

// Si está disponible en tu build
if (DEBUG_MODE) {
    console.log('TacticGL Debug Mode Enabled');
    
    // Habilitar logging detallado
    (window as any).TacticGLDebug = {
        validateEvent,
        EventNormalizer,
        detectAllCapabilities
    };
}
```

#### Instrumentación Personalizada

```typescript
class InstrumentedRenderer {
    private renderCount = 0;
    private errorCount = 0;
    private performanceMarks: Array<{ name: string; time: number }> = [];

    constructor(private renderer: IRenderer) {
        this.setupInstrumentation();
    }

    private setupInstrumentation(): void {
        // Instrumentar eventos de renderizado
        this.renderer.on('render', ({ data, duration }) => {
            this.renderCount++;
            console.log(`Render #${this.renderCount}: ${duration.toFixed(2)}ms`);
            
            // Performance mark
            performance.mark(`render-${this.renderCount}`);
        });

        this.renderer.on('error', ({ error, context }) => {
            this.errorCount++;
            console.error(`Error #${this.errorCount} in ${context}:`, error);
        });
    }

    public getMetrics() {
        return {
            renderCount: this.renderCount,
            errorCount: this.errorCount,
            performanceMarks: [...this.performanceMarks]
        };
    }
}
```

### Compatibilidad de Navegadores

| Característica | Chrome/Edge | Firefox | Safari | IE 11 |
|---------------|-------------|---------|--------|-------|
| SVG Support | ✅ | ✅ | ✅ | ❌ |
| Canvas Support | ✅ | ✅ | ✅ | ✅ |
| WebGL Support | ✅ | ✅ | ✅ | ⚠️ |
| ES2020 Features | ✅ | ✅ | ✅ | ❌ |
| TypeScript | ✅ | ✅ | ✅ | ❌ |

**Recomendaciones:**

- Usar SVGRenderer como fallback seguro
- Implementar detección de capacidades antes de usar WebGL
- Proporcionar polyfills para navegadores antiguos si es necesario

## 🤝 Contribuir

### Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/tacticgl/core.git
cd core

# Instalar dependencias
pnpm install

# Ejecutar tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build
pnpm build
```

### Guías de Contribución

1. **Tipos**: Todos los nuevos features deben incluir tipos TypeScript completos
2. **Tests**: Añadir tests para todas las nuevas funciones
3. **Documentación**: Actualizar README y ejemplos para nuevos features
4. **Performance**: Considerar impacto en performance para cambios de API
5. **Backward Compatibility**: Mantener compatibilidad con versiones anteriores cuando sea posible

### Estructura de Commits

```
feat(types): add new PlayerMetadata type
fix(data): resolve coordinate normalization issue
docs(api): update EventNormalizer examples
test(engine): add WebGL capability detection tests
perf(renderer): optimize SVG element creation
```

## 📄 Licencia

MIT License - ver [LICENSE](../LICENSE) para detalles.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/tacticgl/core/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tacticgl/core/discussions)
- **Email**: <support@tacticgl.com>

---

## 🎉 ¡Gracias por usar @tacticgl/core

Este paquete forma el núcleo sólido de TacticGL, proporcionando tipos unificados, normalización de datos robusta y un sistema de renderizado extensible. ¡Esperamos ver las increíbles visualizaciones que crees con estas herramientas!
