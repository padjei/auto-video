/**
 * §4.3 — the transition vocabulary. Exactly four. Any fifth is a defect.
 *
 *   T1 hard cut        0f   default, ~60% of transitions, cut into movement
 *   T2 dip to deep    16f   act boundaries only, through #060C15, 2f hold at midpoint
 *   T3 Strata Wipe    18f   signature; 2px amber line top→bottom, clip-path on both halves
 *   T4 Strata descent 20f   outgoing scales past the lens, incoming rises from 0.94
 *
 * There is no cross-dissolve in this file. There is no cross-zoom, whip-pan, glitch,
 * light leak, page curl, cube flip, push/slide, iris, film burn or speed ramp either.
 */
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, CLAMP, E, deep, signalA} from '../design/tokens';
import type {TransitionType} from '../../types';

export const TRANSITION_FRAMES: Record<TransitionType, number> = {
  cut: 0,
  dipToDeep: 18, // 8 out + 2 hold + 8 in
  strataWipe: 18,
  strataDescent: 20,
};

/** Frames the *outgoing* scene must stay mounted past its own duration. */
export const tailFramesFor = (t: TransitionType): number =>
  t === 'strataWipe' ? 18 : t === 'strataDescent' ? 14 : 0;

/* ------------------------------------------------------------------ T3 geometry */

export const WIPE_FRAMES = 18;

export const wipeY = (t: number) =>
  interpolate(t, [0, WIPE_FRAMES], [-4, 1084], {easing: E.wipe, ...CLAMP});

const clip = (top: number, bottom: number) =>
  `inset(${Math.max(0, top).toFixed(2)}px 0 ${Math.max(0, bottom).toFixed(2)}px 0)`;

/** Content ABOVE the line is the incoming scene. */
export const wipeIncomingClip = (t: number) => clip(0, 1080 - wipeY(t));
/** Content BELOW the line is the outgoing scene. */
export const wipeOutgoingClip = (t: number) => clip(wipeY(t), 0);

/**
 * The leading edge itself. Rendered above both halves for exactly 18 frames.
 * 2px, accent/signal, with a one-frame trailing smear.
 */
export const StrataWipeLine: React.FC = () => {
  const t = useCurrentFrame();
  const y = wipeY(t);
  const opacity =
    interpolate(t, [0, 3], [0, 1], CLAMP) *
    interpolate(t, [WIPE_FRAMES - 3, WIPE_FRAMES], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: y,
          height: 2,
          background: C.signal,
          opacity,
          boxShadow: `0 -6px 18px -6px ${signalA(0.35)}`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ T2 dip */

export const DIP_FRAMES = 18;

/** Cross-fade through pure bg/deep with a 2-frame hold at the midpoint. */
export const DipToDeep: React.FC = () => {
  const t = useCurrentFrame();
  const opacity =
    t < 8
      ? interpolate(t, [0, 8], [0, 1], {easing: E.wipe, ...CLAMP})
      : t < 10
        ? 1
        : interpolate(t, [10, 18], [1, 0], {easing: E.wipe, ...CLAMP});
  return <AbsoluteFill style={{background: deep(1), opacity, pointerEvents: 'none'}} />;
};

/* ------------------------------------------------------------------ T4 geometry */

export const DESCENT_FRAMES = 20;

export const descentOutgoing = (t: number) => ({
  scale: interpolate(t, [0, DESCENT_FRAMES], [1, 1.22], {easing: E.descend, ...CLAMP}),
  opacity: interpolate(t, [0, DESCENT_FRAMES], [1, 0], {easing: E.descend, ...CLAMP}),
});

export const descentIncoming = (t: number) => ({
  scale: interpolate(t, [0, DESCENT_FRAMES], [0.94, 1], {easing: E.enter, ...CLAMP}),
  opacity: interpolate(t, [0, DESCENT_FRAMES], [0, 1], {easing: E.enter, ...CLAMP}),
});

/* ------------------------------------------------------------------ the stage */

/**
 * Wraps one scene and applies the geometry of the transition entering it (head) and
 * the transition leaving it (tail). The scene component itself knows nothing about
 * transitions — it only ever sees a sequence-local frame.
 */
export const SceneStage: React.FC<{
  duration: number;
  head: TransitionType;
  tail: TransitionType;
  children: React.ReactNode;
}> = ({duration, head, tail, children}) => {
  const frame = useCurrentFrame();

  const style: React.CSSProperties = {};

  // entering
  if (head === 'strataWipe' && frame < WIPE_FRAMES) {
    style.clipPath = wipeIncomingClip(frame);
  } else if (head === 'strataDescent' && frame < DESCENT_FRAMES) {
    const {scale, opacity} = descentIncoming(frame);
    style.transform = `scale(${scale.toFixed(4)})`;
    style.transformOrigin = '50% 46%';
    style.opacity = opacity;
  }

  // leaving
  const tailStart = tail === 'strataDescent' ? duration - 6 : duration;
  const tailLocal = frame - tailStart;
  if (tail === 'strataWipe' && frame >= duration) {
    style.clipPath = wipeOutgoingClip(frame - duration);
  } else if (tail === 'strataDescent' && tailLocal >= 0) {
    const {scale, opacity} = descentOutgoing(tailLocal);
    style.transform = `scale(${scale.toFixed(4)})`;
    style.transformOrigin = '50% 46%';
    style.opacity = opacity;
  }

  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};
