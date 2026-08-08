# Autonomous Architecture

Claude Code is the control plane. Remotion + FFmpeg are the deterministic rendering plane. Optional AI providers form the generative media layer.

## Production loop

Prompt → strategy → storyboard → assets → narration → edit → render → QA → revise → final.

## Resumability

Each project stores a production-state file so Claude can continue after interruption.

## Provider isolation

External media providers must be accessed through adapters. Scene components should never call vendor APIs directly.

## Revision policy

Critical QA findings trigger a revision loop. Default maximum: 3 cycles.
