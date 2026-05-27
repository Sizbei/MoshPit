export const RAVE_COLORS = {
  hotPink: '#FF10F0',
  electricBlue: '#00BFFF',
  acidGreen: '#39FF14',
  uvPurple: '#BF00FF',
  laserRed: '#FF073A',
  neonOrange: '#FF6700',
  cyberYellow: '#FFD300',
  deepBlack: '#0A0A0A',
  darkGray: '#1A1A1A',
  mediumGray: '#2A2A2A',
  lightGray: '#E0E0E0',
  white: '#FFFFFF',
} as const;

export const STAGE_LIGHTING = {
  mainStage: { primary: '#FF10F0', secondary: '#BF00FF' },
  technoTent: { primary: '#FF073A', secondary: '#FF6700' },
  tranceArena: { primary: '#00BFFF', secondary: '#00E5FF' },
  bassStage: { primary: '#39FF14', secondary: '#FFD300' },
  sunriseSet: { primary: '#FFB347', secondary: '#FFCC33' },
} as const;

export const BACKGROUND = {
  editor: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  border: '#3A3A3A',
} as const;
