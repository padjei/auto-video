#!/usr/bin/env bash
# Petal Pals Ep1 — opening test slice (shots 1-6 + theme 11-14), 50s.
#
# Plates are animated here rather than generated as video: a slow push plus a gentle
# drift reads as limited TV animation on establishing shots and costs 2 credits
# instead of 9.5. Generated clips are reserved for shots where a character performs.
set -euo pipefail
cd "$(dirname "$0")"

OUT=out; mkdir -p "$OUT/seg"
W=1920; H=1080; FPS=30

# --- 1. Animate the three still plates (slow push, 1080p) -------------------
plate () { # $1=name $2=seconds $3=zoom-end
  local n=$1 sec=$2 z=$3 frames
  frames=$(python3 -c "print(int($sec*$FPS))")
  ffmpeg -v error -y -loop 1 -i "keyframes/$n.png" \
    -vf "scale=${W}*2:-1,zoompan=z='min(zoom+0.00035,${z})':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=${FPS},format=yuv420p" \
    -t "$sec" -an "$OUT/seg/$n.mp4"
}
plate s01 6 1.10
plate s02 4 1.12
plate s04 4 1.08

# --- 2. Conform generated clips to 1080p ------------------------------------
# Clips arrive 1284x716, which is not 16:9 — scale to cover then centre-crop so
# nothing is letterboxed and no character drifts out of frame.
clip () { # $1=name $2=seconds
  ffmpeg -v error -y -i "clips/$1.mp4" \
    -vf "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},format=yuv420p" \
    -t "$2" -an "$OUT/seg/$1.mp4"
}
clip s03 5; clip s05 5; clip s06 5
clip s11 5; clip s12 5; clip s13 5; clip s14 6

# --- 3. Cut them together ---------------------------------------------------
: > "$OUT/list.txt"
for s in s01 s02 s03 s04 s05 s06 s11 s12 s13 s14; do
  echo "file 'seg/$s.mp4'" >> "$OUT/list.txt"
done
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/list.txt" -c copy "$OUT/picture.mp4"

echo "picture: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/picture.mp4")s"
