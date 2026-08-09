/**
 * S2 — Statement card.
 * bg/base only. Amber eyebrow tick + eyebrow, then a 60–76px headline on Anchor A.
 * Behind it a 96px hairline grid at #24344A @ 0.18 that does NOT scroll — it drifts
 * −8px across the whole scene on the parallax rule. Nothing else.
 */
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {AnchorA, HairlineGrid} from '../design/Anchors';
import {TypeBlock} from '../design/Type';
import {useParallax} from '../design/camera';
import {C, CLAMP, E, deep} from '../design/tokens';
import type {SceneComponentProps} from '../../types';

export const StatementCard: React.FC<SceneComponentProps> = ({scene, exitAt, camera}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;
  const type = useParallax(frame, duration, 'type', camera);

  const drift = interpolate(frame, [0, Math.max(1, duration - 1)], [0, -8], {
    easing: E.camera,
    ...CLAMP,
  });

  // long copy drops to headline-sm so a three-line statement never exceeds the measure
  const longest = (scene.headline ?? '')
    .split('\n')
    .reduce((m, l) => Math.max(m, l.trim().length), 0);
  const lineCount = (scene.headline ?? '').split('\n').filter((l) => l.trim()).length;
  const role = lineCount >= 3 || longest > 30 ? 'headlineSm' : 'headline';

  return (
    <AbsoluteFill style={{background: C.bgBase, overflow: 'hidden'}}>
      {/* the elevation sits UNDER the grid — painted over it, the grid disappears */}
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(ellipse 64% 54% at 68% 34%, rgba(27,41,56,0.62) 0%, ${deep(0)} 72%)`,
            `radial-gradient(ellipse 86% 70% at 30% 96%, ${deep(0.72)} 0%, ${deep(0)} 62%)`,
          ].join(', '),
        }}
      />
      <HairlineGrid drift={drift} opacity={0.3} />
      {/* one structural rule in the right field so the negative space is composed, not blank */}
      <div
        style={{
          position: 'absolute',
          left: 1240,
          top: 152,
          width: 1,
          height: 776,
          background: C.hairline,
          opacity: 0.55,
          transform: `translateY(${(drift * 1.4).toFixed(2)}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 1240,
          top: 560,
          width: 584,
          height: 1,
          background: C.hairline,
          opacity: 0.4,
          transform: `translateY(${(drift * 1.4).toFixed(2)}px)`,
        }}
      />
      <AbsoluteFill style={{transform: `translateY(${type.translateY.toFixed(2)}px)`}}>
        <AnchorA>
          <TypeBlock
            eyebrow={scene.eyebrow}
            headline={scene.headline}
            headlineRole={role}
            body={scene.body}
            exitAt={exitAt}
          />
        </AnchorA>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
