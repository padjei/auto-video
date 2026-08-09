/**
 * Assembles the final audio bed from per-beat narration clips plus the score.
 *
 * Narration is generated one clip per beat so every clip's true duration is known.
 * Those measured durations drive three things that must agree exactly: the placement
 * of narration on the timeline, the caption timings, and the scene durations in
 * project.json. Deriving all three from one measurement is what keeps captions,
 * picture and voice in sync.
 *
 * Reads:  projects/<slug>/narration-plan.json
 * Writes: public/assets/<slug>/mix.wav
 *         projects/<slug>/captions.srt
 *         projects/<slug>/audio-timing.json
 *
 * Usage: tsx scripts/assemble-audio.ts --project <slug>
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
if (!slug) throw new Error('Use --project <slug>');

const fps = Number(arg('--fps') ?? 30);

/**
 * Alternate-voice variant. The picture is locked and conformed to the primary
 * voice, so a variant reuses that timeline exactly and only swaps the clips
 * (see scripts/conform-voice.ts). Outputs are suffixed so a variant can never
 * overwrite the delivered primary mix, captions or timing.
 */
const variant = arg('--variant');
const sfx = variant ? `-${variant}` : '';
const projectDir = path.resolve('projects', slug);
const assetDir = path.resolve('public/assets', slug);

type Beat = {
  id: string;
  /** Spoken text for this beat; also the caption text. */
  narration: string;
  /** Narration audio file, relative to public/. */
  audio: string;
  /** Silence held before this beat's narration starts, in seconds. */
  leadIn: number;
  /** Silence held after this beat's narration ends, in seconds. */
  tail: number;
};

type NarrationPlan = {
  beats: Beat[];
  /** Music level while narration is speaking, and while it is not. */
  duckDb: number;
  bedDb: number;
  score: string;
};

const plan: NarrationPlan = JSON.parse(
  fs.readFileSync(path.join(projectDir, `narration-plan${sfx}.json`), 'utf8')
);

const probeDuration = (file: string) =>
  Number(
    execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file],
      {encoding: 'utf8'}
    ).trim()
  );

/* ---- 1. Measure every narration clip and lay out the timeline ---- */

type Placed = Beat & {
  file: string;
  speechStart: number;
  speechEnd: number;
  beatStart: number;
  beatEnd: number;
  durationInFrames: number;
};

const placed: Placed[] = [];
let cursor = 0;

for (const beat of plan.beats) {
  const file = path.resolve('public', beat.audio);
  if (!fs.existsSync(file)) throw new Error(`Missing narration clip: ${file}`);
  const spoken = probeDuration(file);

  const beatStart = cursor;
  const speechStart = beatStart + beat.leadIn;
  const speechEnd = speechStart + spoken;
  const beatEnd = speechEnd + beat.tail;

  placed.push({
    ...beat,
    file,
    speechStart,
    speechEnd,
    beatStart,
    beatEnd,
    durationInFrames: Math.round((beatEnd - beatStart) * fps)
  });

  cursor = beatEnd;
}

const total = cursor;
const totalFrames = placed.reduce((s, p) => s + p.durationInFrames, 0);

/**
 * The mix has to be exactly as long as the picture, and the picture is a whole
 * number of frames. `total` is the sum of measured clip durations and lands a
 * millisecond or two off a frame edge, so the frame count — which is what
 * project.json renders — is the authority for the mix length.
 */
const target = totalFrames / fps;

/**
 * Everything upstream of the final trim is built with an overhang. `loudnorm`
 * runs a look-ahead and hands back slightly fewer samples than it is given
 * (this is what left the old mix at 59.955s against a 60.000s picture), and the
 * score is still decaying at picture out. Rendering long and trimming once, at
 * the very end, makes both of those land in material that gets discarded.
 */
const overhang = 2;
const work = target + overhang;

/* ---- 2. Build the narration track: each clip delayed to its speech start ---- */

const inputs: string[] = [];
const filters: string[] = [];
const voiceLabels: string[] = [];

placed.forEach((p, i) => {
  inputs.push('-i', p.file);
  const delayMs = Math.round(p.speechStart * 1000);
  filters.push(
    `[${i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,` +
      `adelay=${delayMs}|${delayMs}[v${i}]`
  );
  voiceLabels.push(`[v${i}]`);
});

const scoreIndex = placed.length;
inputs.push('-i', path.resolve('public', plan.score));

filters.push(
  `${voiceLabels.join('')}amix=inputs=${voiceLabels.length}:normalize=0:dropout_transition=0[voxraw]`,
  // Narration sits at broadcast-ish -16 LUFS; a light compressor keeps a calm read
  // even without riding levels, and the de-esser tames generated-TTS sibilance.
  `[voxraw]highpass=f=80,` +
    `equalizer=f=6500:t=q:w=2:g=-3,` +
    `acompressor=threshold=-20dB:ratio=2.5:attack=8:release=180:makeup=2,` +
    `loudnorm=I=${cfg('audio.narration.targetLufs', -16)}:TP=${cfg('audio.narration.truePeakDb', -1.5)}:LRA=${cfg('audio.narration.loudnessRange', 9)}[vox]`,
  `[vox]asplit=2[voxout][voxkeyraw]`,
  // sidechaincompress ends as soon as its KEY input ends, which would truncate the
  // whole mix at the last spoken word and leave the held CTA in digital silence.
  // Pad the key to the full timeline so the score is free to decay under the lockup.
  `[voxkeyraw]apad,atrim=0:${work.toFixed(3)}[voxkey]`,
  // Sidechain-duck the score against the narration so music yields to speech
  // automatically rather than via hand-authored volume keyframes.
  `[${scoreIndex}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,` +
    `apad,atrim=0:${work.toFixed(3)},volume=${plan.bedDb}dB[bed]`,
  `[bed][voxkey]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=420:makeup=1[ducked]`,
  `[voxout][ducked]amix=inputs=2:normalize=0:dropout_transition=0[premix]`,
  // No fade here. The bed's own taper is authored in make-score.ts and is still
  // audible at picture out; a fade at `total - 1.2` would collapse it to digital
  // zero underneath the last 36 frames of the held CTA lockup, which reads as a
  // dropout. The trim is the only thing that decides where the mix ends, and
  // `apad` before it guarantees the file can never come out short of picture.
  // `asetpts` renumbers the mix from sample zero before the trim. Without it the
  // trim measures against a timeline that the narration loudnorm's look-ahead has
  // pushed ~92ms forward, and the file comes out that much shorter than picture.
  `[premix]loudnorm=I=${cfg('audio.mix.targetLufs', -15)}:TP=${cfg('audio.mix.truePeakDb', -1.5)}:LRA=${cfg('audio.mix.loudnessRange', 9)},` +
    `alimiter=limit=${cfg('audio.mix.limiterCeiling', 0.95)},` +
    `asetpts=N/SR/TB,apad,atrim=0:${target.toFixed(3)}[outa]`
);

fs.mkdirSync(assetDir, {recursive: true});
const mixPath = path.join(assetDir, `mix${sfx}.wav`);

execFileSync('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  ...inputs,
  '-filter_complex', filters.join(';'),
  '-map', '[outa]',
  '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2',
  mixPath
], {stdio: ['ignore', 'inherit', 'inherit']});

/* ---- 3. Captions, timed to the measured speech (not the beat boundaries) ---- */

const srtTime = (s: number) => {
  const ms = Math.round(s * 1000);
  const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  const milli = String(ms % 1000).padStart(3, '0');
  return `${h}:${m}:${sec},${milli}`;
};

/**
 * Caption segmentation.
 *
 * One beat is not one cue. A beat is however many cues it takes to keep every
 * row inside MAX_ROW_CHARS and every cue inside MAX_ROWS, because a player that
 * has to re-wrap a row grows the caption block downwards into the lower third —
 * which is exactly where this film's headlines sit.
 *
 * The beat's measured speech window is then divided between its cues in
 * proportion to their character counts, so cue timing still comes from the
 * measured clip durations rather than from the beat grid.
 */

/** Hard limits. A row over 42 characters re-wraps on LinkedIn's renderer. */
const MAX_ROW_CHARS = 42;
const MAX_ROWS = 2;
/** Held between two cues of the same beat so the change of copy is visible. */
const CUE_GAP = 0.04;

/** Line breaks read best after punctuation... */
const BREAK_PUNCTUATION = /[.,;:!?—–]$/;
/** ...and before a word that opens a new phrase rather than continuing one. */
const ROW_START_WORDS = new Set([
  'a', 'across', 'after', 'an', 'and', 'as', 'at', 'because', 'before', 'but',
  'by', 'for', 'from', 'if', 'in', 'into', 'it', 'its', 'not', 'of', 'on', 'or',
  'our', 'over', 'so', 'than', 'that', 'the', 'then', 'they', 'to', 'under',
  'we', 'when', 'where', 'which', 'while', 'who', 'with', 'you', 'your'
]);

const words = (text: string) => text.trim().split(/\s+/);

/**
 * Lay a cue out as one or two rows, never breaking a word. Returns null when the
 * text cannot be made to fit — that is the signal to split it into more cues.
 */
const layout = (text: string): string[] | null => {
  const t = text.trim();
  if (t.length <= MAX_ROW_CHARS) return [t];
  if (MAX_ROWS < 2) return null;
  const w = words(t);
  let best: string[] | null = null;
  let bestScore = Infinity;
  for (let i = 1; i < w.length; i++) {
    const left = w.slice(0, i).join(' ');
    const right = w.slice(i).join(' ');
    if (left.length > MAX_ROW_CHARS || right.length > MAX_ROW_CHARS) continue;
    let score = Math.abs(left.length - right.length);
    if (BREAK_PUNCTUATION.test(left)) score -= 14;
    if (ROW_START_WORDS.has(w[i].toLowerCase().replace(/[^a-z']/g, ''))) score -= 10;
    if (score < bestScore) {
      bestScore = score;
      best = [left, right];
    }
  }
  return best;
};

const fits = (text: string) => layout(text) !== null;

/** Sentence boundary: terminal punctuation followed by whitespace. */
const sentences = (text: string) => text.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
/** Clause boundary: comma, semicolon, colon or a spaced em/en dash. */
const clauses = (text: string) => text.trim().split(/(?<=[,;:—–])\s+/).filter(Boolean);

/**
 * Split a run of units into the fewest cues that all fit, and among those, the
 * division that keeps the cues most even in length and breaks their rows at
 * punctuation. Units are never broken apart, so a split can only ever land on a
 * sentence, clause or word boundary depending on what was handed in.
 */
const partition = (units: string[]): string[] => {
  const n = units.length;
  const join = (i: number, j: number) => units.slice(i, j).join(' ');

  // Fewest cues needed to cover units[i..n).
  const least = new Array<number>(n + 1).fill(Infinity);
  least[n] = 0;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j <= n; j++) {
      if (!fits(join(i, j))) continue;
      least[i] = Math.min(least[i], 1 + least[j]);
    }
  }
  if (!Number.isFinite(least[0])) {
    throw new Error(`Cannot fit caption text into ${MAX_ROWS} rows: ${join(0, n)}`);
  }

  const cueCount = least[0];
  const even = join(0, n).length / cueCount;
  const memo = new Map<string, {cost: number; cuts: string[]}>();

  const solve = (i: number, k: number): {cost: number; cuts: string[]} => {
    if (i === n) return {cost: k === 0 ? 0 : Infinity, cuts: []};
    if (k === 0) return {cost: Infinity, cuts: []};
    const key = `${i}:${k}`;
    const hit = memo.get(key);
    if (hit) return hit;
    let best = {cost: Infinity, cuts: [] as string[]};
    for (let j = i + 1; j <= n; j++) {
      const text = join(i, j);
      const rows = layout(text);
      if (!rows) continue;
      const rest = solve(j, k - 1);
      if (!Number.isFinite(rest.cost)) continue;
      // Evenness dominates; an unpunctuated row break is worth about 10
      // characters of imbalance.
      const balance = (text.length - even) ** 2;
      const breakQuality =
        rows.length < 2 || BREAK_PUNCTUATION.test(rows[0]) ? 0 : 100;
      const cost = balance + breakQuality + rest.cost;
      if (cost < best.cost) best = {cost, cuts: [text, ...rest.cuts]};
    }
    memo.set(key, best);
    return best;
  };

  return solve(0, cueCount).cuts;
};

/** Split one beat's narration into cue-sized chunks, in reading order. */
const chunkNarration = (narration: string): string[] => {
  const out: string[] = [];
  let run: string[] = [];
  const flushRun = () => {
    if (run.length) out.push(...partition(run));
    run = [];
  };

  for (const sentence of sentences(narration)) {
    if (fits(sentence)) {
      // Whole sentences pack together; a cue never straddles a sentence boundary
      // unless both sides of it are complete.
      run.push(sentence);
      continue;
    }
    flushRun();
    // Too long for one cue: fall to clauses, and to words for any clause that is
    // itself too long.
    const units = clauses(sentence).flatMap((c) => (fits(c) ? [c] : words(c)));
    out.push(...partition(units));
  }
  flushRun();
  return out;
};

type Cue = {start: number; end: number; rows: string[]};

const cues: Cue[] = [];

for (const p of placed) {
  const chunks = chunkNarration(p.narration);
  const chars = chunks.reduce((s, c) => s + c.length, 0);
  const window = p.speechEnd - p.speechStart;

  // Boundaries inside the beat's measured speech window, proportional to the
  // characters each cue carries.
  const bounds = [p.speechStart];
  let used = 0;
  for (const c of chunks) {
    used += c.length;
    bounds.push(p.speechStart + window * (used / chars));
  }
  bounds[bounds.length - 1] = p.speechEnd;

  chunks.forEach((c, i) => {
    const last = i === chunks.length - 1;
    cues.push({
      start: bounds[i],
      end: last ? p.speechEnd : bounds[i + 1] - CUE_GAP,
      rows: layout(c)!
    });
  });
}

const srt = cues
  .map((c, i) =>
    [String(i + 1), `${srtTime(c.start)} --> ${srtTime(c.end)}`, ...c.rows, ''].join('\n')
  )
  .join('\n');

fs.writeFileSync(path.join(projectDir, `captions${sfx}.srt`), srt);

/* ---- 4. Timing contract for the storyboard / project.json ---- */

const timing = {
  project: slug,
  fps,
  // Frame-exact: picture, mix and this contract all state one duration.
  totalSeconds: Number(target.toFixed(3)),
  totalFrames,
  // What the measured clips plus their gaps actually summed to, before the
  // timeline was quantised to whole frames.
  measuredSeconds: Number(total.toFixed(3)),
  mix: path.relative(path.resolve('public'), mixPath),
  beats: placed.map((p) => ({
    id: p.id,
    beatStart: Number(p.beatStart.toFixed(3)),
    beatEnd: Number(p.beatEnd.toFixed(3)),
    speechStart: Number(p.speechStart.toFixed(3)),
    speechEnd: Number(p.speechEnd.toFixed(3)),
    durationInFrames: p.durationInFrames,
    narration: p.narration
  }))
};

fs.writeFileSync(
  path.join(projectDir, `audio-timing${sfx}.json`),
  JSON.stringify(timing, null, 2)
);

console.log(`Mix:      ${mixPath}`);
console.log(`Captions: ${path.join(projectDir, `captions${sfx}.srt`)} (${cues.length} cues)`);
console.log(`Total:    ${target.toFixed(3)}s / ${totalFrames} frames @ ${fps}fps`);
