/**
 * Photographic plate layer, with graceful degradation.
 *
 * Assets for this film are not generated yet. Every scene that *wants* a plate must
 * still render, so the plate probes its asset and — on 404, on a missing `media`
 * field, or on a decode failure — falls back to a constructed motion-graphics
 * environment built from the same palette, the same hairlines and the same camera
 * move. Nothing here can throw at render time.
 */
import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  continueRender,
  delayRender,
  staticFile,
} from 'remotion';
import {C, GRADE_FILTER, SCRIM_100, SCRIM_RECORD, deep, steelA, supportA} from './tokens';
import {PlateCast} from './Grade';
import type {CameraState} from './camera';

type ProbeState = 'loading' | 'ok' | 'fail';

/** Deterministic asset existence probe. Blocks the frame until resolved. */
export const useAssetProbe = (src?: string): ProbeState => {
  const [state, setState] = useState<ProbeState>(src ? 'loading' : 'fail');
  const [handle] = useState(() => (src ? delayRender(`probe ${src}`) : null));

  useEffect(() => {
    if (!src || handle === null) return;
    let cancelled = false;
    const done = (next: ProbeState) => {
      if (cancelled) return;
      setState(next);
      continueRender(handle);
    };
    fetch(src, {method: 'HEAD'})
      .then((res) => done(res.ok ? 'ok' : 'fail'))
      .catch(() => done('fail'));
    return () => {
      cancelled = true;
    };
  }, [src, handle]);

  return state;
};

export const resolveMedia = (media?: string): string | undefined => {
  if (!media) return undefined;
  if (/^https?:\/\//.test(media)) return media;
  return staticFile(media.replace(/^\/+/, ''));
};

/* ------------------------------------------------------- constructed fallbacks */

/**
 * S1 fallback — 'institutional surface'. A low-key constructed interior at dusk: a
 * glazed operations wall of bays sharing one head and one sill (so it reads as
 * architecture, not as a bar chart), two lit slots as the only practicals, a ceiling
 * structure, a floor line and its reflection, and a dark foreground jamb for depth.
 * Seeded per scene so two plates in the same film are never the same room.
 * No particles, no bokeh, no icons, no holograms, no flare.
 */
const hash = (s: string) => {
  let acc = 0;
  for (let i = 0; i < s.length; i++) acc = (acc * 31 + s.charCodeAt(i)) % 100003;
  return acc;
};
const rnd = (seed: number, i: number) => {
  const x = Math.sin(seed * 0.31 + i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const InstitutionalField: React.FC<{
  camera: CameraState;
  mid: CameraState;
  seed?: string;
}> = ({camera, mid, seed = 'plate'}) => {
  const s = hash(seed);
  const HEAD = 176; // wall head
  const SILL = 742; // wall sill / floor line
  const bayCount = 8 + (s % 3);
  const wallX = 820;
  const wallW = 1180;
  const bayW = wallW / bayCount;
  const litA = s % bayCount;
  const litB = (s * 7 + 3) % bayCount;
  const transoms = [HEAD + 118, HEAD + 318];

  return (
    <AbsoluteFill style={{background: C.bgDeep, overflow: 'hidden'}}>
      {/* atmosphere — one practical source, steel not amber */}
      <AbsoluteFill
        style={{
          transform: camera.transform,
          transformOrigin: camera.transformOrigin,
          background: [
            `radial-gradient(ellipse 56% 48% at 70% 36%, ${steelA(0.3)} 0%, ${steelA(0)} 68%)`,
            `radial-gradient(ellipse 88% 60% at 44% 106%, ${deep(0.9)} 0%, ${deep(0)} 56%)`,
            `linear-gradient(178deg, ${C.bgElevated} 0%, ${C.bgBase} 46%, ${C.bgDeep} 88%)`,
          ].join(', '),
        }}
      />

      {/* the wall */}
      <AbsoluteFill style={{transform: mid.transform, transformOrigin: mid.transformOrigin}}>
        <div
          style={{
            position: 'absolute',
            left: wallX,
            top: HEAD,
            width: wallW,
            height: SILL - HEAD,
            background: `linear-gradient(184deg, ${C.bgElevated} 0%, ${C.bgBase} 62%, ${C.bgDeep} 100%)`,
            borderTop: `1px solid ${C.strong}`,
            opacity: 0.96,
          }}
        />
        {Array.from({length: bayCount}).map((_, i) => {
          const x = wallX + i * bayW;
          const lit = i === litA || i === litB;
          const depth = 0.28 + rnd(s, i) * 0.34;
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: HEAD,
                  width: 1,
                  height: SILL - HEAD,
                  background: C.strong,
                  opacity: 0.9,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: x + 1,
                  top: HEAD + 1,
                  width: bayW - 2,
                  height: SILL - HEAD - 1,
                  background: C.bgDeep,
                  opacity: depth,
                }}
              />
              {lit ? (
                <div
                  style={{
                    position: 'absolute',
                    left: x + 12,
                    top: transoms[0] + 14,
                    width: bayW - 24,
                    height: 286,
                    background: `linear-gradient(180deg, ${steelA(0.34)} 0%, ${steelA(0.03)} 100%)`,
                    borderTop: `1px solid ${supportA(0.42)}`,
                  }}
                />
              ) : null}
            </React.Fragment>
          );
        })}
        {transoms.map((y) => (
          <div
            key={y}
            style={{
              position: 'absolute',
              left: wallX,
              width: wallW,
              top: y,
              height: 1,
              background: C.hairline,
              opacity: 0.8,
            }}
          />
        ))}

        {/* ceiling structure — receding ribs, no perspective grid */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={`c${i}`}
            style={{
              position: 'absolute',
              left: 300 + i * 40,
              right: 0,
              top: 62 + i * 26,
              height: 1,
              background: C.hairline,
              opacity: 0.5 - i * 0.09,
            }}
          />
        ))}

        {/* floor line + reflection */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: SILL,
            height: 1,
            background: `linear-gradient(90deg, ${deep(0)} 0%, ${C.strong} 38%, ${C.strong} 90%, ${deep(0)} 100%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: wallX - 120,
            right: 0,
            top: SILL + 1,
            height: 210,
            background: `linear-gradient(180deg, ${steelA(0.07)} 0%, ${steelA(0)} 100%)`,
          }}
        />

        {/* foreground jamb — the dark mass that gives the frame depth */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 236 + (s % 60),
            height: 1080,
            background: `linear-gradient(90deg, ${deep(0.96)} 0%, ${deep(0.72)} 72%, ${deep(0)} 100%)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * S5 fallback — "the hands" macro. Extreme close, shallow, tactile: a single raking
 * key from the left, a machined surface read as long hairline ribs under a heavy
 * falloff, one specular streak. Abstract on purpose — no invented hardware.
 */
const MacroField: React.FC<{camera: CameraState; mid: CameraState}> = ({camera, mid}) => {
  const ribs = Array.from({length: 13}, (_, i) => 232 + i * 58);
  return (
    <AbsoluteFill style={{background: C.bgDeep, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: camera.transform,
          transformOrigin: camera.transformOrigin,
          background: [
            `radial-gradient(ellipse 58% 50% at 34% 44%, ${steelA(0.3)} 0%, ${steelA(0)} 74%)`,
            `linear-gradient(100deg, ${C.bgElevated} 0%, ${C.bgBase} 44%, ${C.bgDeep} 78%)`,
          ].join(', '),
        }}
      />
      <AbsoluteFill
        style={{
          transform: `${mid.transform} skewY(-6deg)`,
          transformOrigin: mid.transformOrigin,
          maskImage: `radial-gradient(ellipse 74% 62% at 42% 50%, #000 0%, rgba(0,0,0,0.35) 58%, rgba(0,0,0,0) 88%)`,
          WebkitMaskImage: `radial-gradient(ellipse 74% 62% at 42% 50%, #000 0%, rgba(0,0,0,0.35) 58%, rgba(0,0,0,0) 88%)`,
        }}
      >
        {ribs.map((y, i) => (
          <React.Fragment key={y}>
            <div
              style={{
                position: 'absolute',
                left: -120,
                right: -120,
                top: y,
                height: 1,
                background: i % 3 === 0 ? C.fgTertiary : C.strong,
                opacity: i % 3 === 0 ? 0.55 : 0.9,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: -120,
                right: -120,
                top: y + 1,
                height: 26,
                background: `linear-gradient(180deg, ${steelA(0.13)}, ${steelA(0)})`,
              }}
            />
          </React.Fragment>
        ))}
      </AbsoluteFill>
      {/* specular streak */}
      <AbsoluteFill
        style={{
          transform: camera.transform,
          transformOrigin: camera.transformOrigin,
          background: `radial-gradient(ellipse 44% 5% at 38% 39%, ${steelA(0.2)} 0%, ${steelA(
            0,
          )} 76%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------- the plate */

export type PlateVariant = 'institutional' | 'macro';

export const Plate: React.FC<{
  media?: string;
  variant: PlateVariant;
  camera: CameraState;
  mid: CameraState;
  /** varies the constructed fallback so two plates are never the same room */
  seed?: string;
}> = ({media, variant, camera, mid, seed}) => {
  const src = resolveMedia(media);
  const probe = useAssetProbe(src);
  const isVideo = Boolean(src && /\.(mp4|mov|webm|m4v)$/i.test(src));

  if (probe === 'ok' && src) {
    return (
      <AbsoluteFill style={{background: C.bgDeep, overflow: 'hidden'}}>
        <AbsoluteFill
          style={{transform: camera.transform, transformOrigin: camera.transformOrigin}}
        >
          {isVideo ? (
            <OffthreadVideo
              src={src}
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: GRADE_FILTER,
              }}
            />
          ) : (
            <Img
              src={src}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: GRADE_FILTER,
              }}
            />
          )}
        </AbsoluteFill>
        <PlateCast />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      {variant === 'macro' ? (
        <MacroField camera={camera} mid={mid} />
      ) : (
        <InstitutionalField camera={camera} mid={mid} seed={seed} />
      )}
      <PlateCast strength={0.45} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------------ scrim */

/** §2 — every photographic scene carrying type sits on the 100° scrim. Floor 0.82. */
export const Scrim: React.FC<{variant?: 'standard' | 'record'; opacity?: number}> = ({
  variant = 'standard',
  opacity = 1,
}) => (
  <AbsoluteFill
    style={{
      background: variant === 'record' ? SCRIM_RECORD : SCRIM_100,
      opacity,
      pointerEvents: 'none',
    }}
  />
);
