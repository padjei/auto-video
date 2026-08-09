/**
 * Conformance gate for a project's captions.srt.
 *
 * These are the rules a burned-in renderer (LinkedIn) and a broadcast SRT reader
 * both hold you to. A row over the character limit does not get clipped, it gets
 * re-wrapped, and the caption block grows downwards over the picture — which is
 * why row length is a hard failure here and not an advisory.
 *
 * Usage: tsx scripts/check-captions.ts --project <slug>
 * Exits non-zero on any failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import {cfg} from '../src/studio/pipeline-config';

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const slug = arg('--project');
if (!slug) throw new Error('Use --project <slug>');

const MAX_ROW_CHARS = Number(arg('--max-chars') ?? cfg('captions.maxRowChars', 42));
const MAX_ROWS = Number(arg('--max-rows') ?? cfg('captions.maxRows', 2));
const MAX_CUE_SECONDS = Number(arg('--max-seconds') ?? cfg('captions.maxCueSeconds', 7));
const MAX_CPS = Number(arg('--max-cps') ?? cfg('captions.maxCharsPerSecond', 21));

const srtPath = path.resolve('projects', slug, 'captions.srt');
const raw = fs.readFileSync(srtPath, 'utf8');

const TIMECODE = /^(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})$/;

type Cue = {index: number; start: number; end: number; rows: string[]};

const cues: Cue[] = [];
for (const block of raw.trim().split(/\r?\n\r?\n/)) {
  const lines = block.split(/\r?\n/);
  const index = Number(lines[0]);
  const m = TIMECODE.exec(lines[1] ?? '');
  if (!m) throw new Error(`Malformed timecode in cue ${lines[0]}: ${lines[1]}`);
  const at = (h: string, mm: string, s: string, ms: string) =>
    Number(h) * 3600 + Number(mm) * 60 + Number(s) + Number(ms) / 1000;
  cues.push({
    index,
    start: at(m[1], m[2], m[3], m[4]),
    end: at(m[5], m[6], m[7], m[8]),
    rows: lines.slice(2).filter((l) => l.length > 0)
  });
}

const failures: string[] = [];
const warnings: string[] = [];
const check = (ok: boolean, message: string) => {
  if (!ok) failures.push(message);
  return ok;
};

let longestRow = 0;
let mostRows = 0;
let longestCue = 0;
let shortestCue = Infinity;
let fastestCps = 0;

cues.forEach((c, i) => {
  check(c.index === i + 1, `cue ${i + 1}: index is ${c.index}, expected ${i + 1}`);
  check(c.rows.length > 0, `cue ${c.index}: no text`);
  check(
    c.rows.length <= MAX_ROWS,
    `cue ${c.index}: ${c.rows.length} rows, limit ${MAX_ROWS}`
  );
  for (const row of c.rows) {
    check(
      row.length <= MAX_ROW_CHARS,
      `cue ${c.index}: row of ${row.length} chars, limit ${MAX_ROW_CHARS} — "${row}"`
    );
    longestRow = Math.max(longestRow, row.length);
  }
  mostRows = Math.max(mostRows, c.rows.length);

  check(c.end > c.start, `cue ${c.index}: end ${c.end} is not after start ${c.start}`);
  const prev = cues[i - 1];
  if (prev) {
    check(
      c.start >= prev.end,
      `cue ${c.index}: starts at ${c.start.toFixed(3)}, overlapping cue ${prev.index} which ends at ${prev.end.toFixed(3)}`
    );
  }

  const seconds = c.end - c.start;
  const chars = c.rows.join(' ').length;
  const cps = chars / seconds;
  longestCue = Math.max(longestCue, seconds);
  shortestCue = Math.min(shortestCue, seconds);
  fastestCps = Math.max(fastestCps, cps);
  if (seconds > MAX_CUE_SECONDS) {
    warnings.push(`cue ${c.index}: on screen ${seconds.toFixed(2)}s, convention is ${MAX_CUE_SECONDS}s`);
  }
  if (cps > MAX_CPS) {
    warnings.push(`cue ${c.index}: ${cps.toFixed(1)} chars/sec, convention is ${MAX_CPS}`);
  }
});

/* Text must still be the narration, verbatim, beat by beat. */
const timingPath = path.resolve('projects', slug, 'audio-timing.json');
if (fs.existsSync(timingPath)) {
  const timing = JSON.parse(fs.readFileSync(timingPath, 'utf8'));
  const spoken = timing.beats
    .map((b: {narration: string}) => b.narration)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const captioned = cues
    .map((c) => c.rows.join(' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  check(captioned === spoken, 'caption text does not reconstruct the narration verbatim');
}

console.log(`captions.srt — ${srtPath}`);
console.log(`  cues:             ${cues.length}`);
console.log(`  longest row:      ${longestRow} chars (limit ${MAX_ROW_CHARS})`);
console.log(`  most rows in cue: ${mostRows} (limit ${MAX_ROWS})`);
console.log(`  cue duration:     ${shortestCue.toFixed(2)}s – ${longestCue.toFixed(2)}s`);
console.log(`  fastest cue:      ${fastestCps.toFixed(1)} chars/sec`);
for (const w of warnings) console.log(`  WARN  ${w}`);
for (const f of failures) console.log(`  FAIL  ${f}`);
console.log(failures.length === 0 ? 'PASS' : `FAIL — ${failures.length} finding(s)`);

if (failures.length > 0) process.exit(1);
