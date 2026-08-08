import fs from 'node:fs';
import path from 'node:path';

export type ProviderKind='image'|'video'|'voice'|'music';

export function loadProviderConfig() {
  return JSON.parse(fs.readFileSync(path.resolve('config/providers.json'),'utf8'));
}

export function resolveProvider(kind:ProviderKind,requested?:string) {
  const config=loadProviderConfig();
  const section=config[kind];
  const preferred=requested ?? process.env[`VIDEO_STUDIO_${kind.toUpperCase()}_PROVIDER`] ?? section.default;
  const candidate=section.providers[preferred];

  if (candidate?.enabled) {
    const required:string[]=candidate.env ?? [];
    const missing=required.filter(k=>!process.env[k]);
    if (!missing.length) return {name:preferred,...candidate};
  }

  const fallbackName=section.fallback ?? section.default;
  const fallback=section.providers[fallbackName];
  return {name:fallbackName,...fallback};
}
