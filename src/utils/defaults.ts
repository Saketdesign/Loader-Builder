import type {
  LoaderConfig,
  CellShape,
  AnimationPattern,
  AnimationStyle,
} from '../types';

const SHAPES: CellShape[] = [
  'rounded',
  'square',
  'circle',
  'diamond',
  'hexagon',
  'star',
];
const PATTERNS: AnimationPattern[] = [
  'wave',
  'radial',
  'spiral',
  'pulse',
  'random',
];
const STYLES: AnimationStyle[] = [
  'fade',
  'scale',
  'breathe',
  'glow',
  'pulse-size',
];
const COLORS = [
  '#F97316',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
];

const HEADINGS = [
  'Pondering',
  'Crunching',
  'Brainstorming',
  'Processing',
  'Generating',
];
const SUBHEADINGS = [
  'Preparing your magic...',
  'Brewing something awesome...',
  'Almost ready, hang tight!',
  'Fetching the good stuff...',
  'One moment, please...',
];

const getRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const createDefaultLoader = (
  id: string,
  x: number,
  y: number
): LoaderConfig => ({
  id,
  position: { x, y },
  gridSize: 10,
  activeCells: [], // Pattern handling only for now
  cellShape: getRandom(SHAPES),
  pattern: getRandom(PATTERNS),
  patternScale: 1,
  speed: Math.round(1 + Math.random() * 4), // 1 to 5
  animationStyle: getRandom(STYLES),
  backgroundStyle: 'breathe',
  colors: {
    primary: getRandom(COLORS),
    inactive: '#1F2937',
    background: '#0a0a0a',
    text: '#FFFFFF',
  },
  effects: {
    glow: Math.round(30 + Math.random() * 50),
    blur: 0,
    bloom: true,
  },
  densityBias: 1.0,
  text: getRandom(HEADINGS),
  showGrid: false,
  showNodes: false,
  subheading: getRandom(SUBHEADINGS),
  showSubheading: true,
});
