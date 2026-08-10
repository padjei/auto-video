/**
 * Petal Pals — original music bed, synthesised with FFmpeg.
 *
 * No music model is available on the connected provider, so the score is built from
 * scratch. Being fully synthesised it is also original, which matters for a kids'
 * channel where a licensing claim means a takedown.
 *
 * Two sections, rendered as one continuous piece so there is no seam:
 *   MORNING (0 - themeAt)  soft, sparse, waking-up. Sits under narration.
 *   THEME   (themeAt - end) bright bouncy C-major call-and-response bed.
 *
 * Voices are plucks (fast-decay sines, marimba-ish), a warm pad, and a soft bass.
 * Toddler-show music is mostly major triads, a steady pulse and a singable third —
 * the restraint is in the arrangement, not the harmony.
 *
 * Usage: npx tsx make-theme.ts --out theme.wav --duration 50 --theme-at 29
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const arg = (n: string) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};

const out = arg('--out') ?? 'theme.wav';
const duration = Number(arg('--duration') ?? 50);
const themeAt = Number(arg('--theme-at') ?? 29);
const BPM = 120;
const beat = 60 / BPM;

const NOTE: Record<string, number> = {
  C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4,
  'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2
};
const hz = (name: string) => {
  const m = /^([A-G]#?)(\d)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  return 440 * Math.pow(2, NOTE[m[1]] / 12 + (Number(m[2]) - 4));
};

type Ev = {n: string; at: number; len: number; lvl: number};

/** A bouncy, singable 4-bar tune in C major. Beats are relative to themeAt. */
const MELODY: Ev[] = [];
const tune: [string, number, number][] = [
  // bar 1 — "The sun is up, the dew is bright"
  ['G4', 0, 1], ['G4', 1, 1], ['A4', 2, 1], ['B4', 3, 1],
  ['C5', 4, 2], ['B4', 6, 1], ['G4', 7, 1],
  // bar 3 — "Sunnydew is shining light!"
  ['F4', 8, 1], ['F4', 9, 1], ['G4', 10, 1], ['A4', 11, 1],
  ['G4', 12, 3], ['E4', 15, 1]
];
// Loop the 16-beat tune across the theme section.
const themeBeats = Math.ceil((duration - themeAt) / beat);
for (let rep = 0; rep * 16 < themeBeats + 16; rep++) {
  for (const [n, at, len] of tune) {
    MELODY.push({n, at: (rep * 16 + at) * beat + themeAt, len: len * beat, lvl: 0.16});
  }
}

/** Root movement under the tune: C - C - F - G. */
const BASS: Ev[] = [];
const CHORDS: Ev[] = [];
const prog: [string, string[]][] = [
  ['C2', ['C4', 'E4', 'G4']],
  ['C2', ['C4', 'E4', 'G4']],
  ['F2', ['C4', 'F4', 'A4']],
  ['G2', ['B3', 'D4', 'G4']]
];
for (let rep = 0; rep * 16 < themeBeats + 16; rep++) {
  prog.forEach(([root, triad], i) => {
    const at = (rep * 16 + i * 4) * beat + themeAt;
    BASS.push({n: root, at, len: beat * 3.6, lvl: 0.20});
    for (const t of triad) CHORDS.push({n: t, at, len: beat * 3.8, lvl: 0.05});
  });
}

/** Morning section: sparse, slow, warm. Sits well under a narrator. */
const MORNING: Ev[] = [
  {n: 'C3', at: 0.0, len: 8, lvl: 0.13},
  {n: 'G3', at: 0.5, len: 8, lvl: 0.09},
  {n: 'E4', at: 2.0, len: 5, lvl: 0.05},
  {n: 'C3', at: 8.0, len: 8, lvl: 0.13},
  {n: 'A3', at: 8.5, len: 8, lvl: 0.08},
  {n: 'F4', at: 10.0, len: 5, lvl: 0.05},
  {n: 'F2', at: 16.0, len: 7, lvl: 0.12},
  {n: 'C4', at: 16.5, len: 7, lvl: 0.07},
  {n: 'A4', at: 18.0, len: 4, lvl: 0.04},
  {n: 'G2', at: 23.0, len: 6, lvl: 0.12},
  {n: 'D4', at: 23.5, len: 6, lvl: 0.07},
  {n: 'B4', at: 25.0, len: 4, lvl: 0.04}
];
/** Sparkles: high plucks scattered through the morning, like dew catching light. */
const SPARKLE: Ev[] = [
  {n: 'C6', at: 3.2, len: 1.2, lvl: 0.05},
  {n: 'E6', at: 6.4, len: 1.2, lvl: 0.045},
  {n: 'G5', at: 11.0, len: 1.2, lvl: 0.05},
  {n: 'C6', at: 14.5, len: 1.2, lvl: 0.04},
  {n: 'A5', at: 19.5, len: 1.2, lvl: 0.05},
  {n: 'E6', at: 24.0, len: 1.2, lvl: 0.045},
  {n: 'G5', at: 27.0, len: 1.2, lvl: 0.05}
];

const inputs: string[] = [];
const filters: string[] = [];
const labels: string[] = [];
let i = 0;

/** One sine per event, gated by its own envelope. `pluck` decays fast; `pad` swells. */
const add = (evs: Ev[], kind: 'pluck' | 'pad' | 'bass', lp: number) => {
  for (const e of evs) {
    const f = hz(e.n);
    inputs.push('-f', 'lavfi', '-i', `sine=frequency=${f.toFixed(3)}:duration=${duration}:sample_rate=48000`);
    const on = e.at.toFixed(3);
    const off = (e.at + e.len).toFixed(3);
    const env =
      kind === 'pluck'
        ? `if(between(t\\,${on}\\,${off})\\,exp(-6*(t-${on}))\\,0)`
        : kind === 'bass'
          ? `if(between(t\\,${on}\\,${off})\\,exp(-2.2*(t-${on}))\\,0)`
          : `if(between(t\\,${on}\\,${off})\\,min(1\\,(t-${on})/1.2)*min(1\\,(${off}-t)/1.6)\\,0)`;
    filters.push(`[${i}:a]volume=volume='${env}*${e.lvl}':eval=frame,lowpass=f=${lp}[v${i}]`);
    labels.push(`[v${i}]`);
    i++;
  }
};

add(MELODY, 'pluck', 5200);
add(BASS, 'bass', 900);
add(CHORDS, 'pad', 3000);
add(MORNING, 'pad', 2600);
add(SPARKLE, 'pluck', 9000);

/** Soft off-beat shaker so the theme has a pulse without a drum kit. */
inputs.push('-f', 'lavfi', '-i', `anoisesrc=d=${duration}:c=white:r=48000:a=0.5:seed=77`);
const shake = `if(gt(t\\,${themeAt})\\,exp(-26*mod(t-${themeAt}\\,${(beat / 2).toFixed(4)}))*0.05\\,0)`;
filters.push(`[${i}:a]volume=volume='${shake}':eval=frame,highpass=f=5000,lowpass=f=11000[shk]`);
labels.push('[shk]');
i++;

filters.push(
  `${labels.join('')}amix=inputs=${labels.length}:normalize=0[mix]`,
  `[mix]highpass=f=45,lowpass=f=12000,` +
    `aecho=0.9:0.85:55|110:0.16|0.09,` +
    // Keep the bed out of the voices' presence band so dialogue stays intelligible.
    `equalizer=f=2600:t=q:w=1.6:g=-3,` +
    `loudnorm=I=-24:TP=-3:LRA=8,` +
    `afade=t=in:st=0:d=1.5,afade=t=out:st=${duration - 2}:d=2,` +
    `alimiter=limit=0.9[outa]`
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

console.log(`Theme written: ${out} — ${duration}s, morning 0-${themeAt}s, theme ${themeAt}-${duration}s @ ${BPM}bpm`);
