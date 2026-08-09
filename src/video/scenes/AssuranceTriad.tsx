/**
 * S6 — Assurance triad.
 * Anchor B. Three equal 512px columns with 96px gutters at y = 380–700, separated by
 * 1px `line/hairline` verticals. Mono data-label above, 40px subhead below. Columns
 * reveal left to right on a 6-frame stagger; a single 2px amber underline then sweeps
 * beneath all three (scaleX 0→1, 16 frames). No icons, ever.
 */
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ExitBlock, MaskedLine} from '../design/Type';
import {useParallax} from '../design/camera';
import {C, CLAMP, E, TYPE, deep} from '../design/tokens';
import type {SceneComponentProps, TriadColumn} from '../../types';

/**
 * Geometry note: §8 places the triad at y = 380–700, but with a mono label and a single
 * 40px word per column that leaves 250px of dead column under every entry, which reads
 * as an unfinished slide. The columns keep their 512px width and 96px gutters and the
 * block keeps its Anchor-B optical centre at y ≈ 496; the rules are simply cropped to
 * the height the content actually occupies.
 */
const COL_W = 512;
const GUTTER = 96;
const TOP = 496; // first baseline row
const RULE_TOP = 470;
const BOTTOM = 664; // the amber underline
/**
 * Without a headline above them the three words are the whole frame, so the block is
 * lifted to put its own optical centre on Anchor B's y = 496 rather than hanging 70px
 * under it in an otherwise empty field.
 */
const BARE_LIFT = 70;

const DEFAULT_TRIAD: TriadColumn[] = [
  {label: '01', title: 'Availability'},
  {label: '02', title: 'Integrity'},
  {label: '03', title: 'Recovery'},
];

export const AssuranceTriad: React.FC<SceneComponentProps> = ({scene, exitAt, camera}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;
  const cols = (scene.triad?.length ? scene.triad : DEFAULT_TRIAD).slice(0, 3);
  const type = useParallax(frame, duration, 'type', camera);

  const totalW = cols.length * COL_W + (cols.length - 1) * GUTTER;
  const left = Math.round((1920 - totalW) / 2);

  /**
   * §8 S6 sets the triad words at 40px and sanctions exactly one deviation — stepping
   * them to headline-sm 60px if feed-size testing shows they are not scannable. With no
   * headline in the scene these three words carry the whole beat sound-off, so the
   * deviation is taken here and applied to all three columns. "Availability" measures
   * ≈360px at 60px, still well inside the 512px column.
   */
  const word = scene.headline ? TYPE.subhead : TYPE.headlineSm;

  const lift = scene.headline ? 0 : BARE_LIFT;
  const ruleTop = RULE_TOP - lift;
  const top = TOP - lift;
  const bottom = BOTTOM - lift;

  /**
   * Choreography (revised after draft QA).
   *
   * This scene now carries the *first* half of beat 5 — "availability, integrity and
   * recovery are first-class requirements" — in a 107-frame slot cut hard against the
   * em-dash pause at 33.46s. Two things follow from that:
   *
   * 1. It is entered on a hard cut from a photographic plate, so there is no transition
   *    to hide a start delay behind. The first column begins on frame 4, not frame 30.
   * 2. §9.5 requires the whole message legible by frame 45. The draft ran a 10-frame
   *    column stagger on top of an 18-frame shared delay and a 26-frame sweep starting at
   *    frame 62, which put the third word at frame 57 and the rule at 75. The L→R reveal
   *    is the point of the composition, so it is kept — compressed to a 6-frame stagger,
   *    with the amber rule brought forward to sweep the moment the third column lands.
   *
   * Result: column 3 completes on frame 34 and the underline on frame 36, leaving the
   * frame complete and dead static for the remaining 71 frames.
   */
  const HEAD_AT = 12;
  const COL_AT = scene.headline ? HEAD_AT + 10 : 4;
  const COL_STAGGER = 6;
  const SWEEP_FRAMES = 16;
  const lastColAt = COL_AT + (cols.length - 1) * COL_STAGGER;
  const sweepAt = Math.min(lastColAt + 4, Math.max(0, duration - 56));
  const sweep = interpolate(frame, [sweepAt, sweepAt + SWEEP_FRAMES], [0, 1], {
    easing: E.enter,
    ...CLAMP,
  });

  return (
    <AbsoluteFill style={{background: C.bgBase, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 84% 66% at 50% 44%, rgba(20,31,46,0.85) 0%, ${deep(
            0,
          )} 76%)`,
        }}
      />

      <ExitBlock exitAt={exitAt}>
        <AbsoluteFill
          style={{transform: `translateY(${(type.translateY * 0.5).toFixed(2)}px)`}}
        >
          {/* headline above the triad, optically centred */}
          {scene.headline ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 292,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div style={{maxWidth: 1144, textAlign: 'center'}}>
                {scene.headline
                  .split('\n')
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((line, i) => (
                    <MaskedLine
                      key={line}
                      start={HEAD_AT + i * 4}
                      lineHeight={TYPE.headlineSm.lh}
                    >
                      <div style={TYPE.headlineSm.css}>{line}</div>
                    </MaskedLine>
                  ))}
              </div>
            </div>
          ) : null}

          {/* the three columns */}
          {cols.map((c, i) => {
            const x = left + i * (COL_W + GUTTER);
            const at = COL_AT + i * COL_STAGGER;
            return (
              <React.Fragment key={c.title}>
                {i > 0 ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: x - GUTTER / 2,
                      top: ruleTop,
                      width: 1,
                      height: interpolate(frame, [at - 6, at + 16], [0, bottom - ruleTop], {
                        easing: E.enter,
                        ...CLAMP,
                      }),
                      background: C.hairline,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    left: x,
                    top: ruleTop,
                    width: COL_W,
                    height: 1,
                    background: C.strong,
                    transform: `scaleX(${interpolate(frame, [at - 6, at + 12], [0, 1], {
                      easing: E.enter,
                      ...CLAMP,
                    }).toFixed(3)})`,
                    transformOrigin: 'left center',
                  }}
                />
                <div style={{position: 'absolute', left: x, top, width: COL_W}}>
                  <MaskedLine start={at} lineHeight={TYPE.dataLabel.lh}>
                    <div style={TYPE.dataLabel.css}>{c.label ?? String(i + 1).padStart(2, '0')}</div>
                  </MaskedLine>
                  <div style={{height: 30}} />
                  <MaskedLine start={at + 4} lineHeight={word.lh}>
                    <div style={{...word.css, color: C.fgPrimary}}>{c.title}</div>
                  </MaskedLine>
                  {c.body ? (
                    <div style={{marginTop: 20}}>
                      <MaskedLine start={at + 8} lineHeight={TYPE.body.lh}>
                        <div style={{...TYPE.body.css, fontSize: 26, lineHeight: '36px'}}>
                          {c.body}
                        </div>
                      </MaskedLine>
                    </div>
                  ) : null}
                </div>
              </React.Fragment>
            );
          })}

          {/* the single amber underline, 2px, swept once */}
          <div
            style={{
              position: 'absolute',
              left,
              top: bottom,
              width: totalW,
              height: 2,
              background: C.signal,
              transform: `scaleX(${sweep.toFixed(4)})`,
              transformOrigin: 'left center',
            }}
          />
        </AbsoluteFill>
      </ExitBlock>
    </AbsoluteFill>
  );
};
