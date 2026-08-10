/**
 * Petal Pals Ep1 opening — audio build, v2.
 *
 * The point of this version: shot lengths were re-cut to each line's natural pace,
 * so nothing is time-stretched. The v1 build squeezed theme lines by up to 1.45x
 * and it sounded rushed. If a fit ratio prints above 1.0 here, the shot is too
 * short and the fix belongs in the shot list, not in this script.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const here = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
process.chdir(here);

const probe = (f: string) =>
  Number(execFileSync('ffprobe', ['-v','error','-show_entries','format=duration','-of','csv=p=0', f], {encoding:'utf8'}).trim());

const CLEAN =
  'silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse,' +
  'silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse';

/** shotStart = where the shot begins; lead = pause before the line starts. */
type Line = {file: string; shotStart: number; shotLen: number; lead: number; label: string};
const LINES: Line[] = [
  {file:'vo/narr-s01.wav',  shotStart:0,  shotLen:6, lead:0.5, label:'Narrator (s01)'},
  {file:'vo/narr-s03.wav',  shotStart:10, shotLen:5, lead:0.4, label:'Narrator (s03)'},
  {file:'vo/poppy-s05.wav', shotStart:19, shotLen:7, lead:0.8, label:'Poppy    (s05)'},
  {file:'vo/sunny-s06.wav', shotStart:26, shotLen:8, lead:0.5, label:'Sunny    (s06)'},
  {file:'vo/poppy-s11.wav', shotStart:34, shotLen:8, lead:0.4, label:'Poppy    (theme)'},
  {file:'vo/sunny-s12.wav', shotStart:42, shotLen:8, lead:0.3, label:'Sunny    (theme)'},
  {file:'vo/sprout-s13.wav',shotStart:50, shotLen:6, lead:0.4, label:'Sprout   (theme)'},
];
const GROUP = ['vo/grp-poppy.wav','vo/grp-sunny.wav','vo/grp-sprout.wav'];
const GROUP_AT = 56.6;
const TOTAL = 62;

fs.mkdirSync('out/v2/vo', {recursive: true});
const placed: {file:string; at:number}[] = [];

console.log('\n  line               cleaned   room   fit');
let worst = 0;
for (const l of LINES) {
  const out = `out/v2/vo/${path.basename(l.file)}`;
  execFileSync('ffmpeg', ['-y','-v','error','-i', l.file, '-af', CLEAN, out]);
  const len = probe(out);
  const room = l.shotLen - l.lead - 0.25;   // 0.25s so a line never butts the cut
  const fit = len / room;
  worst = Math.max(worst, fit);
  console.log(`  ${l.label.padEnd(18)} ${len.toFixed(2)}s   ${room.toFixed(2)}s  ${fit.toFixed(2)}${fit > 1 ? '  <-- OVERRUNS' : ''}`);
  placed.push({file: out, at: l.shotStart + l.lead});
}
GROUP.forEach((g, i) => {
  const o = `out/v2/vo/grp${i}.wav`;
  execFileSync('ffmpeg', ['-y','-v','error','-i', g, '-af', CLEAN, o]);
  placed.push({file: o, at: GROUP_AT});
});
console.log(`\n  worst fit ${worst.toFixed(2)} — ${worst <= 1 ? 'no time-stretching applied anywhere' : 'a shot is too short'}`);

const inputs: string[] = [];
const filters: string[] = [];
const vox: string[] = [];
placed.forEach((p, i) => {
  inputs.push('-i', p.file);
  const ms = Math.round(p.at * 1000);
  filters.push(`[${i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,adelay=${ms}|${ms}[v${i}]`);
  vox.push(`[v${i}]`);
});
const music = placed.length;
inputs.push('-i', '../../music/theme-v2.wav');

filters.push(
  `${vox.join('')}amix=inputs=${vox.length}:normalize=0:dropout_transition=0[voxraw]`,
  `[voxraw]highpass=f=100,equalizer=f=6800:t=q:w=2:g=-4,` +
    `acompressor=threshold=-20dB:ratio=3:attack=6:release=160:makeup=2,` +
    `loudnorm=I=-16:TP=-1.5:LRA=8[vox]`,
  `[vox]asplit=2[voxout][keyraw]`,
  `[keyraw]apad,atrim=0:${TOTAL + 2}[key]`,
  `[${music}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad,atrim=0:${TOTAL + 2}[bed]`,
  `[bed][key]sidechaincompress=threshold=0.05:ratio=5:attack=20:release=380:makeup=1[ducked]`,
  `[voxout][ducked]amix=inputs=2:normalize=0:dropout_transition=0[pre]`,
  `[pre]loudnorm=I=-15:TP=-1.5:LRA=9,alimiter=limit=0.95,asetpts=N/SR/TB,apad,atrim=0:${TOTAL}.000[outa]`
);

execFileSync('ffmpeg', ['-y','-hide_banner','-loglevel','error', ...inputs,
  '-filter_complex', filters.join(';'), '-map','[outa]',
  '-c:a','pcm_s16le','-ar','48000','-ac','2','out/v2/mix.wav'], {stdio:['ignore','inherit','inherit']});

console.log(`  mix: ${probe('out/v2/mix.wav').toFixed(3)}s`);
