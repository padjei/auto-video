#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -lt 2 ]; then echo "Usage: $0 "Narration text" output.aiff [voice]"; exit 1; fi
TEXT="$1"; OUTPUT="$2"; VOICE="${3:-Samantha}"; mkdir -p "$(dirname "$OUTPUT")"; say -v "$VOICE" -o "$OUTPUT" "$TEXT"; echo "Created $OUTPUT using macOS voice: $VOICE"
