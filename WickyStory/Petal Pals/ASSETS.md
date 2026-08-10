# Petal Pals — asset inventory

What is versioned, what is not, and how to rebuild what is not.

The rule: **track what cannot be reproduced.** Regenerating an image does not return
the same image — it returns a different one. So anything a later stage was built on top
of must be kept, or continuity breaks between stages. That is why keyframes are tracked
even though they are "generated": 53 clips are conditioned on those exact frames.

## Tracked

| Path | Size | Why |
|---|---|---|
| `series-bible.md`, `RESUME.md`, `build.ts` | small | Source of truth for the whole series. |
| `episodes/*/script.md`, `shotlist.md` | small | The locked 5:40 cut. |
| `episodes/*/keyframe-prompts.json`, `shot-plan-rest.json` | small | Every shot's prompt and length; regenerating from these reproduces the *design*, not the pixels. |
| `build/*/state.json` | small | The build ledger. Without it a resumed build cannot tell what has already been paid for. |
| `elements/elements.json` | small | The locked character Element ids. Losing these means re-designing the cast. |
| `elements/designs-jpg/` | 644K | The six approved character designs. **Not reproducible** — these exact images are what every Element references. |
| `episodes/*/keyframes/jpg/` | 14M | All 53 keyframes plus the 4K plates. **Not reproducible**, and 53 clips are conditioned on them. |
| `episodes/*/vo/full/` | 67M | The 34 narration performances. **Not reproducible** — the TTS varies per generation. |
| `music/make-theme.ts` | small | The score is code, not a file. |

Roughly 82 MB. Enough to resume the build, or rebuild the episode end to end, from a
clean clone.

## Not tracked

| Path | Size | How to get it back |
|---|---|---|
| `episodes/*/keyframes/full`, `/4k` | 519M | Full-res PNG masters. The tracked JPGs are visually equivalent and adequate as start frames. |
| `episodes/*/clips/` | 208M | ~591 credits to regenerate. Reproducible from tracked keyframes + aligned audio, but not free — back these up outside git if the build is paused for long. |
| `episodes/*/out/` | 355M | Pure derivation: `npx tsx build.ts assemble`. |
| `episodes/*/vo/aligned/` | — | `npx tsx build.ts prep-audio` |
| `episodes/*/vo/raw`, `slow`, `vo-tests`, `rerolls` | — | Discarded takes and the voice audition. |
| `music/*.wav` | 21M | `npx tsx music/make-theme.ts --out music/theme-v2.wav --duration 62 --theme-at 34` |
| `elements/designs/` | 29M | PNG masters of the designs; the tracked JPGs are the working copies. |

## Rebuilding from a clean clone

```bash
cd "Petal Pals"
npx tsx music/make-theme.ts --out music/theme-v2.wav --duration 62 --theme-at 34
npx tsx build.ts prep-audio        # rebuilds aligned audio from tracked vo/full
npx tsx build.ts status            # ledger says what still needs generating
```

Clips are the only thing that costs money to restore. Everything else is a command.

## One caveat

`build/*/state.json` records job ids from the generation provider. Those ids stay valid
for fetching results, but a clone on another machine cannot re-download media the
provider has expired. If clips matter, copy `episodes/*/clips/` out of band.
