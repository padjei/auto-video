---
name: video-production
description: End-to-end workflow for creating rendered videos with Claude Code, Remotion and FFmpeg.
---

# Video Production Skill

Use for creating, rendering, storyboarding, animating, editing or revising videos.

## Normalize input
Extract objective, audience, platform, duration, aspect ratio, tone, CTA, script, mandatory assets and output filename.
Infer sensible defaults when omitted.

## Project files
```text
projects/<slug>/brief.md
projects/<slug>/storyboard.md
projects/<slug>/project.json
projects/<slug>/captions.srt
```

## Scene design
Target roughly 6-10 scenes per minute unless slower pacing is justified. Every scene needs timing, visual concept, text, motion, transition and optional media asset.

Preferred scene types: hero, kineticType, metric, quote, split, diagram, process, code, ui, image, video, cta.

## Quality gates
1. `npm run doctor`
2. `npm run typecheck`
3. render draft
4. run video-qa
5. fix Critical findings
6. render final

Do not present only source code when the environment can render the video.
