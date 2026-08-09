/**
 * The AUDIO stage: render every beat, obtain a score, assemble the film's mix.
 *
 * Narration is rendered ONE CLIP PER BEAT. That is the whole point of this stage,
 * not an implementation detail: a single rendered blob of speech has no interior
 * timing you can read back, so captions and cuts placed against it can only ever
 * be guesses. Per-beat clips can be measured, and one set of measurements then
 * drives the narration's placement, the caption timings and the scene durations
 * together — which is what keeps picture, voice and captions from drifting apart.
 *
 * Reads:  projects/<slug>/narration-plan.json
 * Writes: public/assets/<slug>/vo/<beat id>.wav   (only for beats with no audio)
 *         public/assets/<slug>/score.wav          (only if there is no score yet)
 *         projects/<slug>/audio-manifest.json
 *         + everything assembleNarration() writes (mix, captions, audio-timing)
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {resolveProvider} from './provider';
import {voiceAdapter, musicAdapter} from './factory';
import {
  assembleNarration,
  beatAudioPath,
  layoutBeats,
  layoutFrames,
  loadNarrationPlan,
  measureLoudness,
  narrationPlanPath,
  probeDuration,
  resolveFps,
  type NarrationPlan
} from './narration';

export type BeatManifestEntry = {
  id: string;
  /** The text this clip was rendered from. Compared on the next run — see below. */
  narration: string;
  /** Path relative to public/. */
  audio: string;
  /** Adapter that produced it, or 'plan' when the plan supplied the clip. */
  provider: string;
  durationSeconds: number;
};

export type AudioManifest = {
  project: string;
  plan: string;
  voiceProvider: string;
  beats: BeatManifestEntry[];
  score: {path: string; provider: string; durationSeconds: number};
  mix: {
    path: string;
    durationSeconds: number;
    totalFrames: number;
    fps: number;
    integratedLufs: number;
    truePeakDb: number;
  };
  captions: string;
  timing: string;
  /**
   * The single audio track the render mounts. The mix already contains the score,
   * so nothing else may be layered under it.
   */
  voiceover: string;
};

const manifestPath = (project: string) =>
  path.resolve('projects', project, 'audio-manifest.json');

const readManifest = (project: string): AudioManifest | null => {
  const file = manifestPath(project);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as AudioManifest;
  } catch {
    return null;
  }
};

/**
 * Writes resolved clip paths back into the plan, patching the raw JSON rather
 * than re-serialising the parsed object so hand-written comments, key order and
 * any fields this schema does not model survive the round trip.
 */
function recordBeatAudio(project: string, resolved: Map<string, string>) {
  const file = narrationPlanPath(project);
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  let touched = false;
  for (const beat of raw.beats ?? []) {
    const audio = resolved.get(beat.id);
    if (audio && beat.audio !== audio) {
      beat.audio = audio;
      touched = true;
    }
  }
  if (touched) fs.writeFileSync(file, `${JSON.stringify(raw, null, 2)}\n`);
}

/**
 * Renders any beat that has no clip yet, and re-renders any clip WE rendered
 * whose line has since been rewritten.
 *
 * The second half matters because this stage writes clip paths back into the
 * plan: without it, editing a line and re-running would leave the old read in
 * place and the new words in the captions, which is the exact picture/voice
 * divergence this convention exists to prevent. Clips the plan author supplied
 * are never re-rendered — those are somebody's deliberate choice of take.
 */
async function renderBeats(
  project: string,
  plan: NarrationPlan
): Promise<{provider: string; entries: Map<string, {audio: string; provider: string}>}> {
  const previous = new Map(
    (readManifest(project)?.beats ?? []).map((b) => [b.id, b])
  );

  const voiceProvider = resolveProvider('voice', plan.voiceProvider);
  const entries = new Map<string, {audio: string; provider: string}>();
  const resolved = new Map<string, string>();

  for (const beat of plan.beats) {
    const before = previous.get(beat.id);
    const generatedBefore = before && before.provider !== 'plan';
    const stale =
      generatedBefore && before!.audio === beat.audio && before!.narration !== beat.narration;

    if (beat.audio && !stale) {
      const file = path.resolve('public', beat.audio);
      if (!fs.existsSync(file)) throw new Error(`Missing narration clip: ${file}`);
      entries.set(beat.id, {
        audio: beat.audio,
        provider: generatedBefore ? before!.provider : 'plan'
      });
      continue;
    }

    const rel = beat.audio ?? beatAudioPath(project, beat.id);
    const out = path.resolve('public', rel);
    fs.mkdirSync(path.dirname(out), {recursive: true});

    // Providers hand back their own container (mp3 for both hosted voices). It is
    // decoded to the pipeline's 48kHz stereo PCM here so that every measurement
    // downstream is of the same material the mix will use, not of a re-decode.
    const source = path.join(path.dirname(out), 'raw', `${beat.id}.mp3`);
    fs.mkdirSync(path.dirname(source), {recursive: true});

    const request = {
      id: beat.id,
      project,
      prompt: beat.narration,
      outputPath: source,
      voiceId: plan.voiceId
    };

    let result = await voiceAdapter(voiceProvider.name).generate(request);

    // Never block a film on an unavailable premium voice. The local macOS voice
    // is a legitimate scratch read: the timing it produces is real timing, so the
    // cut can be built and reviewed while the paid read is sorted out.
    if (!result.ok && voiceProvider.name !== 'macos') {
      console.warn(
        `Voice provider ${voiceProvider.name} failed on beat ${beat.id} ` +
          `(${result.error}). Falling back to the local macOS voice.`
      );
      result = await voiceAdapter('macos').generate(request);
    }
    if (!result.ok) {
      throw new Error(`Could not render narration for beat ${beat.id}: ${result.error}`);
    }

    execFileSync(
      'ffmpeg',
      ['-y', '-hide_banner', '-loglevel', 'error', '-i', source,
       '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', out],
      {stdio: ['ignore', 'inherit', 'inherit']}
    );

    entries.set(beat.id, {audio: rel, provider: result.provider});
    resolved.set(beat.id, rel);
    beat.audio = rel;
  }

  if (resolved.size) recordBeatAudio(project, resolved);
  return {provider: voiceProvider.name, entries};
}

/**
 * Puts a score at the plan's `score` path.
 *
 * Preference order, per the studio's provider rules: an existing file wins (it is
 * either the user's, or one we already paid to generate), then the music adapter
 * if the plan briefs one, then local synthesis. Local synthesis is the floor and
 * it is always available, so a missing or unreachable music provider can never
 * stop the film — but a locally synthesised score IS re-synthesised when the
 * picture outgrows it, because a bed that stops before picture out reads as a
 * dropout rather than an ending.
 */
async function ensureScore(
  project: string,
  plan: NarrationPlan,
  targetSeconds: number
): Promise<{path: string; provider: string; durationSeconds: number}> {
  const rel = plan.score!;
  const file = path.resolve('public', rel);
  const previous = readManifest(project)?.score;
  const synthesisedBefore = previous?.provider === 'local' && previous.path === rel;

  if (fs.existsSync(file)) {
    const have = probeDuration(file);
    const covers = have >= targetSeconds - 0.001;
    if (covers || !synthesisedBefore) {
      if (!covers) {
        console.warn(
          `Score ${rel} runs ${have.toFixed(2)}s against a ${targetSeconds.toFixed(2)}s picture; ` +
            `the mix will pad it with silence under the tail.`
        );
      }
      return {path: rel, provider: previous?.provider ?? 'existing', durationSeconds: have};
    }
  }

  fs.mkdirSync(path.dirname(file), {recursive: true});

  if (plan.music?.prompt) {
    const provider = resolveProvider('music', plan.music.provider);
    const adapter = musicAdapter(provider.name);
    if (adapter) {
      const result = await adapter.generate({
        project,
        prompt: plan.music.prompt,
        outputPath: file,
        durationSeconds: plan.music.durationSeconds ?? Math.ceil(targetSeconds)
      });
      if (result.ok) {
        return {path: rel, provider: result.provider, durationSeconds: probeDuration(file)};
      }
      console.warn(
        `Music provider ${provider.name} failed (${result.error}). Synthesising the score locally.`
      );
    }
  }

  execFileSync(
    process.execPath,
    ['--import', 'tsx', path.resolve('scripts/make-score.ts'),
     '--out', file, '--duration', String(Math.ceil(targetSeconds))],
    {stdio: 'inherit', env: process.env}
  );

  return {path: rel, provider: 'local', durationSeconds: probeDuration(file)};
}

export async function produceAudio(project: string): Promise<AudioManifest> {
  // Throws with the migration command if this project still carries a legacy
  // single-blob narration.json.
  const plan = loadNarrationPlan(project);
  const fps = resolveFps(project);

  const {provider: voiceProvider, entries} = await renderBeats(project, plan);

  // Measured once the clips exist, so the score is synthesised to the length of
  // the picture the read actually produced rather than to a guess at it.
  const placed = layoutBeats(plan, fps);
  const totalFrames = layoutFrames(placed);
  const targetSeconds = totalFrames / fps;

  const score = await ensureScore(project, plan, targetSeconds);

  const assembled = await assembleNarration(project, {fps});
  const loudness = measureLoudness(assembled.mixPath);
  const relative = (p: string) => path.relative(process.cwd(), p);

  const manifest: AudioManifest = {
    project,
    plan: relative(narrationPlanPath(project)),
    voiceProvider,
    beats: assembled.timing.beats.map((b) => {
      const entry = entries.get(b.id)!;
      return {
        id: b.id,
        narration: b.narration,
        audio: entry.audio,
        provider: entry.provider,
        durationSeconds: Number((b.speechEnd - b.speechStart).toFixed(3))
      };
    }),
    score,
    mix: {
      path: assembled.timing.mix,
      durationSeconds: assembled.timing.totalSeconds,
      totalFrames: assembled.timing.totalFrames,
      fps: assembled.timing.fps,
      integratedLufs: loudness.lufs,
      truePeakDb: loudness.truePeakDb
    },
    captions: relative(assembled.captionsPath),
    timing: relative(assembled.timingPath),
    voiceover: assembled.timing.mix
  };

  fs.writeFileSync(manifestPath(project), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}
