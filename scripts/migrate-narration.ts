/**
 * Converts a legacy narration.json into a narration-plan.json.
 *
 * The legacy format was one blob of text rendered as one clip. Nothing downstream
 * could read timing out of that blob, so captions were estimated by spreading the
 * total duration across sentences in proportion to their word counts — cues landed
 * where the words were guessed to be. The plan format renders one clip per beat,
 * which makes every duration measurable, and captions, cuts and the mix are then
 * all derived from that one measurement.
 *
 * The split here is mechanical: sentence boundaries, grouped so a beat is roughly
 * one breath of copy. It is a starting point. Beats are the unit the film is cut
 * on, so where one ends is an editorial decision a human should make.
 *
 * Usage: tsx scripts/migrate-narration.ts --project <slug> [--force]
 */
import fs from 'node:fs';
import path from 'node:path';
import {legacyNarrationPath, narrationPlanPath} from '../src/studio/narration';

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const slug = arg('--project');
if (!slug) throw new Error('Use --project <slug>');
const force = args.includes('--force');

const legacyPath = legacyNarrationPath(slug);
const planPath = narrationPlanPath(slug);

if (!fs.existsSync(legacyPath)) throw new Error(`Missing ${legacyPath}`);
if (fs.existsSync(planPath) && !force) {
  throw new Error(`${planPath} already exists. Pass --force to overwrite it.`);
}

type Legacy = {
  text?: string;
  voiceProvider?: string;
  musicPrompt?: string;
  musicProvider?: string;
  durationSeconds?: number;
};

const legacy: Legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
const text = (legacy.text ?? '').replace(/\s+/g, ' ').trim();
if (!text) throw new Error(`${legacyPath} has no text to migrate.`);

/** Sentence boundary: terminal punctuation followed by whitespace. */
const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

/**
 * Group sentences into beats of roughly a breath's worth of copy. Short adjacent
 * sentences ride together; anything at or over the target stands on its own.
 *
 * A beat becomes a clip, and a clip's measured length becomes a scene duration —
 * so the target is about one shot's worth of copy (six or seven seconds read
 * aloud), not as much as will fit.
 */
const TARGET_CHARS = 110;
const beats: string[] = [];
for (const sentence of sentences) {
  const open = beats[beats.length - 1];
  if (open && open.length + 1 + sentence.length <= TARGET_CHARS) {
    beats[beats.length - 1] = `${open} ${sentence}`;
  } else {
    beats.push(sentence);
  }
}

/**
 * Placement defaults. A short head before the first word so the film does not open
 * on speech, tight gaps between beats, and a longer tail so the last frame is held
 * rather than cut on a word. These are the values a human tunes first.
 */
const HEAD = 0.3;
const GAP = 0.18;
const TAIL = 0.75;

const plan = {
  _comment:
    `Migrated from narration.json by scripts/migrate-narration.ts. Beat boundaries were ` +
    `split mechanically at sentence boundaries and are a starting point — review them ` +
    `against the storyboard before locking picture. Beats have no audio yet; the audio ` +
    `stage renders one clip per beat and fills the paths in.`,
  ...(legacy.voiceProvider ? {voiceProvider: legacy.voiceProvider} : {}),
  score: `assets/${slug}/score.wav`,
  ...(legacy.musicPrompt
    ? {
        music: {
          ...(legacy.musicProvider ? {provider: legacy.musicProvider} : {}),
          prompt: legacy.musicPrompt,
          ...(legacy.durationSeconds ? {durationSeconds: legacy.durationSeconds} : {})
        }
      }
    : {}),
  bedDb: 0,
  beats: beats.map((narration, i) => ({
    id: `b${i + 1}`,
    leadIn: i === 0 ? HEAD : 0,
    tail: i === beats.length - 1 ? TAIL : GAP,
    narration
  }))
};

fs.mkdirSync(path.dirname(planPath), {recursive: true});
fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`);

console.log(`Migrated ${legacyPath}`);
console.log(`      to ${planPath}`);
console.log(`  ${sentences.length} sentence(s) → ${beats.length} beat(s):`);
beats.forEach((b, i) => {
  const head = b.length > 66 ? `${b.slice(0, 63)}...` : b;
  console.log(`    b${i + 1}  ${head}`);
});
console.log(`  voice provider: ${legacy.voiceProvider ?? '(config default)'}`);
console.log(
  `  score:          ${plan.score} ${legacy.musicPrompt ? '(from the legacy music prompt)' : '(synthesised by scripts/make-score.ts)'}`
);
console.log('');
console.log('  Beat boundaries are a mechanical sentence split, not an edit. Read them back');
console.log('  against the storyboard and move them before you cut picture — each beat is a');
console.log('  clip, and its length becomes a scene duration.');
console.log(`  Then render and mix:  npm run studio:audio -- --project ${slug}`);
console.log(`  The legacy ${path.basename(legacyPath)} is left in place; delete it once you are happy.`);
