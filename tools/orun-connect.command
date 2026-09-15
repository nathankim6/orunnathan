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
#
#  이 창은 무슨 일이 있어도 혼자 닫히지 않습니다. 멈추면 까닭을 적고 기다립니다.
#  적힌 글은 파일 옆 orun-connect.log 에도 그대로 남습니다.
# ===========================================================================
# ── 0. 윈도우식 줄바꿈으로 저장돼 와도 스스로 고쳐 돈다 ───────────────────
# 줄 끝에 CR 이 붙어 오면 여기 아래가 통째로 안 읽힌다 — 그래서 이 한 줄이 맨 앞이다.
# (한 줄짜리 단순한 꼴이라 CR 이 붙어도 이 줄만은 읽힌다. 고친 사본으로 옮겨 탄다.)
grep -q "$(printf '\015')" "$0" 2>/dev/null && exec bash -c 'f=$(printf %s "$1" | tr -d "\015"); t="${TMPDIR:-/tmp}/orun-connect-$$.sh"; tr -d "\015" < "$f" > "$t" || exit 1; chmod 700 "$t"; ORUN_HOME=$(dirname "$f"); export ORUN_HOME; exec bash "$t"' orun "$0"

set -u

SELF="$0"; case "$SELF" in /*) ;; *) SELF="$PWD/$SELF" ;; esac
cd "${ORUN_HOME:-$(dirname "$SELF")}" 2>/dev/null || cd "$(dirname "$SELF")" || exit 1

LOG="$PWD/orun-connect.log"
( : > "$LOG" ) 2>/dev/null || LOG="${TMPDIR:-/tmp}/orun-connect.log"
exec > >(tee "$LOG") 2>&1

finish() {
  RC=$?
  echo
  echo "  ------------------------------------------------------------"
  if [ "$RC" -eq 0 ]; then
    echo "  끝났습니다."
  else
    echo "  ! 여기서 멈췄습니다. (멈춤 번호 $RC)"
    echo "    바로 위에 적힌 글을 그대로 알려 주시면 고쳐 드립니다."
  fi
  echo "    적어 둔 곳: $LOG"
  echo "  ------------------------------------------------------------"
  [ -t 0 ] && read -r -p "  엔터를 누르면 창이 닫힙니다. " _
  case "$SELF" in */orun-connect-*.sh) rm -f "$SELF" 2>/dev/null ;; esac
  return 0
}
trap finish EXIT

APP="${ORUN_APP:-https://nathankim6.github.io/orunnathan/mock-exam.html}"
BRIDGE_URL="${ORUN_BRIDGE_URL:-https://nathankim6.github.io/orunnathan/orun-bridge.mjs}"
PORT="${ORUN_PORT:-8787}"
TOKENFILE=".orun-code"

open_url() {
  if command -v open >/dev/null 2>&1; then open "$1"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$1" >/dev/null 2>&1
  else echo "   브라우저에서 직접 여세요: $1"; fi
}
die() { echo; echo "   ! $1"; exit 1; }

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
NODEV="$(node -v 2>/dev/null || echo '?')"
NODEMAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
case "$NODEMAJOR" in
  ''|*[!0-9]*) NODEMAJOR=0 ;;
esac
[ "$NODEMAJOR" -ge 18 ] || die "Node.js 가 너무 오래됐습니다 ($NODEV). nodejs.org 에서 LTS(18 이상)를 깔고 다시 눌러 주세요."
echo "  [1/5] Node.js $NODEV  준비됨"

# 코드는 한 번만 만들고 그다음부터 그대로 쓴다 — 주소가 매번 바뀌지 않게
HADCODE=""
if [ -f "$TOKENFILE" ]; then
  CODE="$(tr -d ' \r\n' < "$TOKENFILE")"
  HADCODE="1"
fi
if [ -z "${CODE:-}" ]; then
  CODE="$(node -e "const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(const n of require('crypto').randomBytes(6))s+=a[n%a.length];console.log(s)")" \
    || die "코드를 만들지 못했습니다. Node.js 가 제대로 깔렸는지 확인해 주세요."
  printf '%s' "$CODE" > "$TOKENFILE"
  chmod 600 "$TOKENFILE" 2>/dev/null || true
  HADCODE=""
fi

# ── 문 번호 — 이미 쓰이고 있으면 비껴간다 ──────────────────────────────────
# 예전에 켜 둔 창이 아직 살아 있으면 새 브리지는 곧바로 죽는다. 그래서 먼저 본다.
port_taken() {
  node -e 'const n=require("net"),s=n.createServer();s.once("error",e=>process.exit(e.code==="EADDRINUSE"?3:0));s.once("listening",()=>s.close(()=>process.exit(0)));s.listen(+process.argv[1],"127.0.0.1")' "$1" >/dev/null 2>&1
  [ "$?" = "3" ]
}
bridge_here() {
  node -e 'fetch("http://127.0.0.1:"+process.argv[1]+"/health").then(r=>r.json()).then(j=>process.exit(j&&j.name==="orun-bridge"?0:1)).catch(()=>process.exit(1))' "$1" >/dev/null 2>&1
}

if port_taken "$PORT"; then
  if [ -n "$HADCODE" ] && bridge_here "$PORT"; then
    echo
    echo "  이미 켜져 있습니다. 새로 켜지 않고 그대로 씁니다."
    echo "  (먼저 열어 둔 검정 창을 닫지 마세요 — 그 창이 연결을 잡고 있습니다.)"
    echo
    echo "  [5/5] 생성기를 엽니다..."
    open_url "$APP#connect=$CODE@http://127.0.0.1:$PORT"
    echo
    echo "  이 창은 닫으셔도 됩니다."
    exit 0
  fi
  NEWPORT=""
  for k in 1 2 3 4 5 6 7 8; do
    p=$((PORT + k))
    if ! port_taken "$p"; then NEWPORT="$p"; break; fi
  done
  [ -n "$NEWPORT" ] || die "$PORT 번 문이 쓰이고 있고 대신 쓸 번호도 못 찾았습니다. 컴퓨터를 다시 켠 뒤 눌러 주세요."
  echo "  ($PORT 번 문이 쓰이고 있어 $NEWPORT 번으로 옮깁니다)"
  PORT="$NEWPORT"
fi

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
show_probe() {
  if [ "$AGENT" = "claude" ]; then
    echo ping | claude -p --output-format text
  else
    echo ping | codex exec --sandbox read-only --skip-git-repo-check -
  fi
}
echo "  [3/5] 로그인을 확인합니다..."
if ! probe; then
  echo
  echo "  로그인이 필요합니다. 곧 $AGENT 가 열립니다."
  echo "  브라우저에서 로그인을 마친 뒤, 그 창을 닫고 여기로 돌아오세요."
  echo
  [ -t 0 ] && read -r -p "  엔터를 누르면 $AGENT 가 열립니다. " _
  "$AGENT" || true
  echo
  echo "  로그인을 다시 확인합니다..."
fi
# 확인이 안 돼도 여기서 끝내지 않는다 — 확인하는 방법이 도구 판마다 달라
# 멀쩡히 로그인된 분을 막아 세우는 일이 생긴다. 진짜 판정은 아래 브리지 표가 한다.
if probe; then
  echo "  [3/5] 로그인 확인됨"
else
  echo
  echo "  로그인 확인이 되지 않습니다. $AGENT 가 뭐라고 하는지 그대로 보여 드립니다 —"
  echo "  ............................................................"
  show_probe 2>&1 | sed 's/^/  /' | head -20
  echo "  ............................................................"
  echo
  echo "  그래도 켜 보겠습니다. 잠시 뒤 나오는 표에서 $AGENT 가"
  echo "  \"준비됨\" 이면 그대로 쓰시면 되고, \"없음\" 이면 로그인이 덜 된 것입니다."
fi

# ── 4. 브리지 ──────────────────────────────────────────────────────────────
echo "  [4/5] 브리지를 내려받습니다..."
curl -fsSL "$BRIDGE_URL" -o orun-bridge.mjs || die "브리지 파일을 받지 못했습니다. 인터넷 연결을 확인해 주세요."

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
