/**
 * Loads config/pipeline.json.
 *
 * Every caller passes its own literal defaults, so a bare checkout with no config
 * file still runs and still produces the same output. The config exists to make the
 * knobs visible and overridable, not to become a required dependency.
 */
import fs from 'node:fs';
import path from 'node:path';

type Json = Record<string, any>;

let cached: Json | null = null;

export function pipelineConfig(): Json {
  if (cached) return cached;
  const file = path.resolve('config/pipeline.json');
  const loaded: Json = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  cached = loaded;
  return loaded;
}

/**
 * Reads a dotted path out of the config, returning `fallback` when any segment is
 * missing. `cfg('audio.mix.targetLufs', -15)`.
 */
export function cfg<T>(dotted: string, fallback: T): T {
  let node: any = pipelineConfig();
  for (const key of dotted.split('.')) {
    if (node == null || typeof node !== 'object' || !(key in node)) return fallback;
    node = node[key];
  }
  return (node ?? fallback) as T;
}
