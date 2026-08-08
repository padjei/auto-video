import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const i = args.indexOf('--project');
const project = i >= 0 ? args[i+1] : undefined;
if (!project) throw new Error('Use --project <slug>');

const finalPath = path.resolve('out',`${project}-final.mp4`);
if (!fs.existsSync(finalPath)) throw new Error(`Missing final video: ${finalPath}`);

const metadata = JSON.parse(execFileSync('ffprobe',[
  '-v','quiet','-print_format','json','-show_format','-show_streams',finalPath
],{encoding:'utf8'}));

const delivery = {project, finalVideo:finalPath, deliveredAt:new Date().toISOString(), metadata};
fs.writeFileSync(path.resolve('projects',project,'delivery.json'),JSON.stringify(delivery,null,2));
console.log(JSON.stringify(delivery,null,2));
