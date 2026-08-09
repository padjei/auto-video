/**
 * Scene model.
 *
 * The nine archetypes below are the film's whole vocabulary (strategy §8). The legacy
 * generic types are kept so existing projects (projects/demo) still parse and render;
 * they are mapped onto archetypes by the dispatcher in src/video/SceneRenderer.tsx.
 */

/** strategy §8 — the only nine scene constructions that exist. */
export type SceneArchetype =
  | 'cinematicPlate' // S1  institutional surface, generated still + slow push
  | 'statementCard' // S2  bg/base, eyebrow tick + headline, drifting hairline grid
  | 'strataDescent' // S3  signature descent through labelled strata
  | 'architectureDiagram' // S4  sheared node-and-path platform diagram
  | 'engineeringVignette' // S5  tight macro proof shot, settle-out move
  | 'assuranceTriad' // S6  three columns, amber underline sweep
  | 'disciplineGrid' // S7  4+3 typographic grid, no icons, no colour coding
  | 'credentialBlock' // S8  the record — SAM.gov / UEI / CAGE / NAICS
  | 'ctaLockup'; // S9  bg/deep lockup, dead still for the final 24 frames

export type LegacySceneType =
  | 'hero'
  | 'kineticType'
  | 'metric'
  | 'quote'
  | 'split'
  | 'diagram'
  | 'process'
  | 'code'
  | 'ui'
  | 'image'
  | 'video'
  | 'cta';

export type SceneType = SceneArchetype | LegacySceneType;

/** strategy §4.3 — exactly four transitions exist. A fifth is a defect. */
export type TransitionType = 'cut' | 'dipToDeep' | 'strataWipe' | 'strataDescent';

/** strategy §4.1 — depth only. There is no pan/tilt/orbit option by design. */
export type CameraMove = 'push' | 'settle' | 'hold';

export type DiagramNode = {
  id: string;
  label: string;
  /** logical column, 0-based, left to right */
  col: number;
  /** logical row, 0-based, top (interface) to bottom (substrate) */
  row: number;
};

export type DiagramPath = {
  from: string;
  to: string;
  /** true = carries animated data packets (accent/support capsules) */
  flow?: boolean;
};

export type DiagramSpec = {
  /** left-hand tier labels, one per row */
  tiers?: string[];
  nodes?: DiagramNode[];
  paths?: DiagramPath[];
  /** exactly one node id may be active (accent/signal). Never two. */
  active?: string;
  /** 0–2. The same diagram re-posed at three depths. */
  depth?: number;
};

export type StratumSpec = {
  label: string;
  note?: string;
};

export type TriadColumn = {
  label?: string;
  title: string;
  body?: string;
};

export type CredentialField = {
  label: string;
  /** array renders as a deliberately wrapped record value */
  value: string | string[];
};

export type CredentialSpec = {
  fields?: CredentialField[];
  footnote?: string;
  /** 'plate' composites the record over the scene's media at a 0.90 scrim */
  over?: 'plate' | 'base';
};

export type CtaSpec = {
  wordmark?: string;
  wordmarkSub?: string;
  url?: string;
  /** relative path under public/ to a vector mark, tinted through currentColor */
  mark?: string;
};

export type Scene = {
  id: string;
  type: SceneType;
  durationInFrames: number;

  /** copy — `headline` and `body` may contain \n for deliberate line breaks */
  eyebrow?: string;
  headline?: string;
  body?: string;
  caption?: string;
  metric?: string;

  /** relative path under public/, e.g. "assets/nista-launch/plate-01.png" */
  media?: string;

  /** transition INTO this scene. Defaults to a hard cut. */
  transition?: TransitionType;
  camera?: CameraMove;
  /** 0–1 multiplier on the standard scrim. Never below 0.82 effective on type. */
  scrim?: number;

  strata?: StratumSpec[];
  diagram?: DiagramSpec;
  triad?: TriadColumn[];
  disciplines?: string[];
  credential?: CredentialSpec;
  cta?: CtaSpec;

  /** legacy, unused by the NISTA system — kept so old projects parse */
  accent?: string;
};

export type VideoProject = {
  id: string;
  title: string;
  width: number;
  height: number;
  fps: number;
  background?: string;
  foreground?: string;
  accent?: string;
  voiceover?: string;
  music?: string;
  scenes: Scene[];
};

/** Props every archetype component receives from the dispatcher. */
export type SceneComponentProps = {
  scene: Scene;
  project: VideoProject;
  index: number;
  /** frame at which the standard type exit begins, or null to hold */
  exitAt: number | null;
  camera: CameraMove;
};
