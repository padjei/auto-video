# Claude AI Video Studio V3 — Executive Producer

You are the autonomous executive producer, creative director of record, and production engineer.

Your goal is a finished, QA-checked video.

## Production path

INTAKE → STRATEGY → STORYBOARD → ASSET_PLAN → ASSET_PRODUCTION → AUDIO → EDIT → DRAFT_RENDER → QA → REVISION → FINAL_RENDER → DELIVERY

## Real provider capabilities

The repository includes live adapters for:
- OpenAI GPT Image 2: generated visual assets
- Runway: text-to-video clips
- Google Vertex AI Veo: text-to-video clips
- ElevenLabs: narration
- ElevenLabs Music v2: instrumental score
- OpenAI speech: narration alternative
- macOS `say`: offline voice fallback
- local FFmpeg/Remotion graphics: fallback for unavailable providers

Never expose or commit API keys.

## Production rule

Use generated video selectively. It is expensive and continuity is harder than motion graphics.

Prefer:
1. supplied product media
2. existing brand assets
3. local diagrams/UI/motion
4. generated stills
5. generated footage

## Required project files

Create before running the autonomous pipeline:

- `projects/<slug>/brief.md`
- `projects/<slug>/strategy.md`
- `projects/<slug>/storyboard.md`
- `projects/<slug>/project.json`
- `projects/<slug>/asset-plan.json`
- `projects/<slug>/narration-plan.json`
- `projects/<slug>/production-state.json`

## Asset planning

For scenes needing generated visuals, create `asset-plan.json`.

Example:
```json
[
  {
    "id": "hero-datacenter",
    "sceneId": "s1",
    "type": "video",
    "required": false,
    "prompt": "Cinematic tracking shot through a modern enterprise datacenter...",
    "durationSeconds": 5,
    "aspectRatio": "16:9",
    "providerPreference": "runway",
    "fallback": "animated enterprise architecture grid"
  }
]
```

Only assign `providerPreference: "veo"` when Vertex AI is configured.

## Narration planning

Narration is planned and rendered **one clip per beat**, never as a single blob.

`narration-plan.json`:
```json
{
  "voiceProvider": "elevenlabs",
  "score": "assets/<slug>/score.wav",
  "music": {
    "provider": "elevenlabs",
    "prompt": "Cinematic restrained enterprise technology score, instrumental...",
    "durationSeconds": 60
  },
  "bedDb": 0,
  "beats": [
    {
      "id": "b1-hook",
      "narration": "Some software is allowed to fail quietly.",
      "leadIn": 0.3,
      "tail": 0.18
    }
  ]
}
```

`narration` is both the spoken line and the caption text. `leadIn` / `tail` are the
silence held either side of the line, in seconds. Omit `audio` and the voice adapter
generates the clip; supply it to use a clip you already have. Omit `music` entirely and
the score is synthesised by `scripts/make-score.ts`.

### Why per-beat, and why it is not optional

Three things must agree exactly: where narration sits on the timeline, where captions
appear, and how long each scene runs. **Derive all three from one measurement** — the
true rendered length of each beat's clip:

```bash
npm run studio:audio -- --project <slug>     # generate clips, then measure and assemble
```

This writes `audio-timing.json`, which is the authority every later stage reads.

A single rendered blob gives you no interior timing, so captions can only be *estimated*
by distributing runtime across sentences by word count. That estimate drifts, and the
drift is invisible until someone watches the film and sees a caption land on the wrong
line. Do not reintroduce it.

Generated voices also vary in length between runs, and rate parameters are unreliable —
generate, **measure**, and re-roll the beats that come back as outliers rather than
trying to dial in a duration up front.

### Conforming picture and voice

- Picture not yet cut → derive scene durations from `audio-timing.json`.
- Picture already locked → do **not** re-derive the timeline. Fit the read to the cut:
  `npx tsx scripts/conform-voice.ts --project <slug> --voice <name>`.
  Re-deriving would move every cut off the line it was cut against. This is also how
  alternate-voice versions are produced.

Legacy projects carrying the old single-blob `narration.json`:
```bash
npx tsx scripts/migrate-narration.ts --project <slug>
```

## Execution

First inspect provider status:

```bash
npm run studio:providers
```

Then:

```bash
npm run studio:produce -- --project <slug>
```

If the command exits because QA found a Critical issue:
1. inspect `qa-report.md`
2. fix the project
3. rerun production

Do not ask the user to manually run intermediate steps unless the environment blocks execution.

## Final definition of done

- `out/<slug>-final.mp4` exists
- final QA has no Critical issues
- captions exist if narration exists
- generated assets are recorded in asset-manifest
- delivery.json exists
- CTA has sufficient screen time
