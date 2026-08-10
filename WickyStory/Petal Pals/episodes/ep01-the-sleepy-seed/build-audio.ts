/**
 * Petal Pals Ep1 test — audio build.
 *
 * Each line is trimmed of dead air, then tempo-fitted to the shot it plays over.
 * Generated speech comes back at unpredictable lengths, so fitting is measured per
 * line rather than assumed. Anything past ~1.3x is reported, because that is where
 * a sped-up read starts to sound rushed rather than energetic.
 *
 * The group tag is three voices layered on one another — the only way to get an
 * ensemble "all together now" out of a single-speaker TTS.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

// Resolve this file's own directory, decoding %-escapes — the project path contains a
// space, which import.meta.url encodes and chdir will not accept.
const here = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
process.chdir(here);

const probe = (f: string) =>
  Number(execFileSync('ffprobe', ['-v','error','-show_entries','format=duration','-of','csv=p=0', f], {encoding:'utf8'}).trim());

const CLEAN =
  'silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse,' +
  'silenceremove=start_periods=1:start_duration=0:start_threshold=-45dB:detection=peak,areverse,' +
  'silenceremove=stop_periods=-1:stop_duration=0.22:stop_threshold=-42dB:detection=peak';

type Line = {file: string; at: number; window: number; label: string};

/** at = seconds into the film; window = seconds of room before the next line needs the stage. */
const LINES: Line[] = [
  {file: 'vo/narr-s01.wav',  at: 0.7,  window: 5.0, label: 'Narrator  (s01)'},
  {file: 'vo/narr-s03.wav',  at: 10.4, window: 4.3, label: 'Narrator  (s03)'},
  {file: 'vo/poppy-s05.wav', at: 19.4, window: 4.4, label: 'Poppy     (s05)'},
  {file: 'vo/sunny-s06.wav', at: 24.3, window: 4.4, label: 'Sunny     (s06)'},
  {file: 'vo/poppy-s11.wav', at: 29.3, window: 4.4, label: 'Poppy     (theme)'},
  {file: 'vo/sunny-s12.wav', at: 34.3, window: 4.4, label: 'Sunny     (theme)'},
  {file: 'vo/sprout-s13.wav',at: 39.3, window: 4.4, label: 'Sprout    (theme)'},
];
/** The group tag — same line, three voices, stacked. */
const GROUP = ['vo/grp-poppy.wav', 'vo/grp-sunny.wav', 'vo/grp-sprout.wav'];
const GROUP_AT = 44.7;

fs.mkdirSync('out/vo', {recursive: true});
const placed: {file: string; at: number}[] = [];

console.log('\n  line                 raw    fitted   tempo');
for (const l of LINES) {
  const raw = probe(l.file);
  const probeFile = `out/vo/.p-${path.basename(l.file)}`;
  execFileSync('ffmpeg', ['-y','-v','error','-i', l.file, '-af', CLEAN, probeFile]);
  const cleaned = probe(probeFile);
  const tempo = Math.max(1, cleaned / l.window);
  const outFile = `out/vo/${path.basename(l.file)}`;
  const chain = tempo > 1.001 ? `${CLEAN},atempo=${tempo.toFixed(6)}` : CLEAN;
  execFileSync('ffmpeg', ['-y','-v','error','-i', l.file, '-af', chain, outFile]);
  fs.rmSync(probeFile, {force: true});
  const flag = tempo > 1.3 ? '  <-- rushed' : tempo > 1.15 ? '  <-- audible' : '';
  console.log(`  ${l.label.padEnd(20)} ${raw.toFixed(2)}s  ${probe(outFile).toFixed(2)}s  ${tempo.toFixed(3)}${flag}`);
  placed.push({file: outFile, at: l.at});
}

// Group tag: clean each, don't tempo-fit — they are short and land in a 6s shot.
GROUP.forEach((g, i) => {
  const o = `out/vo/grp${i}.wav`;
  execFileSync('ffmpeg', ['-y','-v','error','-i', g, '-af', CLEAN, o]);
  placed.push({file: o, at: GROUP_AT});
});

/* ---- Mix: voices over the ducked theme bed ---- */
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
inputs.push('-i', '../../music/theme-test.wav');

filters.push(
  `${vox.join('')}amix=inputs=${vox.length}:normalize=0:dropout_transition=0[voxraw]`,
  // Kids' dialogue wants to sit forward and bright, but TTS sibilance is hot.
  `[voxraw]highpass=f=100,equalizer=f=6800:t=q:w=2:g=-4,` +
    `acompressor=threshold=-20dB:ratio=3:attack=6:release=160:makeup=2,` +
    `loudnorm=I=-16:TP=-1.5:LRA=8[vox]`,
  `[vox]asplit=2[voxout][keyraw]`,
  `[keyraw]apad,atrim=0:52[key]`,
  `[${music}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad,atrim=0:52[bed]`,
  `[bed][key]sidechaincompress=threshold=0.05:ratio=5:attack=20:release=380:makeup=1[ducked]`,
  `[voxout][ducked]amix=inputs=2:normalize=0:dropout_transition=0[pre]`,
  `[pre]loudnorm=I=-15:TP=-1.5:LRA=9,alimiter=limit=0.95,asetpts=N/SR/TB,apad,atrim=0:50.000[outa]`
);

execFileSync('ffmpeg', ['-y','-hide_banner','-loglevel','error', ...inputs,
  '-filter_complex', filters.join(';'), '-map','[outa]',
  '-c:a','pcm_s16le','-ar','48000','-ac','2','out/mix.wav'], {stdio:['ignore','inherit','inherit']});

console.log(`\n  mix: ${probe('out/mix.wav').toFixed(3)}s`);
