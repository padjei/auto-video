/**
 * S8 — Credential block / the record.
 *
 * Constructed to §6.4 exactly: container x = 96, width = 1144, bottom edge y = 940;
 * fill bg/elevated @ 0.94 with an 18px backdrop blur; 1px line/strong top rule; a
 * 2px × 56px amber tick sitting ON that rule and extending 12px above it; 32/28/32/32
 * padding; a four-column record table in mono; and an optional NAICS footnote.
 *
 * This is the scene that converts a skeptical buyer, so it is built as a filed record —
 * no badges, no seals, no checkmarks, no logos.
 */
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ExitBlock, Lines, MaskedLine} from '../design/Type';
import {Plate, Scrim} from '../design/Plate';
import {useCameraMove, useParallax} from '../design/camera';
import {C, CLAMP, E, TYPE, deep} from '../design/tokens';
import type {CredentialField, SceneComponentProps} from '../../types';

const DEFAULT_FIELDS: CredentialField[] = [
  {label: 'SAM.gov', value: 'ACTIVE'},
  {label: 'UEI', value: 'YGRB3SMAWE6'},
  {label: 'CAGE', value: '22PQ4'},
  {label: 'Classification', value: ['CERTIFIED', 'SMALL BUSINESS']},
];

const DEFAULT_FOOTNOTE = 'NAICS 541511 · 541512 · 541519 · 518210 · 541715';

const CARD_X = 96;
const CARD_W = 1144;
const CARD_BOTTOM = 940;
const PAD_X = 32;
const PAD_TOP = 32;
const PAD_BOTTOM = 28;

/** column widths sum to 1080 (1144 − 2×32) including three 24px gutters */
const COL_W = [200, 240, 160, 408];
const COL_GUTTER = 24;

/**
 * Cue sheet. The draft ran CARD_AT 12 / FIELD_AT 28 / 4-frame field stagger, which put
 * the last credential value on frame 58 and the NAICS row on frame 50 — both outside the
 * §9.5 frame-45 legibility rule for the one scene that has to convert a skeptical buyer.
 * The card opens sooner and the four columns stack on a 3-frame stagger instead of 4:
 * last value completes on frame 41, NAICS on 40, wordmark on 36.
 */
const CARD_AT = 6;
const FIELD_AT = CARD_AT + 8;
const FIELD_STAGGER = 3;

export const CredentialBlock: React.FC<SceneComponentProps> = ({scene, exitAt, camera}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;
  const spec = scene.credential ?? {};
  const fields = (spec.fields?.length ? spec.fields : DEFAULT_FIELDS).slice(0, 4);
  const footnote = spec.footnote ?? DEFAULT_FOOTNOTE;
  const overPlate = spec.over === 'plate';

  const move = useCameraMove(frame, duration, camera === 'hold' ? 'settle' : camera);
  const mid = useParallax(frame, duration, 'mid', camera);

  const open = interpolate(frame, [CARD_AT, CARD_AT + 16], [100, 0], {
    easing: E.enter,
    ...CLAMP,
  });

  const valueLines = (v: string | string[]) => (Array.isArray(v) ? v : [v]);
  const maxValueLines = Math.max(...fields.map((f) => valueLines(f.value).length));

  const bodyHeight =
    TYPE.dataLabel.lh + 8 + maxValueLines * TYPE.data.lh + (footnote ? 24 + TYPE.legal.lh : 0);
  const cardH = PAD_TOP + bodyHeight + PAD_BOTTOM;
  const cardTop = CARD_BOTTOM - cardH;

  return (
    <AbsoluteFill style={{background: C.bgBase, overflow: 'hidden'}}>
      {overPlate ? (
        <>
          <Plate media={scene.media} variant="institutional" camera={move} mid={mid} />
          <Scrim variant="record" />
        </>
      ) : (
        <AbsoluteFill
          style={{
            background: [
              `radial-gradient(ellipse 70% 56% at 62% 26%, rgba(27,41,56,0.6) 0%, ${deep(0)} 74%)`,
              `linear-gradient(180deg, ${deep(0)} 40%, ${deep(0.5)} 100%)`,
            ].join(', '),
          }}
        />
      )}

      <ExitBlock exitAt={exitAt}>
        {scene.headline ? (
          <div style={{position: 'absolute', left: 96, top: 448, maxWidth: 1144}}>
            <Lines
              lines={scene.headline
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean)}
              role="headline"
              start={0}
              maxWidth={1144}
            />
          </div>
        ) : null}

        {/* the record */}
        <div
          style={{
            position: 'absolute',
            left: CARD_X,
            top: cardTop,
            width: CARD_W,
            height: cardH,
            clipPath: `inset(${open.toFixed(2)}% 0 0 0)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: C.bgElevated,
              opacity: 0.94,
              backdropFilter: 'blur(18px) saturate(0.9)',
              WebkitBackdropFilter: 'blur(18px) saturate(0.9)',
              boxShadow: `inset 0 0 0 1px rgba(36,52,74,0.5)`,
            }}
          />
          {/* top rule + amber tick */}
          <div
            style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1, background: C.strong}}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: -12,
              width: 2,
              height: 56,
              background: C.signal,
            }}
          />

          {/* column separators — this has to read as a filed table, not a badge row */}
          {fields.slice(1).map((f, i) => {
            const x =
              PAD_X +
              COL_W.slice(0, i + 1).reduce((a, b) => a + b, 0) +
              i * COL_GUTTER +
              COL_GUTTER / 2;
            return (
              <div
                key={`sep-${f.label}`}
                style={{
                  position: 'absolute',
                  left: x,
                  top: PAD_TOP - 8,
                  width: 1,
                  height:
                    TYPE.dataLabel.lh + 8 + maxValueLines * TYPE.data.lh + 16,
                  background: C.hairline,
                  opacity: 0.85,
                }}
              />
            );
          })}

          <div
            style={{
              position: 'absolute',
              left: PAD_X,
              top: PAD_TOP,
              right: PAD_X,
              display: 'flex',
              gap: COL_GUTTER,
            }}
          >
            {fields.map((f, i) => (
              <div key={f.label} style={{width: COL_W[i] ?? 240}}>
                <MaskedLine start={FIELD_AT + i * FIELD_STAGGER} lineHeight={TYPE.dataLabel.lh}>
                  <div style={TYPE.dataLabel.css}>{f.label}</div>
                </MaskedLine>
                <div style={{height: 8}} />
                {valueLines(f.value).map((v, k) => (
                  <MaskedLine
                    key={v}
                    start={FIELD_AT + i * FIELD_STAGGER + 2 + k * 2}
                    lineHeight={TYPE.data.lh}
                  >
                    <div style={TYPE.data.css}>{v}</div>
                  </MaskedLine>
                ))}
              </div>
            ))}
          </div>

          {footnote ? (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: PAD_X,
                  right: PAD_X,
                  bottom: PAD_BOTTOM + TYPE.legal.lh + 14,
                  height: 1,
                  background: C.hairline,
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: PAD_X,
                  right: PAD_X,
                  bottom: PAD_BOTTOM,
                }}
              >
                <MaskedLine start={FIELD_AT + 12} lineHeight={TYPE.legal.lh}>
                  <div style={TYPE.legal.css}>{footnote}</div>
                </MaskedLine>
              </div>
            </>
          ) : null}
        </div>

        {/*
          §6.5 logo lockup: bottom right, right edge x = 1824, baseline y = 940,
          44px cap height — baseline-aligned to the credential block. It also stops the
          right third of the frame from reading as an unfinished field.
        */}
        <div
          style={{
            position: 'absolute',
            right: 96,
            top: 940 - 62,
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
          }}
        >
          <MaskedLine start={FIELD_AT + 8} lineHeight={62}>
            <div
              style={{
                ...TYPE.display.css,
                fontSize: 62,
                lineHeight: '62px',
                letterSpacing: '1px',
                fontWeight: 500,
              }}
            >
              {scene.cta?.wordmark ?? 'NISTA'}
            </div>
          </MaskedLine>
        </div>
      </ExitBlock>
    </AbsoluteFill>
  );
};
