#!/bin/bash
# ===========================================================================
#  옳은영어 · 동형 모의고사 연결 (macOS · Linux)
#  두 번 누르면 끝납니다. 선생님이 하실 일은 첫 회 로그인 한 번뿐입니다.
#
#  하는 일 — Node 확인 → 도구 확인 → 로그인 확인 → 브리지 내려받아 켜기 →
#            코드가 들어간 주소로 생성기 열기. 코드를 옮겨 적지 않습니다.
#
#  이 창은 쓰시는 동안 켜 두세요. 끄면 연결이 끊깁니다.
#  (맥에서 "열 수 없습니다" 가 뜨면 파일을 오른쪽 눌러 '열기' 를 고르세요.)
# ===========================================================================
set -u
cd "$(dirname "$0")" || exit 1

APP="https://nathankim6.github.io/orunnathan/mock-exam.html"
BRIDGE_URL="https://nathankim6.github.io/orunnathan/orun-bridge.mjs"
PORT="${ORUN_PORT:-8787}"
TOKENFILE=".orun-code"

open_url() {
  if command -v open >/dev/null 2>&1; then open "$1"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$1" >/dev/null 2>&1
  else echo "   브라우저에서 직접 여세요: $1"; fi
}
die() { echo; echo "   ! $1"; echo; read -r -p "   엔터를 누르면 창이 닫힙니다. " _; exit 1; }

echo
echo "  옳은영어 · 동형 모의고사 연결"
echo "  ------------------------------------------------------------"
echo

# ── 1. Node ────────────────────────────────────────────────────────────────
if ! command -v node >/dev/null 2>&1; then
  echo "  [1/5] Node.js 를 깝니다..."
  if command -v brew >/dev/null 2>&1; then
    brew install node || true
  fi
fi
command -v node >/dev/null 2>&1 || die "Node.js 를 찾지 못했습니다. nodejs.org 에서 LTS 를 설치한 뒤 다시 눌러 주세요."
echo "  [1/5] Node.js $(node -v)  준비됨"

# ── 2. 도구 (Claude Code 우선, 없으면 Codex) ────────────────────────────────
AGENT=""
command -v claude >/dev/null 2>&1 && AGENT="claude"
[ -z "$AGENT" ] && command -v codex >/dev/null 2>&1 && AGENT="codex"
if [ -z "$AGENT" ]; then
  echo "  [2/5] Claude Code 를 깝니다..."
  npm i -g @anthropic-ai/claude-code || true
  command -v claude >/dev/null 2>&1 && AGENT="claude"
fi
[ -n "$AGENT" ] || die "Claude Code 를 깔지 못했습니다. 터미널에서 npm i -g @anthropic-ai/claude-code 를 넣어 보시고 나오는 글을 알려 주세요."
echo "  [2/5] $AGENT  준비됨"

# ── 3. 로그인 ──────────────────────────────────────────────────────────────
probe() {
  if [ "$AGENT" = "claude" ]; then
    echo ping | claude -p --output-format text >/dev/null 2>&1
  else
    echo ping | codex exec --json --sandbox read-only --skip-git-repo-check - >/dev/null 2>&1
  fi
}
echo "  [3/5] 로그인을 확인합니다..."
if ! probe; then
  echo
  echo "  로그인이 필요합니다. 곧 $AGENT 가 열립니다."
  echo "  브라우저에서 로그인을 마친 뒤, 그 창을 닫고 여기로 돌아오세요."
  echo
  read -r -p "  엔터를 누르면 $AGENT 가 열립니다. " _
  "$AGENT" || true
  echo
  echo "  로그인을 다시 확인합니다..."
fi
probe || die "아직 로그인이 안 돼 있습니다. 터미널에서 $AGENT 를 한 번 실행해 로그인한 뒤 다시 눌러 주세요."
echo "  [3/5] 로그인 확인됨"

# ── 4. 브리지 ──────────────────────────────────────────────────────────────
echo "  [4/5] 브리지를 내려받습니다..."
curl -fsSL "$BRIDGE_URL" -o orun-bridge.mjs || die "브리지 파일을 받지 못했습니다. 인터넷 연결을 확인해 주세요."

# 코드는 한 번만 만들고 그다음부터 그대로 쓴다 — 주소가 매번 바뀌지 않게
if [ -f "$TOKENFILE" ]; then
  CODE="$(tr -d ' \r\n' < "$TOKENFILE")"
else
  CODE="$(node -e "const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(const n of require('crypto').randomBytes(6))s+=a[n%a.length];console.log(s)")"
  printf '%s' "$CODE" > "$TOKENFILE"
  chmod 600 "$TOKENFILE" 2>/dev/null || true
fi

# ── 5. 켜고 연다 ───────────────────────────────────────────────────────────
echo "  [5/5] 생성기를 엽니다..."
open_url "$APP#connect=$CODE@http://127.0.0.1:$PORT"
echo
echo "  ------------------------------------------------------------"
echo "  이어졌습니다. 이 창은 쓰시는 동안 켜 두세요."
echo "  끝내시려면 Ctrl+C 를 누르거나 창을 닫으시면 됩니다."
echo "  ------------------------------------------------------------"
echo

node orun-bridge.mjs --port "$PORT" --token "$CODE"
