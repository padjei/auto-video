import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import type {GenerationAdapter, GenerationRequest, GenerationResult} from './base';

export class MacOSVoiceAdapter implements GenerationAdapter {
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    try {
      fs.mkdirSync(path.dirname(request.outputPath), {recursive:true});
      const aiff = request.outputPath.replace(/\.[^.]+$/, '.aiff');
      execFileSync('say', ['-v','Samantha','-o',aiff,request.prompt]);
      execFileSync('ffmpeg',['-y','-i',aiff,request.outputPath],{stdio:'ignore'});
      fs.rmSync(aiff,{force:true});
      return {ok:true, provider:'macos', path:request.outputPath};
    } catch (e) {
      return {ok:false, provider:'macos', error:String(e)};
    }
  }
}
