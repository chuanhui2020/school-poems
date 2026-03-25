#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Extract unique characters from JSON data files
CHARS=$(node -e "
const fs = require('fs');
const files = [
  '$PROJECT_DIR/src/data/authors.json',
  '$PROJECT_DIR/src/data/dynasties.json',
  '$PROJECT_DIR/src/data/poems.json',
];
let chars = new Set();
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  const text = JSON.stringify(data);
  for (const ch of text) chars.add(ch);
}
// Add common UI strings
const ui = '诗词元宇宙全景朝代诗人搜索译文赏析点击空白处关闭您的浏览器不支持无法显示请尝试使用';
for (const ch of ui) chars.add(ch);
// Add ASCII
const ascii = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789·—「」《》';
for (const ch of ascii) chars.add(ch);
process.stdout.write([...chars].join(''));
")

echo "Extracted ${#CHARS} unique characters"

PYFTSUBSET="$(python3 -c "import sys; print(sys.prefix)")/bin/pyftsubset"
# Fallback to user install location
if [ ! -f "$PYFTSUBSET" ]; then
  PYFTSUBSET="/Users/$(whoami)/Library/Python/3.9/bin/pyftsubset"
fi
if [ ! -f "$PYFTSUBSET" ]; then
  PYFTSUBSET="$(which pyftsubset 2>/dev/null || echo '')"
fi

if [ -z "$PYFTSUBSET" ] || [ ! -f "$PYFTSUBSET" ]; then
  echo "ERROR: pyftsubset not found. Install with: pip install fonttools brotli"
  exit 1
fi

echo "Using pyftsubset: $PYFTSUBSET"

"$PYFTSUBSET" \
  "$PROJECT_DIR/public/fonts/LXGWWenKai-Regular.ttf" \
  --text="$CHARS" \
  --output-file="$PROJECT_DIR/public/fonts/LXGWWenKai-Subset.woff2" \
  --flavor=woff2 \
  --layout-features='*'

echo "Subset font written to public/fonts/LXGWWenKai-Subset.woff2"
ls -lh "$PROJECT_DIR/public/fonts/LXGWWenKai-Subset.woff2"
