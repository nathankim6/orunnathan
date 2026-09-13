# AGENTS.md — 이 저장소에서 일하는 코딩 에이전트에게 (Codex · Claude Code · 그 밖의 도구)

이 파일은 저장소를 처음 여는 에이전트가 알아야 할 것을 한 장에 모은 것이다. 더 긴 설명과
내력은 `CLAUDE.md` 에 있다. 두 파일이 어긋나면 `CLAUDE.md` 를 따르고, 이 파일을 고쳐 맞춘다.

## 무엇이 어디에 있나

| 경로 | 무엇 | 배포 |
|---|---|---|
| `oracle/parts/*` | **ORUN ORACLE** 소스 (출제자 성향 프로파일러 · 적중 모의고사). CSS·DOM·JS 모듈 16개 | `oracle/build.sh` 가 이어 붙여 `public/orun-oracle.html` 한 벌을 만든다 |
| `public/orun-oracle.html` | ORUN ORACLE 빌드 결과물. **손으로 고치지 않는다** | `main` 푸시 → `.github/workflows/pages.yml` → https://nathankim6.github.io/orunnathan/orun-oracle.html |
| `artifact/orun-mocktest.html` | 동형 모의고사 생성기 원본 | `public/mocktest-generator.html` 과 바이트가 같아야 한다 → `/` · `/mocktest-generator.html` · `/mock-exam.html` |
| `public/studio.html` · `orun-universe.html` · `orun-grammar.html` (+ `orun-universe.html` 이 쓰는 `public/three.min.js` · `public/orun-universe-poster.jpg`) | 그 밖의 정적 앱 | `pages.yml` 이 나열한 이 파일들만 `gh-pages` 로 나가고, 이 파일들(또는 `pages.yml`)이 바뀐 `main` 푸시에서만 워크플로가 돈다 |
| `src/`, `package.json`(루트), `supabase/` | Lovable 프로젝트 `orunquiz` 의 **옛** 스냅샷. 최신판은 별도 저장소 `nathankim6/orunquiz`(`projects/README.md`). 살아 있는 연결이 아니다 | 어디에도 배포되지 않는다. 여기서 개발하지 않는다 |
| `projects/` | Lovable 프로젝트 41개의 코드 사본. 폴더마다 `LOVABLE.md`, 목록은 `projects/README.md` | 배포되지 않고 Lovable 과 동기화되지 않는다 |

원칙 하나: **파일은 한 벌만 둔다.** 같은 HTML 의 사본을 다른 경로·다른 저장소·스튜디오에
만들지 않는다. 사본이 생기면 주소마다 다른 버전이 나간다.

루트의 `package.json` 은 Lovable 스냅샷용이다 — **오라클 명령은 모두 `oracle/` 안에서** 돌린다.

## ORUN ORACLE 을 고치는 순서

```sh
cd oracle
npm ci                                       # playwright (검사용). 앱 자체는 의존성이 없다
npx playwright install --with-deps chromium  # 크로미움이 없을 때만. PLAYWRIGHT_BROWSERS_PATH 나 CHROMIUM_PATH 에 이미 있으면 건너뛴다 — tests/browser.js 가 찾는다
npm run cdn                                  # 검사가 쓰는 CDN 라이브러리를 tests/cdn/ 에 받아 둔다 (한 번만)
```

크로미움을 찾았는지는 `node -e "console.log(require('./tests/browser.js').findChromium())"` 로 본다.

1. `oracle/parts/*` 를 고친다. 파일 하나가 모듈 하나다 (아래 표).
2. `cd oracle && npm run build` — `public/orun-oracle.html` 을 다시 짓는다. 빌드 도장(`build: YYYY-MM-DD HH:MM`, UTC)이 자동으로 찍힌다.
   도장은 빌드마다 바뀐다 — public 파일의 도장 줄 diff 는 정상이며 되돌리지 않는다.
3. `cd oracle && npm test` — 네 검사가 모두 통과해야 한다. API 키·인터넷 없이 돈다 (모의 API · 모의 Supabase · 받아 둔 CDN).
   - `npm run check` parts 로 지은 결과와 `public/orun-oracle.html` 이 같은가 (도장 줄만 빼고)
   - `npm run test:unit` 텍스트 파서·분석·프로파일·예측·검증 단위 검사
   - `npm run test:e2e` 브라우저에서 끝에서 끝까지 — 선생님 → 범위·프린트·기출 → 학습 → 반영율 → 예측 → 모의고사 → DOCX → 백업 → 클라우드 복원
   - `npm run test:stage` three.js 무대의 셰이더·이펙트가 오류 없이 도는가. 스크린샷은 `tests/out/`

   `check`·`unit`·`e2e` 는 **빌드된 `public/orun-oracle.html`** 을 읽는다(`ORACLE_FILE` 로 바꿀 수 있다). parts 만 고치고
   `npm run build` 를 빼먹으면 검사가 옛 파일을 본다. `stage` 만 `parts/40-post.js`·`41-stage.js` 를 직접 읽는다.
   기준값·규칙을 바꿨으면 `tests/unit.js` 에 그 기준을 직접 찍는 검사 한 줄을 더한다 — e2e 픽스처는 넓게만 보므로 통과가 곧 검증은 아니다.
4. `oracle/parts/*` 와 `public/orun-oracle.html` 을 **같은 커밋**에 넣는다. 고친 파일만 `git add` 한다 — `git add -A` 는 쓰지 않는다
   (작업트리에 도구 산출물이 생길 수 있다). CI(`.github/workflows/oracle-ci.yml`)가 `oracle/**` · `public/orun-oracle.html` · 워크플로 파일이
   바뀐 푸시·PR 마다 같은 검사를 GitHub 에서 다시 돈다 (설치 단계에만 인터넷을 쓴다).
5. 기본은 **작업 브랜치를 푸시하고 PR 을 여는 것까지**다. `main` 에 직접 푸시하지 않는다. 사용자가 "배포해 달라"(또는 매번 자동 반영을
   요청한 세션 — `CLAUDE.md` 의 규칙)일 때만 `main` 에 머지하고, `pages.yml` 이 `gh-pages` 를 다시 지은 뒤 라이브를 확인한다:
   `curl -sS https://nathankim6.github.io/orunnathan/orun-oracle.html | sha256sum` 이 `sha256sum public/orun-oracle.html` 과 같아야 끝이다. CDN 이 몇 분은 옛 파일을 준다.

파일 하나를 새로 만들지 말고, 어디를 고칠지 표에서 찾는다.

| 파일 | 역할 |
|---|---|
| `10-css.html` | 스타일 전부. 유리 HUD 패널, 다이얼, 시험지(`#paperPage`) 인쇄 CSS. 글꼴 변수 `--f`(Orbitron) `--fk`(Noto Sans KR) |
| `20-dom.html` | 화면 뼈대. 패널 `#pStatus #pIntel #pListen #pHelp #pData`, 독, 드로어, 시험지, 시트 껍데기(`#sheet`·`#sheetBody` — 내용은 `51-app-ui.js` 가 innerHTML 로 만든다) |
| `30-db.js` | IndexedDB `orun_oracle` 래퍼. 쓰기마다 `SYNC` 로 거울 |
| `31-extract.js` | 파일 → 텍스트 (pdf.js · docx · hwp/hwpx · xlsx · txt · 이미지 OCR) |
| `32-api.js` | Anthropic/OpenAI 호출. 키는 `localStorage`(`orun_api_key` 등, 생성기와 공유). 스트리밍·재시도·잘린 JSON 복구 |
| `33-text.js` | 정규화·셔글·문항 분리·정답표·파일 종류 추정(`guessKind`: exam/scope/handout)·시험 메타 추정 |
| `34-prompts.js` | 모델에 보내는 프롬프트 전부 (분류·데이터화·색인·프린트 색인·매칭·AI 판정·서술·보정·출제) |
| `35-analyze.js` | 데이터화 → 정규화, 범위/프린트 색인, 문항↔지문 매칭, 원문 대비 변형, AI 활용 신호, **프린트 반영율**(`reflection`) |
| `36-profile.js` | 결정적 프로파일(유형 분포·배점·난이도·변형 습관·어법 포인트·드리프트·신뢰도·레벨·프린트 반영) + 서술 |
| `37-predict.js` | 다음 시험 청사진(문항 계획·유력 지문·어법·신뢰도) + 모델 보정 + 생성기용 청사진 텍스트 |
| `38-generate.js` | 적중 모의고사 생성·검증·정화(sanitize)·시험지 HTML·DOCX(`FONT` 상수) |
| `39-sync.js` | Supabase `oracle_docs` 거울 (anon 키 · REST · 작업공간 `orun_oracle_ws`, 기본 `heukseok`) |
| `40-post.js` | 블룸·스트릭 후처리 (ORUN STUDIO 랜딩과 같은 모듈) |
| `41-stage.js` | three.js 무대: 힉스 필드 점, 다이얼 홀로그램, 코어, 바닥 링, 이펙트 `fx.ingest/thinking/learned/predict` |
| `50-app-core.js` | 앱 상태·큐·작업 실행(기출/범위/프린트)·학습·예측·출제·백업·씨앗 선생님(흑석고 윤은영·전정이) |
| `51-app-ui.js` | 패널·드로어·시트(`openSettings()` 등)·설정·토스트·독·2D 폴백 렌더링 |

- 빌드 순서는 `build.sh` 에 고정돼 있다 (`30-db` → … → `51-app-ui`). 새 모듈을 넣으면 거기에 이름을 더한다. `tests/unit.js` 는
  `  const TEXT = (function () {` … `GENERATE` 순서로 구획을 잘라 Node 에서 돌리므로, 그 사이에 모듈을 끼우거나 선언 모양을 바꾸면 `unit.js` 도 같이 고친다.
- `<script>` CDN 줄과 Google Fonts `<link>` 는 parts 가 아니라 `build.sh` 의 HEAD 에 있다. 글꼴을 더하거나 바꾸면 거기의 `family=` 목록을 고친다
  (e2e 는 fonts.googleapis 를 빈 CSS 로 가로채므로 검사로는 드러나지 않는다).
- 검사 픽스처를 바꾸려면 `tests/fixtures/make-fixtures.js` 를 고치고 `npm run fixtures` 로 다시 만든다. 모의 API(`tests/mock-api.js`)는 같은 텍스트를
  읽어 답을 만들고, **프롬프트 속 한국어 문구**(`[프린트 텍스트]`, "각 문항을 아래 필드로 데이터화합니다" 등)를 정규식으로 보고 어떤 답을 줄지 정한다 —
  `34-prompts.js` 의 문구를 바꾸면 `mock-api.js` 도 함께 고친다. 어긋나면 e2e 가 엉뚱한 단계에서 깨진다.

## ORUN ORACLE 에서 지키는 것

- **API 키는 브라우저에만.** `api.anthropic.com` / `api.openai.com` 으로만 보낸다. 서버·프록시·엣지 함수를 두지 않는다. 사용자 API 키를 파일이나 커밋에 넣지 않는다.
- **외부 스크립트는 cdnjs · jsdelivr 만, SRI(`integrity`) 고정.** 라이브러리를 더하거나 버전을 올리면 `build.sh` 의 `<script>` 줄(SRI 해시 포함)과
  `tests/fetch-cdn.sh` 목록을 함께 고치고 `npm run cdn` 을 다시 돌린다 (`run-stage-smoke.js` 는 three.js 주소를 `build.sh` 에서 읽는다).
- **`<!doctype html>` 표준 모드.** (생성기의 quirks 규칙은 이 파일에 해당 없음.)
- **글꼴**: 영문 Orbitron, 한글 Noto Sans KR. 인쇄용 시험지만 명조.
- **화면 시험지와 DOCX 는 같은 판형.** 한쪽만 고치지 않는다. 시험지 글꼴은 두 곳에 같은 이름으로 있다 — `10-css.html` 의 `#paperPage` font-family 와
  `38-generate.js` 의 `FONT` 상수(DOCX). 검사는 이 둘의 일치를 보지 않으므로 손으로 맞춘다.
- **Supabase**: 프로젝트 `wxjazdqabryflvfztujk`, 테이블 `public.oracle_docs`(id · workspace · store · teacher_id · data jsonb · updated_at), anon 키, 열린 RLS.
  브라우저 저장소가 작업본이고 클라우드는 거울이다. 삭제도 거울로 간다. 배경 영상(media)은 올리지 않는다. 파일 원본은 어디에도 저장하지 않는다(추출 텍스트만).
  테이블 DDL·RLS 는 이 저장소에 없다 — `supabase/` 는 다른 프로젝트(orunquiz 스냅샷)의 것이니 거기에 넣지 말고, 스키마 변경은 Supabase 대시보드/MCP 에서 한다.
  service_role 키는 절대 넣지 않는다.
- **파일 종류 셋**: 기출(exam) · 범위 원문(scope) · 선생님 프린트(handout). 프린트는 지문 + 어법·어휘·예상문제 포인트로 색인하고, 기출 문항마다 프린트 출처를 세어 반영율을 낸다. 예측은 프린트 지문을 과거 반영율만큼 우선한다.
- **첫 실행 씨앗**: 흑석고 윤은영(영어A) · 전정이(영어B). 설정 `seeded` 로 한 번만.
- 검사를 건너뛰거나 지우지 않는다. 깨진 검사는 원인을 고친다.

## 동형 모의고사 생성기 (`artifact/orun-mocktest.html`) 를 고칠 때

`CLAUDE.md` 의 1~7번을 매번 끝까지 밟는다: 회귀 검사(스크래치패드 `*.mjs`, Playwright) → 빌드 도장 `build: YYYY-MM-DD HH:MM` →
`public/mocktest-generator.html` 에 **같은 바이트**(`sha256sum` 이 같아야 한다) → 작업 브랜치 커밋·푸시 → `main` 머지·푸시 →
라이브 확인 `curl -sS https://nathankim6.github.io/orunnathan/mock-exam.html | sha256sum` 이 방금 배포한 해시와 같을 때까지 → 사용자에게 HTML 파일 보내기.

- `tools/sync-mock-exam.sh <파일>` 은 **`main` 체크아웃에서만** 쓴다 — public 으로 복사 → 커밋(영문 고정 메시지) → `git push origin main` → 라이브
  `/mock-exam.html` 의 sha256 이 따라올 때까지 최대 40×10초 기다린다. 작업 브랜치에서 돌리면 새 커밋이 푸시되지 않는다. 회귀 검사와 도장은 스크립트가 하지 않는다.
- `<!DOCTYPE>` 을 넣지 않는다 — A4 조판이 quirks mode 에 맞춰져 있다. 저장소 파일의 첫 줄은 `<meta charset="utf-8">` 이고 그대로 둔다.
  아티팩트 뷰어가 덧붙인 `<!doctype html>`·`<html>`·`<head>` 뼈대가 있으면 그 뼈대만 걷어낸다.
- 화면 미리보기와 워드(DOCX)·인쇄는 같은 판형이어야 한다. 키는 브라우저에만, 서버 없음.

## 커밋·브랜치

- 작업 브랜치에서 고치고 검사를 통과한 뒤 커밋한다. `main` 에 들어가면 곧 배포다 (위 5번 규칙).
- 커밋 메시지는 무엇을 왜 바꿨는지 한국어로 적는다. 생성된 파일(`public/orun-oracle.html`)은 그것을 만든 소스 변경과 같은 커밋에 둔다.
- `oracle/node_modules`, `oracle/tests/cdn`, `oracle/tests/out`, `.claude/worktrees` 는 올리지 않는다 (`.gitignore`).

## 하지 말 것

- `public/orun-oracle.html` 을 직접 편집 — `npm run check` 가 잡는다.
- HTML 사본 만들기 (스튜디오, Lovable, 다른 경로).
- `src/` 나 `projects/` 에서 개발 — Lovable 스냅샷이고 배포되지 않는다.
- 비밀 키·토큰을 파일에 넣기 (service_role 키, 사용자 API 키). 공개 anon/publishable 키는 예외다 — `39-sync.js` 의 anon 키와 루트 `.env` 의 `VITE_SUPABASE_*` 는 그대로 둔다.
- 검사를 끄거나 건너뛰기. `main` 에 직접 푸시하기. 다른 사람 브랜치의 역사를 다시 쓰기.
