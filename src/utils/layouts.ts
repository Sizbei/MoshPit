import type { LayoutTemplate, LayoutRect } from '../types/collage';

// =============================================================================
// SECTION 1: 60+ HAND-CRAFTED LAYOUT TEMPLATES
// All coordinates normalized to 0-1 range. Organized by photo count.
// =============================================================================

// --- 2 Photos ---

const TEMPLATES_2: readonly LayoutTemplate[] = [
  {
    id: '2-side-by-side',
    name: 'Side by Side',
    photoCount: 2,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 1 },
      { x: 0.5, y: 0, width: 0.5, height: 1 },
    ],
  },
  {
    id: '2-stacked',
    name: 'Stacked',
    photoCount: 2,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.5 },
      { x: 0, y: 0.5, width: 1, height: 0.5 },
    ],
  },
  {
    id: '2-hero-left',
    name: 'Hero Left',
    photoCount: 2,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.618, height: 1 },
      { x: 0.618, y: 0, width: 0.382, height: 1 },
    ],
  },
  {
    id: '2-hero-right',
    name: 'Hero Right',
    photoCount: 2,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.382, height: 1 },
      { x: 0.382, y: 0, width: 0.618, height: 1 },
    ],
  },
  {
    id: '2-hero-top',
    name: 'Hero Top',
    photoCount: 2,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.618 },
      { x: 0, y: 0.618, width: 1, height: 0.382 },
    ],
  },
  {
    id: '2-panoramic-strips',
    name: 'Panoramic Strips',
    photoCount: 2,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.35 },
      { x: 0, y: 0.65, width: 1, height: 0.35 },
    ],
  },
  {
    id: '2-diagonal-split',
    name: '70/30 Diagonal',
    photoCount: 2,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.7, height: 1 },
      { x: 0.7, y: 0, width: 0.3, height: 1 },
    ],
  },
];

// --- 3 Photos ---

const TEMPLATES_3: readonly LayoutTemplate[] = [
  {
    id: '3-equal-columns',
    name: '3 Equal Columns',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.333, height: 1 },
      { x: 0.333, y: 0, width: 0.334, height: 1 },
      { x: 0.667, y: 0, width: 0.333, height: 1 },
    ],
  },
  {
    id: '3-equal-rows',
    name: '3 Equal Rows',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.333 },
      { x: 0, y: 0.333, width: 1, height: 0.334 },
      { x: 0, y: 0.667, width: 1, height: 0.333 },
    ],
  },
  {
    id: '3-hero-left-stack',
    name: 'Hero Left + 2 Right',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 1 },
      { x: 0.6, y: 0, width: 0.4, height: 0.5 },
      { x: 0.6, y: 0.5, width: 0.4, height: 0.5 },
    ],
  },
  {
    id: '3-hero-right-stack',
    name: 'Hero Right + 2 Left',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.4, height: 0.5 },
      { x: 0, y: 0.5, width: 0.4, height: 0.5 },
      { x: 0.4, y: 0, width: 0.6, height: 1 },
    ],
  },
  {
    id: '3-hero-top',
    name: 'Hero Top + 2 Bottom',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.6 },
      { x: 0, y: 0.6, width: 0.5, height: 0.4 },
      { x: 0.5, y: 0.6, width: 0.5, height: 0.4 },
    ],
  },
  {
    id: '3-hero-bottom',
    name: '2 Top + Hero Bottom',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.4 },
      { x: 0.5, y: 0, width: 0.5, height: 0.4 },
      { x: 0, y: 0.4, width: 1, height: 0.6 },
    ],
  },
  {
    id: '3-l-shape',
    name: 'L-Shape',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 1 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
  {
    id: '3-t-shape',
    name: 'T-Shape',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.5 },
      { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
  {
    id: '3-golden-left',
    name: 'Golden Ratio Left',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.618, height: 1 },
      { x: 0.618, y: 0, width: 0.382, height: 0.618 },
      { x: 0.618, y: 0.618, width: 0.382, height: 0.382 },
    ],
  },
  {
    id: '3-magazine-feature',
    name: 'Magazine Feature',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.65, height: 0.65 },
      { x: 0.65, y: 0, width: 0.35, height: 0.65 },
      { x: 0, y: 0.65, width: 1, height: 0.35 },
    ],
  },
];

// --- 4 Photos ---

const TEMPLATES_4: readonly LayoutTemplate[] = [
  {
    id: '4-grid-2x2',
    name: '2x2 Grid',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
  {
    id: '4-hero-top-3-bottom',
    name: 'Hero + 3 Bottom',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.6 },
      { x: 0, y: 0.6, width: 0.333, height: 0.4 },
      { x: 0.333, y: 0.6, width: 0.334, height: 0.4 },
      { x: 0.667, y: 0.6, width: 0.333, height: 0.4 },
    ],
  },
  {
    id: '4-hero-left-3-right',
    name: 'Hero + 3 Right',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 1 },
      { x: 0.6, y: 0, width: 0.4, height: 0.333 },
      { x: 0.6, y: 0.333, width: 0.4, height: 0.334 },
      { x: 0.6, y: 0.667, width: 0.4, height: 0.333 },
    ],
  },
  {
    id: '4-columns',
    name: '4 Equal Columns',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.25, height: 1 },
      { x: 0.25, y: 0, width: 0.25, height: 1 },
      { x: 0.5, y: 0, width: 0.25, height: 1 },
      { x: 0.75, y: 0, width: 0.25, height: 1 },
    ],
  },
  {
    id: '4-rows',
    name: '4 Equal Rows',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.25 },
      { x: 0, y: 0.25, width: 1, height: 0.25 },
      { x: 0, y: 0.5, width: 1, height: 0.25 },
      { x: 0, y: 0.75, width: 1, height: 0.25 },
    ],
  },
  {
    id: '4-asymmetric-mosaic',
    name: 'Asymmetric Mosaic',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 0.6 },
      { x: 0.6, y: 0, width: 0.4, height: 0.4 },
      { x: 0.6, y: 0.4, width: 0.4, height: 0.6 },
      { x: 0, y: 0.6, width: 0.6, height: 0.4 },
    ],
  },
  {
    id: '4-l-shape-wide',
    name: 'L-Shape Wide',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.65, height: 0.65 },
      { x: 0.65, y: 0, width: 0.35, height: 0.35 },
      { x: 0.65, y: 0.35, width: 0.35, height: 0.65 },
      { x: 0, y: 0.65, width: 0.65, height: 0.35 },
    ],
  },
  {
    id: '4-golden-quadrant',
    name: 'Golden Quadrant',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.618, height: 0.618 },
      { x: 0.618, y: 0, width: 0.382, height: 0.618 },
      { x: 0, y: 0.618, width: 0.618, height: 0.382 },
      { x: 0.618, y: 0.618, width: 0.382, height: 0.382 },
    ],
  },
  {
    id: '4-center-focus',
    name: 'Center Focus',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.7, height: 0.7 },
      { x: 0.7, y: 0, width: 0.3, height: 0.5 },
      { x: 0.7, y: 0.5, width: 0.3, height: 0.5 },
      { x: 0, y: 0.7, width: 0.7, height: 0.3 },
    ],
  },
  {
    id: '4-magazine-spread',
    name: 'Magazine Spread',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.7 },
      { x: 0.5, y: 0, width: 0.5, height: 0.4 },
      { x: 0.5, y: 0.4, width: 0.5, height: 0.6 },
      { x: 0, y: 0.7, width: 0.5, height: 0.3 },
    ],
  },
  {
    id: '4-3-top-1-bottom',
    name: '3 Top + 1 Bottom',
    photoCount: 4,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.333, height: 0.5 },
      { x: 0.333, y: 0, width: 0.334, height: 0.5 },
      { x: 0.667, y: 0, width: 0.333, height: 0.5 },
      { x: 0, y: 0.5, width: 1, height: 0.5 },
    ],
  },
];

// --- 5 Photos ---

const TEMPLATES_5: readonly LayoutTemplate[] = [
  {
    id: '5-cross',
    name: 'Cross Layout',
    photoCount: 5,
    gap: 2,
    cells: [
      { x: 0.25, y: 0, width: 0.5, height: 0.333 },
      { x: 0, y: 0.333, width: 0.333, height: 0.334 },
      { x: 0.333, y: 0.333, width: 0.334, height: 0.334 },
      { x: 0.667, y: 0.333, width: 0.333, height: 0.334 },
      { x: 0.25, y: 0.667, width: 0.5, height: 0.333 },
    ],
  },
  {
    id: '5-mosaic',
    name: 'Mosaic',
    photoCount: 5,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 0.5 },
      { x: 0.6, y: 0, width: 0.4, height: 0.5 },
      { x: 0, y: 0.5, width: 0.4, height: 0.5 },
      { x: 0.4, y: 0.5, width: 0.3, height: 0.5 },
      { x: 0.7, y: 0.5, width: 0.3, height: 0.5 },
    ],
  },
  {
    id: '5-hero-center',
    name: 'Hero Center',
    photoCount: 5,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.4 },
      { x: 0.5, y: 0, width: 0.5, height: 0.4 },
      { x: 0.15, y: 0.4, width: 0.7, height: 0.6 },
      { x: 0, y: 0.4, width: 0.15, height: 0.6 },
      { x: 0.85, y: 0.4, width: 0.15, height: 0.6 },
    ],
  },
  {
    id: '5-hero-top-4-bottom',
    name: 'Hero + 4 Bottom',
    photoCount: 5,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.55 },
      { x: 0, y: 0.55, width: 0.25, height: 0.45 },
      { x: 0.25, y: 0.55, width: 0.25, height: 0.45 },
      { x: 0.5, y: 0.55, width: 0.25, height: 0.45 },
      { x: 0.75, y: 0.55, width: 0.25, height: 0.45 },
    ],
  },
  {
    id: '5-hero-left-4-right',
    name: 'Hero Left + 4 Right',
    photoCount: 5,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.55, height: 1 },
      { x: 0.55, y: 0, width: 0.45, height: 0.25 },
      { x: 0.55, y: 0.25, width: 0.45, height: 0.25 },
      { x: 0.55, y: 0.5, width: 0.45, height: 0.25 },
      { x: 0.55, y: 0.75, width: 0.45, height: 0.25 },
    ],
  },
  {
    id: '5-t-shape',
    name: 'T-Shape',
    photoCount: 5,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.333, height: 0.5 },
      { x: 0.333, y: 0, width: 0.334, height: 0.5 },
      { x: 0.667, y: 0, width: 0.333, height: 0.5 },
      { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
  {
    id: '5-mixed-sizes',
    name: 'Mixed Sizes',
    photoCount: 5,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.4, height: 0.6 },
      { x: 0.4, y: 0, width: 0.3, height: 0.4 },
      { x: 0.7, y: 0, width: 0.3, height: 0.6 },
      { x: 0.4, y: 0.4, width: 0.3, height: 0.6 },
      { x: 0, y: 0.6, width: 0.4, height: 0.4 },
    ],
  },
  {
    id: '5-panoramic-stack',
    name: 'Panoramic Stack',
    photoCount: 5,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.2 },
      { x: 0, y: 0.2, width: 1, height: 0.2 },
      { x: 0, y: 0.4, width: 1, height: 0.2 },
      { x: 0, y: 0.6, width: 1, height: 0.2 },
      { x: 0, y: 0.8, width: 1, height: 0.2 },
    ],
  },
  {
    id: '5-diamond',
    name: 'Diamond Center',
    photoCount: 5,
    gap: 2,
    cells: [
      { x: 0.25, y: 0, width: 0.5, height: 0.3 },
      { x: 0, y: 0.3, width: 0.3, height: 0.4 },
      { x: 0.3, y: 0.2, width: 0.4, height: 0.6 },
      { x: 0.7, y: 0.3, width: 0.3, height: 0.4 },
      { x: 0.25, y: 0.7, width: 0.5, height: 0.3 },
    ],
  },
];

// --- 6 Photos ---

const TEMPLATES_6: readonly LayoutTemplate[] = [
  {
    id: '6-grid-2x3',
    name: '2x3 Grid',
    photoCount: 6,
    gap: 2,
    cells: Array.from({ length: 6 }, (_, i) => ({
      x: (i % 3) * 0.333,
      y: Math.floor(i / 3) * 0.5,
      width: 0.333,
      height: 0.5,
    })),
  },
  {
    id: '6-grid-3x2',
    name: '3x2 Grid',
    photoCount: 6,
    gap: 2,
    cells: Array.from({ length: 6 }, (_, i) => ({
      x: (i % 2) * 0.5,
      y: Math.floor(i / 2) * 0.333,
      width: 0.5,
      height: 0.333,
    })),
  },
  {
    id: '6-hero-top-5-bottom',
    name: 'Hero + 5 Bottom',
    photoCount: 6,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.55 },
      { x: 0, y: 0.55, width: 0.2, height: 0.45 },
      { x: 0.2, y: 0.55, width: 0.2, height: 0.45 },
      { x: 0.4, y: 0.55, width: 0.2, height: 0.45 },
      { x: 0.6, y: 0.55, width: 0.2, height: 0.45 },
      { x: 0.8, y: 0.55, width: 0.2, height: 0.45 },
    ],
  },
  {
    id: '6-mosaic-asymmetric',
    name: 'Asymmetric Mosaic',
    photoCount: 6,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.6 },
      { x: 0.5, y: 0, width: 0.25, height: 0.3 },
      { x: 0.75, y: 0, width: 0.25, height: 0.3 },
      { x: 0.5, y: 0.3, width: 0.5, height: 0.3 },
      { x: 0, y: 0.6, width: 0.6, height: 0.4 },
      { x: 0.6, y: 0.6, width: 0.4, height: 0.4 },
    ],
  },
  {
    id: '6-magazine',
    name: 'Magazine Layout',
    photoCount: 6,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 0.5 },
      { x: 0.6, y: 0, width: 0.4, height: 0.25 },
      { x: 0.6, y: 0.25, width: 0.4, height: 0.25 },
      { x: 0, y: 0.5, width: 0.333, height: 0.5 },
      { x: 0.333, y: 0.5, width: 0.334, height: 0.5 },
      { x: 0.667, y: 0.5, width: 0.333, height: 0.5 },
    ],
  },
  {
    id: '6-columns',
    name: '6 Columns',
    photoCount: 6,
    gap: 2,
    cells: Array.from({ length: 6 }, (_, i) => ({
      x: i * (1 / 6),
      y: 0,
      width: 1 / 6,
      height: 1,
    })),
  },
  {
    id: '6-mixed-hero',
    name: 'Mixed Hero',
    photoCount: 6,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.4, height: 0.5 },
      { x: 0.4, y: 0, width: 0.6, height: 0.5 },
      { x: 0, y: 0.5, width: 0.333, height: 0.5 },
      { x: 0.333, y: 0.5, width: 0.333, height: 0.5 },
      { x: 0.666, y: 0.5, width: 0.167, height: 0.5 },
      { x: 0.833, y: 0.5, width: 0.167, height: 0.5 },
    ],
  },
];

// --- 7 Photos ---

const TEMPLATES_7: readonly LayoutTemplate[] = [
  {
    id: '7-hero-6-grid',
    name: 'Hero + 6 Grid',
    photoCount: 7,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.5 },
      { x: 0, y: 0.5, width: 0.333, height: 0.25 },
      { x: 0.333, y: 0.5, width: 0.334, height: 0.25 },
      { x: 0.667, y: 0.5, width: 0.333, height: 0.25 },
      { x: 0, y: 0.75, width: 0.333, height: 0.25 },
      { x: 0.333, y: 0.75, width: 0.334, height: 0.25 },
      { x: 0.667, y: 0.75, width: 0.333, height: 0.25 },
    ],
  },
  {
    id: '7-mosaic',
    name: '7 Mosaic',
    photoCount: 7,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.4 },
      { x: 0.5, y: 0, width: 0.5, height: 0.4 },
      { x: 0, y: 0.4, width: 0.333, height: 0.3 },
      { x: 0.333, y: 0.4, width: 0.334, height: 0.3 },
      { x: 0.667, y: 0.4, width: 0.333, height: 0.3 },
      { x: 0, y: 0.7, width: 0.5, height: 0.3 },
      { x: 0.5, y: 0.7, width: 0.5, height: 0.3 },
    ],
  },
  {
    id: '7-mixed-magazine',
    name: '7 Magazine',
    photoCount: 7,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 0.6 },
      { x: 0.6, y: 0, width: 0.4, height: 0.3 },
      { x: 0.6, y: 0.3, width: 0.4, height: 0.3 },
      { x: 0, y: 0.6, width: 0.25, height: 0.4 },
      { x: 0.25, y: 0.6, width: 0.25, height: 0.4 },
      { x: 0.5, y: 0.6, width: 0.25, height: 0.4 },
      { x: 0.75, y: 0.6, width: 0.25, height: 0.4 },
    ],
  },
];

// --- 7 Photos (extra) ---

const TEMPLATES_7_EXTRA: readonly LayoutTemplate[] = [
  {
    id: '7-filmstrip',
    name: '7 Filmstrip',
    photoCount: 7,
    gap: 2,
    cells: Array.from({ length: 7 }, (_, i) => ({
      x: i * (1 / 7),
      y: 0.15,
      width: 1 / 7,
      height: 0.7,
    })),
  },
];

// --- 8 Photos ---

const TEMPLATES_8: readonly LayoutTemplate[] = [
  {
    id: '8-grid-2x4',
    name: '2x4 Grid',
    photoCount: 8,
    gap: 2,
    cells: Array.from({ length: 8 }, (_, i) => ({
      x: (i % 4) * 0.25,
      y: Math.floor(i / 4) * 0.5,
      width: 0.25,
      height: 0.5,
    })),
  },
  {
    id: '8-grid-4x2',
    name: '4x2 Grid',
    photoCount: 8,
    gap: 2,
    cells: Array.from({ length: 8 }, (_, i) => ({
      x: (i % 2) * 0.5,
      y: Math.floor(i / 2) * 0.25,
      width: 0.5,
      height: 0.25,
    })),
  },
  {
    id: '8-mosaic-mixed',
    name: '8 Mixed Mosaic',
    photoCount: 8,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.25, height: 0.25 },
      { x: 0.75, y: 0, width: 0.25, height: 0.25 },
      { x: 0.5, y: 0.25, width: 0.5, height: 0.25 },
      { x: 0, y: 0.5, width: 0.333, height: 0.5 },
      { x: 0.333, y: 0.5, width: 0.334, height: 0.5 },
      { x: 0.667, y: 0.5, width: 0.333, height: 0.25 },
      { x: 0.667, y: 0.75, width: 0.333, height: 0.25 },
    ],
  },
];

// --- 9 Photos ---

const TEMPLATES_9: readonly LayoutTemplate[] = [
  {
    id: '9-grid-3x3',
    name: '3x3 Grid',
    photoCount: 9,
    gap: 2,
    cells: Array.from({ length: 9 }, (_, i) => ({
      x: (i % 3) * 0.333,
      y: Math.floor(i / 3) * 0.333,
      width: 0.333,
      height: 0.333,
    })),
  },
  {
    id: '9-hero-8-grid',
    name: 'Hero + 8 Grid',
    photoCount: 9,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.25, height: 0.25 },
      { x: 0.75, y: 0, width: 0.25, height: 0.25 },
      { x: 0.5, y: 0.25, width: 0.25, height: 0.25 },
      { x: 0.75, y: 0.25, width: 0.25, height: 0.25 },
      { x: 0, y: 0.5, width: 0.25, height: 0.25 },
      { x: 0.25, y: 0.5, width: 0.25, height: 0.25 },
      { x: 0.5, y: 0.5, width: 0.25, height: 0.5 },
      { x: 0.75, y: 0.5, width: 0.25, height: 0.5 },
    ],
  },
  {
    id: '9-mosaic-magazine',
    name: '9 Magazine Mosaic',
    photoCount: 9,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 0.4 },
      { x: 0.6, y: 0, width: 0.4, height: 0.4 },
      { x: 0, y: 0.4, width: 0.333, height: 0.3 },
      { x: 0.333, y: 0.4, width: 0.334, height: 0.3 },
      { x: 0.667, y: 0.4, width: 0.333, height: 0.3 },
      { x: 0, y: 0.7, width: 0.25, height: 0.3 },
      { x: 0.25, y: 0.7, width: 0.25, height: 0.3 },
      { x: 0.5, y: 0.7, width: 0.25, height: 0.3 },
      { x: 0.75, y: 0.7, width: 0.25, height: 0.3 },
    ],
  },
];

// --- 9 Photos (extra) ---

const TEMPLATES_9_EXTRA: readonly LayoutTemplate[] = [
  {
    id: '9-mixed-asymmetric',
    name: '9 Mixed Asymmetric',
    photoCount: 9,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.4 },
      { x: 0.5, y: 0, width: 0.25, height: 0.4 },
      { x: 0.75, y: 0, width: 0.25, height: 0.4 },
      { x: 0, y: 0.4, width: 0.25, height: 0.3 },
      { x: 0.25, y: 0.4, width: 0.5, height: 0.3 },
      { x: 0.75, y: 0.4, width: 0.25, height: 0.3 },
      { x: 0, y: 0.7, width: 0.333, height: 0.3 },
      { x: 0.333, y: 0.7, width: 0.334, height: 0.3 },
      { x: 0.667, y: 0.7, width: 0.333, height: 0.3 },
    ],
  },
];

// --- 10 Photos ---

const TEMPLATES_10: readonly LayoutTemplate[] = [
  {
    id: '10-grid-2x5',
    name: '2x5 Grid',
    photoCount: 10,
    gap: 2,
    cells: Array.from({ length: 10 }, (_, i) => ({
      x: (i % 5) * 0.2,
      y: Math.floor(i / 5) * 0.5,
      width: 0.2,
      height: 0.5,
    })),
  },
  {
    id: '10-hero-mosaic',
    name: '10 Hero Mosaic',
    photoCount: 10,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.25, height: 0.25 },
      { x: 0.75, y: 0, width: 0.25, height: 0.25 },
      { x: 0.5, y: 0.25, width: 0.25, height: 0.25 },
      { x: 0.75, y: 0.25, width: 0.25, height: 0.25 },
      { x: 0, y: 0.5, width: 0.2, height: 0.5 },
      { x: 0.2, y: 0.5, width: 0.2, height: 0.5 },
      { x: 0.4, y: 0.5, width: 0.2, height: 0.5 },
      { x: 0.6, y: 0.5, width: 0.2, height: 0.5 },
      { x: 0.8, y: 0.5, width: 0.2, height: 0.5 },
    ],
  },
];

// --- 12 Photos ---

const TEMPLATES_12: readonly LayoutTemplate[] = [
  {
    id: '12-grid-3x4',
    name: '3x4 Grid',
    photoCount: 12,
    gap: 2,
    cells: Array.from({ length: 12 }, (_, i) => ({
      x: (i % 4) * 0.25,
      y: Math.floor(i / 4) * 0.333,
      width: 0.25,
      height: 0.333,
    })),
  },
  {
    id: '12-grid-4x3',
    name: '4x3 Grid',
    photoCount: 12,
    gap: 2,
    cells: Array.from({ length: 12 }, (_, i) => ({
      x: (i % 3) * 0.333,
      y: Math.floor(i / 3) * 0.25,
      width: 0.333,
      height: 0.25,
    })),
  },
];

// --- 16 Photos ---

const TEMPLATES_16: readonly LayoutTemplate[] = [
  {
    id: '16-grid-4x4',
    name: '4x4 Grid',
    photoCount: 16,
    gap: 2,
    cells: Array.from({ length: 16 }, (_, i) => ({
      x: (i % 4) * 0.25,
      y: Math.floor(i / 4) * 0.25,
      width: 0.25,
      height: 0.25,
    })),
  },
];

// =============================================================================
// ALL TEMPLATES COMBINED
// =============================================================================

export const GRID_TEMPLATES: readonly LayoutTemplate[] = [
  ...TEMPLATES_2,
  ...TEMPLATES_3,
  ...TEMPLATES_4,
  ...TEMPLATES_5,
  ...TEMPLATES_6,
  ...TEMPLATES_7,
  ...TEMPLATES_7_EXTRA,
  ...TEMPLATES_8,
  ...TEMPLATES_9,
  ...TEMPLATES_9_EXTRA,
  ...TEMPLATES_10,
  ...TEMPLATES_12,
  ...TEMPLATES_16,
];

// =============================================================================
// SECTION 2: TEMPLATE LOOKUP HELPERS
// =============================================================================

export function getTemplatesForPhotoCount(count: number): readonly LayoutTemplate[] {
  return GRID_TEMPLATES.filter((t) => t.photoCount === count);
}

export function getClosestTemplates(count: number): readonly LayoutTemplate[] {
  const exact = getTemplatesForPhotoCount(count);
  if (exact.length > 0) return exact;

  const sorted = [...GRID_TEMPLATES].sort(
    (a, b) => Math.abs(a.photoCount - count) - Math.abs(b.photoCount - count),
  );
  return sorted.slice(0, 4);
}

// =============================================================================
// SECTION 3: SQUARIFIED TREEMAP ALGORITHM
// Adapted from Bruls, Huizing, van Wijk (2000) and treemap-squared (MIT)
// Generates aesthetically pleasing, space-filling asymmetric grids
// from weighted input values.
// =============================================================================

interface TreemapRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface TreemapContainer {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

function sumArray(arr: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

function normalizeData(data: readonly number[], area: number): readonly number[] {
  const sum = sumArray(data);
  const multiplier = area / sum;
  return data.map((d) => d * multiplier);
}

function shortestEdge(container: TreemapContainer): number {
  return Math.min(container.width, container.height);
}

function calculateWorstAspectRatio(row: readonly number[], length: number): number {
  if (row.length === 0) return Infinity;
  const min = Math.min(...row);
  const max = Math.max(...row);
  const sum = sumArray(row);
  return Math.max(
    (length * length * max) / (sum * sum),
    (sum * sum) / (length * length * min),
  );
}

function doesAddingImproveRatio(
  currentRow: readonly number[],
  nextValue: number,
  length: number,
): boolean {
  if (currentRow.length === 0) return true;
  const newRow = [...currentRow, nextValue];
  const currentRatio = calculateWorstAspectRatio(currentRow, length);
  const newRatio = calculateWorstAspectRatio(newRow, length);
  return currentRatio >= newRatio;
}

function getCoordinates(
  row: readonly number[],
  container: TreemapContainer,
): readonly TreemapRect[] {
  const results: TreemapRect[] = [];
  let subX = container.x;
  let subY = container.y;

  if (container.width >= container.height) {
    const areaWidth = sumArray(row) / container.height;
    for (let i = 0; i < row.length; i++) {
      const h = row[i] / areaWidth;
      results.push({ x: subX, y: subY, width: areaWidth, height: h });
      subY += h;
    }
  } else {
    const areaHeight = sumArray(row) / container.width;
    for (let i = 0; i < row.length; i++) {
      const w = row[i] / areaHeight;
      results.push({ x: subX, y: subY, width: w, height: areaHeight });
      subX += w;
    }
  }
  return results;
}

function cutContainer(
  container: TreemapContainer,
  row: readonly number[],
): TreemapContainer {
  const area = sumArray(row);
  if (container.width >= container.height) {
    const areaWidth = area / container.height;
    return {
      x: container.x + areaWidth,
      y: container.y,
      width: container.width - areaWidth,
      height: container.height,
    };
  }
  const areaHeight = area / container.width;
  return {
    x: container.x,
    y: container.y + areaHeight,
    width: container.width,
    height: container.height - areaHeight,
  };
}

function squarifyRecursive(
  data: readonly number[],
  currentRow: readonly number[],
  container: TreemapContainer,
  results: TreemapRect[],
): void {
  if (data.length === 0) {
    if (currentRow.length > 0) {
      results.push(...getCoordinates(currentRow, container));
    }
    return;
  }

  const length = shortestEdge(container);
  const nextValue = data[0];

  if (doesAddingImproveRatio(currentRow, nextValue, length)) {
    squarifyRecursive(data.slice(1), [...currentRow, nextValue], container, results);
  } else {
    results.push(...getCoordinates(currentRow, container));
    const newContainer = cutContainer(container, currentRow);
    squarifyRecursive(data, [], newContainer, results);
  }
}

/**
 * Generate a treemap layout from weighted values.
 * Returns normalized rectangles (0-1 range) suitable for collage cells.
 *
 * Usage:
 *   const cells = generateTreemapLayout([3, 2, 2, 1, 1]);
 *   // Returns 5 LayoutRects filling a 0-1 square, sizes proportional to weights
 *
 * @param weights - Array of relative importance values (higher = larger cell).
 *                  For equal sizing, pass Array(n).fill(1).
 * @returns Normalized LayoutRect array.
 */
export function generateTreemapLayout(weights: readonly number[]): readonly LayoutRect[] {
  if (weights.length === 0) return [];
  if (weights.length === 1) return [{ x: 0, y: 0, width: 1, height: 1 }];

  // Sort descending for better squarification
  const sorted = [...weights].sort((a, b) => b - a);
  const normalized = normalizeData(sorted, 1);
  const results: TreemapRect[] = [];
  squarifyRecursive(normalized, [], { x: 0, y: 0, width: 1, height: 1 }, results);
  return results;
}

/**
 * Generate a LayoutTemplate using squarified treemap from weights.
 *
 * @param id - Template identifier
 * @param name - Human-readable name
 * @param weights - Relative sizes for each photo cell
 * @param gap - Gap in pixels between cells
 */
export function createTreemapTemplate(
  id: string,
  name: string,
  weights: readonly number[],
  gap: number = 2,
): LayoutTemplate {
  return {
    id,
    name,
    photoCount: weights.length,
    cells: generateTreemapLayout(weights),
    gap,
  };
}

// =============================================================================
// SECTION 4: GOLDEN RATIO SUBDIVISION
// Recursively subdivides a rectangle using phi (1.618) ratio.
// Produces aesthetically pleasing asymmetric layouts.
// =============================================================================

const PHI = 1.618033988749895;

/**
 * Recursively subdivide a rectangle using golden ratio.
 * Each step splits a golden-ratio portion off the long side,
 * alternating between horizontal and vertical cuts.
 *
 * @param count - Number of cells to generate
 * @param container - Starting rectangle (defaults to unit square)
 * @returns Array of LayoutRects
 */
export function generateGoldenRatioLayout(
  count: number,
  container: LayoutRect = { x: 0, y: 0, width: 1, height: 1 },
): readonly LayoutRect[] {
  if (count <= 0) return [];
  if (count === 1) return [container];

  const { x, y, width, height } = container;

  // Decide split direction: split along the longer side
  if (width >= height) {
    // Vertical split: left gets 1/phi, right gets rest
    const leftWidth = width / PHI;
    const rightWidth = width - leftWidth;

    const leftRect: LayoutRect = { x, y, width: leftWidth, height };
    const rightRect: LayoutRect = {
      x: x + leftWidth,
      y,
      width: rightWidth,
      height,
    };

    return [leftRect, ...generateGoldenRatioLayout(count - 1, rightRect)];
  }

  // Horizontal split: top gets 1/phi, bottom gets rest
  const topHeight = height / PHI;
  const bottomHeight = height - topHeight;

  const topRect: LayoutRect = { x, y, width, height: topHeight };
  const bottomRect: LayoutRect = {
    x,
    y: y + topHeight,
    width,
    height: bottomHeight,
  };

  return [topRect, ...generateGoldenRatioLayout(count - 1, bottomRect)];
}

/**
 * Create a LayoutTemplate using golden ratio subdivision.
 */
export function createGoldenRatioTemplate(
  id: string,
  name: string,
  photoCount: number,
  gap: number = 2,
): LayoutTemplate {
  return {
    id,
    name,
    photoCount,
    cells: generateGoldenRatioLayout(photoCount),
    gap,
  };
}

// =============================================================================
// SECTION 5: ROW-BASED JUSTIFIED LAYOUT (Google Photos / Flickr style)
// Adapted from Flickr's justified-layout (MIT License, SmugMug Inc.)
//
// Given N photos with aspect ratios, fills rows to a target height.
// Each row stretches to full width while preserving aspect ratios.
// Returns normalized (0-1) rectangles.
// =============================================================================

interface JustifiedLayoutOptions {
  /** Target row height as fraction of container (default: 0.25 = 4 rows) */
  readonly targetRowHeightFraction?: number;
  /** Tolerance +/- for row height (default: 0.2 = 20%) */
  readonly tolerance?: number;
}

interface JustifiedResult {
  /** Normalized cell rectangles */
  readonly cells: readonly LayoutRect[];
  /** Actual container aspect ratio (width/height) */
  readonly containerAspectRatio: number;
}

/**
 * Generate a justified row-based layout from photo aspect ratios.
 *
 * This is the algorithm used by Google Photos and Flickr:
 * 1. Add photos to a row one at a time
 * 2. When the row's combined aspect ratio exceeds the target,
 *    complete the row and start a new one
 * 3. All photos in a row share the same height
 * 4. Rows fill the full width
 *
 * Returns normalized rectangles assuming a square (1:1) container.
 * For non-square containers, scale x/width by containerWidth and
 * y/height by containerHeight.
 *
 * @param aspectRatios - Width/height ratio for each photo (e.g., 1.5 for landscape)
 * @param options - Layout configuration
 * @returns Justified layout result with cells and container info
 */
export function generateJustifiedLayout(
  aspectRatios: readonly number[],
  options: JustifiedLayoutOptions = {},
): JustifiedResult {
  const {
    targetRowHeightFraction = 0.25,
    tolerance = 0.2,
  } = options;

  if (aspectRatios.length === 0) {
    return { cells: [], containerAspectRatio: 1 };
  }

  // We work in a unit-width container and compute height
  const containerWidth = 1;
  const targetRowHeight = targetRowHeightFraction;
  const minAR = containerWidth / targetRowHeight * (1 - tolerance);
  const maxAR = containerWidth / targetRowHeight * (1 + tolerance);

  interface RowItem {
    readonly aspectRatio: number;
  }

  interface BuiltRow {
    readonly items: readonly RowItem[];
    readonly height: number;
  }

  const rows: BuiltRow[] = [];
  let currentRowItems: RowItem[] = [];

  for (let i = 0; i < aspectRatios.length; i++) {
    const item: RowItem = { aspectRatio: aspectRatios[i] };
    const candidateItems = [...currentRowItems, item];
    const rowAR = candidateItems.reduce((sum, it) => sum + it.aspectRatio, 0);

    if (rowAR >= minAR && rowAR <= maxAR) {
      // Fits within tolerance: complete the row
      const rowHeight = containerWidth / rowAR;
      rows.push({ items: candidateItems, height: rowHeight });
      currentRowItems = [];
    } else if (rowAR > maxAR) {
      // Too wide: decide whether to include or exclude this item
      if (currentRowItems.length === 0) {
        // Single wide photo, force it
        const rowHeight = containerWidth / item.aspectRatio;
        rows.push({ items: [item], height: rowHeight });
        currentRowItems = [];
      } else {
        const prevAR = currentRowItems.reduce((sum, it) => sum + it.aspectRatio, 0);
        const targetAR = containerWidth / targetRowHeight;
        if (Math.abs(rowAR - targetAR) < Math.abs(prevAR - targetAR)) {
          // Including item is closer to target
          const rowHeight = containerWidth / rowAR;
          rows.push({ items: candidateItems, height: rowHeight });
          currentRowItems = [];
        } else {
          // Excluding item is closer: finalize current row, start new one with this item
          const rowHeight = containerWidth / prevAR;
          rows.push({ items: currentRowItems, height: rowHeight });
          currentRowItems = [item];
        }
      }
    } else {
      // Too narrow: row needs more items
      currentRowItems.push(item);
    }
  }

  // Handle remaining items (widows)
  if (currentRowItems.length > 0) {
    const rowAR = currentRowItems.reduce((sum, it) => sum + it.aspectRatio, 0);
    // Match previous row height if possible, otherwise use target
    const prevHeight = rows.length > 0 ? rows[rows.length - 1].height : targetRowHeight;
    const rowHeight = Math.min(prevHeight, containerWidth / rowAR);
    rows.push({ items: currentRowItems, height: rowHeight });
  }

  // Convert rows to normalized cells
  const totalHeight = rows.reduce((sum, row) => sum + row.height, 0);
  const cells: LayoutRect[] = [];
  let currentY = 0;

  for (const row of rows) {
    const normalizedHeight = row.height / totalHeight;
    let currentX = 0;
    const totalAR = row.items.reduce((sum, it) => sum + it.aspectRatio, 0);

    for (const item of row.items) {
      const normalizedWidth = item.aspectRatio / totalAR;
      cells.push({
        x: currentX,
        y: currentY,
        width: normalizedWidth,
        height: normalizedHeight,
      });
      currentX += normalizedWidth;
    }
    currentY += normalizedHeight;
  }

  return {
    cells,
    containerAspectRatio: containerWidth / totalHeight,
  };
}

/**
 * Create a LayoutTemplate from photo aspect ratios using justified layout.
 */
export function createJustifiedTemplate(
  id: string,
  name: string,
  aspectRatios: readonly number[],
  options?: JustifiedLayoutOptions,
  gap: number = 2,
): LayoutTemplate {
  const result = generateJustifiedLayout(aspectRatios, options);
  return {
    id,
    name,
    photoCount: aspectRatios.length,
    cells: result.cells,
    gap,
  };
}

// =============================================================================
// SECTION 6: RANDOM/DYNAMIC LAYOUT GENERATION
// Binary subdivision approach (adapted from PhotoCollage project)
// Generates random but space-filling layouts by recursively splitting
// the canvas with random horizontal/vertical cuts.
// =============================================================================

/**
 * Generate a random collage layout by recursively subdividing the canvas.
 * Each split alternates between horizontal and vertical, with slight
 * randomization in split position for organic-looking results.
 *
 * @param count - Number of cells to generate
 * @param container - Starting rectangle (defaults to unit square)
 * @param seed - Optional seed for reproducible randomness (0-1)
 * @returns Array of LayoutRects
 */
export function generateRandomSubdivisionLayout(
  count: number,
  container: LayoutRect = { x: 0, y: 0, width: 1, height: 1 },
  seed?: number,
): readonly LayoutRect[] {
  // Simple seeded PRNG (mulberry32)
  let s = seed !== undefined ? Math.floor(seed * 2147483647) : Math.floor(Math.random() * 2147483647);
  function random(): number {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function subdivide(rect: LayoutRect, n: number): readonly LayoutRect[] {
    if (n <= 0) return [];
    if (n === 1) return [rect];

    const { x, y, width, height } = rect;

    // Decide split direction based on aspect ratio + some randomness
    const splitHorizontally = width < height
      ? random() < 0.7
      : random() < 0.3;

    // Split position: biased toward center but randomized
    const splitFraction = 0.3 + random() * 0.4; // Between 0.3 and 0.7

    // Distribute items to each half, at least 1 per side
    const leftCount = Math.max(1, Math.min(n - 1, Math.round(n * splitFraction)));
    const rightCount = n - leftCount;

    if (splitHorizontally) {
      // Horizontal split (top/bottom)
      const splitY = splitFraction;
      const topRect: LayoutRect = { x, y, width, height: height * splitY };
      const bottomRect: LayoutRect = {
        x,
        y: y + height * splitY,
        width,
        height: height * (1 - splitY),
      };
      return [
        ...subdivide(topRect, leftCount),
        ...subdivide(bottomRect, rightCount),
      ];
    }

    // Vertical split (left/right)
    const splitX = splitFraction;
    const leftRect: LayoutRect = { x, y, width: width * splitX, height };
    const rightRect: LayoutRect = {
      x: x + width * splitX,
      y,
      width: width * (1 - splitX),
      height,
    };
    return [
      ...subdivide(leftRect, leftCount),
      ...subdivide(rightRect, rightCount),
    ];
  }

  return subdivide(container, count);
}

/**
 * Create a LayoutTemplate from random subdivision.
 */
export function createRandomTemplate(
  id: string,
  name: string,
  photoCount: number,
  seed?: number,
  gap: number = 2,
): LayoutTemplate {
  return {
    id,
    name,
    photoCount,
    cells: generateRandomSubdivisionLayout(photoCount, undefined, seed),
    gap,
  };
}

// =============================================================================
// SECTION 7: SMART AUTO-LAYOUT
// Given N photos with aspect ratios, pick the best algorithm.
// =============================================================================

interface AutoLayoutOptions {
  /** Algorithm preference (default: 'auto') */
  readonly algorithm?: 'treemap' | 'justified' | 'golden' | 'random' | 'auto';
  /** Optional weights for treemap (defaults to equal) */
  readonly weights?: readonly number[];
  /** Optional seed for random layouts */
  readonly seed?: number;
}

/**
 * Automatically generate the best layout for a set of photos.
 *
 * Algorithm selection heuristic (when 'auto'):
 * - 2-4 photos: golden ratio (aesthetically pleasing for small counts)
 * - 5-8 photos: treemap (good space utilization with varied sizes)
 * - 9+ photos: justified rows (scales well, familiar Google Photos feel)
 * - If aspect ratios provided: justified (respects photo proportions)
 *
 * @param photoCount - Number of photos
 * @param aspectRatios - Optional aspect ratios for each photo
 * @param options - Algorithm options
 * @returns LayoutTemplate
 */
export function autoGenerateLayout(
  photoCount: number,
  aspectRatios?: readonly number[],
  options: AutoLayoutOptions = {},
): LayoutTemplate {
  const { algorithm = 'auto', weights, seed } = options;

  const id = `auto-${photoCount}-${Date.now()}`;
  const name = `Auto Layout (${photoCount})`;

  // If specific algorithm requested, use it
  if (algorithm !== 'auto') {
    switch (algorithm) {
      case 'treemap':
        return createTreemapTemplate(
          id,
          name,
          weights ?? Array(photoCount).fill(1),
        );
      case 'justified':
        return createJustifiedTemplate(
          id,
          name,
          aspectRatios ?? Array(photoCount).fill(1.33),
        );
      case 'golden':
        return createGoldenRatioTemplate(id, name, photoCount);
      case 'random':
        return createRandomTemplate(id, name, photoCount, seed);
    }
  }

  // Auto-select based on context
  if (aspectRatios && aspectRatios.length === photoCount) {
    // When we have aspect ratios, justified respects them best
    return createJustifiedTemplate(id, name, aspectRatios);
  }

  if (photoCount <= 4) {
    return createGoldenRatioTemplate(id, name, photoCount);
  }

  if (photoCount <= 8) {
    return createTreemapTemplate(
      id,
      name,
      weights ?? Array(photoCount).fill(1),
    );
  }

  // 9+ photos: justified with default aspect ratios
  return createJustifiedTemplate(
    id,
    name,
    Array(photoCount).fill(1.33),
  );
}
