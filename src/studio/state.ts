import fs from 'node:fs';
import path from 'node:path';
import type {ProductionPhase, ProductionState} from './types';

export const projectDir = (slug: string) => path.resolve('projects', slug);
export const statePath = (slug: string) => path.join(projectDir(slug), 'production-state.json');

export function loadState(slug: string): ProductionState {
  const file = statePath(slug);
  if (!fs.existsSync(file)) {
    const now = new Date().toISOString();
    return {project: slug, phase: 'INTAKE', revisionCycle: 0, startedAt: now, updatedAt: now, errors: []};
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function saveState(state: ProductionState) {
  fs.mkdirSync(projectDir(state.project), {recursive: true});
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(statePath(state.project), JSON.stringify(state, null, 2));
}

export function advanceState(slug: string, phase: ProductionPhase) {
  const state = loadState(slug);
  state.phase = phase;
  saveState(state);
  return state;
}
