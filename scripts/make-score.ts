/**
 * Synthesises an original, restrained cinematic technology underscore with FFmpeg.
 *
 * There is no licensable/generative music provider wired into this studio, so the
 * score is built from scratch: detuned sine partials shaped into sustained pads,
 * a soft eighth-note pulse, and a convolution-free reverb tail. Being fully
 * synthesised, the bed is original and carries no third-party licensing burden.
 *
 * Usage: tsx scripts/make-score.ts --out public/assets/<slug>/score.wav [--duration 60]
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

const out = arg('--out') ?? 'public/assets/score.wav';
/** Length of the picture the score has to cover. The bed must still be sounding here. */
const duration = Number(arg('--duration') ?? 60);
/**
 * Overhang rendered past the picture. Everything that decays to silence decays
 * across this overhang, never inside the programme, so the mix stage can trim to
 * the picture length and still land the last frame on a bed that is audible.
 * A score that reaches zero on the final frame reads as a dropout, not an ending.
 */
const tail = Number(arg('--tail') ?? cfg('audio.score.tailSeconds', 3));
const render = duration + tail;

/** Equal-temperament pitch helper. A4 = 440Hz. */
const note = (name: string) => {
  const semitones: Record<string, number> = {
    C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4,
    'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2
  };
  const m = /^([A-G]#?)(\d)$/.exec(name);
  if (!m) throw new Error(`Bad note: ${name}`);
  const [, pitch, octave] = m;
  return 440 * Math.pow(2, semitones[pitch] / 12 + (Number(octave) - 4));
};

type Layer = {
  note: string;
  /** Seconds the layer is audible, inclusive of its fades. */
  from: number;
  to: number;
  /** Fade in / out length in seconds. Long fades are what make a pad read as a pad. */
  fade: number;
  level: number;
  /** Detune in cents; stacking two or three slightly detuned copies gives width. */
  detune?: number;
};

/**
 * Harmonic arc. D minor throughout, opening to a bare fifth under the CTA so the
 * end feels settled rather than resolved-and-finished — it should sit under a
 * closing logo without demanding attention.
 *
 *   0-14s   Dm, sparse and low          — restraint, "listen"
 *   12-30s  add F, minor colour          — the problem
 *   28-44s  Bb lift                      — capability
 *   42-54s  return to Dm, fuller         — credibility
 *   50-60s  open D5 fifth, decaying      — CTA
 *
 * The layers that carry the CTA run to `render`, not to `duration`: their own
 * fade-outs are the audible taper under the lockup (about -6 dB by the last
 * frame), and they only reach silence out in the overhang the mix discards.
 */
const pads: Layer[] = [
  // Foundation
  {note: 'D2', from: 0,  to: render, fade: 6,  level: 0.30},
  {note: 'D3', from: 0,  to: render, fade: 6,  level: 0.20, detune: -6},
  {note: 'A3', from: 2,  to: 56, fade: 7,  level: 0.14, detune: 5},
  // Minor colour
  {note: 'F3', from: 12, to: 32, fade: 6,  level: 0.13},
  {note: 'F4', from: 14, to: 30, fade: 6,  level: 0.06, detune: 7},
  // Bb lift
  {note: 'A#2', from: 28, to: 46, fade: 6, level: 0.22},
  {note: 'F3',  from: 28, to: 46, fade: 6, level: 0.12, detune: -5},
  {note: 'D4',  from: 30, to: 45, fade: 5, level: 0.08, detune: 6},
  // Return, fuller
  {note: 'D3', from: 42, to: render, fade: 5,  level: 0.18, detune: 4},
  {note: 'F3', from: 44, to: 58,     fade: 5,  level: 0.10},
  // CTA — open fifth, no third, so it reads as steady rather than sentimental
  {note: 'A4', from: 49, to: render, fade: 4,  level: 0.07, detune: -4},
  {note: 'D5', from: 50, to: render, fade: 5,  level: 0.05, detune: 5}
];

/** Amplitude envelope for a layer, as an FFmpeg `volume` expression in `t`. */
const envelope = (l: Layer) =>
  `min(1\\,max(0\\,min((t-${l.from})/${l.fade}\\,(${l.to}-t)/${l.fade})))`;

/** Slow, non-periodic-feeling breathing so sustained pads never sound static. */
const breathe = (seed: number) =>
  `(0.86+0.14*sin(2*PI*${(0.041 + seed * 0.013).toFixed(3)}*t+${(seed * 1.7).toFixed(2)}))`;

const inputs: string[] = [];
const filters: string[] = [];
const mixLabels: string[] = [];
let idx = 0;

for (const [i, l] of pads.entries()) {
  const hz = note(l.note) * Math.pow(2, (l.detune ?? 0) / 1200);
  inputs.push('-f', 'lavfi', '-i', `sine=frequency=${hz.toFixed(3)}:duration=${render}:sample_rate=48000`);
  filters.push(
    `[${idx}:a]volume=volume='${envelope(l)}*${breathe(i)}*${l.level}':eval=frame[p${idx}]`
  );
  mixLabels.push(`[p${idx}]`);
  idx++;
}

/**
 * Soft pulse at 72bpm (eighth notes = 2.4Hz). Gated with a fast attack and a long
 * decay so it reads as a felt-mallet pulse, not a click track. It enters at 12s
 * and steps back under the CTA so narration owns the final beat.
 */
const pulseHz = note('A4');
const period = 60 / 72 / 2; // eighth note
inputs.push('-f', 'lavfi', '-i', `sine=frequency=${pulseHz.toFixed(3)}:duration=${render}:sample_rate=48000`);
const pulseGate = `exp(-9*mod(t\\,${period.toFixed(4)}))`;
const pulseBed = `min(1\\,max(0\\,min((t-12)/8\\,(54-t)/6)))`;
filters.push(`[${idx}:a]volume=volume='${pulseGate}*${pulseBed}*0.055':eval=frame,lowpass=f=2200[pulse]`);
mixLabels.push('[pulse]');
idx++;

/**
 * Filtered-noise swell that crests at the Bb lift (~29s) and again into the CTA
 * (~50s). Gives the cuts something to land on without resorting to a whoosh SFX.
 */
// Seeded so the bed is byte-reproducible across re-renders.
inputs.push('-f', 'lavfi', '-i', `anoisesrc=d=${render}:c=pink:r=48000:a=0.06:seed=20260808`);
const swell =
  `(exp(-0.5*pow(t-29\\,2))*0.9+exp(-0.6*pow(t-50\\,2))*0.7)`;
filters.push(`[${idx}:a]volume=volume='${swell}*0.5':eval=frame,highpass=f=300,lowpass=f=5200[swell]`);
mixLabels.push('[swell]');
idx++;

/**
 * Mix, then shape: lowpass to keep the bed out of the narration's presence band
 * (2-5kHz), gentle multi-tap echo for a room, and a closing taper.
 *
 * The audible closing taper is authored in the layer envelopes above — the pads
 * shed about 6dB between 57s and picture out, which is the ending. This global
 * fade exists only to land the discarded overhang at true silence, so it starts
 * where the picture stops. The previous `st=duration-4:d=4` fade, stacked on
 * layer envelopes that also collapsed at `duration`, is what drove the programme
 * to digital zero before picture out.
 */
filters.push(
  `${mixLabels.join('')}amix=inputs=${mixLabels.length}:normalize=0[mix]`,
  `[mix]lowpass=f=6000,highpass=f=45,` +
    `aecho=0.82:0.85:70|130|210|320:0.30|0.22|0.15|0.09,` +
    `equalizer=f=3000:t=q:w=1.4:g=-4,` +
    // Normalise the bed to a fixed music-under-narration level so the edit's mix
    // stage has a predictable starting point regardless of how the layers sum.
    `loudnorm=I=${cfg('audio.score.targetLufs', -27)}:TP=${cfg('audio.score.truePeakDb', -3)}:LRA=${cfg('audio.score.loudnessRange', 7)},` +
    `afade=t=in:st=0:d=2.5,afade=t=out:st=${duration}:d=${tail},` +
    `alimiter=limit=0.89[outa]`
);

fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});

execFileSync('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  ...inputs,
  '-filter_complex', filters.join(';'),
  '-map', '[outa]',
  '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2',
  path.resolve(out)
], {stdio: ['ignore', 'inherit', 'inherit']});

console.log(`Score written: ${out} (${duration}s picture + ${tail}s trimmable overhang)`);
