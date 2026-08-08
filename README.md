# Claude AI Video Studio V3

V3 turns the Claude Code video repo into a working **autonomous generative production studio**.

You paste a script into Claude Code. Claude plans the film, decides which scenes need generated media, calls configured AI media providers, generates narration and music, assembles everything with Remotion, renders with FFmpeg-compatible media, checks the output, revises problems, and creates the final MP4.

## V3 production architecture

```text
PROMPT / SCRIPT
      │
      ▼
Claude Code Executive Producer
      │
      ├── Script Analyst
      ├── Creative Director
      ├── Storyboard Director
      ├── Prompt Engineer
      ├── Asset Producer
      ├── Audio Director
      ├── Motion Designer
      ├── Video Editor
      └── QA Agent
      │
      ▼
Asset Router
 ┌──────────────┬──────────────┬───────────────┐
 │              │              │               │
GPT Image 2   Runway          Veo          Local Graphics
 │              │              │               │
 └──────────────┴──────────────┴───────────────┘
      │
      ├── ElevenLabs / OpenAI narration
      ├── ElevenLabs Music v2
      │
      ▼
Remotion Composition
      │
      ▼
Draft MP4
      │
      ▼
Automated QA
      │
      ├── critical → revise
      └── pass → final render
      │
      ▼
FINAL MP4
```

## Live integrations in V3

### Images
**OpenAI GPT Image 2**

The adapter calls the Images generation endpoint and writes returned image data directly to the project asset folder.

### AI video
**Runway**
- text-to-video
- async task polling
- automatic output download

**Google Vertex AI Veo**
- long-running video-generation operation
- Application Default Credentials
- GCS output retrieval

### Narration
**ElevenLabs**
- Eleven v3 by default
- configurable voice ID

**OpenAI**
- speech endpoint fallback/alternative

**macOS**
- local `say` fallback

### Music
**ElevenLabs Music v2**
- instrumental generation
- duration matched to project
- C2PA signing requested

## Requirements

- macOS recommended
- Node.js 20+
- npm
- FFmpeg
- Claude Code
- optional `gcloud` CLI for Veo

Install:

```bash
npm install
brew install ffmpeg
```

For Veo:

```bash
brew install --cask google-cloud-sdk
gcloud auth application-default login
```

## Configure

```bash
cp .env.example .env
```

Add only the services you intend to use.

A very good starting combination is:

```text
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...
RUNWAY_API_KEY=...
```

You do **not** need every provider.

Check what the studio will use:

```bash
npm run studio:providers
```

Missing premium keys automatically route to local fallbacks.

## Start Claude

```bash
claude
```

Then:

```text
/video-studio

Create a 60-second premium enterprise technology video.

Brand: NISTA Technologies
Audience: federal CIOs and technology program leaders
Platform: LinkedIn + website
Format: 16:9, 1080p
Tone: sophisticated, credible, mission-oriented
Narration: calm, authoritative, natural
Music: restrained cinematic technology score

Visual direction:
- cinematic systems imagery
- elegant architectural diagrams
- dimensional enterprise interfaces
- controlled typography
- subtle camera motion
- no generic PowerPoint/slideshow appearance
- no excessive neon

CTA:
Modernize with confidence.

SCRIPT:
[paste script]

Use AI-generated footage only for high-value hero moments.
Make routine creative decisions independently.
Generate the assets, narration and score.
Render a draft.
Run QA.
Fix critical issues.
Deliver the final MP4.
```

## What Claude creates

```text
projects/my-video/
├── brief.md
├── strategy.md
├── storyboard.md
├── production-state.json
├── asset-plan.json
├── asset-manifest.json
├── narration.json
├── audio-manifest.json
├── project.json
├── captions.srt
├── qa-report.md
└── delivery.json

public/assets/my-video/
├── generated/
└── audio/

out/
├── my-video-draft.mp4
└── my-video-final.mp4
```

## Manual pipeline

You normally let Claude run this, but every stage remains callable:

```bash
npm run studio:init -- --name "My Video"
npm run studio:providers
npm run studio:assets -- --project my-video
npm run studio:audio -- --project my-video
npm run studio:sync -- --project my-video
npm run studio:render -- --project my-video --mode draft
npm run studio:qa -- --project my-video --mode draft
npm run studio:render -- --project my-video --mode final
npm run studio:deliver -- --project my-video
```

Or run the main pipeline:

```bash
npm run studio:produce -- --project my-video
```

## Cost philosophy

AI footage should be the exception rather than the default.

A strong 60-second brand video might use:
- 1-3 generated hero clips
- 2-4 generated still images
- locally animated diagrams/UI for the remainder
- one narration track
- one music track

That generally produces a more coherent film and reduces generation cost.

## Security

- `.env` is ignored by Git.
- Never put credentials inside project JSON.
- Asset manifests record provider provenance.
- The repo is designed so generated media providers can be replaced without changing the editing engine.

## Provider note

Third-party APIs evolve. Each external provider is isolated in `src/studio/adapters/` so Claude Code can update an adapter without rewriting the production pipeline.
