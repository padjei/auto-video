import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';

export class LocalVideoAdapter implements GenerationAdapter {
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    try {
      fs.mkdirSync(path.dirname(request.outputPath), {recursive: true});
      const size = `${request.width ?? 1920}x${request.height ?? 1080}`;
      execFileSync('ffmpeg', [
        '-y','-f','lavfi','-i',`color=c=#07111A:s=${size}:d=${request.durationSeconds ?? 4}`,
        '-vf','drawgrid=width=64:height=64:thickness=1:color=white@0.06',
        '-r','30','-c:v','libx264','-pix_fmt','yuv420p',request.outputPath
      ], {stdio:'ignore'});
      return {ok:true, provider:'local', path:request.outputPath};
    } catch (e) {
      return {ok:false, provider:'local', error:String(e)};
    }
  }
}
