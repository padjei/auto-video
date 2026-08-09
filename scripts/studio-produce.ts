import 'dotenv/config';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {produceAssets} from '../src/studio/assets';
import {produceAudio} from '../src/studio/audio';
import {syncProjectMedia} from '../src/studio/sync';
import {makeCaptions} from '../src/studio/captions';
import {legacyNarrationPath, narrationPlanPath} from '../src/studio/narration';
import {runQA} from '../src/studio/qa';
import {advanceState,loadState,saveState} from '../src/studio/state';

const args=process.argv.slice(2);
const i=args.indexOf('--project');
const project=i>=0?args[i+1]:undefined;
if (!project) throw new Error('Use --project <slug>');

const run=(script:string,extra:string[]=[])=>{
  const r=spawnSync(process.execPath,['--import','tsx',script,'--project',project,...extra],{stdio:'inherit',env:process.env});
  if (r.status!==0) throw new Error(`${script} failed`);
};

advanceState(project,'ASSET_PRODUCTION');
await produceAssets(project);

// The audio stage renders the per-beat narration, builds the mix, and writes the
// captions and the timing contract the picture is cut to. There is no separate
// caption step any more — captions come out of the same measurement as the mix,
// and makeCaptions() below only verifies that they did.
const plan=narrationPlanPath(project);
const hasNarration=fs.existsSync(plan) || fs.existsSync(legacyNarrationPath(project));
if (hasNarration) {
  advanceState(project,'AUDIO');
  await produceAudio(project);
}

advanceState(project,'EDIT');
syncProjectMedia(project);
if (hasNarration) makeCaptions(project);

advanceState(project,'DRAFT_RENDER');
run('scripts/studio-render.ts',['--mode','draft']);

advanceState(project,'QA');
let qa=runQA(project,false);

let state=loadState(project);
const maxRevisions=JSON.parse(fs.readFileSync('config/budget.json','utf8')).maxRevisionCycles ?? 3;

while (qa.critical.length && state.revisionCycle<maxRevisions) {
  state.phase='REVISION';
  state.revisionCycle+=1;
  saveState(state);
  console.warn(`Critical QA remains. Revision cycle ${state.revisionCycle}. Claude Code should inspect qa-report.md, fix the project, then rerun studio:produce.`);
  process.exit(2);
}

if (qa.critical.length) throw new Error('Critical QA findings remain.');

advanceState(project,'FINAL_RENDER');
run('scripts/studio-render.ts',['--mode','final']);
runQA(project,true);

advanceState(project,'DELIVERY');
run('scripts/studio-deliver.ts');

console.log(`Production complete: out/${project}-final.mp4`);
