/**
 * Conforms an alternate narration voice to a LOCKED picture.
 *
 * The film's cuts were conformed to one voice's measured beat boundaries. Swapping
 * in a different voice therefore cannot simply re-derive the timeline — that would
 * move every cut away from the line it was cut against. Instead the picture stays
 * locked and each beat of the new read is fitted to the duration the picture already
 * expects, which is how a VO replacement against a locked cut is normally done.
 *
 * Per beat: trim edge silence, compress over-long internal pauses, then apply the
 * single atempo factor that lands the clip exactly on its target. The reported
 * factor is the quality signal — much past ~1.15 and a listener starts to hear it,
 * so this prints every factor and flags the ones that will not survive scrutiny.
 *
 * Usage: tsx scripts/conform-voice.ts --project <slug> --voice <name>
 *        Raw clips are read from public/assets/<slug>/vo-<name>/raw/b1..b8.wav
 *        Conformed clips are written to public/assets/<slug>/vo-<name>/b1..b8.wav
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {cfg} from '../src/studio/pipeline-config';

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const slug = arg('--project');
const voice = arg('--voice');
if (!slug || !voice) throw new Error('Use --project <slug> --voice <name>');

/** Above this, listeners reliably notice the read has been sped up. */
const AUDIBLE_TEMPO = cfg('voiceConform.audibleTempoFactor', 1.15);
/** ffmpeg's atempo is only defined to 2.0 in one stage; past this we chain, and it degrades. */
const MAX_TEMPO = cfg('voiceConform.maxTempoFactor', 1.6);

const projectDir = path.resolve('projects', slug);
const voiceDir = path.resolve('public/assets', slug, `vo-${voice}`);

const probe = (f: string) =>
  Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], {
      encoding: 'utf8'
    }).trim()
  );

/**
 * How long each beat's read may actually run.
 *
 * Not the reference voice's speech duration — the reference read left a tail of
 * silence inside each beat before the next one starts, and a different voice is
 * entitled to use it. Budgeting the whole span, less a guard so beats don't run
 * into each other, is free headroom that comes straight off the tempo factor.
 * The last beat keeps a larger guard so the film never ends on a word.
 */
const GUARD = cfg('voiceConform.beatGuardSeconds', 0.1);
const FINAL_GUARD = cfg('voiceConform.finalBeatGuardSeconds', 0.3);

const timing = JSON.parse(fs.readFileSync(path.join(projectDir, 'audio-timing.json'), 'utf8'));
const targets: {id: string; target: number}[] = timing.beats.map((b: any, i: number) => {
  const guard = i === timing.beats.length - 1 ? FINAL_GUARD : GUARD;
  return {
    id: b.id,
    target: Number((b.beatEnd - b.speechStart - guard).toFixed(3))
  };
});

const EDGE_DB = cfg('voiceConform.edgeSilenceThresholdDb', -45);
const PAUSE_DB = cfg('voiceConform.internalPauseThresholdDb', -42);
const PAUSE_MAX = cfg('voiceConform.maxInternalPauseSeconds', 0.28);

const CLEAN =
  `silenceremove=start_periods=1:start_duration=0:start_threshold=${EDGE_DB}dB:detection=peak,` +
  'areverse,' +
  `silenceremove=start_periods=1:start_duration=0:start_threshold=${EDGE_DB}dB:detection=peak,` +
  'areverse,' +
  `silenceremove=stop_periods=-1:stop_duration=${PAUSE_MAX}:stop_threshold=${PAUSE_DB}dB:detection=peak`;

/** atempo is well-conditioned in [0.5, 2.0]; chain stages for anything outside. */
const tempoChain = (factor: number) => {
  const stages: number[] = [];
  let remaining = factor;
  while (remaining > 2.0) {
    stages.push(2.0);
    remaining /= 2.0;
  }
  while (remaining < 0.5) {
    stages.push(0.5);
    remaining /= 0.5;
  }
  stages.push(remaining);
  return stages.map((s) => `atempo=${s.toFixed(6)}`).join(',');
};

const rows: string[] = [];
let worst = 0;

for (const [i, {id, target}] of targets.entries()) {
  const n = i + 1;
  const raw = path.join(voiceDir, 'raw', `b${n}.wav`);
  if (!fs.existsSync(raw)) throw new Error(`Missing raw clip: ${raw}`);

  // Measure what the cleaned clip runs to before deciding the tempo factor.
  const probeFile = path.join(voiceDir, `.probe-b${n}.wav`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-af', CLEAN, probeFile]);
  const cleaned = probe(probeFile);

  const factor = cleaned / target;
  worst = Math.max(worst, factor);

  const out = path.join(voiceDir, `b${n}.wav`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-af', `${CLEAN},${tempoChain(factor)}`, out]);
  fs.rmSync(probeFile, {force: true});

  const got = probe(out);
  const flag =
    factor > MAX_TEMPO ? '  ✗ UNUSABLE' : factor > AUDIBLE_TEMPO ? '  ! audible' : '';
  rows.push(
    `  ${id.padEnd(16)} raw ${probe(raw).toFixed(2).padStart(6)}s  ` +
      `cleaned ${cleaned.toFixed(2).padStart(6)}s  → target ${target.toFixed(2)}s  ` +
      `tempo ${factor.toFixed(3)}  got ${got.toFixed(2)}s${flag}`
  );
}

console.log(`\nConforming "${voice}" to the locked picture:\n`);
console.log(rows.join('\n'));
console.log(
  `\n  worst tempo factor: ${worst.toFixed(3)}  ` +
    (worst > MAX_TEMPO
      ? '→ NOT USABLE at this script length'
      : worst > AUDIBLE_TEMPO
        ? '→ usable but the speed-up is audible'
        : '→ transparent')
);
