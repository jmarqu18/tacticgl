# @tacticgl/core

Core type definitions and interfaces for the TacticGL library.

## 📦 Package Structure

```
packages/core/
├── src/                    # Production source code
│   ├── types/             # TypeScript type definitions
│   │   ├── geometry.types.ts
│   │   ├── data.types.ts
│   │   ├── config.types.ts
│   │   ├── renderer.types.ts
│   │   └── index.ts
│   └── index.ts           # Main entry point
├── tests/                 # Test files (not published)
│   └── types/
│       ├── exports.test.ts
│       ├── validation.test.ts
│       └── types.typecheck.test.ts
├── dist/                  # Built files (generated)
└── package.json
```

## 🚀 Installation

```bash
pnpm add @tacticgl/core
```

## 📖 Usage

### Import all types
```typescript
import type { 
  Position2D, 
  TacticGLEvent, 
  IRenderer 
} from '@tacticgl/core';
```

### Import types module directly
```typescript
import type { Position2D } from '@tacticgl/core/types';
```

## 🧪 Development

### Run tests
```bash
pnpm test
```

### Type checking
```bash
pnpm type-check
```

### Build
```bash
pnpm build
```

## 📝 Type Definitions

### Geometry Types
- `Position2D` - Normalized 2D coordinates (0-100)
- `PixelPosition` - Pixel-based coordinates
- `Dimensions` - Width and height
- `Padding` - Spacing in 4 directions
- `BoundingBox` - Rectangle definition
- `PitchOrientation` - Field orientation

### Data Types
- `TacticGLEvent` - Normalized sports event
- `EventType` - 33+ supported event types
- `EventOutcome` - Event result states
- `NormalizedMatch` - Complete match data
- `TrackingFrame` - Positional tracking data

### Config Types
- `RenderConfig` - Renderer configuration
- `Theme` - Visual theme options
- `TransitionConfig` - Animation settings
- `LayerConfig` - Layer properties

### Renderer Types
- `IRenderer` - Core renderer interface
- `RendererCapabilities` - Renderer features
- `Layer` - Rendering layer
- `RendererType` - Available renderers (svg, canvas, webgl)

## 📄 License

MIT
