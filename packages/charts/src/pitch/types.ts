export interface PitchDimensions {
    width: number;
    height: number;
    lineThickness?: number;
}

export interface PitchTheme {
    name: string;
    grass: string;
    lines: string;
    goalLine: string;
    penaltyArc: string;
    centerCircle: string;
}

export type PitchOrientation = 'horizontal' | 'vertical';

export interface PitchConfig {
    container?: HTMLElement | string; // ID or element
    dimensions: PitchDimensions;
    orientation: PitchOrientation;
    theme: PitchTheme;
}

export interface DeepPartialPitchConfig {
    container?: HTMLElement | string;
    dimensions?: Partial<PitchDimensions>;
    orientation?: PitchOrientation;
    theme?: Partial<PitchTheme>;
}
