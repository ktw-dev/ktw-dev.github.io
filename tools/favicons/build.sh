#!/usr/bin/env bash
# Builds the favicon set from two source marks (claude-md/ui-style-prd.md 12-3).
#   mark-small.svg  -> favicon.svg, favicon.ico (16/32/48), favicon-16x16.png, favicon-32x32.png
#   mark-large.svg  -> apple-touch-icon.png (180), android-chrome-192x192.png, android-chrome-512x512.png
# To change the icon, replace the two SVGs, run this script, and bump `version` in _config.yml.
# Needs: resvg (brew install resvg), python3 with Pillow.
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
OUT="$SRC/../../assets/img/favicons"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# The PNG/ICO files always use the light mark: browsers do not tell a favicon which mode the tab is in.
sed '/@media/d' "$SRC/mark-small.svg" > "$TMP/small-light.svg"

cp "$SRC/mark-small.svg" "$OUT/favicon.svg"

for s in 16 32 48; do
  resvg -w "$s" -h "$s" "$TMP/small-light.svg" "$TMP/k-$s.png"
done
cp "$TMP/k-16.png" "$OUT/favicon-16x16.png"
cp "$TMP/k-32.png" "$OUT/favicon-32x32.png"

resvg -w 180 -h 180 "$SRC/mark-large.svg" "$OUT/apple-touch-icon.png"
resvg -w 192 -h 192 "$SRC/mark-large.svg" "$OUT/android-chrome-192x192.png"
resvg -w 512 -h 512 "$SRC/mark-large.svg" "$OUT/android-chrome-512x512.png"

python3 - "$TMP" "$OUT" <<'PY'
import sys
from PIL import Image
tmp, out = sys.argv[1], sys.argv[2]
big = Image.open(f"{tmp}/k-48.png")
big.save(f"{out}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
         append_images=[Image.open(f"{tmp}/k-16.png"), Image.open(f"{tmp}/k-32.png")])
PY

echo "favicons written to $OUT"
