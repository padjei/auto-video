/**
 * §3 — the single text entry/exit rule for the whole film.
 * Type is revealed by a mask, never flown in. Nothing translates more than 22px.
 * No springs, no per-character typewriter, no scale-in, no blur, no shadow.
 */
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, CLAMP, E, TIMING, TYPE, type TypeRole} from './tokens';

export const splitLines = (value?: string): string[] =>
  (value ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

/* ------------------------------------------------------------------ line mask */

type MaskedLineProps = {
  start: number;
  lineHeight: number;
  children: React.ReactNode;
  duration?: number;
  style?: React.CSSProperties;
};

/**
 * One masked line box. The wrapper is `overflow: hidden` so the reveal reads as a
 * mask; a descender pad (and matching negative margin) keeps `g/y/p` from clipping
 * without changing the stacked line rhythm.
 */
export const MaskedLine: React.FC<MaskedLineProps> = ({
  start,
  lineHeight,
  children,
  duration = TIMING.revealFrames,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + duration], [0, 1], {
    easing: E.enter,
    ...CLAMP,
  });
  const pad = Math.round(lineHeight * 0.24);
  return (
    <div style={{overflow: 'hidden', paddingBottom: pad, marginBottom: -pad, ...style}}>
      <div
        style={{
          transform: `translateY(${((1 - p) * TIMING.revealRise).toFixed(3)}px)`,
          opacity: p,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ block exit */

/**
 * §3 EXIT — whole block, no stagger, 9 frames, quart-in, starting at
 * `durationInFrames - 12`. Pass `exitAt = null` to hold (used before a Strata Wipe,
 * a Strata Descent, and on the final lockup, which must be dead still).
 */
export const ExitBlock: React.FC<{
  exitAt: number | null;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({exitAt, children, style}) => {
  const frame = useCurrentFrame();
  if (exitAt === null) {
    return <div style={style}>{children}</div>;
  }
  const p = interpolate(frame, [exitAt, exitAt + TIMING.exitFrames], [1, 0], {
    easing: E.exit,
    ...CLAMP,
  });
  return (
    <div
      style={{
        ...style,
        opacity: p,
        transform: `translateY(${((1 - p) * TIMING.exitRise).toFixed(3)}px)`,
      }}
    >
      {children}
    </div>
  );
};

/* --------------------------------------------------------------- eyebrow + tick */

/**
 * The 2px × 56px amber tick. Draws scaleX 0→1 from the left over 9 frames,
 * starting 6 frames before the eyebrow text. It is a tick, never a filled bar.
 */
export const EyebrowTick: React.FC<{start: number; width?: number}> = ({start, width = 56}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + TIMING.tickFrames], [0, 1], {
    easing: E.enter,
    ...CLAMP,
  });
  return (
    <div
      style={{
        width,
        height: 2,
        background: C.signal,
        transform: `scaleX(${p})`,
        transformOrigin: 'left center',
      }}
    />
  );
};

export const Eyebrow: React.FC<{
  text: string;
  tickStart: number;
  textStart: number;
  gap?: number;
}> = ({text, tickStart, textStart, gap = 20}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap}}>
    <EyebrowTick start={tickStart} />
    <MaskedLine start={textStart} lineHeight={TYPE.eyebrow.lh}>
      <div style={TYPE.eyebrow.css}>{text}</div>
    </MaskedLine>
  </div>
);

/* ------------------------------------------------------------------- headlines */

export const Lines: React.FC<{
  lines: string[];
  role: TypeRole;
  start: number;
  stagger?: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}> = ({lines, role, start, stagger = TIMING.lineStagger, maxWidth, style}) => {
  const spec = TYPE[role];
  return (
    <div style={{maxWidth}}>
      {lines.map((line, i) => (
        <MaskedLine key={`${role}-${i}`} start={start + i * stagger} lineHeight={spec.lh}>
          <div style={{...spec.css, ...style}}>{line}</div>
        </MaskedLine>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------- standard blocks */

export type TypeBlockProps = {
  eyebrow?: string;
  headline?: string;
  headlineRole?: TypeRole;
  body?: string;
  bodyRole?: TypeRole;
  exitAt: number | null;
  align?: 'left' | 'center';
  delay?: number;
};

/**
 * The Anchor-A / Anchor-B type block used by nearly every scene, wired to the
 * one cue sheet in §3: tick → eyebrow (+6) → headline (+6, 4/line) → body (+8).
 */
export const TypeBlock: React.FC<TypeBlockProps> = ({
  eyebrow,
  headline,
  headlineRole = 'headline',
  body,
  bodyRole = 'subhead',
  exitAt,
  align = 'left',
  delay = 0,
}) => {
  const headlineLines = splitLines(headline);
  const bodyLines = splitLines(body);
  const tick = delay;
  const eyebrowAt = tick + TIMING.tickLead;
  const headlineAt = eyebrowAt + TIMING.eyebrowLead;
  const lastLineAt = headlineAt + TIMING.lineStagger * Math.max(0, headlineLines.length - 1);
  const bodyAt = lastLineAt + TIMING.bodyOffset;
  const centred = align === 'center';

  return (
    <ExitBlock
      exitAt={exitAt}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: centred ? 'center' : 'flex-start',
        textAlign: centred ? 'center' : 'left',
      }}
    >
      {eyebrow ? (
        <div style={{marginBottom: 28}}>
          <Eyebrow text={eyebrow} tickStart={tick} textStart={eyebrowAt} />
        </div>
      ) : null}
      {headlineLines.length ? (
        <Lines
          lines={headlineLines}
          role={headlineRole}
          start={headlineAt}
          maxWidth={centred ? 1144 : 1144}
        />
      ) : null}
      {bodyLines.length ? (
        <div style={{marginTop: 32}}>
          <Lines lines={bodyLines} role={bodyRole} start={bodyAt} maxWidth={852} />
        </div>
      ) : null}
    </ExitBlock>
  );
};
