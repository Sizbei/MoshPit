// Skia ColorMatrix values (4x5 row-major)
// [R, G, B, A, translate] per row for R, G, B, A output

export interface FilterPreset {
  readonly id: string;
  readonly name: string;
  readonly matrix: readonly number[];
}

const identity: readonly number[] = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

export const FILTER_PRESETS: readonly FilterPreset[] = [
  { id: 'none', name: 'None', matrix: identity },
  {
    id: 'main-stage',
    name: 'Main Stage',
    matrix: [
      1.2, 0.1, 0.1, 0, 10,
      0, 0.8, 0.2, 0, 0,
      0.1, 0, 1.3, 0, 20,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'techno-tent',
    name: 'Techno Tent',
    matrix: [
      1.4, 0, 0, 0, 20,
      0, 0.7, 0, 0, 0,
      0, 0, 0.6, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'trance-arena',
    name: 'Trance Arena',
    matrix: [
      0.6, 0, 0.1, 0, 0,
      0, 0.9, 0.2, 0, 10,
      0.1, 0.1, 1.4, 0, 30,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'bass-stage',
    name: 'Bass Stage',
    matrix: [
      0.7, 0.1, 0, 0, 0,
      0.1, 1.3, 0, 0, 15,
      0, 0, 0.6, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'sunrise-set',
    name: 'Sunrise Set',
    matrix: [
      1.3, 0.1, 0, 0, 15,
      0, 1.1, 0.05, 0, 10,
      0, 0, 0.8, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'afterhours',
    name: 'Afterhours',
    matrix: [
      0.8, 0, 0.1, 0, 0,
      0, 0.7, 0.1, 0, 0,
      0.1, 0.1, 0.9, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'neon-nights',
    name: 'Neon Nights',
    matrix: [
      1.1, 0, 0.2, 0, 5,
      0, 1.0, 0.1, 0, 0,
      0.2, 0, 1.2, 0, 15,
      0, 0, 0, 1, 0,
    ],
  },
];
