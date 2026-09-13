#!/bin/sh
# 검사가 쓰는 CDN 라이브러리를 tests/cdn/ 에 받아 둔다 (브라우저 검사는 인터넷 대신 이 파일을 준다).
# 파일 이름은 URL 에서 https:// 를 떼고 / 를 __ 로 바꾼 것 — e2e.js·run-stage-smoke.js 가 같은 규칙으로 찾는다.
set -e
D=$(cd "$(dirname "$0")" && pwd)/cdn
mkdir -p "$D"
for u in \
  https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js \
  https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js \
  https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js \
  https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js \
  https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js \
  https://cdn.jsdelivr.net/npm/docx@9.1.0/build/index.umd.js \
  https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js ; do
  f="$D/$(echo "$u" | sed 's#^https://##; s#/#__#g')"
  if [ -s "$f" ]; then echo "있음  $(basename "$f")"; continue; fi
  echo "받기  $u"; curl -fsSL --retry 3 -o "$f" "$u"
done
echo "cdn 준비 완료: $D"
