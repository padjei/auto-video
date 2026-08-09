/**
 * The narration engine: measure, place, mix, caption.
 *
 * This module owns the one narration convention in this studio. Narration is
 * written and rendered one clip per beat, so every clip's true duration is known
 * before anything is cut. Those measured durations drive three things that must
 * agree exactly: the placement of narration on the timeline, the caption timings,
 * and the scene durations in project.json. Deriving all three from a single set of
 * measurements is what keeps picture, voice and captions from drifting apart.
 *
 * The convention this replaced rendered the whole script as one blob of speech and
 * then *estimated* interior timing by spreading the total duration across sentences
 * in proportion to their word counts. A blob gives you no interior timing to read,
 * so captions landed where the words were guessed to be rather than where they are.
 * There is no way to fix that downstream, which is why per-beat rendering is not an
 * option in this pipeline but the entry condition for it.
 *
 * Reads:  projects/<slug>/narration-plan[-variant].json
 * Writes: public/assets/<slug>/mix[-variant].wav
 *         projects/<slug>/captions[-variant].srt
 *         projects/<slug>/audio-timing[-variant].json
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {z} from 'zod';
import {cfg} from './pipeline-config';

/* ------------------------------------------------------------------ schema */

export const NarrationBeatSchema = z.object({
  id: z.string().min(1),
  /** Spoken text for this beat; also, verbatim, the caption text. */
  narration: z.string().min(1),
  /**
   * Narration audio for this beat, relative to public/. Optional: when it is
   * absent the audio stage renders the clip and fills the path in. It is never
   * optional by the time the mix is built — you cannot measure a clip that does
   * not exist yet.
   */
  audio: z.string().min(1).optional(),
  /** Silence held before this beat's narration starts, in seconds. */
  leadIn: z.number().min(0).default(0),
  /** Silence held after this beat's narration ends, in seconds. */
  tail: z.number().min(0).default(0)
});

export const NarrationMusicSchema = z.object({
  provider: z.string().min(1).optional(),
  prompt: z.string().min(1),
  durationSeconds: z.number().positive().optional()
});

export const NarrationPlanSchema = z.object({
  /** Voice provider name, as keyed in config/providers.json. */
  voiceProvider: z.string().min(1).optional(),
  /** Provider-specific voice id. Falls back to the adapter's own default. */
  voiceId: z.string().min(1).optional(),
  /**
   * Music bed, relative to public/. Either supplied, generated from `music`, or
   * synthesised by scripts/make-score.ts. Defaults to assets/<slug>/score.wav.
   */
  score: z.string().min(1).optional(),
  /**
   * Generative music brief. Omit it and the score is synthesised locally, which
   * is original, free and always available — never block a film on a music API.
   */
  music: NarrationMusicSchema.optional(),
  /** Music level going into the ducker, in dB. */
  bedDb: z.number().default(0),
  /**
   * Retained for plans written before the mix ducked by sidechain. The bed is now
   * ducked against the narration itself, so a fixed duck level has nothing to do.
   */
  duckDb: z.number().optional(),
  beats: z.array(NarrationBeatSchema).min(1)
});

export type NarrationPlan = z.infer<typeof NarrationPlanSchema>;
export type NarrationBeat = z.infer<typeof NarrationBeatSchema>;

export type BeatTiming = {
  id: string;
  beatStart: number;
  beatEnd: number;
  speechStart: number;
  speechEnd: number;
  durationInFrames: number;
  narration: string;
};

export type NarrationTiming = {
  project: string;
  fps: number;
  totalSeconds: number;
  totalFrames: number;
  measuredSeconds: number;
  mix: string;
  beats: BeatTiming[];
};

export type NarrationResult = {
  timing: NarrationTiming;
  /** Absolute paths to everything the assembly wrote. */
  mixPath: string;
  captionsPath: string;
  timingPath: string;
  cueCount: number;
};

/* ------------------------------------------------------------------- files */

const suffix = (variant?: string) => (variant ? `-${variant}` : '');

export const narrationPlanPath = (project: string, variant?: string) =>
  path.resolve('projects', project, `narration-plan${suffix(variant)}.json`);

export const legacyNarrationPath = (project: string) =>
  path.resolve('projects', project, 'narration.json');

export const audioTimingPath = (project: string, variant?: string) =>
  path.resolve('projects', project, `audio-timing${suffix(variant)}.json`);

export const captionsPath = (project: string, variant?: string) =>
  path.resolve('projects', project, `captions${suffix(variant)}.srt`);

export const mixPath = (project: string, variant?: string) =>
  path.resolve('public/assets', project, `mix${suffix(variant)}.wav`);

/** Where a beat's rendered clip lands when the audio stage has to generate it. */
export const beatAudioPath = (project: string, beatId: string) =>
  `assets/${project}/vo/${beatId}.wav`;

/**
 * Loads and validates a plan.
 *
 * Validation is here, and loud, because everything downstream of it is ffmpeg:
 * a missing field surfaces as a filtergraph syntax error or a silently wrong
 * duration, hundreds of lines from the typo that caused it.
 */
export function loadNarrationPlan(project: string, variant?: string): NarrationPlan {
  const file = narrationPlanPath(project, variant);

  if (!fs.existsSync(file)) {
    if (!variant && fs.existsSync(legacyNarrationPath(project))) {
      throw new Error(
        `${file} is missing, but a legacy narration.json is present.\n` +
          `The single-blob narration format is no longer supported — it cannot give ` +
          `captions or cuts any interior timing.\n` +
          `Convert it with:  npx tsx scripts/migrate-narration.ts --project ${project}`
      );
    }
    throw new Error(`Missing narration plan: ${file}`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`${file} is not valid JSON: ${(e as Error).message}`);
  }

  const parsed = NarrationPlanSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.length ? i.path.join('.') : '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`${file} is not a valid narration plan:\n${issues}`);
  }

  const plan = parsed.data;
  plan.score ??= `assets/${project}/score.wav`;
  return plan;
}

/**
 * Frame rate the timeline is quantised to.
 *
 * Taken from project.json when there is one, so the mix stage and the renderer
 * can never disagree about how long a frame is — a 24fps picture cut against a
 * 30fps timing contract drifts a frame every few beats.
 */
export function resolveFps(project: string, requested?: number): number {
  if (requested) return requested;
  const file = path.resolve('projects', project, 'project.json');
  if (fs.existsSync(file)) {
    const fps = Number(JSON.parse(fs.readFileSync(file, 'utf8')).fps);
    if (Number.isFinite(fps) && fps > 0) return fps;
  }
  return 30;
}

export const probeDuration = (file: string) =>
  Number(
    execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file],
      {encoding: 'utf8'}
    ).trim()
  );

/**
 * Integrated loudness and true peak, as the delivery gate measures them.
 * ffmpeg reports these on stderr, and only in the summary block it prints last.
 */
export function measureLoudness(file: string): {lufs: number; truePeakDb: number} {
  const run = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
    {encoding: 'utf8'}
  );
  const log = `${run.stderr ?? ''}`;
  const tail = log.slice(log.lastIndexOf('Integrated loudness:'));
  const lufs = Number(/I:\s*(-?\d+(?:\.\d+)?)\s*LUFS/.exec(tail)?.[1] ?? NaN);
  const truePeakDb = Number(/Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS/.exec(tail)?.[1] ?? NaN);
  return {lufs, truePeakDb};
}

/* --------------------------------------------------------------- captions */

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
 * which is exactly where a film's headlines sit.
 *
 * The beat's measured speech window is then divided between its cues in
 * proportion to their character counts, so cue timing still comes from the
 * measured clip durations rather than from the beat grid.
 */

/** Hard limits. A row over 42 characters re-wraps on LinkedIn's renderer. */
const MAX_ROW_CHARS = cfg('captions.maxRowChars', 42);
const MAX_ROWS = cfg('captions.maxRows', 2);
/** Held between two cues of the same beat so the change of copy is visible. */
const CUE_GAP = cfg('captions.interCueGapSeconds', 0.04);

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

/**
 * Cues for one laid-out timeline, timed inside each beat's MEASURED speech
 * window — not against the beat grid, which includes lead-in and tail silence.
 */
function buildCues(placed: Placed[]): Cue[] {
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

  return cues;
}

const renderSrt = (cues: Cue[]) =>
  cues
    .map((c, i) =>
      [String(i + 1), `${srtTime(c.start)} --> ${srtTime(c.end)}`, ...c.rows, ''].join('\n')
    )
    .join('\n');

/* --------------------------------------------------------------- assembly */

type Placed = {
  id: string;
  narration: string;
  leadIn: number;
  tail: number;
  file: string;
  speechStart: number;
  speechEnd: number;
  beatStart: number;
  beatEnd: number;
  durationInFrames: number;
};

/**
 * Measures the beat clips and lays them out end to end.
 *
 * Exported because the score has to be synthesised to the length of the picture,
 * and the picture's length is this layout — so the audio stage needs to run the
 * layout before it has a score to mix against.
 */
export function layoutBeats(plan: NarrationPlan, fps: number): Placed[] {
  const placed: Placed[] = [];
  let cursor = 0;

  for (const beat of plan.beats) {
    if (!beat.audio) {
      throw new Error(
        `Beat "${beat.id}" has no audio clip. Run the audio stage first ` +
          `(npm run studio:audio -- --project <slug>) so every beat is rendered and measurable.`
      );
    }
    const file = path.resolve('public', beat.audio);
    if (!fs.existsSync(file)) throw new Error(`Missing narration clip: ${file}`);
    const spoken = probeDuration(file);

    const beatStart = cursor;
    const speechStart = beatStart + beat.leadIn;
    const speechEnd = speechStart + spoken;
    const beatEnd = speechEnd + beat.tail;

    placed.push({
      id: beat.id,
      narration: beat.narration,
      leadIn: beat.leadIn,
      tail: beat.tail,
      file,
      speechStart,
      speechEnd,
      beatStart,
      beatEnd,
      durationInFrames: Math.round((beatEnd - beatStart) * fps)
    });

    cursor = beatEnd;
  }

  return placed;
}

/** Frame-exact picture length implied by a layout. */
export const layoutFrames = (placed: Placed[]) =>
  placed.reduce((s, p) => s + p.durationInFrames, 0);

/**
 * Measures every beat clip, builds the sidechain-ducked mix, writes the captions
 * timed to that measurement, and writes the timing contract the picture is cut to.
 *
 * Every clip must already exist: this stage measures, it does not generate. See
 * produceAudio() in audio.ts for the stage that renders missing clips.
 */
export async function assembleNarration(
  project: string,
  opts: {variant?: string; fps?: number} = {}
): Promise<NarrationResult> {
  const {variant} = opts;
  const fps = resolveFps(project, opts.fps);
  const plan = loadNarrationPlan(project, variant);
  const assetDir = path.resolve('public/assets', project);

  /* ---- 1. Measure every narration clip and lay out the timeline ---- */

  const placed = layoutBeats(plan, fps);
  const total = placed.length ? placed[placed.length - 1].beatEnd : 0;
  const totalFrames = layoutFrames(placed);

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
  const scoreFile = path.resolve('public', plan.score!);
  if (!fs.existsSync(scoreFile)) throw new Error(`Missing score: ${scoreFile}`);
  inputs.push('-i', scoreFile);

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
  const mix = mixPath(project, variant);

  execFileSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    ...inputs,
    '-filter_complex', filters.join(';'),
    '-map', '[outa]',
    '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2',
    mix
  ], {stdio: ['ignore', 'inherit', 'inherit']});

  /* ---- 3. Captions, timed to the measured speech (not the beat boundaries) ---- */

  const cues = buildCues(placed);
  const srt = captionsPath(project, variant);
  fs.writeFileSync(srt, renderSrt(cues));

  /* ---- 4. Timing contract for the storyboard / project.json ---- */

  const timing: NarrationTiming = {
    project,
    fps,
    // Frame-exact: picture, mix and this contract all state one duration.
    totalSeconds: Number(target.toFixed(3)),
    totalFrames,
    // What the measured clips plus their gaps actually summed to, before the
    // timeline was quantised to whole frames.
    measuredSeconds: Number(total.toFixed(3)),
    mix: path.relative(path.resolve('public'), mix),
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

  const timingFile = audioTimingPath(project, variant);
  fs.writeFileSync(timingFile, JSON.stringify(timing, null, 2));

  return {
    timing,
    mixPath: mix,
    captionsPath: srt,
    timingPath: timingFile,
    cueCount: cues.length
  };
}
