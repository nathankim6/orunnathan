#!/bin/sh
# 부분 파일(parts/*)을 한 파일로 잇는다 → public/orun-oracle.html
# 쓰는 법:  cd oracle && npm run build      (또는 sh build.sh [출력경로])
# parts 를 고쳤으면 반드시 다시 짓고, parts 와 public 파일을 함께 커밋한다. public 파일을 손으로 고치지 않는다.
set -e
S=$(cd "$(dirname "$0")" && pwd)
OUT=${1:-$S/../public/orun-oracle.html}
STAMP=${ORACLE_STAMP:-$(date -u +"%Y-%m-%d %H:%M")}
{
cat <<'HEAD'
<!doctype html>
<html lang="ko">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ORUN ORACLE · 흑석고 출제 오라클</title>
<meta name="description" content="학교 기출문제와 시험범위 원문을 쌓아 선생님별 출제 성향을 학습하고, 다음 시험을 예측해 적중 동형 모의고사를 만드는 도구">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" integrity="sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" integrity="sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js" integrity="sha384-rNlaE5fs9dGIjmxWDALQh/RBAaGRYT5ChrzHo6tRfgrZ36iRFAiquP5g41Jsv+0j" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" integrity="sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js" integrity="sha384-SnzOobpRMLXZ52iJvZm/C0fYw0OQemTXzTjIsdsfMcrCtCEe9qgzxTd3RSklO5x2" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/docx@9.1.0/build/index.umd.js" integrity="sha384-LrP2iKGIDznkgkHfHqWN+9TUFjaXfyUTJgf6zsJx74Omjx0dqO4mHG8N9mngCdRI" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js" integrity="sha384-9EQoUIJYrv09/oYhSxnw1VpLcfPw3BM9dE7+D/3wGUPeLLa7F9Z6OAoD+i/M6FK9" crossorigin="anonymous"></script>
HEAD
cat "$S/parts/10-css.html"
cat "$S/parts/20-dom.html"
echo '<script>'
echo '(function () {'
echo '  "use strict";'
echo "  const BUILD = \"build: $STAMP\";"
for f in 30-db 31-extract 32-api 33-text 34-prompts 35-analyze 36-profile 37-predict 38-generate 39-sync 40-post 41-stage 50-app-core 51-app-ui; do
  cat "$S/parts/$f.js"; echo
done
cat <<'TAIL'
  // ---- 시작 ----
  window.ORACLE = { APP, UI, API, DB, SYNC, TEXT, ANALYZE, PROFILE, PREDICT, GENERATE, BUILD };
  function start() {
    UI.init();
    APP.boot().catch(e => { console.error(e); UI.toast("시작하지 못했어요: " + (e && e.message || e), { bad: true, ms: 12000 }); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
</script>
</html>
TAIL
} > "$OUT"
echo "built $OUT ($(stat -c%s "$OUT") bytes, $STAMP)"
