import fs from 'node:fs';
import path from 'node:path';
import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';

export class LocalImageAdapter implements GenerationAdapter {
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    fs.mkdirSync(path.dirname(request.outputPath), {recursive: true});
    const out = request.outputPath.endsWith('.svg') ? request.outputPath : request.outputPath + '.svg';
    const prompt = request.prompt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').slice(0,120);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${request.width ?? 1600}" height="${request.height ?? 900}">
      <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#07111A"/><stop offset="1" stop-color="#102334"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="78%" cy="20%" r="220" fill="#68D8FF" opacity=".12"/>
      <text x="8%" y="48%" fill="#F7FAFC" font-size="42" font-family="Arial">Local visual fallback</text>
      <text x="8%" y="56%" fill="#9FB3C8" font-size="22" font-family="Arial">${prompt}</text>
    </svg>`;
    fs.writeFileSync(out, svg);
    return {ok: true, provider: 'local', path: out};
  }
}
