#!/bin/sh
# parts/* 로 지은 결과가 public/orun-oracle.html 과 같은지 본다 (빌드 도장 줄만 빼고).
# 다르면 누군가 parts 만 고치고 다시 짓지 않았거나, public 파일을 손으로 고친 것이다.
set -e
S=$(cd "$(dirname "$0")/.." && pwd)
PUB="$S/../public/orun-oracle.html"
TMP=$(mktemp)
trap 'rm -f "$TMP" "$TMP.a" "$TMP.b"' EXIT
ORACLE_STAMP="0000-00-00 00:00" sh "$S/build.sh" "$TMP" >/dev/null
sed 's/build: [0-9-]* [0-9:]*/build: X/' "$TMP" > "$TMP.a"
sed 's/build: [0-9-]* [0-9:]*/build: X/' "$PUB" > "$TMP.b"
if cmp -s "$TMP.a" "$TMP.b"; then
  echo "ok   parts 와 public/orun-oracle.html 이 같다"
else
  echo "FAIL parts 로 지은 결과와 public/orun-oracle.html 이 다르다 — 'cd oracle && npm run build' 로 다시 짓고 둘을 함께 커밋하세요"
  diff "$TMP.a" "$TMP.b" | head -20 || true
  exit 1
fi
