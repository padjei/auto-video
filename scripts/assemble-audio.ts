/**
 * Assembles the final audio bed from per-beat narration clips plus the score.
 *
 * Thin CLI over src/studio/narration.ts, which is where the measurement, mixing
 * and caption segmentation actually live so that the audio stage of the pipeline
 * and this command produce the same film. The clips must already exist — use
 * `npm run studio:audio -- --project <slug>` to render any that do not.
 *
 * Reads:  projects/<slug>/narration-plan[-variant].json
 * Writes: public/assets/<slug>/mix[-variant].wav
 *         projects/<slug>/captions[-variant].srt
 *         projects/<slug>/audio-timing[-variant].json
 *
 * Usage: tsx scripts/assemble-audio.ts --project <slug> [--variant <name>] [--fps 30]
 */
import {assembleNarration} from '../src/studio/narration';

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const slug = arg('--project');
if (!slug) throw new Error('Use --project <slug>');

/** Defaults to the project's own fps, and only then to 30. */
const fpsArg = arg('--fps');
const fps = fpsArg === undefined ? undefined : Number(fpsArg);

/**
 * Alternate-voice variant. The picture is locked and conformed to the primary
 * voice, so a variant reuses that timeline exactly and only swaps the clips
 * (see scripts/conform-voice.ts). Outputs are suffixed so a variant can never
 * overwrite the delivered primary mix, captions or timing.
 */
const variant = arg('--variant');

const result = await assembleNarration(slug, {variant, fps});

console.log(`Mix:      ${result.mixPath}`);
console.log(`Captions: ${result.captionsPath} (${result.cueCount} cues)`);
console.log(
  `Total:    ${result.timing.totalSeconds.toFixed(3)}s / ${result.timing.totalFrames} frames @ ${result.timing.fps}fps`
);
