# V3 Provider Setup

## OpenAI

Set:
```bash
OPENAI_API_KEY=...
```

Used for:
- GPT Image 2
- OpenAI speech

Default image model:
`gpt-image-2`

## ElevenLabs

Set:
```bash
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

Used for:
- Eleven v3 narration
- Music v2

## Runway

Set:
```bash
RUNWAY_API_KEY=...
```

The adapter uses the Runway API version header `2024-11-06`, creates a text-to-video task, polls it, and downloads the result.

## Google Veo

Install gcloud and authenticate:

```bash
gcloud auth application-default login
```

Set:
```bash
GOOGLE_CLOUD_PROJECT=...
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_STORAGE_URI=gs://your-bucket/video-studio
```

The V3 adapter starts a Vertex AI long-running Veo operation, polls it, then copies the generated video from GCS.

## Local fallback

No API key required.

Local fallback supports:
- animated Remotion scenes
- local SVG graphic placeholders
- FFmpeg-generated motion backgrounds
- macOS narration

This guarantees the project can still render when premium generation is unavailable.
