import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import {resolveProvider} from './provider';
import {voiceAdapter,musicAdapter} from './factory';

type NarrationPlan={
  text:string;
  voiceProvider?:string;
  musicPrompt?:string;
  musicProvider?:string;
  durationSeconds?:number;
};

export async function produceAudio(project:string) {
  const dir=path.resolve('projects',project);
  const planPath=path.join(dir,'narration.json');
  if (!fs.existsSync(planPath)) throw new Error(`Missing ${planPath}`);
  const plan:NarrationPlan=JSON.parse(fs.readFileSync(planPath,'utf8'));

  const audioDir=path.resolve('public/assets',project,'audio');
  fs.mkdirSync(audioDir,{recursive:true});

  const voiceProvider=resolveProvider('voice',plan.voiceProvider);
  const voiceOut=path.join(audioDir,'voiceover.mp3');
  let voice=await voiceAdapter(voiceProvider.name).generate({
    id:'voiceover',project,prompt:plan.text,outputPath:voiceOut
  });

  if (!voice.ok && voiceProvider.name!=='macos') {
    voice=await voiceAdapter('macos').generate({
      id:'voiceover',project,prompt:plan.text,outputPath:voiceOut
    });
  }

  let music:any=null;
  if (plan.musicPrompt) {
    const musicProvider=resolveProvider('music',plan.musicProvider);
    const adapter=musicAdapter(musicProvider.name);
    if (adapter) {
      music=await adapter.generate({
        project,
        prompt:plan.musicPrompt,
        outputPath:path.join(audioDir,'music.mp3'),
        durationSeconds:plan.durationSeconds ?? 60
      });
    }
  }

  const result={
    voiceover:voice.ok?`assets/${project}/audio/voiceover.mp3`:null,
    backgroundMusic:music?.ok?`assets/${project}/audio/music.mp3`:null,
    voiceProvider:voice.provider,
    musicProvider:music?.provider ?? null
  };
  fs.writeFileSync(path.join(dir,'audio-manifest.json'),JSON.stringify(result,null,2));
  return result;
}
