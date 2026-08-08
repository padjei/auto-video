import 'dotenv/config';
import {produceAssets} from '../src/studio/assets';

const args=process.argv.slice(2);
const i=args.indexOf('--project');
const project=i>=0?args[i+1]:undefined;
if (!project) throw new Error('Use --project <slug>');
console.log(JSON.stringify(await produceAssets(project),null,2));
