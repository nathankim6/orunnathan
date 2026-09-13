# oracle/ — ORUN ORACLE 소스와 검사

`parts/*` 가 소스, `build.sh` 가 이어 붙여 `../public/orun-oracle.html` 한 벌을 만든다. 앱 자체는 파일 하나이고
빌드 도구도 의존성도 없다 — 여기 `package.json` 은 검사(Playwright)용이다. 작업 순서와 규칙은 저장소 루트의
`AGENTS.md`(짧게) · `CLAUDE.md`(길게) 에 있다.

```sh
cd oracle
npm ci && npx playwright install --with-deps chromium && npm run cdn   # 처음 한 번
# parts/* 를 고친 뒤
npm run build   # → ../public/orun-oracle.html
npm test        # check(어긋남) · unit · e2e(모의 API·모의 Supabase) · stage(three.js)
```

## Codex 에서 쓰려면

1. chatgpt.com/codex → Settings → GitHub 을 연결하고 `nathankim6/orunnathan` 을 고른다.
2. Environment 를 만들 때 **Setup script** 에 아래를 넣는다. 설치 단계엔 인터넷이 필요하고, 그 뒤 검사는 인터넷 없이 돈다.
   ```sh
   cd oracle && npm ci && npx playwright install --with-deps chromium && npm run cdn
   ```
3. Codex 는 루트의 `AGENTS.md` 를 읽고 시작한다. 거기에 "parts 를 고치고 → `npm run build` → `npm test` → parts 와 public 파일을 함께 커밋" 이 적혀 있다.
4. PR 이 열리면 `.github/workflows/oracle-ci.yml` 이 같은 검사를 GitHub 에서 다시 돈다. `main` 에 합쳐지면 `pages.yml` 이 라이브로 올린다.

## 폴더

| 경로 | 무엇 |
|---|---|
| `parts/` | 소스 모듈 16개 (역할은 `AGENTS.md` 표) |
| `build.sh` | 조립. `ORACLE_STAMP` 환경변수로 도장을 고정할 수 있다 (어긋남 검사가 쓴다) |
| `tests/unit.js` | 빌드된 HTML 에서 모듈을 잘라 Node 에서 돌리는 단위 검사 |
| `tests/e2e.js` | Playwright 끝에서 끝까지. Anthropic·Supabase·Google Fonts·CDN 을 모두 가로채 오프라인으로 돈다 |
| `tests/mock-api.js` | 모의 LLM — 프롬프트의 `[작업]` 문구를 보고 그럴듯한 JSON 을 SSE 로 돌려준다 |
| `tests/run-stage-smoke.js` | `parts/40-post.js` + `41-stage.js` 만 얹은 페이지로 3D 무대를 검사 |
| `tests/fixtures/` | 교과서 범위·기출 2건·프린트 텍스트 픽스처 (`make-fixtures.js` 로 생성) |
| `tests/fetch-cdn.sh` | 검사용 CDN 라이브러리 내려받기 → `tests/cdn/` (git 에 안 올림) |
| `tests/check-build.sh` | parts 로 지은 결과 ↔ `public/orun-oracle.html` 어긋남 검사 |
| `tests/out/` | 스크린샷·생성된 검사 페이지 (git 에 안 올림) |
