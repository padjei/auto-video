import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia} from '@remotion/renderer';
import {VideoProjectSchema} from '../src/project-schema';

const args = process.argv.slice(2);
const arg = (name:string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i+1] : undefined;
};
const slug = arg('--project');
const mode = arg('--mode') ?? 'draft';
if (!slug) throw new Error('Use --project <slug>');

const data = VideoProjectSchema.parse(JSON.parse(fs.readFileSync(path.resolve('projects',slug,'project.json'),'utf8')));
const serveUrl = await bundle({entryPoint:path.resolve('src/index.ts')});
const comps = await getCompositions(serveUrl,{inputProps:{project:data}});
const comp = comps.find(c=>c.id==='AgenticVideo');
if (!comp) throw new Error('Composition AgenticVideo not found');

const durationInFrames = data.scenes.reduce((sum,s)=>sum+s.durationInFrames,0);
const target = {...comp,width:data.width,height:data.height,fps:data.fps,durationInFrames};
const output = path.resolve('out',`${slug}-${mode}.mp4`);
fs.mkdirSync(path.dirname(output),{recursive:true});

await renderMedia({composition:target,serveUrl,codec:'h264',outputLocation:output,inputProps:{project:data}});
console.log(output);
