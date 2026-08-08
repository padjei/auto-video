import 'dotenv/config';
import {produceAudio} from '../src/studio/audio';

const args=process.argv.slice(2);
const i=args.indexOf('--project');
const project=i>=0?args[i+1]:undefined;
if (!project) throw new Error('Use --project <slug>');
console.log(JSON.stringify(await produceAudio(project),null,2));
