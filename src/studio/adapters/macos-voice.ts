import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';

export class MacOSVoiceAdapter implements GenerationAdapter {
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    try {
      fs.mkdirSync(path.dirname(request.outputPath), {recursive:true});
      const aiff = request.outputPath.replace(/\.[^.]+$/, '.aiff');
      // This adapter is the studio's floor: it is what runs when a premium voice
      // is unavailable, so it must not fail over something as cosmetic as a voice
      // name. An unknown name (e.g. a hosted provider's voice id carried in from
      // the plan) falls back to the default rather than failing the render.
      const say = (voice: string) => execFileSync('say', ['-v',voice,'-o',aiff,request.prompt]);
      try {
        say(request.voiceId || 'Samantha');
      } catch {
        say('Samantha');
      }
      execFileSync('ffmpeg',['-y','-i',aiff,request.outputPath],{stdio:'ignore'});
      fs.rmSync(aiff,{force:true});
      return {ok:true, provider:'macos', path:request.outputPath};
    } catch (e) {
      return {ok:false, provider:'macos', error:String(e)};
    }
  }
}
