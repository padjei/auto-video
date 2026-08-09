/**
 * §5 — grade and finish. One layer, applied film-wide, so every scene (generated
 * plate or pure motion graphics) resolves to the same film.
 *
 * Order: grade (SVG S-curve, on <Img>/<Video> only) → cast → vignette → grain → edge.
 *
 * Deviation, deliberate: the two *cast* layers are emitted by <PlateCast/> inside the
 * photographic plate, underneath the scrim and the type, rather than film-wide above
 * everything. `mix-blend-mode: color` at 0.34 over the type layer would drag warm
 * off-white headlines toward navy and break the §2 contrast floor, and over a pure
 * motion-graphics scene it would desaturate the amber signal. Cast belongs to imagery;
 * vignette, grain and edge stay global.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FINISH, deep, signalA} from './tokens';

/* ------------------------------------------------------------------- filter defs */

/** §5.1 filmic S-curve + desaturation. Mount once per composition. */
export const GradeDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
    <defs>
      <filter id="nistaGrade" colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.045 0.170 0.380 0.610 0.800 0.925 0.990" />
          <feFuncG type="table" tableValues="0.040 0.160 0.370 0.600 0.790 0.920 0.985" />
          <feFuncB type="table" tableValues="0.070 0.200 0.395 0.600 0.775 0.895 0.960" />
        </feComponentTransfer>
        <feColorMatrix type="saturate" values="0.78" />
      </filter>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------------- cast */

/** §5.2 — unify to navy, then bias the highlight warm so nothing goes corpse-grey. */
export const PlateCast: React.FC<{strength?: number}> = ({strength = 1}) => (
  <>
    <AbsoluteFill
      style={{
        background: C.bgBase,
        mixBlendMode: 'color',
        opacity: FINISH.castNavy * strength,
        pointerEvents: 'none',
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 55% at 52% 38%, ${signalA(
          0.16 * strength,
        )} 0%, ${signalA(0)} 70%)`,
        mixBlendMode: 'soft-light',
        pointerEvents: 'none',
      }}
    />
  </>
);

/* --------------------------------------------------------------------- vignette */

const Vignette: React.FC<{strength: number}> = ({strength}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: [
        `radial-gradient(ellipse 118% 104% at 50% 44%, ${deep(0)} 36%, ${deep(
          0.22 * strength,
        )} 68%, ${deep(0.58 * strength)} 100%)`,
        `linear-gradient(to bottom, ${deep(0.3 * strength)} 0%, ${deep(0)} 16%)`,
      ].join(', '),
    }}
  />
);

/* ------------------------------------------------------------------------ grain */

/**
 * §5.4 — animated grain. The turbulence is generated on a 640×360 surface and scaled
 * up 3.02×, which (a) makes the grain read at a filmic ~3px rather than as 1px digital
 * noise and (b) costs ~9× less to rasterise per frame in headless Chromium.
 * The seed re-rolls on a 7-frame cycle so it is deterministic across re-renders, and
 * freezes entirely over the final 24 frames so the closing lockup is a literally
 * identical frame (§4.6 / QA §9.10).
 */
const Grain: React.FC<{opacity: number; frozen: boolean}> = ({opacity, frozen}) => {
  const frame = useCurrentFrame();
  const seed = frozen ? 3 : frame % 7;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
        <defs>
          <filter id="nistaGrain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves={2}
              stitchTiles="stitch"
              seed={seed}
              result="n"
            />
            <feColorMatrix in="n" type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 640,
          height: 360,
          marginLeft: -320,
          marginTop: -180,
          transform: 'scale(3.02)',
          filter: 'url(#nistaGrain)',
          opacity,
          mixBlendMode: 'overlay',
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------ finish */

export type FinishProfile = {
  /** 0 = pure motion graphics, 1 = photographic plate. Drives grain + vignette. */
  photographic: number;
};

/**
 * The film-wide finish layer. Sits above every scene and every transition.
 * No letterbox bars, no rounded corners, no film burn, no flare, no bloom.
 */
export const Grade: React.FC<{profileAt: (frame: number) => FinishProfile}> = ({profileAt}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {photographic} = profileAt(frame);

  const vignette =
    FINISH.vignetteMotion + (FINISH.vignettePhoto - FINISH.vignetteMotion) * photographic;
  const grain =
    FINISH.grainMotion + (FINISH.grainPhoto - FINISH.grainMotion) * photographic;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Vignette strength={vignette} />
      <Grain opacity={grain} frozen={frame >= durationInFrames - 24} />
    </AbsoluteFill>
  );
};
