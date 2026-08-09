/**
 * S4 — Platform architecture diagram.
 *
 * Centred, isometric-adjacent: a 12° vertical shear applied to the *structure* only.
 * Node labels are placed at the sheared centre but drawn horizontally, because a
 * sheared glyph is an oblique and §3 bans italics.
 *
 * Node rectangles are 1px `line/strong` parallelograms with mono labels. Exactly one
 * node is active in `accent/signal` and it breathes 0.72→1.00→0.72 on a 48-frame loop
 * with no scale pulse and no ring. Paths draw with a stroke-dasharray reveal in reading
 * order, 5-frame stagger, from source toward destination. Data packets are 3×26
 * `accent/support` capsules, 34 frames edge to edge, never more than 3 on screen.
 *
 * Built once, re-posed at three depths via `diagram.depth`.
 *
 * The scene's headline is set at headline-sm on the y = 856 baseline rather than at 40px
 * subhead on y = 880: when a diagram scene carries one of the film's spoken lines rather
 * than a label, a 40px line under a full-frame diagram reads as a footnote, not as a
 * sound-off message. 856 + 70 keeps it clear of the y = 940 bottom reserve.
 */
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {MaskedLine} from '../design/Type';
import {ExitBlock} from '../design/Type';
import {Eyebrow} from '../design/Type';
import {useCameraMove} from '../design/camera';
import {C, CLAMP, E, FONT, L, TYPE, deep, signalA} from '../design/tokens';
import type {DiagramNode, DiagramPath, SceneComponentProps} from '../../types';

const SHEAR = Math.tan((12 * Math.PI) / 180);

const DEFAULT_TIERS = ['Interface', 'Service', 'Platform', 'Substrate'];

const DEFAULT_NODES: DiagramNode[] = [
  {id: 'portal', label: 'PORTAL', col: 0, row: 0},
  {id: 'gateway', label: 'API GATEWAY', col: 1, row: 0},
  {id: 'console', label: 'CONSOLE', col: 2, row: 0},

  {id: 'identity', label: 'IDENTITY', col: 0, row: 1},
  {id: 'orchestration', label: 'ORCHESTRATION', col: 1, row: 1},
  {id: 'datasvc', label: 'DATA SERVICES', col: 2, row: 1},

  {id: 'runtime', label: 'RUNTIME', col: 0, row: 2},
  {id: 'pipeline', label: 'PIPELINE', col: 1, row: 2},
  {id: 'observability', label: 'OBSERVABILITY', col: 2, row: 2},

  {id: 'network', label: 'NETWORK', col: 0, row: 3},
  {id: 'storage', label: 'STORAGE', col: 1, row: 3},
  {id: 'compute', label: 'COMPUTE', col: 2, row: 3},
];

const DEFAULT_PATHS: DiagramPath[] = [
  {from: 'portal', to: 'identity'},
  {from: 'gateway', to: 'orchestration', flow: true},
  {from: 'console', to: 'datasvc'},
  {from: 'identity', to: 'runtime'},
  {from: 'orchestration', to: 'pipeline', flow: true},
  {from: 'datasvc', to: 'observability'},
  {from: 'runtime', to: 'network'},
  {from: 'pipeline', to: 'storage', flow: true},
  {from: 'observability', to: 'compute'},
];

const NODE_W = 268;
const NODE_H = 76;
const COL_PITCH = 400;
const ROW_PITCH = 112;

/**
 * The three depths. Deeper poses drop the tiers above them and scale up, so the
 * diagram is re-posed rather than re-drawn — and so the sheared extremes always stay
 * inside the y = 232–848 band the composition reserves for it.
 */
const POSES = [
  {scale: 0.94, focus: 1.5, rows: [0, 3]},
  {scale: 1.12, focus: 2.0, rows: [1, 3]},
  {scale: 1.34, focus: 2.5, rows: [2, 3]},
] as const;

type Pt = {x: number; y: number};

export const ArchitectureDiagram: React.FC<SceneComponentProps> = ({scene, exitAt, camera}) => {
  const frame = useCurrentFrame();
  const duration = scene.durationInFrames;
  const spec = scene.diagram ?? {};
  const allNodes = spec.nodes?.length ? spec.nodes : DEFAULT_NODES;
  const allPaths = spec.paths?.length ? spec.paths : DEFAULT_PATHS;
  const tiers = spec.tiers?.length ? spec.tiers : DEFAULT_TIERS;
  const depth = Math.min(2, Math.max(0, spec.depth ?? 0));

  const move = useCameraMove(frame, duration, camera === 'hold' ? 'push' : camera);

  // depth pose — a static re-pose between scenes, never an animated vertical move
  const pose = POSES[depth];
  const [rowFrom, rowTo] = pose.rows;

  const nodes = allNodes.filter((n) => n.row >= rowFrom && n.row <= rowTo);
  const visible = new Set(nodes.map((n) => n.id));
  const paths = allPaths.filter((p) => visible.has(p.from) && visible.has(p.to));
  const activeId =
    spec.active && visible.has(spec.active)
      ? spec.active
      : nodes[Math.min(nodes.length - 1, 1)].id;

  const cols = Math.max(...allNodes.map((n) => n.col)) + 1;
  const rows = Math.max(...allNodes.map((n) => n.row)) + 1;
  const cx = 960;
  const cy = 540;

  const logical = (n: {col: number; row: number}): Pt => ({
    x: cx + (n.col - (cols - 1) / 2) * COL_PITCH,
    y: cy + (n.row - pose.focus) * ROW_PITCH,
  });

  const shear = (p: Pt): Pt => ({x: p.x, y: p.y - (p.x - cx) * SHEAR});

  const byId = new Map(nodes.map((n) => [n.id, n]));

  const nodeShape = (n: DiagramNode) => {
    const c = logical(n);
    const corners: Pt[] = [
      {x: c.x - NODE_W / 2, y: c.y - NODE_H / 2},
      {x: c.x + NODE_W / 2, y: c.y - NODE_H / 2},
      {x: c.x + NODE_W / 2, y: c.y + NODE_H / 2},
      {x: c.x - NODE_W / 2, y: c.y + NODE_H / 2},
    ].map(shear);
    return {centre: shear(c), corners};
  };

  const routeFor = (p: DiagramPath): Pt[] | null => {
    const a = byId.get(p.from);
    const b = byId.get(p.to);
    if (!a || !b) return null;
    const la = logical(a);
    const lb = logical(b);
    const start = {x: la.x, y: la.y + NODE_H / 2};
    const end = {x: lb.x, y: lb.y - NODE_H / 2};
    if (Math.abs(la.x - lb.x) < 1) return [start, end].map(shear);
    const midY = (start.y + end.y) / 2;
    return [start, {x: start.x, y: midY}, {x: end.x, y: midY}, end].map(shear);
  };

  const polyLength = (pts: Pt[]) =>
    pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);

  const pointAt = (pts: Pt[], t: number): Pt => {
    const total = polyLength(pts);
    let target = t * total;
    for (let i = 1; i < pts.length; i++) {
      const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      if (target <= seg || i === pts.length - 1) {
        const k = seg === 0 ? 0 : target / seg;
        return {
          x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k,
          y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k,
        };
      }
      target -= seg;
    }
    return pts[pts.length - 1];
  };

  /**
   * Choreography. The structural bed starts drawing on frame 0 so that when this scene
   * is entered on a Strata Wipe there is already something above the line — a wipe that
   * reveals an empty frame is a wipe that reads as a glitch. Nodes stagger by row (7f)
   * and by column (2f) rather than by flat index, so the last of twelve lands at frame
   * 44 and the whole diagram is legible inside the §4.6 frame-45 rule.
   */
  const PATH_START = 4;
  const NODE_START = 8;
  const nodeCue = (n: DiagramNode) => NODE_START + (n.row - rowFrom) * 7 + n.col * 2;

  // §4.5 active-state pulse: 48-frame loop, amplitude 0.72 → 1.00 → 0.72, no scale
  const pulsePhase = (frame % 48) / 48;
  const pulse =
    pulsePhase < 0.5
      ? interpolate(pulsePhase, [0, 0.5], [0.72, 1], {easing: E.camera})
      : interpolate(pulsePhase, [0.5, 1], [1, 0.72], {easing: E.camera});

  const flowPaths = paths.filter((p) => p.flow);

  /**
   * §6.1 title safe. The stratum rail has to live *inside* the camera group so it tracks
   * its own rows vertically — but the group scales about (50%, 46%), so a left edge
   * authored at x = 96 renders at 960 − 864·s, i.e. it walks out to x = 48 by the end of a
   * 1.055 push. The draft measured these four labels at x = 61, 35px outside the box.
   * Solving 960 + (left − 960)·s = 96 for `left` pins the *rendered* left edge to exactly
   * 96 on every frame of the move, with no effect on the vertical tracking.
   */
  const railLeft = 960 - (960 - L.MARGIN) / move.scale;

  return (
    <AbsoluteFill style={{background: C.bgElevated, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(ellipse 74% 62% at 50% 42%, rgba(27,41,56,0.9) 0%, rgba(11,21,35,0) 72%)`,
            `linear-gradient(178deg, ${C.bgElevated} 0%, ${C.bgBase} 58%, ${C.bgDeep} 100%)`,
          ].join(', '),
        }}
      />

      {/* --- diagram -------------------------------------------------------- */}
      <AbsoluteFill
        style={{transform: move.transform, transformOrigin: move.transformOrigin}}
      >
        <AbsoluteFill
          style={{
            transform: `scale(${pose.scale})`,
            transformOrigin: '50% 50%',
          }}
        >
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            {/* tier rules — the structural bed the nodes sit on */}
            {Array.from({length: rowTo - rowFrom + 1}).map((_, k) => {
              const r = rowFrom + k;
              const y = cy + (r - pose.focus) * ROW_PITCH;
              const left = shear({x: 150, y});
              const right = shear({x: 1770, y});
              const at = k * 3;
              const p = interpolate(frame, [at, at + 22], [0, 1], {
                easing: E.enter,
                ...CLAMP,
              });
              return (
                <line
                  key={`tier-${r}`}
                  x1={left.x}
                  y1={left.y}
                  x2={left.x + (right.x - left.x) * p}
                  y2={left.y + (right.y - left.y) * p}
                  stroke={C.hairline}
                  strokeWidth={1}
                  opacity={0.6}
                />
              );
            })}

            {/* paths — drawn from source toward destination, reading order */}
            {paths.map((path, i) => {
              const pts = routeFor(path);
              if (!pts) return null;
              const len = polyLength(pts);
              const at = PATH_START + i * 3;
              const p = interpolate(frame, [at, at + 22], [0, 1], {
                easing: E.enter,
                ...CLAMP,
              });
              const d = pts.map((pt, k) => `${k === 0 ? 'M' : 'L'}${pt.x} ${pt.y}`).join(' ');
              const touchesActive = path.from === activeId || path.to === activeId;
              return (
                <path
                  key={`${path.from}-${path.to}`}
                  d={d}
                  fill="none"
                  stroke={touchesActive ? C.support : C.hairline}
                  strokeWidth={touchesActive ? 1.5 : 1}
                  opacity={touchesActive ? 0.9 : 0.62}
                  strokeDasharray={len}
                  strokeDashoffset={len * (1 - p)}
                />
              );
            })}

            {/* data packets */}
            {flowPaths.slice(0, 3).map((path, i) => {
              const pts = routeFor(path);
              if (!pts) return null;
              const cycle = 34 + i * 9;
              const offset = i * 13;
              const local = (frame - NODE_START - offset + cycle * 4) % cycle;
              const t = local / cycle;
              if (frame < NODE_START + offset) return null;
              const pt = pointAt(pts, t);
              const o = t < 0.5 ? t * 1.8 : (1 - t) * 1.8;
              return (
                <rect
                  key={`pk-${path.from}-${path.to}`}
                  x={pt.x - 1.5}
                  y={pt.y - 13}
                  width={3}
                  height={26}
                  rx={1.5}
                  fill={C.support}
                  opacity={Math.min(0.9, o)}
                />
              );
            })}

            {/* nodes */}
            {nodes.map((n) => {
              const {centre, corners} = nodeShape(n);
              const at = nodeCue(n);
              const p = interpolate(frame, [at, at + 11], [0, 1], {
                easing: E.enter,
                ...CLAMP,
              });
              const s = interpolate(p, [0, 1], [0.96, 1]);
              const isActive = n.id === activeId;
              const d = corners.map((c, k) => `${k === 0 ? 'M' : 'L'}${c.x} ${c.y}`).join(' ') + ' Z';
              return (
                <g
                  key={n.id}
                  opacity={p}
                  transform={`translate(${centre.x} ${centre.y}) scale(${s}) translate(${-centre.x} ${-centre.y})`}
                >
                  <path
                    d={d}
                    fill={isActive ? C.bgRaised : C.bgElevated}
                    stroke={isActive ? C.signal : C.strong}
                    strokeWidth={isActive ? 2 : 1}
                    opacity={isActive ? pulse : 0.96}
                    style={
                      isActive
                        ? {filter: `drop-shadow(0 0 24px ${signalA(0.22)})`}
                        : undefined
                    }
                  />
                  <text
                    x={centre.x}
                    y={centre.y + 7}
                    textAnchor="middle"
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 20,
                      fontWeight: 400,
                      letterSpacing: '0.6px',
                      fill: isActive ? C.fgPrimary : C.fgSecondary,
                    }}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>

        {/*
          Tier labels, left rail. Each label is aligned to the vertical centre of its own
          row's left-hand node — the sheared rules are sloped, so aligning to the rule
          would put the label 170px out. The rail lives inside the camera move but
          outside the depth pose so it tracks the diagram exactly; `railLeft` counters the
          move's horizontal component so the rendered left edge stays on title safe.
        */}
        <div style={{position: 'absolute', left: railLeft, top: 0, width: 260}}>
          {Array.from({length: rowTo - rowFrom + 1}).map((_, k) => {
            const r = rowFrom + k;
            const rowY = cy + (r - pose.focus) * ROW_PITCH + (COL_PITCH * SHEAR);
            const y = cy + (rowY - cy) * pose.scale;
            const at = NODE_START + k * 7;
            const p = interpolate(frame, [at, at + 11], [0, 1], {easing: E.enter, ...CLAMP});
            return (
              <React.Fragment key={`tl-${r}`}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: y - 9,
                    ...TYPE.dataLabel.css,
                    /**
                     * §9.9 — the depth fade used to be an opacity multiplier (0.55 on the
                     * three upper strata), which dropped these labels to 3.03:1. Depth is
                     * now carried by the colour ramp itself: the focus stratum takes
                     * fg/secondary, the strata above it take fg/tertiary. Both are opaque
                     * and both measure above the 4.5:1 floor; the hierarchy survives.
                     */
                    color: r === rowTo ? C.fgSecondary : C.fgTertiary,
                    opacity: p,
                  }}
                >
                  {tiers[r] ?? `Tier ${r + 1}`}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: y + 18,
                    width: 176,
                    height: 1,
                    background: C.hairline,
                    opacity: 0.7 * p,
                    transform: `scaleX(${p.toFixed(3)})`,
                    transformOrigin: 'left center',
                  }}
                />
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* --- type ----------------------------------------------------------- */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${deep(0.62)} 0%, ${deep(0)} 20%, ${deep(
            0,
          )} 80%, ${deep(0.5)} 100%)`,
        }}
      />
      <ExitBlock exitAt={exitAt}>
        {scene.eyebrow ? (
          <div style={{position: 'absolute', left: 96, top: 128}}>
            <Eyebrow text={scene.eyebrow} tickStart={0} textStart={6} />
          </div>
        ) : null}
        {scene.headline ? (
          <div style={{position: 'absolute', left: 96, top: 856, maxWidth: 1144}}>
            <MaskedLine start={12} lineHeight={TYPE.headlineSm.lh}>
              <div style={TYPE.headlineSm.css}>{scene.headline.replace(/\n/g, ' ')}</div>
            </MaskedLine>
          </div>
        ) : null}
        {scene.caption ? (
          <div
            style={{
              position: 'absolute',
              right: 96,
              top: 904,
              ...TYPE.dataLabel.css,
              textAlign: 'right',
            }}
          >
            {scene.caption}
          </div>
        ) : null}
      </ExitBlock>
    </AbsoluteFill>
  );
};
