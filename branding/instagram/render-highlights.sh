#!/usr/bin/env bash
# Render AI Founder Hub Instagram highlight covers + story frames to PNG.
# Covers are 1080x1080 (Instagram crops the centre circle); stories are 1080x1920.
set -euo pipefail
cd "$(dirname "$0")"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
HIGHLIGHTS=(start workshops bootcamp dubai)

mkdir -p highlights/covers highlights/stories

echo "Rendering covers..."
for h in "${HIGHLIGHTS[@]}"; do
  "$CHROME" --headless --window-size=1080,1080 --hide-scrollbars --virtual-time-budget=15000 \
    --screenshot="highlights/covers/cover-$h.png" \
    "file://$PWD/art/highlight-covers.html?h=$h" >/dev/null 2>&1
  echo "  cover-$h.png"
done

echo "Rendering stories..."
for h in "${HIGHLIGHTS[@]}"; do
  for n in 1 2 3; do
    "$CHROME" --headless --window-size=1080,1920 --hide-scrollbars --virtual-time-budget=15000 \
      --screenshot="highlights/stories/$h-$n.png" \
      "file://$PWD/art/highlight-stories.html?h=$h&n=$n" >/dev/null 2>&1
    echo "  $h-$n.png"
  done
done

echo "Done. 4 covers + 12 story frames in highlights/"
