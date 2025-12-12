import { PitchDimensions, PitchTheme } from './types';

export const FIFA_DIMENSIONS: PitchDimensions = {
    width: 105,
    height: 68,
    lineThickness: 0.12,
};

export const UEFA_DIMENSIONS: PitchDimensions = {
    width: 105,
    height: 68,
    lineThickness: 0.12,
};

export const PENALTY_AREA = {
    width: 16.5,
    height: 40.32, // (16.5 * 2) + 7.32 (goal width) = 40.32
};

export const GOAL_AREA = {
    width: 5.5,
    height: 18.32, // (5.5 * 2) + 7.32 = 18.32
};

export const CENTER_CIRCLE_RADIUS = 9.15;
export const PENALTY_SPOT_DISTANCE = 11;
export const CORNER_ARC_RADIUS = 1;

export const LIGHT_THEME: PitchTheme = {
    name: 'light',
    grass: '#567d46',
    lines: '#ffffff',
    goalLine: '#ffffff',
    penaltyArc: '#ffffff',
    centerCircle: '#ffffff',
};

export const DARK_THEME: PitchTheme = {
    name: 'dark',
    grass: '#1a1a1a',
    lines: '#444444',
    goalLine: '#444444',
    penaltyArc: '#444444',
    centerCircle: '#444444',
};
