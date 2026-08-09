/**
 * S5 — Engineering vignette, "the hands".
 * Tight, shallow-depth plate; settle-out camera move (1.055 → 1.010). Type sits low
 * left and short — six words maximum, enforced here rather than trusted to copy.
 * No amber anywhere in this archetype: it is one of the three that must carry none.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {AnchorA} from '../design/Anchors';
import {Lines, ExitBlock} from '../design/Type';
import {Plate, Scrim} from '../design/Plate';
import {useCameraMove, useParallax} from '../design/camera';
import {C, TYPE} from '../design/tokens';
import type {SceneComponentProps} from '../../types';

const clampWords = (value: string | undefined, max: number) => {
  if (!value) return [] as string[];
  return value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/).slice(0, max).join(' '));
};

export const EngineeringVignette: React.FC<SceneComponentProps> = ({
  scene,
  exitAt,
  camera,
}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;
  // The archetype defaults to settle-out, but the two plates run back to back and two
  // identical moves in a row is a §4.2A defect — so the scene's own camera wins.
  const move = useCameraMove(frame, duration, camera === 'hold' ? 'settle' : camera);
  const mid = useParallax(frame, duration, 'mid', camera);
  const type = useParallax(frame, duration, 'type', camera);

  const lines = clampWords(scene.headline, 6);

  return (
    <AbsoluteFill style={{background: C.bgDeep, overflow: 'hidden'}}>
      <Plate media={scene.media} variant="macro" camera={move} mid={mid} />
      <Scrim opacity={scene.scrim ?? 1} />

      <AbsoluteFill style={{transform: `translateY(${type.translateY.toFixed(2)}px)`}}>
        <AnchorA>
          <ExitBlock exitAt={exitAt}>
            {lines.length ? (
              <Lines lines={lines} role="headline" start={12} maxWidth={1144} />
            ) : null}
            {scene.body ? (
              <div style={{marginTop: 30}}>
                <Lines
                  lines={clampWords(scene.body, 10)}
                  role="body"
                  start={12 + 4 * Math.max(0, lines.length - 1) + 8}
                  maxWidth={852}
                />
              </div>
            ) : null}
          </ExitBlock>
        </AnchorA>
        {scene.caption ? (
          <div style={{position: 'absolute', left: 96, top: 904, ...TYPE.dataLabel.css}}>
            {scene.caption}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
