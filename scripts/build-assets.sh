#!/usr/bin/env bash
#
# Regenerate the bitmap assets in public/ from the sources in assets-src/.
#
# Sources:
#   public/assets/favicon.svg   master icon (vector, also shipped as-is)
#   assets-src/og-card.html     1200×630 social card
#
# Outputs (all committed):
#   public/assets/og-card.png           1200×630 social card
#   public/favicon.ico                  16/32/48 icon
#   public/assets/favicon-16|32|48.png  transparent favicons
#   public/assets/apple-touch-icon.png  180×180, opaque
#   public/assets/icon-192|512.png      PWA icons, opaque
#
# Requirements: Google Chrome (or CHROME=/path/to/chrome) and Python 3 + Pillow.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
out_dir="$root/public"
work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT

find_chrome() {
  if [ -n "${CHROME:-}" ]; then printf '%s\n' "$CHROME"; return; fi
  local candidates=(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
    "google-chrome"
    "chromium"
    "chromium-browser"
  )
  local candidate
  for candidate in "${candidates[@]}"; do
    if [ -x "$candidate" ]; then printf '%s\n' "$candidate"; return; fi
    if command -v "$candidate" >/dev/null 2>&1; then printf '%s\n' "$candidate"; return; fi
  done
  return 1
}

chrome=$(find_chrome) || {
  printf 'No Chrome/Chromium found. Set CHROME=/path/to/chrome and retry.\n' >&2
  exit 1
}

render() { # <html> <out> <width> <height> <background>
  local html=$1 out=$2 width=$3 height=$4 background=$5
  rm -f "$out"
  # Chrome keeps running after writing the screenshot, so poll for the file and
  # then terminate the process instead of relying on a clean exit.
  "$chrome" \
    --headless \
    --disable-gpu \
    --hide-scrollbars \
    --no-first-run \
    --no-default-browser-check \
    --disable-extensions \
    --disable-sync \
    --disable-background-networking \
    --force-device-scale-factor=1 \
    --user-data-dir="$work_dir/chrome-profile" \
    --default-background-color="$background" \
    --virtual-time-budget=4000 \
    --window-size="$width,$height" \
    --screenshot="$out" \
    "file://$html" >/dev/null 2>&1 &
  local pid=$!
  local waited=0
  while [ ! -s "$out" ] && [ "$waited" -lt 80 ]; do
    sleep 0.5
    waited=$((waited + 1))
  done
  sleep 1
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
  test -s "$out" || { printf 'render failed: %s\n' "$out" >&2; exit 1; }
}

printf 'Rendering icon master and social card…\n'
render "$root/assets-src/icon-render.html" "$work_dir/icon-512.png" 512 512 00000000
render "$root/assets-src/og-card.html" "$out_dir/assets/og-card.png" 1200 630 ffffffff

printf 'Deriving icon sizes…\n'
python3 - "$work_dir/icon-512.png" "$out_dir" <<'PY'
import sys
from pathlib import Path

from PIL import Image

master_path = Path(sys.argv[1])
out_dir = Path(sys.argv[2])
assets = out_dir / "assets"

master = Image.open(master_path).convert("RGBA")
if master.size != (512, 512):
    raise SystemExit(f"master icon must be 512×512, got {master.size}")

for size in (16, 32, 48):
    master.resize((size, size), Image.LANCZOS).save(assets / f"favicon-{size}.png")

for size in (180, 192, 512):
    flat = Image.new("RGB", (size, size), "#04070d")
    flat.paste(master.resize((size, size), Image.LANCZOS), (0, 0), master.resize((size, size), Image.LANCZOS))
    name = {
        180: "apple-touch-icon.png",
        192: "icon-192.png",
        512: "icon-512.png",
    }[size]
    flat.save(assets / name, optimize=True)

ico_sizes = [(48, 48), (32, 32), (16, 16)]
master.resize((48, 48), Image.LANCZOS).save(
    out_dir / "favicon.ico", sizes=ico_sizes, format="ICO"
)

for path in sorted(assets.glob("*.png")) + [out_dir / "favicon.ico"]:
    with Image.open(path) as image:
        print(f"  {path.relative_to(out_dir.parent)}  {image.size[0]}×{image.size[1]}  {image.format}")
PY

printf 'Assets regenerated.\n'
