import fs from 'node:fs';
import {syncProjectMedia} from '../src/studio/sync';
import {makeCaptions} from '../src/studio/captions';
import {audioTimingPath} from '../src/studio/narration';

const args=process.argv.slice(2);
const i=args.indexOf('--project');
const project=i>=0?args[i+1]:undefined;
if (!project) throw new Error('Use --project <slug>');

syncProjectMedia(project);

// Captions are written by the audio stage from the measured narration; here they
// are only verified. A project that has never run the audio stage has nothing to
// verify, and that is not an error at sync time.
const captions=fs.existsSync(audioTimingPath(project))?makeCaptions(project):null;

console.log(`Synced media for ${project}${captions?` (captions verified: ${captions})`:''}`);
