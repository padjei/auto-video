/**
 * §6.3 — two type anchors, and only two. A third anchor is a defect.
 */
import React from 'react';
import {L} from './tokens';

/** Anchor A — "low left". Block bottom baseline at y = 856, left edge x = 96. */
export const AnchorA: React.FC<{
  children: React.ReactNode;
  baseline?: number;
  transform?: string;
}> = ({children, baseline = L.ANCHOR_A_BASELINE, transform}) => (
  <div
    style={{
      position: 'absolute',
      left: L.MARGIN,
      right: L.MARGIN,
      bottom: L.H - baseline,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      transform,
    }}
  >
    {children}
  </div>
);

/**
 * Anchor B — optical centre at y = 496. Permitted at exactly three moments:
 * the title card, the CTA lockup and the assurance triad.
 */
export const AnchorB: React.FC<{
  children: React.ReactNode;
  centre?: number;
  transform?: string;
}> = ({children, centre = L.ANCHOR_B_CENTRE, transform}) => (
  <div
    style={{
      position: 'absolute',
      left: L.MARGIN,
      right: L.MARGIN,
      top: 0,
      height: L.H,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `translateY(${centre - L.H / 2}px)${transform ? ` ${transform}` : ''}`,
    }}
  >
    {children}
  </div>
);

/** The barely-there structural grid used by the statement card (§8 S2). Never scrolls. */
export const HairlineGrid: React.FC<{
  drift: number;
  size?: number;
  opacity?: number;
}> = ({drift, size = 96, opacity = 0.18}) => (
  <div
    style={{
      position: 'absolute',
      inset: -size,
      opacity,
      backgroundImage: [
        'linear-gradient(to right, #24344A 1px, transparent 1px)',
        'linear-gradient(to bottom, #24344A 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: `${size}px ${size}px`,
      transform: `translateY(${drift.toFixed(2)}px)`,
      maskImage:
        'radial-gradient(ellipse 78% 72% at 46% 48%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0) 92%)',
      WebkitMaskImage:
        'radial-gradient(ellipse 78% 72% at 46% 48%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0) 92%)',
    }}
  />
);
