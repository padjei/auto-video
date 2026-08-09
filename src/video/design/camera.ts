/**
 * §4.1–4.2 — the camera has exactly one degree of freedom: depth.
 * There is no pan, no tilt, no orbit, no shake anywhere in this file by construction:
 * translateX is only ever emitted by the *parallax* helper, never by the camera helper,
 * and there it is bounded to ±4px on the background plane.
 */
import {interpolate} from 'remotion';
import {CLAMP, E} from './tokens';
import type {CameraMove} from '../../types';

export type CameraState = {
  scale: number;
  translateY: number;
  transform: string;
  transformOrigin: string;
  progress: number;
};

const ORIGIN = '50% 46%';

/**
 * A — slow push (default), or settle-out on alternating scenes so no two
 * identical moves ever sit back to back.
 */
export const useCameraMove = (
  frame: number,
  duration: number,
  mode: CameraMove = 'push',
): CameraState => {
  const p = interpolate(frame, [0, Math.max(1, duration - 1)], [0, 1], {
    easing: E.camera,
    ...CLAMP,
  });

  let scale = 1;
  let translateY = 0;

  if (mode === 'push') {
    scale = interpolate(p, [0, 1], [1.0, 1.055]);
    translateY = interpolate(p, [0, 1], [0, -14]);
  } else if (mode === 'settle') {
    scale = interpolate(p, [0, 1], [1.055, 1.01]);
    translateY = interpolate(p, [0, 1], [0, -8]);
  }

  return {
    scale,
    translateY,
    transform: `scale(${scale}) translateY(${translateY}px)`,
    transformOrigin: ORIGIN,
    progress: p,
  };
};

export type Plane = 'plate' | 'mid' | 'type';

/**
 * B — parallax drift. Type always moves most, background always moves least.
 * Inverted parallax is a bug (§4.2B).
 */
export const useParallax = (
  frame: number,
  duration: number,
  plane: Plane,
  mode: CameraMove = 'push',
): CameraState => {
  const p = interpolate(frame, [0, Math.max(1, duration - 1)], [0, 1], {
    easing: E.camera,
    ...CLAMP,
  });
  const dir = mode === 'settle' ? -1 : 1;

  const spec =
    plane === 'plate'
      ? {s: [1.0, 1.045], y: [0, -6], x: [0, -4]}
      : plane === 'mid'
        ? {s: [1.0, 1.02], y: [0, -11], x: [0, 3]}
        : {s: [1.0, 1.0], y: [0, -18], x: [0, 0]};

  const scale =
    mode === 'settle'
      ? interpolate(p, [0, 1], [spec.s[1], 1 + (spec.s[1] - 1) * 0.18])
      : interpolate(p, [0, 1], [spec.s[0], spec.s[1]]);
  const translateY = interpolate(p, [0, 1], [spec.y[0], spec.y[1]]);
  const translateX = interpolate(p, [0, 1], [spec.x[0], spec.x[1] * dir]);

  return {
    scale,
    translateY,
    transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
    transformOrigin: '50% 46%',
    progress: p,
  };
};

/** Deterministic alternation so the film never repeats a move back to back. */
export const defaultCameraFor = (index: number): CameraMove =>
  index % 2 === 0 ? 'push' : 'settle';
