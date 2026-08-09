/**
 * S1 — Cinematic plate, institutional surface.
 * Full-bleed graded still, slow push, 100° scrim, Anchor A type in the lower-left
 * negative space. Degrades to a constructed institutional field when the plate has
 * not been generated yet.
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useCameraMove, useParallax} from '../design/camera';
import {AnchorA} from '../design/Anchors';
import {Plate, Scrim} from '../design/Plate';
import {TypeBlock} from '../design/Type';
import {C, TYPE} from '../design/tokens';
import type {SceneComponentProps} from '../../types';

export const CinematicPlate: React.FC<SceneComponentProps> = ({scene, exitAt, camera}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;
  const plate = useParallax(frame, duration, 'plate', camera);
  const mid = useParallax(frame, duration, 'mid', camera);
  const type = useParallax(frame, duration, 'type', camera);
  const move = useCameraMove(frame, duration, camera);

  return (
    <AbsoluteFill style={{background: C.bgDeep, overflow: 'hidden'}}>
      <Plate
        media={scene.media}
        variant="institutional"
        camera={move}
        mid={mid}
        seed={scene.id}
      />

      <AbsoluteFill
        style={{transform: plate.transform, transformOrigin: plate.transformOrigin}}
      />

      <Scrim opacity={scene.scrim ?? 1} />

      <AbsoluteFill
        style={{
          transform: `translateY(${type.translateY.toFixed(2)}px)`,
        }}
      >
        <AnchorA>
          <TypeBlock
            eyebrow={scene.eyebrow}
            headline={scene.headline}
            headlineRole="headline"
            body={scene.body}
            exitAt={exitAt}
          />
        </AnchorA>
        {scene.caption ? (
          <div
            style={{
              position: 'absolute',
              left: 96,
              top: 904,
              ...TYPE.dataLabel.css,
            }}
          >
            {scene.caption}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
