/**
 * S3 — Strata descent (the signature scene, not merely the transition).
 *
 * Four labelled strata — INTERFACE / SERVICE / PLATFORM / SUBSTRATE — are stacked in
 * DEPTH, not vertically, because the camera has one degree of freedom (§4.1). Each
 * stratum is a full-frame 1px-ruled plate and the camera drives through it using the
 * T4 construction from §4.2C: outgoing scale 1.00→1.22 / opacity 1→0 over 20f on
 * `E.descend`, incoming scale 0.94→1.00 / opacity 0→1 on `E.enter`, incoming starting
 * at frame 6 of the outgoing move.
 *
 * The type layer is fixed across the whole scene so the sound-off message is legible
 * by frame 45 and holds while the strata pass behind it.
 */
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {AnchorA} from '../design/Anchors';
import {TypeBlock} from '../design/Type';
import {useCameraMove} from '../design/camera';
import {C, CLAMP, E, TYPE, deep, signalA, steelA} from '../design/tokens';
import type {SceneComponentProps, StratumSpec} from '../../types';

const DEFAULT_STRATA: StratumSpec[] = [
  {label: 'Interface', note: 'what the mission sees'},
  {label: 'Service', note: 'contracts and boundaries'},
  {label: 'Platform', note: 'runtime and pipeline'},
  {label: 'Substrate', note: 'the load-bearing layer'},
];

/** Deterministic 0–1 from two ints. No Math.random anywhere in the film. */
const h = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const BAND_TOP = 240;
const BAND_BOTTOM = 828;

const StratumPlate: React.FC<{index: number; total: number}> = ({index, total}) => {
  const rows = [4, 7, 12, 24][Math.min(index, 3)] ?? 6 + index * 5;
  const rowH = (BAND_BOTTOM - BAND_TOP) / rows;
  const density = index / Math.max(1, total - 1);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(174deg, ${C.bgElevated} 0%, ${C.bgBase} 74%, ${C.bgDeep} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* key pool so the plate is lit, not flat */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 74% 60% at 62% 42%, ${steelA(
            0.16 - density * 0.05,
          )} 0%, ${steelA(0)} 74%)`,
        }}
      />

      {Array.from({length: rows}).map((_, r) => {
        const y = BAND_TOP + r * rowH;
        const seed = h(index * 13 + 7, r);
        const seed2 = h(index * 29 + 3, r * 5 + 1);
        const cellW = 180 + Math.round(seed * 640);
        const cellX = 96 + Math.round(seed2 * (1728 - cellW));
        const filled = seed > 0.42 && rowH > 14;
        return (
          <React.Fragment key={r}>
            <div
              style={{
                position: 'absolute',
                left: 96,
                width: 1728,
                top: Math.round(y),
                height: 1,
                background: r % 4 === 0 ? C.strong : C.hairline,
              }}
            />
            {filled ? (
              <div
                style={{
                  position: 'absolute',
                  left: cellX,
                  top: Math.round(y) + 1,
                  width: cellW,
                  height: Math.max(2, rowH * 0.56),
                  background: seed2 > 0.6 ? C.bgRaised : C.bgElevated,
                  borderTop: `1px solid ${C.strong}`,
                  borderRight: `1px solid ${C.hairline}`,
                  opacity: 0.72 + seed2 * 0.28,
                }}
              />
            ) : null}
            {/* column ticks, so the band reads as a section drawing not a bar chart */}
            <div
              style={{
                position: 'absolute',
                left: 96 + Math.round(seed * 1200),
                top: Math.round(y) - Math.round(rowH * 0.4),
                width: 1,
                height: Math.round(rowH * 0.8),
                background: C.hairline,
                opacity: 0.8,
              }}
            />
          </React.Fragment>
        );
      })}

      {/* bottom falloff so the stack never reads as a flat chart */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${deep(0)} 56%, ${deep(0.42)} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const StrataDescentScene: React.FC<SceneComponentProps> = ({scene, exitAt, camera}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;
  const strata = scene.strata?.length ? scene.strata : DEFAULT_STRATA;
  const n = strata.length;
  const move = useCameraMove(frame, duration, camera === 'hold' ? 'push' : camera);

  // the moment stratum k takes over from k-1
  const takeover = (k: number) => Math.round((duration * k) / n);

  const found = strata.findIndex((_, k) => frame < takeover(k + 1));
  const resolvedActive = found === -1 ? n - 1 : found;

  return (
    <AbsoluteFill style={{background: C.bgDeep, overflow: 'hidden'}}>
      {/* --- the depth stack ------------------------------------------------ */}
      <AbsoluteFill
        style={{transform: move.transform, transformOrigin: move.transformOrigin}}
      >
        {strata.map((s, k) => {
          const inAt = k === 0 ? -20 : takeover(k);
          const outAt = k === n - 1 ? Infinity : takeover(k + 1) - 6;

          const inScale = interpolate(frame, [inAt, inAt + 20], [0.94, 1], {
            easing: E.enter,
            ...CLAMP,
          });
          const inOpacity = interpolate(frame, [inAt, inAt + 20], [0, 1], {
            easing: E.enter,
            ...CLAMP,
          });

          const outScale = Number.isFinite(outAt)
            ? interpolate(frame, [outAt, outAt + 20], [1, 1.22], {
                easing: E.descend,
                ...CLAMP,
              })
            : 1;
          const outOpacity = Number.isFinite(outAt)
            ? interpolate(frame, [outAt, outAt + 20], [1, 0], {
                easing: E.descend,
                ...CLAMP,
              })
            : 1;

          const opacity = inOpacity * outOpacity;
          if (opacity <= 0.001) return null;

          return (
            <AbsoluteFill
              key={s.label}
              style={{
                transform: `scale(${(inScale * outScale).toFixed(4)})`,
                transformOrigin: '50% 46%',
                opacity,
              }}
            >
              <StratumPlate index={k} total={n} />
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>

      {/* --- stratum record, upper right ------------------------------------ */}
      <div style={{position: 'absolute', right: 96, top: 176, textAlign: 'right'}}>
        {strata.map((s, k) => {
          const at = k === 0 ? 0 : takeover(k);
          const on = k === resolvedActive;
          const opacity = interpolate(frame, [at, at + 14], [0, 1], {
            easing: E.enter,
            ...CLAMP,
          });
          if (!on) return null;
          const edge = interpolate(frame, [at, at + 18], [0, 1], {
            easing: E.wipe,
            ...CLAMP,
          });
          return (
            <div key={s.label} style={{opacity}}>
              {/* T3 leading edge, re-used as the through-line of the descent */}
              <div
                style={{
                  width: 664,
                  height: 2,
                  marginLeft: 'auto',
                  marginBottom: 22,
                  background: C.signal,
                  transform: `scaleX(${edge.toFixed(3)})`,
                  transformOrigin: 'right center',
                  boxShadow: `0 -6px 18px -6px ${signalA(0.35)}`,
                }}
              />
              <div style={{...TYPE.stratumLabel.css, color: C.fgPrimary}}>{s.label}</div>
              {s.note ? (
                <div style={{...TYPE.dataLabel.css, marginTop: 14}}>{s.note}</div>
              ) : null}
              <div style={{...TYPE.dataLabel.css, marginTop: 12, opacity: 0.55}}>
                {String(k + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- fixed type layer ------------------------------------------------ */}
      {/* §2 scrim: 0.82 floor at the type anchor, imagery breathing in the 62–100% band */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(100deg, ${deep(0.9)} 0%, ${deep(0.82)} 26%, ${deep(
            0.34,
          )} 58%, ${deep(0.1)} 100%)`,
        }}
      />
      <AnchorA>
        <TypeBlock
          eyebrow={scene.eyebrow}
          headline={scene.headline}
          headlineRole="headline"
          body={scene.body}
          exitAt={exitAt}
        />
      </AnchorA>
    </AbsoluteFill>
  );
};
