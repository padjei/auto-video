# nista-launch — asset inventory

What lives in git, what does not, and how to rebuild anything that does not.

The rule: **track what cannot be regenerated, ignore what can.** Generated media is
otherwise large enough to bloat the history permanently, and git has no way to forget it.

## Tracked

| Path | Size | Why |
|---|---|---|
| `public/assets/nista-launch/ops-floor.jpg` | 140K | Delivered plate, 2304×1296. Regenerating would produce a *different* image — generation is not reproducible. |
| `public/assets/nista-launch/whiteboard.jpg` | 168K | Delivered plate (v2 — v1 had printed pseudo-branding on the marker barrel). |
| `public/assets/nista-launch/keyboard.jpg` | 180K | Delivered plate (v2 — v1 had a display in frame and the arm across the type anchor). |
| `public/assets/nista-launch/nista-mark.svg` | 4K | Vector redraw of the brand mark, tinted via `currentColor` for the monochrome knockout. |
| `public/assets/nista-launch/nista-logo.png` | 24K | Original 512px site icon, kept for reference. |
| `public/assets/nista-launch/vo/b1–b8.wav` | 5.3M | Reid narration, conformed. **Not reproducible** — the TTS varies per generation. |
| `public/assets/nista-launch/vo-vera/b1–b8.wav` | 5.4M | Vera narration, conformed. Same. |
| `public/assets/nista-launch/vo-arthur/b1–b8.wav` | 5.4M | Arthur narration, conformed. Same. |

Roughly 17 MB. Enough to re-render all three cuts of the film from a clean checkout.

## Not tracked

| Path | Size | How to get it back |
|---|---|---|
| `out/*.mp4` | 45M each | `npm run studio:render -- --project nista-launch --mode final` |
| `public/assets/nista-launch/score.wav` | 12M | `npx tsx scripts/make-score.ts --out public/assets/nista-launch/score.wav --duration 60` |
| `public/assets/nista-launch/mix.wav` | 11M | `npx tsx scripts/assemble-audio.ts --project nista-launch` |
| `public/assets/nista-launch/mix-{vera,arthur}.wav` | 11M each | `npx tsx scripts/assemble-audio.ts --project nista-launch --variant <voice>` |
| `public/assets/nista-launch/plates/*.png` | 86M | 4K generation masters. The tracked JPEGs are Lanczos downscales of these; the masters only matter if you want to re-crop. |
| `public/assets/nista-launch/*/raw/` | 19M | Un-conformed narration takes. `scripts/conform-voice.ts` regenerates the conformed clips from these, so keep them locally while iterating. |
| `public/assets/nista-launch/rerolls/`, `vo-tests/` | 11M | Discarded takes and the original four-voice audition. |

## Rebuilding the film from a clean checkout

```bash
npm install
npm run doctor                                     # needs ffmpeg + ffprobe on PATH
npx tsx scripts/make-score.ts --out public/assets/nista-launch/score.wav --duration 60
npx tsx scripts/assemble-audio.ts --project nista-launch
npx tsx scripts/check-captions.ts --project nista-launch
npm run studio:render -- --project nista-launch --mode final
```

For the alternate voices, the picture is **locked** — do not re-derive scene durations
from their narration. `scripts/conform-voice.ts` fits each read to the existing cut, and
`assemble-audio --variant <voice>` builds the mix. The variant masters are then muxed by
stream-copying the video from the primary master, so the image stays bit-identical.

## One caveat on reproducibility

`mix.wav` is not byte-stable across runs — consecutive identical invocations alternate
between two checksums. A null test between them peaks at −91 dBFS, i.e. one LSB at 16-bit,
which is ffmpeg thread-ordering and is far below AAC quantisation. Audibly it is the same
file. Do not treat a checksum mismatch here as a regression; null-test instead.
