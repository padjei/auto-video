/**
 * S9 — CTA lockup.
 * bg/deep. Anchor B. The mark as a monochrome knockout in warm off-white at 72px cap
 * height, the wordmark beneath it, a 2px × 96px amber rule 32px below that, the CTA
 * line at display 108/500, and the URL 56px beneath in body.
 *
 * The wordmark is deliberately set at 40px, not at display scale: the CTA line is the
 * message and two competing 100px+ lines on the same card is the single loudest thing
 * that made the previous end frame read as a template. The logo is never animated
 * beyond the standard text reveal.
 *
 * Dead still for the final 24 frames — every cue completes by frame 44 and there is no
 * camera move, no exit and no drift on this scene. Freeze is power.
 */
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {AnchorB} from '../design/Anchors';
import {VectorMark} from '../design/Mark';
import {MaskedLine} from '../design/Type';
import {C, CLAMP, E, FONT, TYPE, deep} from '../design/tokens';
import type {SceneComponentProps} from '../../types';

/** 512-unit artwork whose hexagon spans 340 units — 112px box ⇒ ~74px cap height. */
const MARK_BOX = 112;

export const CtaLockup: React.FC<SceneComponentProps> = ({scene, project}) => {
  const frame = useCurrentFrame();
  const cta = scene.cta ?? {};
  const wordmark = cta.wordmark ?? 'NISTA';
  const sub = cta.wordmarkSub;
  const url = cta.url ?? project.id;
  const lines = (scene.headline ?? 'Modernize with confidence.')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const MARK_AT = 4;
  const WORD_AT = MARK_AT + 4;
  const RULE_AT = 12;
  const LINE_AT = 18;
  const URL_AT = LINE_AT + 4 * Math.max(0, lines.length - 1) + 8;

  const rule = interpolate(frame, [RULE_AT, RULE_AT + 9], [0, 1], {
    easing: E.enter,
    ...CLAMP,
  });

  return (
    <AbsoluteFill style={{background: C.bgDeep, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 76% 62% at 50% 42%, rgba(11,21,35,0.9) 0%, ${deep(
            0,
          )} 78%)`,
        }}
      />
      <AnchorB>
        {/* the mark — monochrome knockout, tinted through currentColor */}
        {cta.mark ? (
          <>
            <MaskedLine start={MARK_AT} lineHeight={MARK_BOX}>
              <VectorMark src={cta.mark} size={MARK_BOX} color={C.fgPrimary} />
            </MaskedLine>
            <div style={{height: 26}} />
          </>
        ) : null}

        {/* the wordmark */}
        <MaskedLine start={WORD_AT} lineHeight={48}>
          <div
            style={{
              ...TYPE.display.css,
              fontFamily: FONT.display,
              fontSize: 40,
              fontWeight: 500,
              letterSpacing: '7.2px',
              lineHeight: '48px',
              color: C.fgPrimary,
            }}
          >
            {wordmark}
          </div>
        </MaskedLine>
        {sub ? (
          <>
            <div style={{height: 14}} />
            <MaskedLine start={WORD_AT + 4} lineHeight={TYPE.eyebrow.lh}>
              <div style={{...TYPE.eyebrow.css, color: C.fgSecondary}}>{sub}</div>
            </MaskedLine>
          </>
        ) : null}

        <div style={{height: 32}} />
        <div
          style={{
            width: 96,
            height: 2,
            background: C.signal,
            transform: `scaleX(${rule.toFixed(3)})`,
          }}
        />
        <div style={{height: 40}} />

        <div style={{maxWidth: 1144, textAlign: 'center'}}>
          {lines.map((line, i) => (
            <MaskedLine key={line} start={LINE_AT + i * 4} lineHeight={TYPE.display.lh}>
              <div style={TYPE.display.css}>{line}</div>
            </MaskedLine>
          ))}
        </div>

        <div style={{height: 56}} />
        <MaskedLine start={URL_AT} lineHeight={TYPE.body.lh}>
          <div style={{...TYPE.body.css, letterSpacing: '0.6px'}}>{url}</div>
        </MaskedLine>
      </AnchorB>
    </AbsoluteFill>
  );
};
