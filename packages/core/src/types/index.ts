// Re-export all types for public API

// Geometry
export type {
    Position2D,
    PixelPosition,
    Dimensions,
    Padding,
    BoundingBox,
    PitchOrientation,
} from './geometry.types';

// Data
export type {
    EventType,
    EventOutcome,
    PlayerRef,
    TeamRef,
    TacticGLEvent,
    MatchMetadata,
    TeamLineup,
    TrackingFrame,
    NormalizedMatch,
    NormalizedData,
    RenderElement,
} from './data.types';

// Config
export type {
    Theme,
    PitchDimensions,
    RenderConfig,
    RenderOptions,
    TransitionConfig,
    EasingFunction,
    LayerConfig,
} from './config.types';

// Renderer
export type {
    RendererCapabilities,
    RendererType,
    RendererPreference,
    Layer,
    RendererEvents,
    RendererEventCallback,
    IRenderer,
    RenderEngineInfo,
    RenderEngineOptions,
} from './renderer.types';
