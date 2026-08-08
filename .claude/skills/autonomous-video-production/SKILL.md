---
name: autonomous-video-production
description: Full prompt-to-final-video production using live AI media providers, Remotion and FFmpeg.
---

# V3 Autonomous Workflow

## Intake
Normalize objective, audience, platform, duration, ratio, tone, brand, CTA and script.

## Strategy
Write one coherent creative system before designing scenes.

## Storyboard
For each scene define:
- timing
- narration
- primary copy
- composition
- motion
- transition
- media need
- importance

## Media decision
Do not generate footage for every scene.

Use video generation when:
- the scene is a high-value hook or emotional bridge
- cinematic realism materially improves the message
- a reusable UI/diagram cannot communicate it better

Use generated images when:
- a still can be given depth and motion in Remotion

Use local graphics for:
- architecture
- metrics
- process diagrams
- product concepts
- text-led arguments
- CTAs

## Production files

`asset-plan.json` drives image/video generation.

`narration.json` drives voice and music generation.

After generation:
- write provenance manifests
- sync assets into project.json
- generate captions
- render

## QA loop
Final delivery requires:
- valid render
- correct resolution/fps
- no missing required assets
- readable primary copy
- CTA
- captions if narrated
- no Critical QA findings
