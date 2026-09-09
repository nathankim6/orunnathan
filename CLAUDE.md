# 이 저장소에서 일하는 법

## 동형 모의고사 생성기 — 고치면 바로 배포한다

원본은 `artifact/orun-mocktest.html` 한 파일이다. 이 파일을 고쳤으면 **매번**
아래 순서를 끝까지 밟는다. "나중에 한꺼번에" 는 없다 — 사용자가 매번 자동
반영을 요청했다.

1. 회귀 검사를 돌린다 (스크래치패드의 `*.mjs`, Playwright). 통과해야 다음으로 간다.
2. 빌드 도장을 올린다 — 파일 안 `build: YYYY-MM-DD HH:MM`.
3. 같은 바이트를 **두 곳**에 둔다. 둘의 sha256 이 같아야 한다.
   - `artifact/orun-mocktest.html` (원본)
   - `public/mocktest-generator.html` (공개본 한 벌)
   워크플로가 이 한 벌을 `index.html` · `mocktest-generator.html` ·
   `mock-exam.html` 세 이름으로 함께 내보낸다. 사본을 더 만들지 않는다.
4. 작업 브랜치에 커밋·푸시한다.
5. `main` 에 머지하고 푸시한다. `.github/workflows/pages.yml` 이 `main` 푸시에서
   돌아 `gh-pages` 를 다시 짓는다.
6. 라이브가 따라올 때까지 확인한다 —
   `curl -sS https://nathankim6.github.io/orunnathan/mock-exam.html | sha256sum`
   가 방금 배포한 해시와 같아야 끝이다. CDN 이 한두 번은 옛 파일을 준다.
7. 사용자에게 HTML 파일을 보낸다 (`SendUserFile`). 고칠 때마다 준다.

`tools/sync-mock-exam.sh` 는 아티팩트 파일을 받아 3~6번을 대신 해 준다.

주소가 셋인 것은 예전에 사본을 두 벌 두던 흔적이다. 주소는 그대로 지키되
파일은 한 벌만 둔다 — 사본이 둘이면 주소마다 다른 버전이 나간다.

## 배포되는 것들

Pages 는 `gh-pages` 브랜치를 읽고, 그 브랜치에는 워크플로가 나열한 파일만 둔다.
`public/` 의 나머지와 저장소의 다른 파일은 웹으로 열리지 않는다.

| 주소 | 나오는 파일 |
|---|---|
| `/` , `/mocktest-generator.html` , `/mock-exam.html` | 동형 모의고사 생성기 |
| `/studio.html` | ORUN STUDIO 랜딩 (타일이 `/mock-exam.html` 을 가리킨다) |
| `/orun-universe.html` , `/orun-grammar.html` | 그 밖의 앱 |

## Lovable

`src/`·`package.json` 의 Vite+React 프로젝트는 Lovable 에서 한 번 떠 온 스냅샷이다.
Lovable 편집기는 이 저장소를 자기 소스로 읽지 않는다 — 연결은 Lovable UI 에서만
할 수 있다. 그러니 여기서 고친 것이 Lovable 사이트에 저절로 가지 않는다.

## 생성기를 고칠 때 지키는 것

- API 키는 브라우저에만 두고 `api.anthropic.com` / `api.openai.com` 으로만 보낸다.
  서버를 두지 않는다.
- `<!DOCTYPE>` 를 넣지 않는다 — A4 조판이 quirks mode 에서 맞춰져 있다.
  첫 줄의 `<meta charset="utf-8">` 은 지운다.
- 화면 미리보기와 워드(DOCX)·인쇄는 같은 판형이어야 한다. 한쪽만 고치지 않는다.
