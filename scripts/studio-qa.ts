import {runQA} from '../src/studio/qa';

const args = process.argv.slice(2);
const arg = (name:string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i+1] : undefined;
};
const project = arg('--project');
const mode = arg('--mode') ?? 'draft';
if (!project) throw new Error('Use --project <slug>');

const result = runQA(project,mode==='final');
console.log(JSON.stringify(result,null,2));
if (result.critical.length) process.exitCode = 2;
