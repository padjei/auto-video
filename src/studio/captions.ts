/**
 * Captions are produced by the audio stage, not here.
 *
 * This used to estimate cue timings by spreading the video's total duration over
 * the script's sentences in proportion to their word counts. That is a guess, and
 * it drifts: a sentence read slowly, a pause for a cut, a beat of silence under a
 * lockup, and every subsequent cue is wrong by the accumulated error. The measured
 * assembly in narration.ts already knows exactly when each beat's speech starts and
 * ends, because it measured the clips, so cue timing comes from there.
 *
 * What is left here is a verification: the caption track exists, and it still says
 * what the narration says. There is deliberately no fallback to estimation — a
 * silently estimated caption track is the failure this convention removed, and it
 * is better for the caller to be told to run the audio stage.
 */
import fs from 'node:fs';
import path from 'node:path';
import {audioTimingPath, captionsPath} from './narration';

/**
 * Returns the path to the project's measured captions.srt.
 * Throws if the audio stage has not run, or if the captions no longer match the
 * narration they were timed against.
 */
export function makeCaptions(project: string, variant?: string): string {
  const timingFile = audioTimingPath(project, variant);
  const srtFile = captionsPath(project, variant);

  if (!fs.existsSync(timingFile)) {
    throw new Error(
      `Missing ${timingFile}. Captions are timed from the measured narration, so the ` +
        `audio stage has to run first:  npm run studio:audio -- --project ${project}`
    );
  }
  if (!fs.existsSync(srtFile)) {
    throw new Error(
      `Missing ${srtFile}, although ${path.basename(timingFile)} exists. Re-run the ` +
        `assembly to regenerate it:  npx tsx scripts/assemble-audio.ts --project ${project}` +
        `${variant ? ` --variant ${variant}` : ''}`
    );
  }

  const timing = JSON.parse(fs.readFileSync(timingFile, 'utf8'));
  const flatten = (s: string) => s.replace(/\s+/g, ' ').trim();

  const spoken = flatten(timing.beats.map((b: {narration: string}) => b.narration).join(' '));
  const captioned = flatten(
    fs
      .readFileSync(srtFile, 'utf8')
      .trim()
      .split(/\r?\n\r?\n/)
      .map((block) => block.split(/\r?\n/).slice(2).join(' '))
      .join(' ')
  );

  if (captioned !== spoken) {
    throw new Error(
      `${srtFile} no longer reconstructs the narration in ${path.basename(timingFile)}. ` +
        `The script changed after the mix was built — re-run the audio stage so the ` +
        `voice, the captions and the cut are measured from the same read.`
    );
  }

  return srtFile;
}
