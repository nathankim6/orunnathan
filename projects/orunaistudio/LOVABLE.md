# orunaistudio

Lovable 프로젝트를 코드 그대로 옮겨 온 사본입니다. (가져온 날짜: 2026-09-05 05:44 UTC)

| 항목 | 값 |
|---|---|
| Lovable 편집기 | https://lovable.dev/projects/48418b1c-d05d-42d0-a3f6-6cf8842f27f0 |
| 배포 주소 | https://orunaistudio.lovable.app |
| Lovable 마지막 수정 | 2026-05-16 |
| 데이터베이스 | 없음 |
| 파일 | 텍스트 80개 복사, 그림·미디어 11개 내려받음 |

## 실행 방법

```sh
npm install
npm run dev
```

잠금 파일(package-lock.json, bun.lock, bun.lockb)은 가져오지 않았습니다. 위 `npm install`이 새로 만듭니다.

## 2026-09-09 일부만 다시 맞춘 파일

UNIVERSE · GRAMMAR 가 화면에 뜨지 않고 파일로 내려받아지던 문제를 고치면서
아래 다섯 개만 Lovable 최신본(커밋 `ab12af6`)과 같게 맞췄습니다.

- `src/pages/EmbeddedApp.tsx` (새 파일)
- `src/App.tsx`
- `src/pages/Index.tsx`
- `src/index.css` (맨 아래 `.embed-*` 블록만 최신, 그 위는 09-05 사본)
- `src/assets/orun-english-logo.png.asset.json`

나머지 파일은 아직 2026-09-05 사본 그대로라 Lovable 쪽과 다릅니다.
특히 `src/components/MenuCard.tsx` 같은 옛 컴포넌트는 Lovable 에는 이미 없고,
`src/scene/orunScene.js`(Index 가 불러 씀)와 `public/orun-universe.html`(11.8MB),
`public/orun-grammar.html`(25MB), `public/orun-universe-poster.jpg` 는 여기에
없습니다. 그래서 이 사본만으로는 `npm run dev` 가 그대로 돌지 않습니다.
정본은 Lovable 프로젝트입니다.

## 가져오지 못한 파일

배포된 사이트에서 찾을 수 없어 비어 있습니다. "코드에서 사용" 표시가 없는 파일은 앱이 쓰지 않는 파일이라 없어도 됩니다. 사용 중인 파일은 Lovable 편집기에서 내려받아 같은 자리에 넣으면 됩니다.

- `src/assets/icons/management-icon.png`
- `src/assets/icons/test-icon.png`
- `src/assets/logos/claude-logo.png` (코드에서 사용)
- `src/assets/logos/gemini-logo.svg` (코드에서 사용)
- `src/assets/logos/openai-logo.svg` (코드에서 사용)
- `src/assets/logos/perplexity-logo.png` (코드에서 사용)
- `src/assets/quiz-maker-preview.png`
- `src/assets/workbook-maker-preview.png`
