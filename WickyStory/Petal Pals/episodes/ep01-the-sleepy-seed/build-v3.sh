#!/usr/bin/env bash
# Petal Pals Ep1 — opening, quality rebuild. 62s.
#
# Changes from v1:
#   - Plates generated at 4K (5504x3072) so the push crops into real detail
#     instead of enlarging a 2K frame.
#   - Dialogue and singing shots are Wan 2.7 at 1080p, driven by the actual voice
#     track, so mouths move with the words rather than inventing motion.
#   - Non-speaking action is Kling 3.0 'pro' (1928x1076), same resolution as Wan
#     at lower cost since no lip sync is needed.
#   - Shot lengths re-cut to fit each line at its natural pace. Nothing is
#     time-stretched anywhere in this build.
set -euo pipefail
cd "$(dirname "$0")"

OUT=out/v3; mkdir -p "$OUT/seg"
W=1920; H=1080; FPS=30

# Slow push on a 4K plate: scale to 2x output, then zoompan crops within it.
plate () { # $1=name $2=seconds $3=zoom-end
  local n=$1 sec=$2 z=$3 frames
  frames=$(python3 -c "print(int($sec*$FPS))")
  ffmpeg -v error -y -loop 1 -i "keyframes/4k/$n.png" \
    -vf "scale=${W}*2:-1,zoompan=z='min(zoom+0.00030,${z})':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=${FPS},format=yuv420p" \
    -t "$sec" -an "$OUT/seg/$n.mp4"
}
plate s01 6 1.10
plate s02 4 1.12
plate s04 4 1.08

# Generated clips: cover-scale to 1080p and centre-crop, then hold to length.
# `tpad` clones the last frame if a clip lands a hair short of its slot.
clip () { # $1=source $2=name $3=seconds
  ffmpeg -v error -y -i "$1" \
    -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},tpad=stop_mode=clone:stop_duration=1,format=yuv420p" \
    -t "$3" -an "$OUT/seg/$2.mp4"
}
clip clips/v3/s03.mp4 s03 5
clip clips/v3/s05.mp4 s05 7
clip clips/v3/s06.mp4 s06 8
clip clips/v3/s11.mp4 s11 8
clip clips/v3/s12.mp4 s12 8
clip clips/v3/s13.mp4 s13 6
clip clips/v3/s14.mp4 s14 6

: > "$OUT/list.txt"
for s in s01 s02 s03 s04 s05 s06 s11 s12 s13 s14; do
  echo "file 'seg/$s.mp4'" >> "$OUT/list.txt"
done
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/list.txt" -c copy "$OUT/picture.mp4"
echo "picture: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/picture.mp4")s"
