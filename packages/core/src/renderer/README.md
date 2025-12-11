# BaseRenderer - Clase Abstracta Base para Renderers

## 📋 Descripción

`BaseRenderer` es la clase abstracta base que proporciona la funcionalidad común a todos los tipos de renderer en TacticGL (SVG, Canvas2D, WebGL). Implementa la gestión de capas, el sistema de eventos tipado y el ciclo de vida completo del renderer.

## 🎯 Características Principales

- ✅ **Sistema de eventos tipado** - Event emitter con tipado estricto de TypeScript
- ✅ **Gestión de capas** - Añadir, remover y organizar capas con ordenamiento automático por zIndex
- ✅ **Validación de DOM** - Verificación estricta de que el contenedor existe y está adjuntado al DOM
- ✅ **Ciclo de vida completo** - Hooks de inicialización, renderizado, actualización y destrucción
- ✅ **Clase abstracta** - Define el contrato que todos los renderers deben cumplir
- ✅ **100% TypeScript** - Tipado estricto y autocompletado completo
- ✅ **Totalmente testeado** - >90% de coverage con tests unitarios exhaustivos

## 📦 Instalación

```bash
npm install @tacticgl/core
# o
pnpm add @tacticgl/core
# o
yarn add @tacticgl/core
```

## 🚀 Uso Básico

### Crear un Renderer Personalizado

```typescript
import { BaseRenderer } from '@tacticgl/core';
import type { NormalizedData, RendererCapabilities } from '@tacticgl/core/types';

class SVGRenderer extends BaseRenderer {
  // Definir las capacidades del renderer
  readonly capabilities: RendererCapabilities = {
    maxElements: 5000,
    supportsAnimation: true,
    supportsInteractivity: true,
    supportsFilters: true,
    performance: 'high'
  };

  // Implementar el método de creación del contexto
  protected createRenderContext(): void {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    this.getContainer()?.appendChild(svg);
  }

  // Implementar el método de renderizado
  render(data: NormalizedData, options?: RenderOptions): void {
    // Lógica de renderizado específica de SVG
    console.log('Rendering data:', data);
  }

  // Implementar el método de actualización
  update(data: Partial<NormalizedData>, transition?: TransitionConfig): void {
    // Lógica de actualización incremental
    console.log('Updating data:', data);
  }
}
```

### Usar el Renderer

```typescript
// Obtener el contenedor del DOM
const container = document.getElementById('pitch-container');

// Crear instancia del renderer
const renderer = new SVGRenderer();

// Inicializar el renderer
renderer.init(container, {
  width: 1280,
  height: 720,
  responsive: true,
  theme: 'dark'
});

// Añadir capas
const backgroundLayer = renderer.addLayer('background', 0);
const eventsLayer = renderer.addLayer('events', 10);
const overlayLayer = renderer.addLayer('overlay', 20);

// Renderizar datos
renderer.render({
  events: [
    {
      id: 'evt_001',
      type: 'shot',
      position: { x: 90, y: 45 },
      team: { id: 217, name: 'Barcelona' }
    }
  ]
});

// Actualizar datos
renderer.update({
  events: [/* ... */]
});

// Limpiar contenido
renderer.clear();

// Destruir renderer
renderer.destroy();
```

## 🎨 Gestión de Capas

Las capas permiten organizar el contenido en diferentes niveles de visualización:

```typescript
// Añadir capas con diferentes z-index
const field = renderer.addLayer('field', 0);      // Fondo
const zones = renderer.addLayer('zones', 5);      // Zonas tácticas
const events = renderer.addLayer('events', 10);   // Eventos del partido
const overlay = renderer.addLayer('overlay', 15); // Info superpuesta

// Obtener una capa
const eventsLayer = renderer.getLayer('events');

// Operaciones de capa
if (eventsLayer) {
  eventsLayer.hide();              // Ocultar
  eventsLayer.show();              // Mostrar
  eventsLayer.setOpacity(0.5);     // Cambiar opacidad
  eventsLayer.clear();             // Limpiar contenido
}

// Obtener todas las capas ordenadas por zIndex
const layers = renderer.getLayers(); // [field, zones, events, overlay]

// Remover una capa
renderer.removeLayer('overlay');
```

## 📡 Sistema de Eventos

El renderer emite eventos tipados durante su ciclo de vida:

```typescript
// Evento de inicialización
renderer.on('init', ({ container, config }) => {
  console.log('Renderer initialized', container, config);
});

// Evento de renderizado
renderer.on('render', ({ data, duration }) => {
  console.log(`Rendered in ${duration}ms`);
});

// Evento de capa añadida
renderer.on('layerAdded', ({ layer }) => {
  console.log('Layer added:', layer.id);
});

// Evento de destrucción
renderer.on('destroy', () => {
  console.log('Renderer destroyed');
});

// Desuscribir de un evento
const callback = () => console.log('Init');
renderer.on('init', callback);
renderer.off('init', callback);
```

### Eventos Disponibles

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `init` | `{ container, config }` | Emitido después de la inicialización exitosa |
| `render` | `{ data, duration }` | Emitido después de un renderizado completo |
| `update` | `{ data }` | Emitido después de una actualización parcial |
| `clear` | `void` | Emitido después de limpiar el contenido |
| `destroy` | `void` | Emitido al destruir el renderer |
| `error` | `{ error, context }` | Emitido cuando ocurre un error |
| `layerAdded` | `{ layer }` | Emitido cuando se añade una capa |
| `layerRemoved` | `{ layerId }` | Emitido cuando se remueve una capa |

## 🔧 API Reference

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `isInitialized` | `boolean` | Indica si el renderer ha sido inicializado |
| `capabilities` | `RendererCapabilities` | Capacidades técnicas del renderer (abstracta) |

### Métodos del Ciclo de Vida

#### `init(container: HTMLElement, config: RenderConfig): void`

Inicializa el renderer en el contenedor especificado.

**Throws:**
- `Error` si el container es null
- `Error` si el container no está adjuntado al DOM

```typescript
renderer.init(document.getElementById('pitch'), {
  width: 800,
  height: 600
});
```

#### `render(data: NormalizedData, options?: RenderOptions): void` (abstracto)

Renderiza los datos proporcionados. Debe ser implementado por cada renderer específico.

#### `update(data: Partial<NormalizedData>, transition?: TransitionConfig): void` (abstracto)

Actualiza parcialmente el renderizado existente. Optimizado para cambios incrementales.

#### `clear(): void`

Limpia el contenido renderizado manteniendo la estructura de capas.

#### `destroy(): void`

Destruye el renderer y libera todos los recursos (capas, event handlers, referencias DOM).

### Métodos de Capas

#### `addLayer(id: string, zIndex: number): Layer`

Añade una nueva capa de renderizado.

```typescript
const layer = renderer.addLayer('events', 10);
```

#### `getLayer(id: string): Layer | null`

Obtiene una capa por su ID.

#### `getLayers(): ReadonlyArray<Layer>`

Obtiene todas las capas ordenadas por zIndex (ascendente).

#### `removeLayer(id: string): void`

Elimina una capa y su contenido.

### Métodos de Eventos

#### `on<K>(event: K, callback: RendererEventCallback<K>): void`

Suscribe a un evento del renderer.

#### `off<K>(event: K, callback: RendererEventCallback<K>): void`

Desuscribe de un evento.

### Utilidades

#### `resize(width: number, height: number): void`

Redimensiona el renderer al nuevo tamaño.

#### `getContainer(): HTMLElement | null`

Obtiene el elemento DOM raíz del renderer.

## 🧪 Testing

El módulo incluye tests exhaustivos con >90% de coverage:

```bash
# Ejecutar tests
pnpm test packages/core/src/renderer/

# Ejecutar con coverage
pnpm test:coverage
```

## 📚 Recursos Adicionales

- [Documentación de API](../../../docs/api/renderer.md)
- [Guía de Implementación](../../../docs/guides/implementing-renderers.md)
- [Ejemplos](../../../examples/renderers/)

## 🤝 Contribuir

Para contribuir al desarrollo de `BaseRenderer`:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Asegúrate de que los tests pasen (`pnpm test`)
4. Commit tus cambios (`git commit -m 'Add amazing feature'`)
5. Push a la rama (`git push origin feature/amazing-feature`)
6. Abre un Pull Request

## 📝 Licencia

MIT © TacticGL
