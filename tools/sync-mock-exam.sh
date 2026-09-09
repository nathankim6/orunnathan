#!/bin/sh
# 동형 모의고사 생성기 재동기화.
#
#   tools/sync-mock-exam.sh <아티팩트를 내려받은 파일 경로>
#
# 원본 아티팩트는 소유자만 열 수 있어서, 같은 바이트를 public/mock-exam.html 로
# 복사해 Pages 가 대신 공개한다. 이 스크립트는 그 복사본이 원본과 같은지 보고
# 다르면 새로 올린다. 같으면 아무것도 하지 않는다.
set -e
src="$1"
[ -n "$src" ] || { echo "사용법: $0 <아티팩트 파일>"; exit 2; }
[ -f "$src" ] || { echo "파일이 없습니다: $src"; exit 2; }

repo=$(cd "$(dirname "$0")/.." && pwd)
dst="$repo/public/mock-exam.html"
url=https://nathankim6.github.io/orunnathan/mock-exam.html

new=$(sha256sum "$src" | cut -d' ' -f1)
old=$(sha256sum "$dst" | cut -d' ' -f1)
echo "원본  $new  ($(stat -c%s "$src") bytes)"
echo "배포본 $old  ($(stat -c%s "$dst") bytes)"

if [ "$new" = "$old" ]; then
  echo "변경 없음"
  exit 0
fi

cp "$src" "$dst"
cd "$repo"
git add public/mock-exam.html
git -c user.name="Claude" -c user.email="noreply@anthropic.com" \
    commit -q -m "Refresh the hosted mock exam generator from its artifact"

i=1
until git push -u origin main; do
  [ $i -gt 4 ] && { echo "푸시 실패"; exit 1; }
  d=$((2 ** i)); echo "재시도 ${d}초"; sleep $d; i=$((i + 1))
done

# Pages 워크플로가 gh-pages 를 다시 짓는다. 라이브가 따라올 때까지 본다.
i=0
while [ $i -lt 40 ]; do
  i=$((i + 1))
  live=$(curl -sS "$url" | sha256sum | cut -d' ' -f1)
  if [ "$live" = "$new" ]; then echo "라이브 반영됨 ($i회 확인)"; exit 0; fi
  sleep 10
done
echo "라이브가 아직 옛 파일입니다: $live"
exit 1
