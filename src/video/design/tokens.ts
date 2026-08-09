/**
 * NISTA design tokens — the single source of truth for the film's look.
 * Mirrors projects/nista-launch/strategy.md §2, §3, §4.4, §6.
 * Nothing in src/video may hardcode a hex, a font stack, an easing or a grid value.
 */
import type React from 'react';
import {Easing} from 'remotion';

/* ------------------------------------------------------------------ §2 colour */

export const C = {
  bgBase: '#0B1523',
  bgDeep: '#060C15',
  bgElevated: '#141F2E',
  bgRaised: '#1B2938',
  hairline: '#24344A',
  strong: '#2C3E56',
  fgPrimary: '#F2EFE8',
  fgSecondary: '#9DAABA',
  /**
   * fg/tertiary. Lifted from the original #6B7A8C.
   *
   * #6B7A8C measured 3.46:1 on bg/base, and the 17px mono roles that carry the film's
   * data labels were being drawn at `fg/secondary` `opacity .75`, which composites to
   * almost exactly the same value (~#7A8393) and measured 3.03–4.43:1 in the draft QA
   * pass — below the 4.5:1 floor in §9.9 on every one of them. The floor is not
   * negotiable and the type sizes are specified, so the fix is here: one token, lifted
   * until every 17/18px mono role clears 4.5:1 against its own composited background
   * (bg/base, the s03 diagram field, and the bg/elevated credential card fill alike),
   * with enough margin that an inclusive glyph mask still clears it.
   *
   * Relative luminance 0.339 against fg/secondary's 0.394 — 14% down, ΔL* ≈ 4 — so the
   * token stays subordinate but the separation is now carried mainly by size, weight and
   * tracking (17/18px uppercase mono vs 30-40px sentence case) rather than by tint alone.
   * That trade is forced: at 17px on a near-black field you cannot have both an 18-point
   * L* step below fg/secondary and 4.5:1, and 4.5:1 is the non-negotiable one.
   */
  fgTertiary: '#909FB2',
  signal: '#C6A15B',
  signalLift: '#D8B778',
  support: '#5B8AB4',
  supportLift: '#7FA6C9',
} as const;

/** rgba() helpers for the two structural colours used in gradients. */
export const deep = (a: number) => `rgba(6,12,21,${a})`;
export const signalA = (a: number) => `rgba(198,161,91,${a})`;
export const supportA = (a: number) => `rgba(91,138,180,${a})`;
/** Neutral steel light — the only "light source" colour allowed in constructed plates. */
export const steelA = (a: number) => `rgba(157,170,186,${a})`;

/* ------------------------------------------------------------------- §3 fonts */

/**
 * macOS-resident stacks only. No @font-face, no google-fonts, no Inter.
 * Weight is constrained to 300 / 400 / 500 / 700 — HelveticaNeue.ttc has no 600.
 */
export const FONT = {
  display:
    '"SF Pro Display", system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif',
  text: '"SF Pro Text", system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: '"SF Mono", ui-monospace, Menlo, Monaco, "Courier New", monospace',
} as const;

export type Weight = 300 | 400 | 500 | 700;

const smoothing: React.CSSProperties = {
  WebkitFontSmoothing: 'antialiased',
  margin: 0,
  padding: 0,
  fontKerning: 'normal',
};

const numeric: React.CSSProperties = {
  fontFeatureSettings: '"tnum" 1, "ss01" 1',
  fontVariantLigatures: 'none',
};

/** Type scale for 1920×1080. `lh` is the line box height in px (used by the reveal mask). */
export const TYPE = {
  display: {
    lh: 112,
    css: {
      ...smoothing,
      fontFamily: FONT.display,
      fontSize: 108,
      fontWeight: 500 as Weight,
      letterSpacing: '-3.2px',
      lineHeight: '112px',
      color: C.fgPrimary,
    } satisfies React.CSSProperties,
  },
  headline: {
    lh: 84,
    css: {
      ...smoothing,
      fontFamily: FONT.display,
      fontSize: 76,
      fontWeight: 500 as Weight,
      letterSpacing: '-2px',
      lineHeight: '84px',
      color: C.fgPrimary,
    } satisfies React.CSSProperties,
  },
  headlineSm: {
    lh: 70,
    css: {
      ...smoothing,
      fontFamily: FONT.display,
      fontSize: 60,
      fontWeight: 400 as Weight,
      letterSpacing: '-1.3px',
      lineHeight: '70px',
      color: C.fgPrimary,
    } satisfies React.CSSProperties,
  },
  subhead: {
    lh: 53,
    css: {
      ...smoothing,
      fontFamily: FONT.text,
      fontSize: 40,
      fontWeight: 400 as Weight,
      letterSpacing: '-0.6px',
      lineHeight: '53px',
      color: C.fgSecondary,
    } satisfies React.CSSProperties,
  },
  body: {
    lh: 43,
    css: {
      ...smoothing,
      fontFamily: FONT.text,
      fontSize: 30,
      fontWeight: 400 as Weight,
      letterSpacing: '-0.2px',
      lineHeight: '43px',
      color: C.fgSecondary,
    } satisfies React.CSSProperties,
  },
  eyebrow: {
    lh: 19,
    css: {
      ...smoothing,
      fontFamily: FONT.text,
      fontSize: 19,
      fontWeight: 500 as Weight,
      letterSpacing: '3.4px',
      lineHeight: '19px',
      textTransform: 'uppercase',
      color: C.signal,
    } satisfies React.CSSProperties,
  },
  label: {
    lh: 28,
    css: {
      ...smoothing,
      fontFamily: FONT.text,
      fontSize: 22,
      fontWeight: 500 as Weight,
      letterSpacing: '0.8px',
      lineHeight: '28px',
      color: C.fgSecondary,
    } satisfies React.CSSProperties,
  },
  /** mono — machine-record data only (UEI / CAGE / NAICS / SAM status / diagram nodes). */
  data: {
    lh: 42,
    css: {
      ...smoothing,
      ...numeric,
      fontFamily: FONT.mono,
      fontSize: 32,
      fontWeight: 400 as Weight,
      letterSpacing: '0.4px',
      lineHeight: '42px',
      color: C.fgPrimary,
    } satisfies React.CSSProperties,
  },
  /**
   * 17px mono data label. Weight steps 400 → 500: SF Mono is monospaced, so the advance
   * width is identical and nothing reflows, but the stroke gains enough body that the
   * glyph interior is actually opaque at 17px instead of being carried by antialiasing.
   * That is what let the old 400-weight labels measure a full 12% under their own nominal
   * colour. Colour is now the (lifted) tertiary token at full opacity rather than
   * secondary @ .75 — same intent, measurable contrast.
   */
  dataLabel: {
    lh: 17,
    css: {
      ...smoothing,
      ...numeric,
      fontFamily: FONT.mono,
      fontSize: 17,
      fontWeight: 500 as Weight,
      letterSpacing: '1.9px',
      lineHeight: '17px',
      textTransform: 'uppercase',
      color: C.fgTertiary,
      opacity: 1,
    } satisfies React.CSSProperties,
  },
  nodeLabel: {
    lh: 26,
    css: {
      ...smoothing,
      ...numeric,
      fontFamily: FONT.mono,
      fontSize: 20,
      fontWeight: 400 as Weight,
      letterSpacing: '0.6px',
      lineHeight: '26px',
      color: C.fgSecondary,
    } satisfies React.CSSProperties,
  },
  stratumLabel: {
    lh: 40,
    css: {
      ...smoothing,
      ...numeric,
      fontFamily: FONT.mono,
      fontSize: 30,
      fontWeight: 400 as Weight,
      letterSpacing: '6px',
      lineHeight: '40px',
      textTransform: 'uppercase',
      color: C.fgSecondary,
    } satisfies React.CSSProperties,
  },
  /** 18px mono footnote (the NAICS row). Same treatment as `dataLabel`. */
  legal: {
    lh: 25,
    css: {
      ...smoothing,
      ...numeric,
      fontFamily: FONT.mono,
      fontSize: 18,
      fontWeight: 500 as Weight,
      letterSpacing: '0.3px',
      lineHeight: '25px',
      color: C.fgTertiary,
      opacity: 1,
    } satisfies React.CSSProperties,
  },
} as const;

export type TypeRole = keyof typeof TYPE;

/* ----------------------------------------------------------------- §4.4 easing */

export const E = {
  enter: Easing.bezier(0.16, 1.0, 0.3, 1.0), // expo-out    — all reveals
  exit: Easing.bezier(0.55, 0.0, 1.0, 0.45), // quart-in    — all dismissals
  camera: Easing.bezier(0.37, 0.0, 0.63, 1.0), // sine-in-out — every camera move
  wipe: Easing.bezier(0.33, 0.0, 0.15, 1.0), // mechanical  — T3 only
  descend: Easing.bezier(0.7, 0.0, 0.84, 0.0), // expo-in     — T4 outgoing only
} as const;

// NOTE: spring() is banned film-wide (§4.4). There is no spring import in src/video.

export const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

/* ------------------------------------------------------- §3 reveal choreography */

export const TIMING = {
  revealFrames: 14,
  lineStagger: 4,
  eyebrowLead: 6,
  tickFrames: 9,
  tickLead: 6,
  bodyOffset: 8,
  exitFrames: 9,
  exitBefore: 12,
  revealRise: 22,
  exitRise: -10,
} as const;

/** Standard cue sheet for an Anchor-A / Anchor-B type block. */
export const cues = (headlineLines: number) => {
  const tick = 0;
  const eyebrow = tick + TIMING.tickLead;
  const headline = eyebrow + TIMING.eyebrowLead;
  const lastLine = headline + TIMING.lineStagger * Math.max(0, headlineLines - 1);
  return {tick, eyebrow, headline, lastLine, body: lastLine + TIMING.bodyOffset};
};

/* ---------------------------------------------------------------- §6 the grid */

export const L = {
  W: 1920,
  H: 1080,
  MARGIN: 96, // title safe
  ACTION: 56, // action safe
  GUTTER: 24,
  COLW: 122,
  USABLE: 1728,
  ANCHOR_A_BASELINE: 856, // block bottom for low-left type
  ANCHOR_B_CENTRE: 496, // optical centre for the three permitted centred moments
  BOTTOM_RESERVE: 940, // nothing critical below this y
  MEASURE_HEADLINE: 1144, // 8 col
  MEASURE_BODY: 852, // 6 col
} as const;

/** Literal column measures from §6.2. col(8) === 1144. */
export const col = (n: number) => n * L.COLW + (n - 1) * L.GUTTER;

/** Every y in the film is a multiple of 8. */
export const grid8 = (v: number) => Math.round(v / 8) * 8;

/* --------------------------------------------------------------- §5 grade/finish */

export const GRADE_FILTER = 'url(#nistaGrade)';

export const FINISH = {
  grainPhoto: 0.052,
  grainMotion: 0.034,
  vignettePhoto: 1,
  vignetteMotion: 0.5,
  castNavy: 0.34,
} as const;

/** §2 — the 100° scrim. Type lives in the 0–34% band; imagery breathes in 62–100%. */
export const SCRIM_100 = `linear-gradient(100deg, ${deep(0.92)} 0%, ${deep(0.82)} 34%, ${deep(
  0.46,
)} 62%, ${deep(0.28)} 100%)`;

/** Heavier variant used behind the credential record (§8 S8: 0.90 floor). */
export const SCRIM_RECORD = `linear-gradient(100deg, ${deep(0.95)} 0%, ${deep(0.9)} 46%, ${deep(
  0.72,
)} 74%, ${deep(0.58)} 100%)`;
