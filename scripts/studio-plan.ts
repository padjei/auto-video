import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const i = args.indexOf('--project');
const project = i >= 0 ? args[i+1] : undefined;
if (!project) throw new Error('Use --project <slug>');
const dir = path.resolve('projects',project);
if (!fs.existsSync(path.join(dir,'brief.md'))) throw new Error('Missing brief.md');

if (!fs.existsSync(path.join(dir,'strategy.md'))) fs.writeFileSync(path.join(dir,'strategy.md'),'# Strategy\n\n');
if (!fs.existsSync(path.join(dir,'storyboard.md'))) fs.writeFileSync(path.join(dir,'storyboard.md'),'# Storyboard\n\n');
if (!fs.existsSync(path.join(dir,'asset-plan.json'))) fs.writeFileSync(path.join(dir,'asset-plan.json'),'[]\n');
console.log(`Planning scaffold ready: ${project}`);
