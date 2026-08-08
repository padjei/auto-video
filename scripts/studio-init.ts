import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = (name:string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i+1] : undefined;
};

const name = arg('--name') ?? 'Untitled Video';
const slug = (arg('--slug') ?? name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const dir = path.resolve('projects',slug);
fs.mkdirSync(dir,{recursive:true});
const now = new Date().toISOString();

fs.writeFileSync(path.join(dir,'brief.md'), `# ${name}

## Objective

## Audience

## Platform

## Duration

## Aspect Ratio

## Tone

## CTA

## Script

`);

fs.writeFileSync(path.join(dir,'production-state.json'), JSON.stringify({
  project:slug, phase:'INTAKE', revisionCycle:0, startedAt:now, updatedAt:now, errors:[]
},null,2));

console.log(slug);
