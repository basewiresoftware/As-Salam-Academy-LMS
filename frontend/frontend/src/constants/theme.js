import { Platform } from 'react-native';

/**
 * Palette taken from the Masjid As-Salam seal: a royal blue field, a brass
 * dome, and a white ring. Blue carries the UI, gold is reserved for accents
 * so it stays special.
 */
export const colors = {
  navy: '#0C2A6B',
  primary: '#12439E',
  primaryDeep: '#0A2E73',
  primaryTint: '#E7EDFA',

  gold: '#C8952B',
  goldLight: '#E6BE63',

  background: '#F4F6FB',
  surface: '#FFFFFF',
  border: '#D7DEEC',
  borderStrong: '#B9C4DC',

  /** Ink for display type — a shade off pure black so headlines read as blue. */
  ink: '#0B1E3F',
  /** Flat fills for the signed-out split screen. */
  panel: '#0B2559',
  panelSoft: '#153A7C',
  panelLine: 'rgba(255, 255, 255, 0.18)',
  /** Dimmer behind a modal. Ink at 45%, so overlays lean blue like the chrome. */
  scrim: 'rgba(11, 30, 63, 0.45)',
  /** Quiet grey-blue an input rests on until it is focused. */
  field: '#EDF1F8',
  hairline: '#E3E8F2',

  text: '#111827',
  textMuted: '#5B6579',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: '#C3D0EC',

  danger: '#B3261E',
  dangerTint: '#FDECEA',
  success: '#1E7A44',
};

/**
 * Two-stop gradients, kept here so every chrome surface leans the same way —
 * dark at the left, a shade brighter at the right.
 */
export const gradients = {
  /** The signed-in header bar. */
  header: [colors.navy, colors.primary],
  /** Flat crest panels that need a little depth. */
  panel: [colors.panel, colors.panelSoft],
};

/**
 * A serif carries every headline and a plain system sans carries the rest.
 * The pairing is what keeps the academy from looking like a stock dashboard.
 */
export const fonts = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  }),
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const typography = {
  /** Serif headlines, set tight. Sizes step down for narrow screens. */
  serifXl: {
    fontFamily: fonts.serif,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  serifLg: {
    fontFamily: fonts.serif,
    fontSize: 32,
    lineHeight: 37,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  serifMd: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  display: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  caption: { fontSize: 12, lineHeight: 17, fontWeight: '400' },
  overline: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4 },
};

export default { colors, fonts, gradients, spacing, radius, typography };
