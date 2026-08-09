/**
 * S7 — Discipline grid.
 * The seven government disciplines as a 4+3 typographic grid on bg/base. Each cell has
 * a 1px top rule, a mono index and a 30px name. Cells reveal in reading order on a
 * 5-frame stagger. No icons, no cards, no colour coding — and no amber: this is one of
 * the three archetypes that must carry none, so the eyebrow is set in mono steel here
 * rather than as an amber tick.
 *
 * Grid note: §8 specifies a 254px cell. Measured at 30px, "Digital Transformation" and
 * "Artificial Intelligence" both overflow 254px (and col(2) = 268px) and wrap to two
 * lines, which breaks the baseline alignment the grid exists to hold. col(3) = 414px is
 * the smallest true grid measure that keeps every discipline on one line, and 4 × 414 +
 * 3 × 24 resolves to exactly the 1728px usable width, x = 96 → 1824.
 *
 * When the scene carries no headline the disciplines *are* the message, so the grid is
 * lifted to the Anchor-B optical band and cued earlier — a sound-off viewer has to have
 * all seven inside the frame-45 legibility rule, which a 5-frame stagger under a
 * headline cue cannot do.
 */
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ExitBlock, Lines, MaskedLine} from '../design/Type';
import {useParallax} from '../design/camera';
import {C, CLAMP, E, TYPE, col, deep} from '../design/tokens';
import type {SceneComponentProps} from '../../types';

const DEFAULT_DISCIPLINES = [
  'Artificial Intelligence',
  'Data',
  'Enterprise Software',
  'Platform',
  'Cloud',
  'Cybersecurity',
  'Digital Transformation',
];

const CELL_W = col(3); // 414 — tiles the 1728px usable width exactly
const COL_X = [96, 534, 972, 1410];
const ROW_Y_UNDER_HEADLINE = [456, 676];
const ROW_Y_BARE = [352, 572];

export const DisciplineGrid: React.FC<SceneComponentProps> = ({scene, exitAt, camera}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;
  const items = (scene.disciplines?.length ? scene.disciplines : DEFAULT_DISCIPLINES).slice(0, 8);
  const type = useParallax(frame, duration, 'type', camera);

  const hasHeadline = Boolean(scene.headline);
  const ROW_Y = hasHeadline ? ROW_Y_UNDER_HEADLINE : ROW_Y_BARE;
  const HEAD_AT = 12;
  const GRID_AT = hasHeadline ? HEAD_AT + 20 : 6;
  const STAGGER = hasHeadline ? 5 : 4;

  return (
    <AbsoluteFill style={{background: C.bgBase, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 74% at 34% 40%, rgba(20,31,46,0.7) 0%, ${deep(
            0,
          )} 78%)`,
        }}
      />
      <ExitBlock exitAt={exitAt}>
        <AbsoluteFill
          style={{transform: `translateY(${(type.translateY * 0.6).toFixed(2)}px)`}}
        >
          {scene.eyebrow ? (
            <div style={{position: 'absolute', left: 96, top: 152}}>
              <MaskedLine start={6} lineHeight={TYPE.dataLabel.lh}>
                <div style={TYPE.dataLabel.css}>{scene.eyebrow}</div>
              </MaskedLine>
            </div>
          ) : null}

          {scene.headline ? (
            <div style={{position: 'absolute', left: 96, top: 232}}>
              <Lines
                lines={scene.headline
                  .split('\n')
                  .map((l) => l.trim())
                  .filter(Boolean)}
                role="headline"
                start={HEAD_AT}
                maxWidth={1144}
              />
            </div>
          ) : null}

          {items.map((name, i) => {
            const r = Math.floor(i / 4);
            const c = i % 4;
            const x = COL_X[c];
            const y = ROW_Y[Math.min(r, ROW_Y.length - 1)];
            const at = GRID_AT + i * STAGGER;
            const p = interpolate(frame, [at, at + 14], [0, 1], {easing: E.enter, ...CLAMP});
            return (
              <div key={name} style={{position: 'absolute', left: x, top: y, width: CELL_W}}>
                <div
                  style={{
                    height: 1,
                    background: C.strong,
                    transform: `scaleX(${p.toFixed(3)})`,
                    transformOrigin: 'left center',
                  }}
                />
                <div style={{height: 26}} />
                <MaskedLine start={at + 2} lineHeight={TYPE.dataLabel.lh}>
                  <div style={TYPE.dataLabel.css}>{String(i + 1).padStart(2, '0')}</div>
                </MaskedLine>
                <div style={{height: 18}} />
                <MaskedLine start={at + 4} lineHeight={TYPE.body.lh}>
                  <div style={{...TYPE.body.css, color: C.fgPrimary, fontSize: 30}}>{name}</div>
                </MaskedLine>
              </div>
            );
          })}
        </AbsoluteFill>
      </ExitBlock>
    </AbsoluteFill>
  );
};
