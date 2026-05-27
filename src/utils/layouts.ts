import type { LayoutTemplate } from '../types/collage';

export const GRID_TEMPLATES: readonly LayoutTemplate[] = [
  {
    id: 'grid-2x1',
    name: '2 Side by Side',
    photoCount: 2,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 1 },
      { x: 0.5, y: 0, width: 0.5, height: 1 },
    ],
  },
  {
    id: 'grid-1x2',
    name: '2 Stacked',
    photoCount: 2,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.5 },
      { x: 0, y: 0.5, width: 1, height: 0.5 },
    ],
  },
  {
    id: 'grid-2x2',
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
    id: 'grid-hero-right',
    name: 'Hero + 2 Right',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 1 },
      { x: 0.6, y: 0, width: 0.4, height: 0.5 },
      { x: 0.6, y: 0.5, width: 0.4, height: 0.5 },
    ],
  },
  {
    id: 'grid-hero-bottom',
    name: 'Hero + 2 Bottom',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.6 },
      { x: 0, y: 0.6, width: 0.5, height: 0.4 },
      { x: 0.5, y: 0.6, width: 0.5, height: 0.4 },
    ],
  },
  {
    id: 'grid-l-shape',
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
    id: 'grid-3x1',
    name: '3 Column',
    photoCount: 3,
    gap: 2,
    cells: [
      { x: 0, y: 0, width: 0.333, height: 1 },
      { x: 0.333, y: 0, width: 0.334, height: 1 },
      { x: 0.667, y: 0, width: 0.333, height: 1 },
    ],
  },
  {
    id: 'grid-3x3',
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
    id: 'grid-hero-4',
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
    id: 'grid-cross',
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
    id: 'grid-mosaic-5',
    name: 'Mosaic 5',
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
    id: 'grid-2x3',
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
];

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
