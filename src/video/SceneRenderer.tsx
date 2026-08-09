/**
 * Scene dispatcher.
 *
 * Replaces the previous monolithic renderer. There is no drawing code in this file —
 * it only resolves a scene to one of the nine archetypes in strategy §8. Legacy
 * generic scene types from older projects are mapped onto the nearest archetype so
 * existing project.json files keep rendering.
 */
import React from 'react';
import type {SceneArchetype, SceneComponentProps, SceneType} from '../types';

import {CinematicPlate} from './scenes/CinematicPlate';
import {StatementCard} from './scenes/StatementCard';
import {StrataDescentScene} from './scenes/StrataDescentScene';
import {ArchitectureDiagram} from './scenes/ArchitectureDiagram';
import {EngineeringVignette} from './scenes/EngineeringVignette';
import {AssuranceTriad} from './scenes/AssuranceTriad';
import {DisciplineGrid} from './scenes/DisciplineGrid';
import {CredentialBlock} from './scenes/CredentialBlock';
import {CtaLockup} from './scenes/CtaLockup';

const LEGACY_MAP: Record<string, SceneArchetype> = {
  hero: 'statementCard',
  kineticType: 'statementCard',
  metric: 'statementCard',
  quote: 'statementCard',
  split: 'cinematicPlate',
  image: 'cinematicPlate',
  video: 'engineeringVignette',
  diagram: 'architectureDiagram',
  code: 'architectureDiagram',
  ui: 'architectureDiagram',
  process: 'disciplineGrid',
  cta: 'ctaLockup',
};

const ARCHETYPES: Record<SceneArchetype, React.FC<SceneComponentProps>> = {
  cinematicPlate: CinematicPlate,
  statementCard: StatementCard,
  strataDescent: StrataDescentScene,
  architectureDiagram: ArchitectureDiagram,
  engineeringVignette: EngineeringVignette,
  assuranceTriad: AssuranceTriad,
  disciplineGrid: DisciplineGrid,
  credentialBlock: CredentialBlock,
  ctaLockup: CtaLockup,
};

export const resolveArchetype = (type: SceneType): SceneArchetype =>
  (type in ARCHETYPES ? (type as SceneArchetype) : LEGACY_MAP[type]) ?? 'statementCard';

/** Archetypes that carry generated photography and therefore the heavier finish. */
export const isPhotographic = (archetype: SceneArchetype): boolean =>
  archetype === 'cinematicPlate' || archetype === 'engineeringVignette';

export const SceneRenderer: React.FC<SceneComponentProps> = (props) => {
  const Component = ARCHETYPES[resolveArchetype(props.scene.type)];
  return <Component {...props} />;
};
