# Petal Pals — resume point

Ep 1 "The Sleepy Seed" is **design-complete and part-built**. Everything creative is
decided and approved; what remains is mechanical generation. Start here.

```bash
cd "WickyStory/Petal Pals"
npx tsx build.ts status          # where the build is
npx tsx build.ts next --n 8      # what to submit next
```

## State

| | |
|---|---|
| Script | 5:40, 63 shots, locked. `episodes/ep01-the-sleepy-seed/script.md` |
| Cast Elements | 6 locked, approved 2026-08-09. `elements/elements.json` |
| Narration | 34 lines recorded, 6 voices. `episodes/*/vo/full/` |
| Aligned audio | 34/34 built, nothing time-stretched. `vo/aligned/` |
| Keyframes | 53/53 generated and eyeballed. `keyframes/full/` |
| Theme + score | `music/make-theme.ts`, `music/theme-v2.wav` |
| Opening | Built, 62s, 10 shots. `episodes/*/out/v3/` |
| **Clips** | **0/53** — this is all that's left |

Credits: ~600 spent, ~1,800 remaining. Finishing needs ~591.

## The loop

For each shot the ledger (`build/ep01-the-sleepy-seed/state.json`) tracks four steps.
Work in batches of 6–8; the provider rate-limits harder than that.

1. **Upload aligned audio** (speaking shots only)
   `media_upload` → `curl -X PUT` the wav → `media_confirm`
   → `npx tsx build.ts record --kind upload --map s16=<media_id>,...`

2. **Generate the clip**
   - Speaking shot → **`wan2_7`**, 1080p, `duration` = shot length,
     `medias`: `start_image` = keyframe job id, `audio_references` = uploaded media id
   - Silent shot → **`kling3_0`**, `mode: pro`, `sound: off`, same start_image
   - Prompts: `episodes/*/keyframe-prompts.json`, plus the phoneme direction below
   → `npx tsx build.ts record --kind clip --map s16=<job_id>,...`

3. **Download** → `npx tsx build.ts fetch --kind clip --map s16=<result_url>,...`

4. **Assemble** → `npx tsx build.ts assemble`, then mix and mux using the pattern in
   `episodes/*/build-audio-v2.ts`.

## Rules that were learned the hard way

- **Never describe a character in a prompt.** Use `<<<element-id>>>` and describe only
  what they're DOING. Describing them fights the Element and the character drifts.
- **Sprout has EXACTLY ONE leaf** through s57 and **TWO from s60** — that's the season
  tracker. The model wants to give him a pair; say the count in every prompt and check
  every render.
- **Lip sync needs shot-aligned audio.** Feeding a 6.8s line to an 8s shot makes the
  model guess when the mouth moves. `prep-audio` pads to the exact shot length with the
  speech at its true offset. This is most of the quality.
- **Add phoneme direction** to every speaking prompt: jaw open on vowels, lips round on
  "oo", close on b/m/p, mouth at rest during the silence, "every mouth shape lands on
  its syllable."
- **The preset recommender intercepts submissions** unpredictably. On
  `submission_failed ... Preset "X" was recommended`, resubmit with
  `declined_preset_id: <id>`. Expect it a few times per batch.
- **`speech_rate` is unreliable** — it barely changes full-line length and varies per
  generation. Never fix timing with it; fix the shot length instead.
- **Fix timing in the shot list, not the audio.** `prep-audio` reports any shot too
  short for its line. Lengthen the shot. Time-stretching past ~1.15x sounds rushed and
  was the single biggest quality complaint on the first cut.

## Open creative items

- **Episode runs 5:40**, not 5:00, because shots were lengthened to fit the voices at
  natural pace. Accepted as better for ages 2–6; trim beats if 5:00 is required.
- **Lip sync is good, not perfect.** Approved as-is for Ep 1. If it needs another pass,
  the remaining levers are tighter framing on dialogue shots, or Seedance 2.0 (~4x the
  cost, ~54 cr per 6s shot) on the closest shots.
- **Songs are rhythmic chant over a synthesized bed**, not sung — no singing model is
  connected. Suno/Udio vocals could be dropped in later.

## Episodes 2–5

Beat sheets are in `series-bible.md` §E. The whole pipeline is reusable: expand a beat
sheet to a full script, re-derive shot lengths from measured narration, reuse the
Elements (Sprout needs a **new Element per episode** as his leaf count grows), and run
`build.ts --ep ep02-...`.
