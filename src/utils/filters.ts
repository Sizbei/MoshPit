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
  {
    id: 'kodachrome',
    name: 'Kodachrome',
    matrix: [
      1.129, -0.397, -0.040, 0, 0.250,
      -0.164, 1.084, -0.055, 0, 0.097,
      -0.168, -0.560, 1.601, 0, 0.140,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'polaroid-film',
    name: 'Polaroid',
    matrix: [
      1.438, -0.062, -0.062, 0, 0,
      -0.122, 1.378, -0.122, 0, 0,
      -0.016, -0.016, 1.483, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    matrix: [
      1.5, -0.2, -0.1, 0, -0.05,
      -0.15, 1.4, -0.1, 0, -0.05,
      -0.1, -0.3, 1.8, 0, 0.02,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    matrix: [
      1.2, 0.1, 0.1, 0, 0.08,
      -0.1, 0.8, 0.3, 0, 0.02,
      0.1, 0.2, 1.3, 0, 0.06,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'cross-process',
    name: 'Cross Process',
    matrix: [
      1.2, -0.1, 0.1, 0, 0.05,
      -0.1, 1.0, 0.2, 0, 0.05,
      -0.3, 0.2, 0.8, 0, 0.08,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'night-vision',
    name: 'Night Vision',
    matrix: [
      0.1, 0.4, 0, 0, 0,
      0.3, 1.0, 0.3, 0, 0,
      0, 0.4, 0.1, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'bleach-bypass',
    name: 'Bleach Bypass',
    matrix: [
      0.6, 0.45, 0.15, 0, 0,
      0.15, 0.7, 0.15, 0, 0,
      0.15, 0.45, 0.5, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'lomo',
    name: 'Lomography',
    matrix: [
      1.6, -0.3, -0.1, 0, -0.05,
      -0.15, 1.5, -0.15, 0, -0.05,
      -0.1, -0.3, 1.7, 0, -0.05,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'sepia',
    name: 'Sepia',
    matrix: [
      0.393, 0.769, 0.189, 0, 0,
      0.349, 0.686, 0.168, 0, 0,
      0.272, 0.534, 0.131, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'bw-contrast',
    name: 'B&W High Contrast',
    matrix: [
      0.45, 0.9, 0.15, 0, -0.15,
      0.45, 0.9, 0.15, 0, -0.15,
      0.45, 0.9, 0.15, 0, -0.15,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'duotone-pink-blue',
    name: 'Duotone Pink/Blue',
    matrix: [
      0.35, 0.55, 0.10, 0, 0.10,
      0.05, 0.15, 0.05, 0, 0.02,
      0.30, 0.30, 0.10, 0, 0.20,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'duotone-orange-teal',
    name: 'Duotone Orange/Teal',
    matrix: [
      0.40, 0.55, 0.10, 0, 0.10,
      0.15, 0.35, 0.08, 0, 0.04,
      0.05, 0.15, 0.20, 0, 0.15,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'infrared',
    name: 'Infrared',
    matrix: [
      0, 0, 1, 0, 0,
      0, 1, 0, 0, 0,
      1, 0, 0, 0, 0,
      0, 0, 0, 1, 0,
    ],
  },
  {
    id: 'negative',
    name: 'Negative',
    matrix: [
      -1, 0, 0, 0, 1,
      0, -1, 0, 0, 1,
      0, 0, -1, 0, 1,
      0, 0, 0, 1, 0,
    ],
  },
];
