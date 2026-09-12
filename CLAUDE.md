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
| `/orun-oracle.html` | ORUN ORACLE — 출제자 성향 프로파일러 · 적중 모의고사 |
| `/orun-universe.html` , `/orun-grammar.html` | 그 밖의 앱 |

## 무엇이 무엇에 이어져 있나

생성기는 파일이 한 벌뿐이고, 그것을 보는 곳이 여럿이다. 아래 화살표는
"고치면 저절로 따라온다" 는 뜻이다.

```
artifact/orun-mocktest.html
  └─ public/mocktest-generator.html   (같은 바이트 · sha256 이 같아야 한다)
       └─ gh-pages                     (pages.yml 이 main 푸시에서 짓는다)
            ├─ /  ·  /mocktest-generator.html  ·  /mock-exam.html
            ├─ /studio.html            타일이 mock-exam.html 을 가리킨다
            └─ ORUN STUDIO (Lovable orunaistudio)
                 MOCK EXAM CREATOR 타일이
                 https://nathankim6.github.io/orunnathan/mock-exam.html 을 가리킨다
```

스튜디오는 생성기 사본을 들고 있지 않다. 그래서 여기서 배포하면 스튜디오가
여는 것도 같이 새것이 된다 — Lovable 을 다시 배포할 필요가 없다.
**스튜디오에 생성기 사본을 만들지 말 것.** 사본이 생기는 순간 이 화살표가 끊긴다.

GitHub Pages 는 `access-control-allow-origin: *` 를 준다. 다른 사이트가 이 파일을
`fetch` 로 받아 자기 화면에 띄우는 것도 되므로, 사본을 둘 이유는 어디에도 없다.

## ORUN ORACLE (출제자 성향 프로파일러) — `public/orun-oracle.html`

선생님 홀로그램(three.js)에 기출 시험지·시험범위 원문을 떨어뜨리면 문항 단위로
데이터화하고, 범위 지문과 매칭해 출제 성향을 학습(프로파일 v1, v2, …)한 뒤 다음 시험을
예측하고 적중 모의고사(화면·인쇄·DOCX)를 만든다. 파일은 **한 벌**(`public/orun-oracle.html`)이고
`pages.yml` 이 `/orun-oracle.html` 로 그대로 내보낸다. 스튜디오 타일 `ORUN ORACLE` 이
이 주소를 가리킨다.

- 조립: 스크래치패드의 `parts/*.js` 를 `build.sh` 가 한 파일로 잇는다. 세션이 끝나면 부분
  파일은 사라지므로, 이후 수정은 `public/orun-oracle.html` 을 직접 고친다. 구획 주석
  (`// ==== DB / EXTRACT / API / TEXT / PROMPTS / ANALYZE / PROFILE / PREDICT / GENERATE / POST / STAGE / APP / UI`)
  으로 나뉘어 있다.
- 키·모델 저장 키는 생성기와 같다(`orun_api_key` 등) — 같은 주소에서 키를 나눠 쓴다.
  API 는 브라우저에서 `api.anthropic.com` / `api.openai.com` 으로만 간다. 서버 없음.
- 저장은 IndexedDB `orun_oracle`. 파일 원본은 저장하지 않는다(추출 텍스트만).
- 회귀 검사: Playwright e2e(모의 API) 가 스크래치패드 `tests/e2e.js` 에 있다. 고쳤으면
  돌리고, 빌드 도장(`build: YYYY-MM-DD HH:MM`) 을 올리고, `main` 에 머지해 라이브를 확인한다
  (`curl -sS https://nathankim6.github.io/orunnathan/orun-oracle.html | sha256sum`).
- `<!doctype html>` 을 쓴다(표준 모드). 생성기의 quirks 규칙은 이 파일에 적용되지 않는다.

## Lovable — 여기서 고친 것이 가지 않는 곳

| Lovable 프로젝트 | 사는 곳 | 이 저장소와의 관계 |
|---|---|---|
| `orunaistudio` (ORUN STUDIO) | orunaistudio.lovable.app | 없음. 타일 링크로만 이어진다 |
| `orunquiz` (QUIZ MAKER) | orunquiz.lovable.app | `src/`·`package.json` 이 그 스냅샷이다 |

`src/` 는 `orunquiz` 를 한 번 떠 온 것이고, **살아 있는 연결이 아니다.**
여기서 고쳐도 Lovable 로 가지 않고, Lovable 에서 고친 것도 여기로 오지 않는다.
지금 이 저장소에서 `npm run build` 로 나오는 것은 어디에도 배포되지 않는다.

이어 붙이는 길은 하나뿐이다 — Lovable 편집기에서 GitHub 을 연결하는 것.
그 버튼은 Lovable UI 에만 있어 MCP 로는 누를 수 없다(`add_connector` 도
대시보드 주소만 돌려준다). 연결하면 Lovable 이 그 프로젝트만의 저장소를
새로 만든다. 이 저장소에 합쳐지지 않는다 — 같은 경로에 다른 내용과 다른
역사가 이미 있기 때문이다.

연결이 끝나 저장소 이름을 받으면, 그 저장소를 세션에 붙여(`add_repo`) 거기서
직접 고친다. 그때 `src/` 스냅샷은 지운다 — 두 벌을 남기면 어느 쪽이 원본인지
모르게 된다.

## 생성기를 고칠 때 지키는 것

- API 키는 브라우저에만 두고 `api.anthropic.com` / `api.openai.com` 으로만 보낸다.
  서버를 두지 않는다.
- `<!DOCTYPE>` 를 넣지 않는다 — A4 조판이 quirks mode 에서 맞춰져 있다.
  첫 줄의 `<meta charset="utf-8">` 은 지운다.
- 화면 미리보기와 워드(DOCX)·인쇄는 같은 판형이어야 한다. 한쪽만 고치지 않는다.
