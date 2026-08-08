import {syncProjectMedia} from '../src/studio/sync';
import {makeCaptions} from '../src/studio/captions';

const args=process.argv.slice(2);
const i=args.indexOf('--project');
const project=i>=0?args[i+1]:undefined;
if (!project) throw new Error('Use --project <slug>');

syncProjectMedia(project);
makeCaptions(project);
console.log(`Synced media and captions for ${project}`);
