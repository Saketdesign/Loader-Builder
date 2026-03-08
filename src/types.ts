export type CellShape =
  | 'rounded'
  | 'square'
  | 'circle'
  | 'diamond'
  | 'hexagon'
  | 'star';
export type AnimationPattern =
  | 'wave'
  | 'radial'
  | 'spiral'
  | 'pulse'
  | 'fluid'
  | 'rain'
  | 'radar'
  | 'spinner'
  | 'random';
export type AnimationStyle =
  | 'fade'
  | 'scale'
  | 'breathe'
  | 'glow'
  | 'pulse-size';
export type BackgroundStyle = 'breathe' | 'static' | 'glow-fade';

export type ColorMapType = 'none' | 'ocean' | 'fire' | 'cyber' | 'neon';

export interface LoaderColors {
  primary: string;
  inactive: string;
  background: string;
  text: string;
  colorMap?: ColorMapType;
}

export interface LoaderEffects {
  glow: number; // 0-100 intensity
  blur: number; // 0-20px
  bloom: boolean;
  enableTrails?: boolean;
  enable3DTilt?: boolean;
}

export interface LoaderConfig {
  id: string;
  position: { x: number; y: number };
  gridSize: number; // e.g., 10 for 10x10
  activeCells: boolean[][]; // [row][col]

  // Settings
  cellShape: CellShape;

  // Animation
  pattern: AnimationPattern;
  patternScale: number;
  speed: number; // 1-60 FPS or multiplier
  animationStyle: AnimationStyle;
  backgroundStyle: BackgroundStyle;

  // Appearance
  colors: LoaderColors;
  effects: LoaderEffects;
  densityBias: number; // 1.0 = uniform, > 1.0 = dense center, < 1.0 = sparse center
  text: string;
  subheading?: string;

  // Feature Toggles
  showGrid: boolean; // For builder mode
  showNodes: boolean; // Connecting lines
  showSubheading: boolean;
  textShimmer: boolean;
}

// Canvas State
export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}
