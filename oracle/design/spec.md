# ORUN ORACLE — 출제자 세컨드 브레인 · 최종 명세

> 세 제안(graph-first · database-first · capture-ask-first)과 세 심사평을 합쳐 쓴 **하나의 구현 명세**다.
> 뼈대는 graph-first 의 "모든 것이 노트 + 모든 노트에 주소" 이고, 첫 화면과 매일의 고리(인박스 · 오늘 피드 · 다음에 할 일 · 물어보기)는
> capture-ask-first 에서, 표 뷰 · 메모 anchor 분리 · 삭제 규칙 · 배터리(rAF 정지) · 단계별 롤아웃은 database-first 에서 가져왔다.
> 심사평의 graft 항목은 전부 반영했고 missing 항목은 §3.13 · §4 · §9 에 하나씩 답이 있다.
> 이 문서는 `oracle/parts/*` 현재 코드(2026-09-14, 커밋 `dfcac6f`)를 다시 열어 실제 함수 · 저장소 · DOM id 와 맞췄다.
> **id 와 함수 시그니처는 계약이다.** 구현자는 이 문서만 보고 병렬로 만든다. 문서와 코드가 어긋나면 문서를 고치고 그 커밋에 함께 넣는다.

---

## 0. 한눈에

| 항목 | 결정 |
|---|---|
| 제품명 | **ORUN ORACLE** 그대로. 부제 "출제자 세컨드 브레인" (`#brandSub` = "흑석고 영어 · 출제자 세컨드 브레인") |
| 파일 · 주소 | `public/orun-oracle.html` 한 벌, `/orun-oracle.html` 그대로. 소스는 `oracle/parts/*` |
| 첫 화면 | **오늘** (`#/today`) — 인박스 + 성장 지표 + 다음에 할 일 + 최근 캡처 + 물어보기 입력. 설정으로 브레인을 첫 화면으로 바꿀 수 있다 |
| 뼈대 | 왼쪽 `#nav`(240) · 가운데 `#main` · 오른쪽 `#aside`(320) · 위 `#topbar`(48) · 아래 `#statusbar`(28). 좁은 화면은 `#tabbar` |
| 모든 것이 노트 | 선생님 · 시험 · 문항 · 지문 · 자료(범위/프린트) · 프로파일 · 예측 · 모의고사 · 자유 메모 · 질문 — 열 가지가 한 벌의 노트 템플릿(`#vNote`)으로 그려지고 `#/n/<id>` 주소를 가진다 |
| 내 메모 | 원 문서에 넣지 않고 `notes` 저장소에 `anchorKey` 로 붙인다. `[[링크]]` · `#태그` · 백링크 |
| 검색 · 명령 | ⌘K 팔레트(`#cmdk`) — 로컬 역색인(BM25, 한글 2-gram) + 원문 substring + 명령 + 태그 + `?` 질문 |
| 물어보기 | RAG: 구조 근거(프로파일 · 예측 숫자) + 검색 근거 → 스트리밍 답 + `[n]` 인용 → 노트로 저장, 인용은 `links(kind:"cite")` |
| 3D | 첫 화면에서 빠지고 **브레인 뷰**(`#/brain`)가 된다. 지연 생성, 뷰를 떠나면 `pause()`. 2D 폴백 유지 |
| 새 저장소 | `notes` · `links` · `tags` (IndexedDB VERSION 1 → 2, 추가만). Supabase 거울에 셋을 더한다 |
| 새 모듈 | `42-index.js` INDEX · `43-links.js` LINKS · `44-notes.js` NOTES · `45-ask.js` ASK · `46-graph2d.js` GRAPH2D · `51-router.js` ROUTE · UI 를 `52-app-shell.js` · `53-ui-note.js` · `54-ui-views.js` · `55-ui-brain.js` 로 나눈다 |
| 글꼴 | `body` 는 `--f`(Orbitron 우선) 유지 — 규칙의 문자와 e2e 검사를 지킨다. `#main #nav #aside #cmdk .toast #sheetBody button input textarea` 는 `--fk`. Orbitron 은 `.en .num .kicker .badge kbd` 에만 |
| 밝기 | 어두운 화면 유지("밤의 서재"). 유리 · 글로우 · 코너 장식은 브레인 뷰의 `.hud` 에만 |

---

## 1. 컨셉 · 이름 · 느낌

### 1.1 한 문단

ORUN ORACLE 은 "흑석고 영어 선생님 한 분의 머릿속을 내 쪽에 복제해 두는 두뇌" 다. 시험지 한 장, 프린트 한 장, 교과서 범위 한 벌을 인박스에 떨어뜨리면(**Capture**) 두뇌는 그것을 문항 · 지문 · 포인트라는 **노트**로 쪼개고, 문항은 지문에, 지문은 프린트에, 프린트는 시험에 **링크**로 이어 붙이며(**Organize**), 링크가 쌓이면 "이 선생님은 이렇게 낸다" 는 **프로파일 노트**로 증류하고(**Distill**), 그것을 근거 삼아 예측 청사진과 적중 모의고사를 **표현**한다(**Express**). 강사는 어느 노트에든 자기 메모를 적고 `[[링크]]` 와 `#태그` 로 잇고, 두뇌에게 묻는다. 두뇌는 강사의 메모를 다음 학습의 서술에 반영한다 — 사람 말을 배우는 통로가 있다.

### 1.2 느낌 — 세컨드 브레인의 어떤 면을 어떻게

- **넣을수록 자란다.** 오늘 화면 위쪽에 문항 · 지문 · 프린트 반영율 · 프로파일 버전 · 내 메모 수와 8주 스파크라인이 선다(파생 "링크 수" 는 지표로 쓰지 않는다 — 강사에게 의미가 없다). 파일이 끝나면 "문항 +7 (총 21) · 매칭 6/7" 토스트와 사이드바 지표의 짧은 펄스.
- **조용하고 글 중심.** 유리 HUD 다섯 장이 동시에 빛나던 화면 대신 한 번에 노트 한 장. 왼쪽 목차, 가운데 글(최대 폭 760px), 오른쪽 이 글에 이어진 것들. 빛은 상태(동기화 중 · 학습 중 · 방금 들어온 것)에만 쓴다.
- **모든 것이 노트.** 속성 표 → 본문 → 내 메모 → 링크 → 백링크. 같은 자리에 같은 것이 있다는 예측 가능성이 곧 "내 것" 이라는 느낌이다.
- **넣기 · 묻기 · 고치기.** 강사가 하는 일은 셋뿐이다. 오늘 화면 = 인박스 + 오늘 피드 + 다음에 할 일 + 물어보기.
- **JARVIS 는 브레인 뷰로 산다.** 홀로그램 다이얼과 유형 별자리는 이미 그래프였다. 시험 · 지문 · 문항 · 프린트 · 메모 노드와 링크를 얹으면 그대로 "브레인 뷰" 다. `G` 로 연다. 사용자가 그리워하면 설정에서 첫 화면을 브레인으로 바꾼다.

### 1.3 이름

- 제품명 `ORUN ORACLE` (Orbitron 800). 상단 부제 `#brandSub`: "{학교} 영어 · 출제자 세컨드 브레인". `<title>` = "ORUN ORACLE · 출제자 세컨드 브레인".
- 화면 이름(한국어 UI): 오늘 · 인박스 · 서재 · 브레인 · 타임라인 · 물어보기 · 설정. 영어는 아이브로우(TODAY · INBOX · LIBRARY · BRAIN · TIMELINE · ASK)와 숫자 · 라벨에만.

---

## 2. IA · 내비게이션 · 와이어프레임 · DOM id

### 2.1 라우트 (해시 라우터 `ROUTE`)

| 주소 | 뷰 컨테이너 | 내용 |
|---|---|---|
| `#/today` | `#vToday` | 오늘 (기본. 설정 `home:"brain"` 이면 `#/brain`) |
| `#/inbox` | `#vInbox` | 인박스 — 드롭 · 고르기 · 사진 찍기 · 빠른 메모 · 큐 |
| `#/n/<id>` | `#vNote` (`data-kind`) | 노트 페이지. id 접두로 종류를 안다 (§4.1) |
| `#/tag/<이름>` | `#vTag` | 태그 페이지 |
| `#/all/<kind>[?…]` | `#vLibrary` (`data-kind`) | 서재 목록. kind = `exams` `questions` `passages` `sources` `profiles` `predictions` `mocks` `notes`. 쿼리: `q` `type` `tag` `hit=1` `year` `kind=프린트` `matched=0` `ext=1` `exam=<e_id>` `passage=<p_id>` `diff=상\|중\|하` `genre=<장르>` `sort` `dir` |
| `#/brain[?focus=<id>]` | `#vBrain` | 브레인(3D 그래프 · 2D 폴백) |
| `#/timeline[?week=YYYY-MM-DD]` | `#vTimeline` | 타임라인 · 데일리 로그 · 주간 집계 |
| `#/ask[?q=&ctx=<id>]` | `#vAsk` | 물어보기 |
| `#/search?q=` | `#vSearch` | 검색 결과 전체 목록 |

규칙
- 모든 `.view` 는 항상 DOM 에 있고 `hidden` 속성으로만 토글한다(스크롤 위치 · 폼 상태 유지). 활성 뷰는 `#main[data-view="today|inbox|note|tag|library|brain|timeline|ask|search"]` 로도 표시한다.
- 선생님 범위는 주소에 없고 `APP.state.selectedId` 다(`"*"` = 모든 선생님). 다른 선생님의 노트를 열면 `APP.select(teacherId, true)` 로 조용히 따라간다.
- 오버레이(시트 `#sheetWrap` · 시험지 `#paper` · 팔레트 `#cmdk` · 메뉴 · 자동완성 `#acPop` · 미리보기 `#asidePeek`)는 히스토리에 넣지 않는다. 라우트가 바뀌면 오버레이는 먼저 닫힌다. 브라우저 뒤로가기는 라우트만 바꾼다.
- 옛 호출 어댑터: `UI.openDrawer(kind, id)` 는 남기되 내부에서 라우팅한다 — `exam|question|passage|source` → `#/n/<id>`, `handouts` → `#/all/sources?kind=프린트`, `mocks` → `#/all/mocks`.
- 알 수 없는 주소 · 없는 id → `#/today` 로 replace 하고 토스트 "그 노트는 없어요".

### 2.2 데스크톱 골격 (1440)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ #topbar  ORUN ORACLE  흑석고 영어 · 출제자 세컨드 브레인   [⌘K 검색 · 명령 · 질문…]  ●OPUS 5 ●CLOUD ? ⚙ ] │ 48
├────────────┬───────────────────────────────────────────────────────────┬─────────────────────┤
│ #nav 240   │ #main                                                     │ #aside 320          │
│ ▾ 윤은영    │  #crumbs  윤은영 › 시험 › 2025 1학기 중간                     │  이 노트             │
│   영어A  V3 │                                                           │  백링크 4            │
│ ────────── │  (활성 뷰 하나: #vToday #vInbox #vNote #vTag #vLibrary      │  관련 6             │
│ ⌂ 오늘      │   #vBrain #vTimeline #vAsk #vSearch)                       │  미니 그래프 (2D)     │
│ ⇩ 인박스  2 │                                                           │  ─────────────      │
│ ▤ 서재      │                                                           │  이 노트에 대해 묻기  │
│ ◎ 브레인    │                                                           │  [질문…        ↵]   │
│ ≡ 타임라인  │                                                           │  ─────────────      │
│ ? 물어보기  │                                                           │  작업 1/3 (진행 중만) │
│ ────────── │                                                           │                     │
│ 시험 4      │                                                           │                     │
│ 문항 61     │                                                           │                     │
│ 지문 38     │                                                           │                     │
│ 자료 3      │                                                           │                     │
│ 프로파일 V3 │                                                           │                     │
│ 예측 1      │                                                           │                     │
│ 모의고사 2  │                                                           │                     │
│ 메모 12     │                                                           │                     │
│ ────────── │                                                           │                     │
│ # 태그      │                                                           │                     │
│  #어법 12   │                                                           │                     │
│  #재출제 3  │                                                           │                     │
│ ────────── │                                                           │                     │
│ 최근        │                                                           │                     │
│  7번 · 빈칸 │                                                           │                     │
│ ────────── │                                                           │                     │
│ 문항 61·지문 38·V3 │                                                     │                     │
├────────────┴───────────────────────────────────────────────────────────┴─────────────────────┤
│ #statusbar  ⟳ 처리 중 1 · 대기 2 [모두 취소]   색인 312 노트   동기화 12초 전   build 2026-09-14  │ 28
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

- `[` = `#navToggle`(nav 접기 → 56px 아이콘 열), `]` = `#asideToggle`(aside 접기). 상태는 localStorage(§4.6).
- `#main` 이 스크롤 컨테이너. 노트 뷰 본문 폭 `max-width: 760px`. 서재 표는 `#main` 폭 전체.
- `#statusbar` 는 큐 진행(`#queueMini` — 기존 id 유지) · 색인 상태(`#indexMini`) · 동기화(`#syncMini`) · 빌드 도장(`#buildMini`). 클릭하면 인박스.

### 2.3 좁은 화면 골격 (600)

```
┌──────────────────────────────┐
│ ≡  ORUN ORACLE     ⌘K ● ● ⚙ │  #topbar (≡ = #navToggle 가 서랍을 연다)
├──────────────────────────────┤
│ #main (한 열)                 │
│  활성 뷰 100% 폭              │
│                              │
│  #aside 는 본문 아래로 이어 붙는다│
│  (백링크 · 관련 · 묻기)         │
│                              │
├──────────────────────────────┤
│ ⌂오늘  ⇩인박스²  ▤서재  ◎브레인 ⋯│  #tabbar (더보기 = 타임라인·물어보기·선생님·설정)
└──────────────────────────────┘
```

- 분기점은 둘로 통일한다. **≤ 900px → `body.narrow`**: `#nav` 는 왼쪽 서랍(`#nav.open`), 앱 그리드가 한 열이 되어 `#main`(높이 auto) 아래에 `#aside` 가 이어 붙고 **문서(body)가 스크롤**한다(DOM 은 옮기지 않는다 — `html, body { overflow: auto }` 로 바꾸고 `#main` 의 자체 스크롤을 끈다), `#tabbar` 가 보이고 `#statusbar` 는 숨는다(큐 배지는 `#tabInbox .badge`). **< 720px → 3D 대신 2D** (`APP.state.mode === "flat"`, 기존 규칙 그대로: WebGL 없음 · `forceFlat` · 폭 720 미만).
- 표(`#libTable`)는 ≤ 900 에서 카드(`#libCards`)로 바뀐다. 카드에서는 편집하지 않고 노트 페이지에서 한다.

### 2.4 노트 페이지 — 한 벌의 템플릿 (`#vNote`)

```
#vNote[data-kind="question"]
┌────────────────────────────────────────────────────────────────┐
│ ‹ #noteBackBtn   #noteCrumb 윤은영 › 2025 1학기 중간 › 7번      ⋯ │  #noteHead · #noteMenu
│ QUESTION · 2025 1학기 중간 · 7번                                 │  #noteKicker (Orbitron 아이브로우)
│ 다음 글의 빈칸에 들어갈 말로 가장 적절한 것은?                       │  #noteTitle (Noto Sans KR 600 22px)
│ #빈칸 #재출제  ⊕ 태그        ┆ 파생: 빈칸 · 프린트적중             │  #noteTags (사용자 태그 = 칩, 파생 태그 = .chip.derived)
├────────────────────────────────────────────────────────────────┤
│ ✎ 넣을 때 AI 에게 전한 말: "2학기 기말 시험지예요…"               │  #noteAiMemo (exam.memo / source.memo, 읽기 전용)
├────────────────────────────────────────────────────────────────┤
│ 속성                                                            │  #noteProps  (table.props — 편집 가능한 셀은 점선 밑줄)
│  시험        [[2025 1학기 중간 · 영어A]]                          │
│  유형        빈칸 · 5지선다 · 3점 · 난이도 중                      │
│  매칭 지문   [[Lesson 3 · Reading 1]]  AUTO 96%  [매칭 바꾸기 ▾]  │  #dMatchSel (기존 id 유지)
│  프린트      ★ 지문 · 어법  ← [[2025_1학기_중간_대비_프린트]]      │
│  변형        빈칸 · 마지막문장 · 구 · 선지 패러프레이즈 · 평행 · 영어 │
├────────────────────────────────────────────────────────────────┤
│ 본문                                                            │  #noteBody (종류별 블록 — 표 2.5)
│  발문 · 선지 ①~⑤ · 정답 · 특징 · [▸ 추출 원문]                     │
├────────────────────────────────────────────────────────────────┤
│ 내 메모                        김강사 · 3분 전 · 동기화 ✓   ⌘↵ 저장 │  #noteMemo · #noteMemoMeta
│ ┌────────────────────────────────────────────────────────────┐ │  #noteMemoText (textarea) ↔ #noteMemoView (미리보기, E 로 토글)
│ │ 작년과 같은 문장에서 빈칸. [[Lesson 3 · Reading 1]] 재출제    │ │  [[ → #acPop 자동완성, # → 태그 자동완성
│ │ 유력 #재출제                                                  │ │
│ └────────────────────────────────────────────────────────────┘ │  #noteMemoSave · #noteMemoToggle
├────────────────────────────────────────────────────────────────┤
│ 링크 (3)                     │ 백링크 (4)                        │  #noteLinks · #noteBacklinks
│  → 시험 2025 1학기 중간       │  ← 예측 2026 1학기 중간 (유력 2위)  │  각 행 [data-id]
│  → 지문 Lesson 3 · Reading 1 │  ← 물어보기 "빈칸 몇 문항?"        │
│  → 프린트 …                   │  ← 메모 "겹침 정리"                │
├────────────────────────────────────────────────────────────────┤
│ [매칭 해제] [같은 지문 문항 보기] [브레인에서 보기]                  │  #noteActions (종류별 버튼)
└────────────────────────────────────────────────────────────────┘
```

### 2.5 종류별 본문 블록 (현재 드로어 · 패널의 내용을 그대로 옮긴다)

| kind (`data-kind`) | id 접두 | `#noteProps` | `#noteBody` | `#noteActions` | 지금 어디 |
|---|---|---|---|---|---|
| `teacher` | `t_` | 학교 · 학년 · 과목 · 색 · 레벨 · 프로파일 V · 시험/문항/지문/자료 수 | `#teacherStatus` 상태 줄 7행(문항 데이터화 · 지문 매칭 · 성향 학습 · 다음 시험 예측 · 프린트 반영율 · 클라우드 · 엔진 — 지금 `renderStatus` 그대로) · 최신 프로파일 요약 · 시험 목록 `[data-exam]` · 자료 목록 `[data-src]` · 지난 모의고사 `[data-mock]` | `#btnEditTeacher` 정보 수정 → 선생님 시트 · `#btnLearn` 학습 · `#btnPredict` 예측 · `#btnMock` 적중 모의고사 · `#btnFiles` 파일 넣기 · `#btnExportOne` 이 선생님만 백업 · `#btnDelTeacher` 삭제(→ 삭제 시트) | `#pStatus` `#pIntel` 독 |
| `exam` | `e_` | 연도 `input[data-m=year]` · 학기 `[data-seg=semester]` · 시험명 `[data-seg=term]` · 학년 `[data-seg=grade]` · 과목 `[data-m=subject]` · 학교 `[data-m=school]` (추정 배지 `.badge.warn`) · 문항 수 · 총점 · AI 활용 추정 · 프린트 반영율 · 상태 | 분석 요약 · 반영율 막대 `.bar.gold` · AI 판정(신호표 `details.raw`) · 문항 표 `table.tbl tr[data-q]` · 원문 `details.raw` | `#dDelExam` 삭제 | 드로어 exam |
| `question` | `q_` | 위 그림 (`#dMatchSel` 유지) | 발문 · 선지 · 정답 · 특징 · 변형 · 선지 습관 · 추출 원문 `details.raw` | `#qUnmatch` 매칭 해제 · `#qSiblings` 같은 지문 문항 · `#qBrain` 브레인에서 보기 | 드로어 question |
| `passage` | `p_` | 출처 · 장르 · 단어 수 · 특징 칩 · 프린트 지문 여부 · 다음 시험 확률(예측 `blueprint.passages[].pUse`) | 요지 · 원문(문장마다 span, 주제문 노랑 · 빈칸 후보 점선) · 어법 후보 · 이 지문을 쓴 문항 `[data-q]` · 출처 자료 `[data-src]` · 예측 근거 `.note` | `#pMock` 이 지문으로 문항 만들기(모의고사 시트를 이 자료만 체크해 연다) | 드로어 passage |
| `source` (범위) | `s_` | 종류 `#dKind` 세그 · 지문 수 · 글자 수 · 범위 완비 `#dComplete` | 지문 목록 `[data-pass]` · 원문 | `#dDelSrc` | 드로어 source |
| `source` (프린트) | `s_` | 대상 시험 `#dTy #dTs #dTt` (+추정 배지) · 반영율 · 지문 · 포인트 수 | 시험 실질 반영율(전체 · 시험별) · 포인트 목록(★ = 시험에 나옴) · 지문 목록 · 원문 | `#dDelSrc` · `#dAddPrint` | 드로어 source(프린트) + handouts |
| `profile` | `pf_` | 버전 스위처 `#profVer`(select, V1…Vn) · 레벨 · 신뢰도 · 근거(시험/문항/지문 수) · 모델 · 이유 | **이번 판에서 달라진 점(delta)** 맨 위 · 서술 + 키워드 칩 + 주의점 · 유형 분포 `.dist` · 습관 `.kv`(배점 · 난이도 · 어법 · 빈칸 · 지문 · 세트 · 발문) · AI 활용 추정 · 프린트 반영 · 근거 시험 `[data-exam]` | `#pfRelearn` 다시 학습 · `#pfCopy` 이 판을 텍스트로 복사 | `#pIntel` |
| `prediction` | `pd_` | 대상 시험 · 프로파일 V · 신뢰도 · 모델 · 만든 날 | 범위 지도 `#rangeMap`(canvas) · 구성 `.kv` · 유력 지문 `.hot[data-pass]` (pUse 막대 · ★) · 어법 포인트 · 서술형 형식 · 새로 나올 것 · 청사진 텍스트 `details` | `#rCopy` 청사진 복사 · `#rPredict` 예측 갱신 · `#rMock` 적중 모의고사 · (프로파일이 없을 때의 학습은 teacher 노트의 `#btnLearn`) | `#pData` |
| `mock` | `m_` | 대상 · 문항 수 · 배점 · 모델 · 예측 V · 만든 날 | 문항 요약 목록(번호 · 유형 · 배점 · 지문 `[data-pass]`) · 만들지 못한 문항 | `#openPaper` 시험지 열기(→ `#paper`) · `#mockDocx` 워드 · `#mockDel` 삭제 | 드로어 mocks |
| `note` (자유 · daily · weekly) | `n_` | 만든 날 · 선생님 · 종류 · 날짜(daily) · 서명 | 본문 = 메모 편집기가 곧 본문 (`#noteMemo` 가 본문 자리에 온다, `#noteBody` 는 숨김) | `#nPin` 고정 · `#nDel` 삭제(5초 취소) | 신규 |
| `note` (ask) | `n_` | 물은 시각 · 범위 · 모델 · 근거 수 | 질문 · 답(인용 칩 `.cite[data-id]`) · 근거 목록 `[data-cite]` · 후속 질문 | `#nAskAgain` 다시 묻기(→ `#/ask?q=`) · `#nDel` | 신규 |
| 태그 (`#vTag`) | — | `#tagTitle` · 색 `#tagColor` · 설명 `#tagDescText` | `#tagList [data-id]` (이 태그가 붙은 노트) | `#tagRename` · `#tagDelete` | 신규 |

### 2.6 오른쪽 `#aside`

```
┌─────────────────────────┐
│ THIS NOTE               │ #asideProps   종류 · 만든 날 · 마지막 수정 · 서명(author) · 동기화 상태
│ 백링크 4                 │ #asideBacklinks  [data-id] 행, 클릭 이동
│ 관련 6                   │ #asideRelated    같은 지문 · 같은 태그 · 같은 시험의 이웃 (LINKS.neighbors 2홉, 최대 6)
│ (미니 그래프)             │ #asideGraph > canvas#asideGraphCanvas  이 노트 중심 1홉, 노드 클릭 → 이동, "브레인에서 보기" #asideGraphOpen
│ 이 노트에 대해 묻기       │ #asideAsk  input#asideAskInput · button#asideAskGo → #/ask?ctx=<id>&q=…
│ 작업 1/3                 │ #asideQueue  진행 중 작업만(취소 버튼), 없으면 숨김
│ (미리보기)               │ #asidePeek  ⌘클릭 미리보기: #asidePeekTitle #asidePeekBody #asidePeekOpen #asidePeekClose
└─────────────────────────┘
```

노트가 아닌 뷰에서 aside 는 `#asideQueue` 와 `#asideAsk`(범위 = 현재 선생님)만 보인다. 브레인 뷰에서는 aside 를 자동으로 접는다(`#brainFull` 이 아니어도).

### 2.7 왼쪽 `#nav`

| 요소 | id / 선택자 | 동작 |
|---|---|---|
| 선생님 스위처 | `#navTeacher` (버튼: 색 점 · 이름 · 과목 · V) → `#navTeacherMenu` (`[data-teacher]` 행들 + `[data-teacher="*"]` "모든 선생님" + `#btnNew` "＋ 선생님") | 클릭 = `APP.select(id)`. `← →` 순환 유지 |
| 주 메뉴 | `#navMain` > `a[data-nav="today|inbox|library|brain|timeline|ask"]`, 인박스 배지 `#navInboxCount` | 활성 항목 `.on` |
| 서재 | `#navLib` > `a[data-nav-kind="exams|questions|passages|sources|profiles|predictions|mocks|notes"] > .cnt` | `#/all/<kind>` |
| 태그 | `#navTags` > `a[data-tag]` (상위 8 + "더보기" `#navTagsMore` → ⌘K 의 `#` 모드 = 태그 전체) | `#/tag/<이름>` |
| 최근 | `#navRecent` > `a[data-id]` (최근 연 노트 8, localStorage) | |
| 성장 | `#navGrowth` (문항 · 지문 · V · 메모 수, 8주 스파크라인 `#navGrowthCanvas`) | 클릭 → 타임라인. 파일 완료 시 400ms 펄스 `.pulse` |
| 접기 | `#navToggle` | `[` |

### 2.8 `#topbar` · `#statusbar` · `#tabbar`

- `#topbar`: `#brand`(`b` + `#brandSub`) · `#crumbs`(현재 뷰의 경로, 각 조각 `[data-route]`) · `#btnSearch`("⌘K 검색 · 명령 · 질문" — 팔레트 열기) · `#engine`(`i` + `#engineLabel`) · `#cloud`(`i` + `#cloudLabel`) · `#fpsTag` · `#btnHelp` · `#btnSettings` · `#asideToggle`.
- `#statusbar`: `#queueMini`(처리 중/대기 · `#qCancelAll` 모두 취소 · `#qAbortGen` 출제 중단 — 기존 id 유지) · `#indexMini`("색인 312 노트" / "색인 중 40%") · `#syncMini` · `#buildMini`.
- `#tabbar` (`body.narrow` 에서만): `button[data-tab="today|inbox|library|brain|more"]`, `#tabInbox .badge`, `#tabMore` → 시트(kind `more`): 선생님 스위처 행 `[data-more="teacher:<id>"]`(+ `[data-more="teacher:*"]`) · `[data-more="new"]` 새 선생님(→ 선생님 시트) · `[data-more="timeline|ask|settings|help"]`. (`#btnNew` 는 `#navTeacherMenu` 안 하나뿐 — id 중복 금지.)

### 2.9 오늘 (`#vToday`)

```
┌──────────────────────────────────────────────────────────────┐
│ TODAY · 2026-09-14 · 윤은영 영어A                                │ #homeHead
│ ┌ 다음 시험 ───────────────┐ ┌ 프로파일 ──────────────────────┐ │ #homeNext · #homeLevel
│ │ 2026 1학기 중간 · D-31    │ │ V3 · 학습 Lv.2 · 신뢰도 41%     │ │
│ │ 예측 READY · 신뢰도 41%   │ │ 숙련까지 문항 19 · 시험 1        │ │
│ │ [청사진] [모의고사]        │ │ [프로파일 보기]                  │ │
│ └──────────────────────────┘ └────────────────────────────────┘ │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   ▁▂▃▅▆█ 8주                 │ #homeStats [data-stat] · #homeGrowth > canvas#homeGrowthCanvas
│ │문항│ │지문│ │반영│ │ V  │ │메모│                                │
│ │ 61 │ │ 38 │ │57%│ │ 3  │ │ 12 │                                │
│ └────┘ └────┘ └────┘ └────┘ └────┘                                │
│ ┌ 인박스 ─────────────────────────────────────────────────────┐ │ #homeCapture
│ │  기출 · 범위 원문 · 프린트 · 사진을 여기에 놓으세요 [고르기]     │ │ #homeDrop · #homePick
│ │  한 줄 메모  [ [[Lesson 3]] 이번엔 분사구문 #어법        ↵ ]    │ │ #homeCaptureText · #homeCaptureGo
│ └─────────────────────────────────────────────────────────────┘ │
│ 정리 중 2                                          [인박스 열기 →] │ #homeQueue (진행 중 작업 줄, 최대 3)
│ 다음에 할 일                                                      │ #nextUp > .todo[data-act]
│  • 예측이 프로파일 V2 기준이에요 — [다시 예측]                      │
│  • 지문을 못 찾은 문항 3개 — [직접 매칭]                           │
│ 시작하기 ✓ 엔진  ✓ 선생님  ○ 파일 넣기                             │ #onboard (#ob1 #ob2 #ob3 · #ob1Btn #ob2Btn #ob3Btn #ob3Note)
│ 최근 캡처                                                        │ #homeRecent > [data-id] (.new = 24시간 안)
│  ● 2025 2학기 기말 · 7문항 · 프린트 반영 57%             3분 전   │
│  ● 메모 "겹침 정리" #재출제                                9분 전   │
│ 두뇌에게 묻기  [ 윤은영 선생님은 빈칸을 어디에 뚫나?           ↵ ]  │ #homeAsk > #homeAskInput · #homeAskGo → #/ask?q=
│ ⓘ 무엇이 바뀌었나 — 홀로그램은 브레인(G)으로, 파일은 인박스로 … [닫기]│ #homeChanged · #homeChangedClose (1회, localStorage)
└──────────────────────────────────────────────────────────────┘
```

- 빈 상태(자료 0): 지표 0, 스파크라인 자리에 "첫 파일을 넣으면 여기서 자라기 시작해요", `#nextUp` 첫 줄이 "기출 시험지를 넣어 주세요 [인박스]".
- 선생님 "모든 선생님" 일 때: `#homeNext #homeLevel` 숨김, 지표는 합계, `#nextUp` 은 선생님별 첫 항목 하나씩.

### 2.10 인박스 (`#vInbox`)

```
┌──────────────────────────────────────────────────────────────┐
│ INBOX · 윤은영                    종류 [자동|기출|범위|프린트]     │ #inboxKind (세그 [data-v]) — 파일 시트 기본 칩
│ ┌──────────────────────────────────────────────────────────┐ │
│ │        기출 · 범위 원문 · 프린트를 여기에 놓으세요             │ │ #inboxDrop
│ │   PDF · 워드 · 한글 · 엑셀 · 텍스트 · 사진(OCR) · 20개까지     │ │
│ │              [파일 고르기]  [사진 찍기]                        │ │ #inboxPick → #fileInput · #inboxCamera → #cameraInput
│ └──────────────────────────────────────────────────────────┘ │
│ 빠른 메모 [ 오늘 수업에서 들은 것: 2단원 빈칸 강조… ↵ ]           │ #captureText · #captureGo  → n_ 노트, 피드에 NOTE 줄
│ 작업                              [완료 지우기] [모두 취소]        │ #queueClear · #queueCancelAll
│ ▮▮▮▮▮▯▯ 2025_2학기_기말.pdf  [기출]  문항 분석 6/14        [✕]   │ #queueList > .q[data-job]  (칩 [data-flip] · [data-cancel])
│ ✕ 교과서.pdf  이미 넣은 파일이에요 (교과서_시험범위) [그래도 넣기]  │ [data-force] · [data-retry] · [data-rm]
│ ✓ 프린트.hwp  완료 · 지문 2 · 포인트 6 · 반영율 50%  [노트 열기]   │ [data-open] → #/n/<sourceId|examId>
│   ✎ 이 프린트는 어법 정리 위주예요                                │ .memo (기존 큐 메모 표시 유지)
└──────────────────────────────────────────────────────────────┘
```

- 드롭 · 고르기 → 지금의 **파일 시트**(`UI.openFilesSheet`, `[data-k]` 칩 · `#fsMemo` · `#fsGo` · `#fsCancel`)가 그대로 뜬다. 시트 제목 "두뇌에 넣기". `#inboxKind` 가 `auto` 가 아니면 칩 기본값이 된다(옛 `pendingKind`).
- 전역 드롭(`#dropAll`, `body.dragging`)은 어느 뷰에서든 유지. 선생님이 `"*"` 이거나 없으면 `openPickSheet`.
- 큐 행 = 기존 `queueHtml()` 그대로(단계 · 종류 칩 순환 `cycleJobKind` · 취소 · 재시도 · 그래도 넣기 · 지우기 · 메모 · OCR 진행). 완료 행에 `[data-open]` 을 더한다.
- 키 없음: 행에 "API 키를 저장하면 시작해요" + `needKey` 토스트/설정 열기(기존 동작).
- 모바일: `#cameraInput` = `<input type="file" accept="image/*" capture="environment" multiple hidden>`. 여러 장은 각각 파일로 큐에 들어간다(한 파일로 묶기는 §10).

### 2.11 서재 (`#vLibrary`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ LIBRARY · 문항 61                          [검색…]  정렬 [번호 ▾]        │ #libHead · #libCount · #libSearch · #libSort
│ 필터  [유형 ▾] [태그 ▾] [★ 프린트] [미매칭] [연도 ▾]   ×초기화              │ #libFilter > .chip[data-f] · #libFilterPop · #libFilterClear
│ ┌───┬──────┬────┬────┬─────┬──────────────┬────┬──────┐               │ #libTable > thead th[data-sort] · tbody tr[data-id]
│ │NO │유형   │배점│난이│지문  │매칭          │프린트│태그   │               │
│ │ 1 │제목   │ 2  │중  │L1·R1│AUTO 100%     │★지문 │#재출제│               │  (셀 [data-m] [data-seg] 는 시험 표에서만 편집)
│ └───┴──────┴────┴────┴─────┴──────────────┴────┴──────┘               │
│ (≤900px 이면 #libCards > .card[data-id])                              │
│ 빈 상태: "기출 시험지를 인박스에 놓으세요" [파일 넣기]                      │ #libEmpty · #libEmptyAct
└──────────────────────────────────────────────────────────────────────┘
```

종류별 열 (기본 정렬):

| kind | 열 | 편집 |
|---|---|---|
| exams (시험 순) | 제목 · 연도 `[data-m=year]` · 학기 `[data-seg=semester]` · 시험명 `[data-seg=term]` · 문항 · 매칭 · 프린트 반영 · AI · 상태 배지 · 메모 수 | 연도 · 학기 · 시험명(셀 인라인, `APP.updateExamMeta`) |
| questions (시험 · 번호) | 번호 · 시험 · 유형(소유형) · 형식 · 배점 · 난이도 · 지문 · 프린트 ★ · 변형 · 태그 | 태그(칩 `+`) |
| passages (자료 · 순서) | 출처 · 자료 · 장르 · 단어 · 특징 · 쓰인 문항 수 · 다음 시험 % · 프린트 여부 · 태그 | 태그 |
| sources (최근) | 이름 · 종류 `#dKind`(범위) / 대상 시험(프린트) · 지문 · 포인트 · 반영율 · 완비 | 종류 · 완비 · 대상 시험은 노트에서 |
| profiles (버전 역순) | V · 만든 날 · 레벨 · 신뢰도 · 근거 시험/문항 · 델타 첫 줄 · 모델 | — |
| predictions (최근) | 대상 · V · 문항 계획 · 유력 지문 수 · 신뢰도 · 모델 | — |
| mocks (최근) | 제목 · 대상 · 문항 · 배점 · 모델 · 만든 날 · [열기] | — |
| notes (수정 역순) | 제목 · 종류(자유/daily/weekly/ask/anchor) · 붙은 곳 · 태그 · 서명 · 수정일 | — |

필터 칩: `type=<유형>` `tag=<이름>` `hit=1` `matched=0` `year>=<n>` `kind=프린트|교과서|…` `ext=1`(외부지문). 조합은 주소 쿼리로만 산다(저장된 뷰는 §10).
노트에서 오는 좁히기 — `exam=<e_id>`(시험 노트 [문항 목록으로]) · `passage=<p_id>`(문항 노트 `#qSiblings`) · `diff=상|중|하`(파생 태그 #난이도…) · `genre=<장르>`(지문). 칩은 없고 `#libCount` 옆에 무엇으로 좁혔는지 적으며 `#libFilterClear` 가 함께 지운다.

### 2.12 브레인 (`#vBrain`)

```
┌────────────────────────────────────────────────────────────────┐
│ BRAIN · 윤은영  [✓시험 ✓지문 ✓문항 ✓프린트 ✓메모 ✓예측 ✓모의고사]  [2D] [⛶] │ #brainBar > [data-node] · #brain2d · #brainFull · #brainFocus
│               ·  ·      ○ 시험 2025-1중                            │
│           ·      ╲   ╱                                            │ canvas#fx (3D) 또는 canvas#brainFlat (2D)
│     ◇ 메모 ─── ◉ 윤은영 ◉ ─── ○ 시험 2025-2기                       │ #chips (호버 칩)
│           ╱   (다이얼 홀로그램 + 유형 별자리)                       │
│      ● Lesson 1 ····· 문항(점) ····· ★ 프린트(금색)                 │
│ ┌ Lesson 3 · Reading 1 ─────────────────────────┐                  │ #brainHud (.hud) > #brainHudTitle · #brainHudSub · #brainHudOpen · #brainHudAsk · #brainHudClose
│ │ 지문 · 187단어 · 문항 3 · 프린트 ★ · 다음 시험 82% │                  │
│ │ [열기] [여기서 물어보기]                          │                  │
│ └───────────────────────────────────────────────┘                  │
│ #flat > #flatGrid > .tcard[data-id] (2D 모드에서 선생님 카드 열)     │
│ #brainEmpty "파일을 넣으면 여기서 가지가 뻗어요"                      │
└────────────────────────────────────────────────────────────────┘
```

- `#fx` `#chips` `#brainFlat` `#flat` 는 `#vBrain` 안(position:absolute; inset:0)에 있다. `#bgVideo` 는 body 직계(텍스처 소스)로 남는다.
- `#brainFull`(⛶) = `body.brainFull`: nav · aside · statusbar 숨김, 코너 워드마크 `#wordsTL #wordsTR #wordsBL #wordsBR`(`.corner`, `#wordsSchool` 포함) 표시. Esc 로 해제.
- 노드: 선생님 = 다이얼 홀로그램(기존 `addTeacher`), 시험 = 링, 지문 · 프린트 = 구(프린트 지문 · 적중 = 금색 `--gold`), 문항 = 점(`THREE.Points` 하나), 메모 = 마름모, 예측 · 모의고사 = 육각. **색은 선생님 색**(노드 hue = 그 선생님 색, 종류는 모양 · 크기), 금색만 예외.
- 호버 → `#chips` 칩(기존 `stage.anchor`) · 클릭 → `#brainHud` · 더블클릭/`[열기]` → `#/n/<id>` · `[여기서 물어보기]` → `#/ask?ctx=<id>`. 드래그 회전 · 휠 확대 유지. 파일을 노드에 놓으면 그 선생님 맥락으로 파일 시트(기존 `bindDrop` 의 `stage.pick`).
- `?focus=<id>` → 그 노드 중심 2홉만(`#brainFocus` 칩에 제목, × 로 해제).

### 2.13 타임라인 (`#vTimeline`)

```
│ ‹ #tlPrev   2026-09-08 ~ 09-14 (#tlRange)   #tlNext ›      [+ 오늘 로그 #tlToday] │
│ 이번 주 배운 것  (#tlWeek)                                 [회고 쓰기 #tlRetro]    │
│  넣은 것 5 · 문항 +28 · 지문 +12 · 프로파일 V1→V3 · 예측 2 · 반영율 43%→57% · 메모 4│
│ 필터 [전체][캡처][학습][예측][출제][수정][메모][질문][오류]   (#tlFilter [data-f])   │
│ ─ 9/14 (일) ─────────────────────────────── (.tlDay[data-day="2026-09-14"])       │
│  14:02 LEARN    프로파일 V3 · 신뢰도 21% → 38%        → [[프로파일 V3]]  (.ev[data-ev][data-ref]) │
│  13:58 INGEST   2025 2학기 기말 · 문항 7             → [[시험]]                       │
│  13:40 NOTE     "[[Lesson 3]] 이번엔 분사구문" #어법  → [[메모]]                       │
│  ✎ 오늘 로그 "겹침 정리"                            → [[daily 2026-09-14]]             │
│ 빈 주: "이 주에는 아무것도 없어요" (#tlEmpty)                                         │
```

### 2.14 물어보기 (`#vAsk`)

```
┌────────────────────────────────────────────────────────────────┐
│ ASK · 범위 [윤은영 ▾] (#askScope)   맥락: [7번 · 빈칸 ×] (#askCtx · #askCtxClear)  │
│ #askLog                                                         │
│  ┌ 나: 빈칸을 주로 어디에 뚫어?                       (.msg.me) │
│  ┌ 두뇌: 최근 두 시험에서 빈칸 5문항 중 4문항이 마지막문장이었고 [1][2], 단위는 구가 3회 [3]. 프린트에 실린 지문에서 나온 비율은 50% [4] … (.msg.brain, .cite[data-id]) │
│    근거 (#askCites)  [1] 문항 · 2025 1학기 중간 · 5번  [2] 문항 · 2025 2학기 기말 · 3번  [3] 프로파일 V3 · 변형 습관  [4] 프린트 반영율   ([data-cite], 안 쓴 것 .unused, 없는 번호 .dashed) │
│    더 물어보기: [어법 포인트는?] [서술형 조건은?]  (.followup)     │
│    [노트로 저장 #askSave] [다시 묻기 #askAgain]                    │
│ #askStatus  근거 모으는 중 → 12개 찾음 → 답 쓰는 중               │
│ #askCost    근거 12 · 약 9,800자 · 이번 세션 질문 3회               │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ 질문…  (#askInput, ⏎ 전송 · ⇧⏎ 줄바꿈)          [#askGo] [#askStop] │
│ └──────────────────────────────────────────────────────────┘   │
│ 지난 질문 (#askHistory > [data-id])                              │
│ #askEmpty  "두뇌에 아직 이 내용이 없어요 — 검색어를 바꾸거나 자료를 넣어 주세요" [자료 넣기 #askEmptyFiles] │
│ #citePop  (칩 호버 미리보기: 근거 첫 200자)                        │
└────────────────────────────────────────────────────────────────┘
```

### 2.15 ⌘K 팔레트 (`#cmdk`)

```
┌ ⌘K ──────────────────────────────────────────────┐
│ 🔍 어법 Lesson 2                          (#cmdkInput, role=combobox) │
│ 노트                                                │
│  ▸ 지문   Lesson 2 · Reading 1        어법 타깃 3     │ #cmdkList > .hit[data-hit="p_…"] (role=option, id=hit-0…)
│  ▸ 문항   2025 1학기 중간 · 8번 · 어법                │
│  ▸ 프린트 2025_1학기_중간_대비_프린트 · 어법 포인트 3   │
│ 원문에서                                            │
│  ▸ Lesson 2 · Reading 1 … "…when the <b>law</b> of…" │ .hit[data-hit="grep:p_…:1234"]
│ 명령                                                │
│  › 두뇌에게 묻기 "어법 Lesson 2"                      │ .hit[data-hit="cmd:ask"]
│  › 브레인에서 보기                                   │ .hit[data-hit="cmd:brain"]
│ 태그  #어법 12                                       │ .hit[data-hit="tag:어법"]
│ ↑↓ 이동 · ⏎ 열기 · ⌘⏎ 미리보기 · Esc 닫기   색인 중 40% (#cmdkHint · #cmdkStatus) │
└───────────────────────────────────────────────────┘
```

### 2.16 유지되는 시트 · 오버레이 (id 그대로)

- 시트 껍데기 `#sheetWrap #sheet #sheetTitle #sheetBody #sheetClose`, `#sheetWrap[data-kind]`.
- 선생님 `#tfName #tfSchool #tfGrade #tfSubj #tfSubjOther #tfColor #tfErr #tfDel #tfCancel #tfOk` · 삭제 `#delName #delExport #delCancel #delGo` · 파일 `[data-k] #fsMemo #fsCancel #fsGo` · 고르기 `[data-pick] #pickNew` · 예측 `#pdYear #pdSem #pdTerm #pdDate(신설, 선택) #pdCancel #pdGo` · 모의고사 `#mkCount [data-src] #mkStrength #mkExtra #mkCancel #mkGo` · 도움말 `.help kbd` · 더보기(좁은 화면) `[data-more]`.
- 설정 `[data-tab=engine|cloud|bg|view|data|brain]`: 엔진 `#sProv #sKey #sKeySave #sKeyClear #sKeyStat #sModel #sOaModel #sLight #sKeep #sProbe #sProbeMsg` · 클라우드 `#cOn #cWs #cWsSave #cStat #cPush #cPull #cWipe` · 배경 `#sVidDrop #sVidPick #sVidRm #sOpa [data-copy]` · 화면 `#sQ #sRed #sFlat #sAuto #sFps #sHome(신설: 첫 화면 오늘/브레인)` · 데이터 `#sPersist #sExport #sImport #sWipe` · **브레인(신설)** `#sAuthor`(메모 서명) `#sPrivate`(메모 · 링크 · 태그는 이 브라우저에만) `#sAskK`(근거 개수 8/12/16) `#sAskLight`(물어보기는 Sonnet) `#sReindex`(색인 다시 짓기) `#sIndexStat`.
- 시험지 `#paper #paperBar #paperTitle #paperPrint #paperDocx #paperCopy #paperClose #paperScroll #paperPage` — **body 직계 자식**이어야 한다(인쇄 CSS).
- 토스트 `#toasts`. 숨은 입력 `#fileInput #importInput #videoInput #cameraInput`. 자동완성 `#acPop`(role=listbox, `.hit[data-id]`). 부팅 실패 화면 `#bootError > #bootErrorMsg #bootRetry`.

### 2.17 DOM id 총목록 (계약)

```
셸        #topbar #brand #brandSub #crumbs #btnSearch #engine #engineLabel #cloud #cloudLabel #fpsTag #btnHelp #btnSettings #asideToggle
          #nav #navToggle #navTeacher #navTeacherMenu [data-teacher] #btnNew #navMain [data-nav] #navInboxCount #navLib [data-nav-kind] .cnt #navTags [data-tag] #navRecent #navGrowth #navGrowthCanvas
          #main [data-view] #aside #asideProps #asideBacklinks #asideRelated #asideGraph #asideGraphCanvas #asideGraphOpen #asideAsk #asideAskInput #asideAskGo #asideQueue #asidePeek #asidePeekTitle #asidePeekBody #asidePeekOpen #asidePeekClose
          #statusbar #queueMini #qCancelAll #qAbortGen #indexMini #syncMini #buildMini
          #tabbar [data-tab] #tabInbox #tabMore
          #dropAll #toasts #acPop #cmdk #cmdkInput #cmdkList #cmdkHint #cmdkStatus #bootError #bootErrorMsg #bootRetry
오늘      #vToday #homeHead #homeNext #homeLevel #homeStats [data-stat] #homeGrowth #homeGrowthCanvas #homeCapture #homeDrop #homePick #homeCaptureText #homeCaptureGo #homeQueue #nextUp .todo[data-act] #onboard #ob1 #ob2 #ob3 #ob1Btn #ob2Btn #ob3Btn #ob3Note #homeRecent #homeAsk #homeAskInput #homeAskGo #homeChanged #homeChangedClose
인박스    #vInbox #inboxKind #inboxDrop #inboxPick #inboxCamera #captureText #captureGo #queueList .q[data-job] [data-flip] [data-cancel] [data-retry] [data-force] [data-rm] [data-open] #queueClear #queueCancelAll #inboxHint
노트      #vNote[data-kind] #noteHead #noteBackBtn #noteCrumb #noteKicker #noteTitle #noteTags #noteTagAdd #noteMenu #noteAiMemo #noteProps #noteBody #noteMemo #noteMemoText #noteMemoView #noteMemoSave #noteMemoToggle #noteMemoMeta #noteLinks #noteBacklinks #noteActions
          (teacher) #teacherStatus #btnEditTeacher #btnLearn #btnPredict #btnMock #btnFiles #btnExportOne #btnDelTeacher [data-exam] [data-src] [data-mock]
          (exam) [data-m] [data-seg] [data-q] #dDelExam   (question) #dMatchSel #qUnmatch #qSiblings #qBrain [data-pass]
          (passage) #pMock [data-q] [data-src]   (source) #dKind #dComplete #dTy #dTs #dTt #dDelSrc #dAddPrint [data-pass]
          (profile) #profVer #pfRelearn #pfCopy [data-exam]   (prediction) #rangeMap #rCopy #rPredict #rMock [data-pass]
          (mock) #openPaper #mockDocx #mockDel [data-pass]   (note) #nPin #nDel #nAskAgain
태그      #vTag #tagTitle #tagColor #tagDescText #tagList #tagRename #tagDelete
서재      #vLibrary #libHead #libCount #libSearch #libSort #libFilter [data-f] #libFilterPop #libFilterClear #libTable th[data-sort] tr[data-id] #libCards .card[data-id] #libEmpty #libEmptyAct
브레인    #vBrain #fx #chips #brainFlat #flat #flatGrid .tcard[data-id] #flatNew #brainBar [data-node] #brain2d #brainFull #brainFocus #brainHud #brainHudTitle #brainHudSub #brainHudOpen #brainHudAsk #brainHudClose #brainEmpty #wordsTL #wordsTR #wordsBL #wordsBR #wordsSchool #bgVideo(body)
타임라인  #vTimeline #tlPrev #tlNext #tlRange #tlWeek #tlRetro #tlFilter [data-f] #tlDays .tlDay[data-day] .ev[data-ev][data-ref] #tlToday #tlEmpty
물어보기  #vAsk #askScope #askCtx #askCtxClear #askLog .msg .cite[data-id] #askCites [data-cite] .followup #askSave #askAgain #askStatus #askCost #askInput #askGo #askStop #askHistory #askEmpty #askEmptyFiles #citePop
검색      #vSearch #searchQ #searchList [data-id] #searchGrep [data-id][data-pos]
시트      #sheetWrap #sheet #sheetTitle #sheetBody #sheetClose + §2.16 의 폼 id 전부
시험지    #paper #paperBar #paperTitle #paperPrint #paperDocx #paperCopy #paperClose #paperScroll #paperPage .pq
입력      #fileInput #importInput #videoInput #cameraInput
```

---

## 3. 기능 명세

### 3.1 캡처 · 인박스

- 파일: `APP.enqueue(files, teacherId, at, {memo, kinds})` → `runJob → runExam/runScope/runHandout` **그대로**. 바뀌는 것: (1) 진입점이 인박스 · 오늘 · 전역 드롭 · 브레인 노드 드롭 · 사진 찍기, (2) 완료 시 `INDEX.upsert` 와 `LINKS.rebuildTeacher` 가 돌고, 큐 행에 `[data-open]` 이 생기며, 토스트에 "문항 +7 (총 21) · 매칭 6/7" 처럼 실제 숫자를 쓴다, (3) `#navGrowth` 펄스 400ms.
- 빠른 메모(`#captureText` · `#homeCaptureText`, `C` 단축키로 포커스): `NOTES.create({kind:"note", body, teacherId, author})`. `[[` · `#` 자동완성. Enter 저장(⇧Enter 줄바꿈). 문항 번호 패턴(`^\s*\d{1,2}\s*[.)]`)이 5줄 이상이면 토스트 "기출 시험지 같아요 — 파일로 넣을까요?" [텍스트 파일로 넣기] → `new File([text], "붙여넣기.txt")` 로 enqueue.
- "AI 에게 전할 말"(`exam.memo` · `source.memo`)은 그대로 두고 노트 상단 `#noteAiMemo` 에 읽기 전용으로 보인다. **내 메모와 다른 칸이다** — 하나는 모델에게, 하나는 나에게.
- 선생님이 `"*"` 이거나 없을 때 파일이 오면 `openPickSheet(files)`(기존).

### 3.2 노트 · 내 메모 · 편집기

- **저장 위치**: 내 메모는 원 문서에 넣지 않는다. `notes` 문서 `kind:"anchor"`, `anchorKey:"<store>:<id>"`(예 `questions:q_abc`) 하나. `NOTES.memo(anchorKey)` 로 읽고 `NOTES.saveMemo()` 로 쓴다. 자유 메모(`kind:"note"`) · 데일리(`kind:"daily"`, `date`) · 주간(`kind:"weekly"`, `date` = 그 주 월요일) · 질문(`kind:"ask"`) 도 같은 저장소.
- **편집기 규칙**: `textarea#noteMemoText` + 미리보기 `#noteMemoView`. 편집 ↔ 미리보기 토글 `E`(입력 밖) / `#noteMemoToggle`. 저장 = `⌘/Ctrl+Enter` 또는 `#noteMemoSave` 또는 입력 멈춘 뒤 **900ms 자동 저장**(본문이 바뀐 경우만). 저장 시 `NOTES.parse` → 태그 · 링크 캐시 갱신 → `LINKS.setUserLinks` → 백링크 · 색인 갱신 → `events(note)` 기록(첫 저장만).
- **문법(마크다운-라이트)**: `[[제목]]` 링크 · `#태그` · `**굵게**` · 줄 머리 `- ` 목록 · `> ` 인용 · 빈 줄 = 단락. 그 밖은 글자 그대로. 렌더는 **반드시 `TEXT.esc` 를 먼저** 적용한 뒤 정규식으로 바꾼다(XSS 방어 · 단위 검사 있음). 렌더 결과에 허용되는 태그: `p a(data-link) span.tag b ul li blockquote br`.
- **`[[` 자동완성** `#acPop`: 커서 앞 `[[` 이후 텍스트로 `INDEX.prefix(q, {teacherId})` 상위 8(제목 · 종류 배지 · 선생님). ↑↓ ⏎ 선택 → `[[제목]]` 삽입, 링크 캐시에 id 저장(같은 제목이 둘이면 id 로 구분). Esc 닫기. `#` 뒤에는 `NOTES.tags.list()` 접두 일치 상위 8 + "새 태그 만들기".
- **한글 IME**: `keydown` 에서 `e.isComposing || e.keyCode === 229` 면 아무것도 하지 않는다. 자동완성 감지는 `input` 과 `compositionend` 에서 한다. ⌘Enter 도 조합 중이면 무시.
- **제목 해석** `LINKS.resolve(text, teacherId)`: ① 캐시 id → ② 제목 정확 일치(공백 · 대소문자 무시, 같은 선생님 우선) → ③ 2-gram Dice ≥ 0.8 인 후보가 정확히 하나 → ④ 실패 = 깨진 링크(회색 점선, 클릭 → "이 제목으로 새 메모 만들기" 토스트 액션. **자동으로 빈 노트를 만들지 않는다**).
- **태그**: `#어법` 처럼 본문에 쓰거나 `#noteTagAdd`(⊕) 로 단다(⊕ 는 본문 끝에 `#태그` 를 덧붙이는 것과 같다 — 태그의 진실은 본문이다). 문항의 기존 `tags[]` 필드는 읽기만 하고(파생 표시), 새 태그는 anchor 노트로 간다. **파생 태그**(저장하지 않음): 문항 `type`(#빈칸), `handoutHit`(#프린트적중), `external`(#외부지문), `difficulty`(#난이도상/중/하), 프린트 `#프린트`. `.chip.derived` 로 색을 달리한다. 태그 문서 `tags` 는 이름 · 색 · 설명 · 서명만(카운트는 색인에서 센다).
- **옛 메모 필드** `questions.note` · `teachers.note`: 부팅 때 한 번 `NOTES.migrateLegacy()` 가 비어 있지 않은 값을 anchor 노트로 복사한다(id `n_legacy_<원id>` 로 멱등, `author:"legacy"`). 원 필드는 지우지 않는다(추가만). UI 는 그 뒤 원 필드를 읽지 않는다.
- **서명**: 모든 notes · links · tags 문서에 `author`(localStorage `orun_oracle_author`, 설정 › 브레인 `#sAuthor`, 기본 `""` → 표시 "이 기기"). 작업공간은 여러 사람이 쓴다.
- **삭제**: 자유 메모 · 질문 노트는 `#nDel` → 5초 취소 토스트 뒤 하드 삭제(links 의 from 도 함께). anchor 메모는 본문을 비우면 문서를 지운다.
- **고아 규칙**(database-first): `deleteExam` · `deleteSource` · `deleteTeacher` · 프로파일 30판 가지치기가 문서를 지울 때 `NOTES.orphan(store, ids)` 를 먼저 부른다 → 그 anchor 노트는 지우지 않고 `anchor:null, anchorKey:"", orphanOf:{store,id,title}`, 제목 "(삭제된 {title}에 붙어 있던 메모)" 로 남는다. 선생님 삭제 시 그 선생님의 자유 메모 · 질문은 `teacherId:null` 로 남긴다(`delWhere` 목록에 notes · links · tags 를 **넣지 않는다**). `links` 의 `to` 가 사라지면 깨진 링크로 표시.

### 3.3 백링크

- 백링크 = **파생 링크의 역방향 ∪ 사용자 링크(`links.to === id`)**. `LINKS.backlinks(id)` → `[{from, kind, label, teacherId}]`. 파생 링크는 저장하지 않고 부팅 · 데이터 변경 때 메모리에서 다시 만든다(선생님당 O(문항+지문), 5ms 급).
- 파생 관계(실제 필드): 문항→시험 `examId`(belongs) · 문항→지문 `match.passageId`(match) · 문항→프린트 `handoutHit.sourceIds`(hit) · 지문→자료 `sourceId`(from) · 프로파일→시험 `basedOn.examIds`(basedOn) · 예측→지문 `blueprint.passages[].passageId`(predicts, 상위 30) · 예측→프로파일(같은 선생님의 `profileVersion` 판)(uses) · 모의고사→예측 `predictionId`(made) · 모의고사→지문 `questions[].passageId`(usesPassage) · 프린트→시험(`target` 이 `exam.meta` 의 연도 · 학기 · 시험명과 같을 때)(targets) · anchor 노트→원 문서(anchor) · 모든 문서→선생님 `teacherId`(owner — 백링크 목록에는 보이지 않고 그래프에만).
- 노트 페이지 `#noteBacklinks` 와 aside `#asideBacklinks` 는 종류 배지 + 제목 + 이유(예: "유력 2위", "매칭 AUTO 96%", "인용 [3]").

### 3.4 브레인(그래프) 뷰 — 3D 무대의 새 역할

- 무대는 **`#/brain` 에 처음 들어갈 때** 만든다(`APP.ensureStage()`). 부팅 때는 만들지 않는다. 떠나면 `stage.pause()`, 돌아오면 `stage.resume()` + `resize()`. `state.mode` 는 부팅 때 지금처럼 정한다.
- 처음 만들 때 상태를 재구성한다: 모든 선생님 `addTeacher` · `setLevel(silent)` · `setProfile(constellation)` · `fx.predict(bars)` · 배경(`media.bg` → `applyVideo`) · `setGraph(LINKS.graph(...))`. 무대가 없는 동안 일어난 `fx.ingest/learned/link` 는 `state.fxQueue`(최대 6, 각 `{fn, args, at}`)에 쌓고, 열 때 300ms 간격으로 재생한 뒤 비운다(`prefers-reduced-motion` · `sRed` 면 재생하지 않는다).
- `41-stage.js` 추가 API(기존 API 이름은 모두 유지 — `run-stage-smoke.js` 가 그대로 돈다):
  - `stage.setGraph({nodes, edges})` — `nodes: [{id, kind:"exam|passage|handout|question|note|prediction|mock", label, size, teacherId, hit, pUse}]`, `edges: [[from, to, kind]]`. 선생님 노드는 기존 리그. 문항은 `THREE.Points` 하나(속성 버퍼), 시험 · 지문 · 프린트 · 예측 · 모의고사는 `InstancedMesh`(모양별), 메모는 `InstancedMesh`(마름모), 간선은 `LineSegments` 하나 — 간선이 200 개를 넘으면 호버/포커스 노드의 이웃만 그린다.
  - 배치: 선생님 중심 → 시험 링(반지름 3.6, 시험 순) → 지문 · 프린트 링(5.2, 자료 순 · 프린트 지문은 안쪽 4.6) → 문항은 매칭 지문 주위 산개(매칭 없으면 시험 링 바깥) → 메모 · 예측 · 모의고사는 이어진 노드 옆. 선택되지 않은 선생님의 그래프는 그리지 않는다(선생님 `"*"` 이면 선택된 것이 없으므로 그래프 없음, 다이얼만).
  - `stage.clearGraph()` · `stage.graph()`(현재 nodes/edges — e2e 용) · `stage.pickNode(x, y)` → `{id, kind}|null`(선생님 포함; 문항은 가장 가까운 점, 8px) · `stage.focusNode(id|null)` · `stage.setNodeFilter(kinds[])` · `fx.link(a, b)`(두 노드 사이 선이 0.8초에 걸쳐 자란다) · 기존 `pick(x,y)` 는 선생님만 돌려준다(드롭 호환).
- 2D 폴백 `46-graph2d.js`: `makeGraph2D(canvas, {onPick, onHover})` → `{setGraph, setFocus, setNodeFilter, resize, pause, resume, pick, dispose}`. 힘 배치(반발 · 스프링 · 감쇠), 노드 ≤ 400, 120 스텝 뒤 고정, 보일 때만 rAF. 선생님 카드 `#flatGrid .tcard[data-id]`(드롭 · 선택 · `#flatNew`)는 2D 캔버스 위 열에 그대로.
- 필터 칩 `#brainBar [data-node]` 상태는 localStorage. `#brain2d` 는 `saveUi({forceFlat})` 없이 이번 세션만 2D(설정 `#sFlat` 은 영구).
- 배경 영상 슬롯 · 힉스필드 프롬프트 · 화질 · 움직임 설정은 브레인 뷰의 것(설정 문구를 "브레인 뷰" 로 바꾼다).

### 3.5 전체 검색 — 색인 구조 · 랭킹 · 토큰화 (`42-index.js`)

- **문서 단위** = 노트 하나. `INDEX.docOf(store, doc, ctx)` 가 `{id, store, kind, teacherId, title, sub, fields:{title, tags, memo, props, body}, createdAt, updatedAt}` 로 만든다. `ctx` = `{examTitle(id), passageSrc(id), memoOf(anchorKey)}`.
  - 제목 규칙: 시험 `TEXT.examLabel(meta)`, 문항 `"{시험 제목} · {number}번"`, 지문 `p.src || "지문"`(+ 선생님이 여럿이면 자동완성에서 `· {선생님}`), 자료 `s.name`, 프로파일 `"프로파일 V{n}"`, 예측 `target.label + " 예측"`, 모의고사 `m.title`, 메모 `title || body 첫 줄(40자)`, 질문 `"물어보기: " + q(40자)`, 선생님 `name`.
  - body: 문항 = 발문 + 선지 + 정답 + 특징 + rawBlock 앞 600자 / 지문 = 요지 + 원문 앞 400자 / 시험 = 요약 + 원문 앞 1,500자 / 자료 = 프린트 포인트 텍스트 + 원문 앞 1,500자 / 프로파일 = 서술 + 키워드 + 델타 / 예측 = copyText / 모의고사 = 문항 발문들 / 메모 = 본문 전체 / 질문 = 질문 + 답.
  - props: 종류 · 시험 라벨 · 유형 · 소유형 · 형식 · 난이도 · 변형 · 어법 포인트 · 장르 · 자료 종류 · 프린트 적중 종류.
  - memo: anchor 메모 본문. tags: 사용자 태그 + 파생 태그.
- **토크나이저** `INDEX.tokenize(s)`: NFKC · 소문자 → 영문 `[a-z0-9]+`(2자 이상, 어미 `s/es/ed/ing` 제거 · 숫자는 그대로) → 한글은 공백 · 기호를 제거한 음절 덩어리의 **2-gram**(덩어리가 1글자면 그 글자) → `#태그` 는 `#` 포함 한 토큰 → 원문자 · 기호는 버린다. `TEXT.norm` 을 재사용하지 않는다(norm 은 기호를 지우고 한글을 남기므로 그 앞단계만 공유).
- **구조**: `post: Map<token, Map<docId, {tf:{f:n}}>>`(필드별 tf) · `len: Map<docId, n>` · `df` · `docs: Map<docId, doc>` · `titles: [{id, lower, kind, teacherId}]`. 점수 = 필드 가중 BM25(k1 1.2 · b 0.6, 가중 title 3 · tags 3 · memo 2 · props 1.5 · body 1) + 같은 선생님 ×1.3 + 90일 안 ×1.1 + 제목 정확 일치 ×2.
- **API**: `rebuild(all)`(`{store: docs[]}` 전량 — `setTimeout(0)` 조각으로 200개씩, `state.progress`) · `upsert(store, doc)` · `remove(id)` · `search(q, {teacherId, kinds, limit=30, minScore})` → `[{id, store, kind, title, sub, score, snippet, matched:[tokens]}]` · `titles({teacherId})` · `prefix(q, {teacherId, limit})` · `grep(q, {teacherId, limit=20})` → `[{id, store, pos, snippet}]`(passages.text · exams.text · sources.text 에 `indexOf`, 대소문자 무시) · `clear()` · `state {ready, building, progress, n}` · `on(fn)`.
- **언제 다시 짓나**: 부팅(`SYNC.bootstrap` 뒤) · `importJson` 뒤 · `wipeAll` · `deleteTeacher` 뒤 · 설정 `#sReindex`. 증분은 `DB.onWrite` 훅(§4.4)으로 `put/putAll/del/delWhere/clear` 마다. bootstrap 의 `putAll(silent)` 는 훅을 부르지 않고(대량) 끝에 한 번 rebuild.
- **색인 전 상태**: `state.ready === false` 면 ⌘K 목록에 "색인 중 n%" 만, 물어보기 `#askGo` 비활성 + `#askStatus` "색인이 끝나면 물을 수 있어요".
- **원문 안에서 찾기**: 질의가 12자 이상이거나 따옴표로 감쌌으면 ⌘K 가 `grep` 도 돌려 "원문에서" 그룹으로 보여 준다. 클릭 → 지문 노트에서 그 문장을 `mark` 로 강조(`#/n/<id>?at=<pos>`).
- 메모리: 지문 500 · 문항 1,000 · 메모 500 규모에서 토큰 ~30만, 수 MB. 저장하지 않는다(재구축이 싸고 동기화와 어긋나지 않는다).

### 3.6 물어보기 — RAG 파이프라인 (`45-ask.js`)

1. **범위**: `#askScope` 선생님(또는 `*`). `ctx`(열린 노트 · `#brainHudAsk` · `#asideAsk`)가 있으면 그 노트와 `LINKS.neighbors(ctx, 1)` 이웃을 근거 후보 맨 앞에 넣는다. 이웃 몫은 `max(1, ⌊k/3⌋)` 까지다 — 예측 노트는 유력 지문이 30개, 시험 노트는 문항이 수십 개라 몫이 없으면 이웃만으로 `k` 가 다 차서 질문으로 찾은 근거가 하나도 못 들어간다. 종류 상한을 면제받는 것은 열린 노트 자신뿐이다.
   범위가 `*` 면 근거가 여러 선생님 것으로 섞이므로 근거마다 `teacherName` 을 `sub` 앞에 붙이고(프롬프트 머리글 · `#askCites` 칩 둘 다) 프롬프트에 "선생님별로 나누어 답하고 합치지 말 것" 을 넣는다.
2. **구조 근거** `ASK.structured(question, {profile, prediction, teacher})`: 질문에 유형명(`ANALYZE.TYPES`) · "몇 문항" · "문항 수" · "배점" · "비중" · "반영율" · "유력" · "확률" · "신뢰도" · "난이도" · "서술형" · "어법" 이 있으면 최신 프로파일 · 예측에서 숫자를 **로컬로** 뽑아 줄로 만든다(예: `프로파일 V3 (2026-09-14) · 빈칸 21% (시험당 3.0문항 · 평균 2.7점) · 서술형 14% · 프린트 반영율 57% · 예측 2026 1학기 중간: 빈칸 4문항 · 유력 지문 1위 Lesson 3 · Reading 1 (82%)`). 항상 선생님 카드 한 줄과 `PROFILE.compact()` 는 시스템 프롬프트에 들어간다.
3. **검색**: `INDEX.search(question, {teacherId, limit: 40})` → **점수 하한**: `score >= max(2.0, 0.3 × top)` 이고 질문 토큰 중 2개 이상(질문 토큰이 2개 이하면 1개) 매칭된 문서만 → 종류 다양성 상한(문항 8 · 지문 5 · 프린트 3 · 메모 5 · 시험 3 · 질문 2 · 모의고사 1) → 1홉 확장(문항이 뽑히면 매칭 지문, 지문이 뽑히면 그 지문을 쓴 문항 상위 3) → 예산 12,000자(`#sAskK` 8/12/16 개 상한) 안에서 자른다.
4. **근거 블록** `ASK.evidenceText(ev)`: 문항 = 발문 + 선지 + 정답 + 변형 + 매칭 지문 제목 + ★(≤ 600자) · 지문 = 요지 + 첫 두 문장 + 어법 타깃(≤ 700자) · 프린트 = 대상 시험 + 반영율 + 포인트 목록(≤ 800자) · 메모 = 본문(≤ 1,200자) · 시험 = 요약 + 반영율 + 문항 수 · 질문 = 답(≤ 600자) · 모의고사 = 문항 발문 목록.
5. **프롬프트** `PROMPTS.ask(o)` → `{system, user}` (§5.4). `API.call(user, {system, cacheSystem:true, light: state.ui.askLight !== false, tier:"default", effort:"medium", onText, signal})` — **JSON 이 아니라 평문 스트리밍**. 답의 마지막 줄 `USED: 1,2,3`, 그 다음 줄 `FOLLOWUP: 질문 | 질문`.
6. **표시**: 스트리밍 중 `[n]` 을 정규식으로 `.cite[data-id]` 칩으로 바꾼다(`TEXT.esc` 뒤). 칩에는 그때의 근거 미리보기를 `data-prev` 로 박아 둔다 — `#askLog` 는 질문마다 쌓이고 번호는 1부터 다시 매겨지므로, 호버 팝업(`#citePop`)이 마지막 질문의 근거를 보면 지난 답의 칩이 엉뚱한 글을 보여 준다. 끝나면 `USED` 를 파싱해 안 쓴 근거는 `.unused`(흐리게), 없는 번호는 `.dashed`. `FOLLOWUP` 은 `.followup` 버튼. `#askStatus` 3단계(근거 모으는 중 → n개 찾음 → 답 쓰는 중). `#askCost` 에 근거 수 · 글자 수 · 이번 세션 질문 수.
7. **저장**: 답이 끝나면 `ASK.save()` → `notes` 에 `kind:"ask"`(`ask:{question, scope, ctx, model, evidence:[ids], used:[n]}`, 본문 = 답 ≤ 4,000자) + `links(kind:"cite")`(질문 노트 → 인용된 노트마다) + `events(ask)`. 인용된 노트의 백링크에 "물어보기: …" 가 생긴다. `#askSave` 는 그 노트를 열 뿐(저장은 자동).
8. **보내는 몸짓**: `#askGo` · `#askInput` ⏎ · 오늘 화면 `#homeAskGo` · 노트 오른쪽 `#asideAskGo`/⏎ · `#nAskAgain` · 후속 질문 · ⌘K 의 `?질문` ⏎ · `cmd:ask` — 전부 `VIEWS.submitAsk(q, ctx)` 를 지나 실제로 묻는다(주소만 바꾸면 §3.6 의 force 가드에 걸려 아무 일도 안 난다). 주소에 `q` 가 있어도 몸짓이 없으면 묻지 않고 `#askInput` 에 채워만 둔다(뒤로가기 · 북마크). 앞 질문이 도는 중이면 조용히 버리지 않고 입력칸에 되돌려 주며 [중단하고 새로 묻기] 를 띄운다.
9. **근거 0**: 모델을 부르지 않고 `#askEmpty` 문구 + "자료 넣기" 버튼(`#askEmptyFiles` → 파일 시트). **키 없음**: `#askGo` 비활성 + 설정 열기 링크. **중단**: `#askStop` → AbortController → 지금까지의 답을 남기고 `USED` 없이 저장.
10. 비용: 근거 12,000자 상한 · 구조 질의는 LLM 없이 · 시스템 프롬프트 캐시(`cacheSystem`) · 기본 Sonnet(`light`).

### 3.7 타임라인 · 데일리 로그 · 주간 집계

- 데이터: `events`(선생님 범위 또는 전체) + `notes(kind:daily|weekly|note|ask)` 를 날짜별로 합친다. 주 단위로 읽는다(`DB.range("events","at",lo,hi)`). 새 이벤트 종류: `note`(메모 생성 · anchor 첫 저장) · `ask` · `link`(수동 링크) · `match`(수동 매칭 수정 — 지금 `edit` 대신). 기존 10종(`teacher.create ingest index learn predict generate edit export import error`)은 그대로.
- 상한: `APP.log()` 는 선생님당 2,000건을 넘으면 가장 오래된 것부터 지운다(50건마다 검사, 삭제는 `DB.del` → 클라우드도 삭제).
- `#tlWeek` = `APP.weekSummary(teacherId, weekStart)` 로컬 집계: 넣은 파일 수 · 문항/지문 증가 · 프로파일 V 이동 · 예측 수 · 반영율 변화 · 메모 수 · 질문 수. `#tlRetro` "회고 쓰기" = 그 집계 문장을 본문 초안으로 넣은 `weekly` 노트를 만들어 연다(LLM 초안은 §10).
- `#tlToday` "+ 오늘 로그" = `NOTES.ensureDaily(today, teacherId)` 로 열기.

### 3.8 성장 지표

`APP.growth(teacherId)` → `{questions, passages, handoutRate, profileVersion, notes, week:{questions, passages, notes}, spark:[8]}`. spark = 최근 8주 각 주에 만들어진 문항 + 지문 + 메모 수(createdAt 기준). 오늘 `#homeStats` · nav `#navGrowth` · 상태줄 `#indexMini` 가 같은 함수를 쓴다. "링크 수" 는 어디에도 쓰지 않는다.

### 3.9 커맨드 팔레트 — 명령 목록

접두: 없음 = 검색(노트 + 원문 + 명령 몇 개) · `>` 명령만 · `#` 태그만 · `?` 곧장 물어보기 · `q:` `p:` `e:` `s:` `n:` `t:` 종류 제한. ↑↓ 이동 · ⏎ 열기 · ⌘⏎ aside 미리보기 · Esc 닫기. 150ms 디바운스, 결과 ≤ 30.

| 명령(`data-hit`) | 이름 | 조건 |
|---|---|---|
| `cmd:new` | 새 선생님 | |
| `cmd:files` | 파일 넣기 | 선생님 있음 |
| `cmd:camera` | 사진 찍기 | 모바일 |
| `cmd:quick` | 빠른 메모 "…"(입력 텍스트) | |
| `cmd:learn` `cmd:predict` `cmd:mock` | 학습 · 예측 · 적중 모의고사 | 독 규칙과 같은 활성 조건 |
| `cmd:ask` | 두뇌에게 묻기 "…" | 키 · 색인 |
| `cmd:today` `cmd:inbox` `cmd:library` `cmd:brain` `cmd:timeline` `cmd:askview` | 화면 이동 | |
| `cmd:brainfocus` | 브레인에서 보기(현재 노트) | 노트 뷰 |
| `cmd:teacher:<id>` | 선생님 전환 | |
| `cmd:prints` | 프린트 반영율(→ 서재 프린트) | |
| `cmd:mocks` | 지난 모의고사 | |
| `cmd:blueprint` | 청사진 복사 | 예측 있음 |
| `cmd:export` `cmd:exportone` `cmd:import` | 전체 백업 · 이 선생님만 · 불러오기 | |
| `cmd:settings:<tab>` | 설정 탭 | |
| `cmd:help` | 단축키 | |
| `cmd:flat` | 2D/3D 전환 | 브레인 뷰 |
| `cmd:video` | 배경 영상 | |
| `cmd:daily` | 오늘 로그 열기 | |
| `cmd:reindex` | 색인 다시 짓기 | |

### 3.10 키보드 단축키

| 키 | 동작 | 비고 |
|---|---|---|
| `⌘K` / `Ctrl+K` | 팔레트 | **입력창 안에서도** 동작 |
| `/` | 물어보기 입력 포커스(`#asideAskInput` → 없으면 `#/ask`) | 입력 밖 |
| `⌘Enter` | 메모 저장 · 파일 시트 넣기 · 질문 전송 | 입력 안 |
| `Esc` | 우선순위: `#paper` › 시트 › `#cmdk` › `#acPop` › 메뉴 › `#asidePeek` › `#brainFull` 해제 › 메모 편집 중이면 미리보기로 | 입력 안에서는 `#acPop` 닫기 → 시트 닫기 |
| `N` `O` `L` `P` `M` | 새 선생님 · 파일 · 학습 · 예측 · 모의고사 | 기존 |
| `← →` | 이전/다음 선생님 | 기존 |
| `[` `]` | nav · aside 접기 | 기존 의미 유지 |
| `?` | 도움말 | 기존 |
| `Delete` | 선택한 선생님 삭제 시트 | 기존 |
| `G` `H` `I` `T` `A` | 브레인 · 오늘 · 인박스 · 타임라인 · 물어보기 | 신설 |
| `E` | 내 메모 편집 ↔ 미리보기 | 노트 뷰 |
| `C` | 빠른 메모 포커스 | 오늘 · 인박스 |
| `1`~`8` | 서재 n번째 목록 | 신설 |
| `Backspace` | (없음 — §10) | |

가드: 단일 글자 단축키는 `e.target` 이 `input/textarea/select/[contenteditable]` 이 아니고 오버레이가 없을 때만. `e.metaKey/ctrlKey/altKey` 가 있으면 ⌘K · ⌘Enter 만 처리하고 나머지는 브라우저에 준다. `e.isComposing` 이면 전부 무시.

### 3.11 온보딩 · 빈 상태 · "무엇이 바뀌었나"

- `#onboard` 는 오늘 화면 카드. 문구: ① "엔진 연결 — API 키를 저장하면 시험지를 읽고 학습해요" [키 넣기 `#ob1Btn`] ② "선생님 — 흑석고 윤은영(영어A) · 전정이(영어B)가 준비돼 있어요" [＋ 선생님 추가 `#ob2Btn`] ③ "파일 넣기 — 기출 시험지 · 시험범위 원문 · 선생님 프린트를 **인박스에** 놓으세요" [인박스 열기 `#ob3Btn`] (`#ob3Note` "선생님을 만들면 열려요"). 완료 조건은 지금과 같다(문항 또는 지문이 생기면 `onboardingDone`).
- `#homeChanged`(1회, localStorage `orun_oracle_ui2.changedSeen`): "홀로그램은 브레인(G), 파일은 인박스(I), 상세는 노트 페이지로 갔어요. ⌘K 로 무엇이든 찾고 물어보세요."
- 빈 상태마다 다음 행동 버튼(기존 토스트 문구를 승격): 시험 없음 → "기출 시험지를 인박스에 놓으세요" [파일 넣기]; 프로파일 없음 → "문항이 1개 이상이면 학습할 수 있어요" [학습](문항 0 이면 비활성 + 이유); 예측 없음 → "학습 뒤 예측할 수 있어요" [예측]; 모의고사 없음 → "예측 뒤에 만들 수 있어요"; 범위 원문 없음 → "범위 원문이 없어 유력 지문을 고를 수 없어요" [파일 넣기]; 프린트 없음 → "파일을 넣을 때 칩을 '프린트' 로 두면 반영율을 계산해요"; 메모 없음 → "이 노트에 첫 메모를 적어 보세요 — [[ 로 잇고 # 로 태그"; 브레인 노드 1개 → "파일을 넣으면 여기서 가지가 뻗어요".
- 도움말 시트(`openHelp`)의 표는 §3.10 전체로 다시 쓴다. 파일 드롭 행: "인박스 · 오늘 · 어디에나 놓으면 파일 시트가 떠요 · 브레인에서는 홀로그램 위에".

### 3.12 큐 · 학습 · 예측 · 모의고사 (변경 없음 + 위치)

- 학습 `APP.learn` 은 그대로이되 서술 프롬프트에 **강사 메모**를 싣는다: 선생님 anchor 메모 + 최근 프로파일 3판의 anchor 메모(각 300자, 최대 3개) → `PROFILE.narrate(profile, signal, {notes})` → `PROMPTS.narrative(compact, stems, notes)` 의 `[강사 메모]` 블록. 프로파일 노트에 "이 판의 서술에 반영된 메모 n개" 표시.
- 예측 시트에 `#pdDate`(선택, 시험 날짜) 를 더한다 → `target.date`. 오늘 화면 D-day 는 최신 예측의 `target.date` 가 있을 때만.
- 모의고사 시트 · 시험지 · DOCX · 인쇄 · 중단(`#qAbortGen`) 그대로. 지문 노트의 `#pMock` 은 모의고사 시트를 그 자료만 체크해 연다.

### 3.13 심사평 missing 항목의 답

| # | 문제 | 결정 |
|---|---|---|
| 1 | 작업공간이 여럿의 것 · 개인 UI 상태가 settings 로 거울됨 | 개인 UI 상태(nav/aside 접힘 · lastRoute · 최근 노트 · 그래프 필터 · 첫 화면 · changedSeen)는 **localStorage `orun_oracle_ui2`**. `settings.ui` 는 지금 있는 공용 취향(autoLearn · quality · reduced · forceFlat · light · showFps · lastTeacherId)만. 메모에 `author` 서명 |
| 2 | bootstrap 이 클라우드로 로컬을 덮음 | `notes` `links` `tags` 는 `updatedAt` 비교 병합(§4.5). 나머지 저장소는 지금 규칙 |
| 3 | 백업 schema | **schema 는 1 로 둔다.** 키만 더한다(`notes` `links` `tags`). 옛 앱은 모르는 키를 조용히 버리고, 새 앱은 옛 백업(키 없음)을 그대로 읽는다 |
| 4 | 인쇄 | `#paper` 는 body 직계. `@media print { body > *:not(#paper) {display:none} }` 유지 + `#nav #aside #topbar #statusbar #tabbar #cmdk #toasts #acPop` 명시 숨김. 새 전역 규칙(`button{font-family:var(--fk)}` 등)은 `#paperPage` 와 `FONT` 상수에 닿지 않는다(`#paperPage` 는 명조 고정, e2e 스크린샷 비교) |
| 5 | events · 질문 무한 누적 | events 선생님당 2,000건 상한 · 질문 답 4,000자 · 타임라인은 주 단위 range 읽기 |
| 6 | 비용 · 지연 | `#askCost` · 시스템 프롬프트 캐시 · 구조 질의 LLM 없음 · 근거 0 호출 없음 · 기본 Sonnet · 설정 `#sAskK` |
| 7 | 뒤로가기 vs 오버레이 | 오버레이는 히스토리 밖. 라우트 변경 시 오버레이 먼저 닫힘. Esc 우선순위 표(§3.10). 모바일 스와이프 백 = 브라우저 뒤로 = 라우트 |
| 8 | 지문 원문 검색 | `INDEX.grep` + ⌘K "원문에서" 그룹 + `?at=` 강조(§3.5) |
| 9 | `questions.note` 와 notes | 부팅 1회 `migrateLegacy` 로 anchor 노트에 복사(멱등 id). 이후 UI 는 새 저장소만 읽는다. AI 메모(`memo`)는 `#noteAiMemo` 로 분리 |
| 10 | 접근성 | 팔레트 · 자동완성 role/aria(§6.7) · `#askLog aria-live` · 포커스 링 · `--faint` 를 4.5:1 이상으로 |
| 11 | 모바일 캡처 | `#inboxCamera` + `#cameraInput capture="environment" multiple` |
| 12 | 씨앗 선생님과 `*` 범위 | `"*"` 이면 학습 · 예측 · 모의고사 · 파일 버튼 비활성(툴팁 "선생님을 골라 주세요"), 드롭은 `openPickSheet`, 서재 · 검색 · 타임라인은 전체, 물어보기 범위 전체 |
| 13 | 종류색 vs 선생님색 | 종류는 **모양 + 모노그램 배지**, 색은 선생님 소유. 금색은 프린트 전용 — `PALETTE[4]` 를 `#ffc857` → `#c9d86b` 로 바꿔 금색과 겹치지 않게(기존 선생님 색은 문서에 있어 안 바뀐다) |
| 14 | 글꼴 규칙 | `body` `--f` 유지 · 본문 컨테이너 `--fk` · Orbitron 은 라벨 · 숫자 · 아이브로우 · 키캡(§6.2). CLAUDE.md · AGENTS.md 문구를 같은 커밋에서 고친다 |
| 15 | 3D 지연 생성 시 상태 재구성 | `ensureStage()` 가 teachers/profile/prediction/backdrop 을 전부 다시 올린다(§3.4) |
| 16 | 문구 목록 | 온보딩 3단 · 도움말 · 설정 배경 탭 · `#brandSub` · 인박스 힌트 · `ob3Note` · 큐 키 없음 문구 (§3.11) |
| 17 | IndexedDB onblocked → 부팅 실패 | `DB.open` 은 `code:"blocked"` 로 거부하고 `APP.boot` 가 `#bootError` 를 그린다("다른 탭이 저장소를 붙잡고 있어요 — 다른 탭을 닫고 [다시 시도]"). `#bootRetry` 가 `open()` 을 다시 부른다(최대 5회, 그 뒤 새로 고침 안내) |
| 18 | 마크다운-라이트 XSS | `esc()` 먼저, 정규식 치환은 그 뒤. 클라우드에서 온 노트도 같은 경로. 단위 검사(§8) |
| 19 | 색인 재구축 시점 | §3.5 목록 + `state.ready` 게이트 |
| 20 | 근거 0 이 안 나옴 | 점수 하한 + 최소 토큰 일치(§3.6 3) |
| 21 | keydown 가드 · Esc | §3.10 |
| 22 | 분기점 | 900(narrow) · 720(flat) 둘로 통일 |
| 23 | 옛 UI 안내 | `#homeChanged` |
| 24 | 실수 삭제 복구 | 5초 취소 토스트(노트 · 링크 · 태그) |
| 25 | 열린 RLS + 실명 메모 | 설정 › 브레인 `#sPrivate`(메모 · 링크 · 태그를 거울하지 않음) + 메모 편집기 아래 상시 안내 "작업공간 이름을 아는 사람은 이 메모를 볼 수 있어요" |

---

## 4. 데이터 모델

### 4.1 id 규약 (기존 `uid(prefix)` 그대로)

| 접두 | 저장소 | kind |
|---|---|---|
| `t_` | teachers | teacher |
| `e_` | exams | exam |
| `q_` | questions | question |
| `p_` | passages | passage |
| `s_` | sources | source (`kind === "프린트"` 이면 프린트) |
| `pf_` | profiles | profile |
| `pd_` | predictions | prediction |
| `m_` | mocks | mock (**`mk_` 아님**) |
| `n_` | notes | note (`kind` 필드로 anchor/note/daily/weekly/ask) |
| `lk_` | links | — |
| `tag:` | tags | — |
| `ev_` | events | — |
| `j_` | (메모리) 큐 작업 | — |

`NOTES.kindOf(id)` · `NOTES.storeOf(id)` 가 접두로 푼다. 모든 노트 주소는 `#/n/<id>`.

### 4.2 새 저장소 (`30-db.js` `VERSION = 2`)

```js
notes: { key: "id", idx: ["teacherId", "anchorKey", "kind", "date", "updatedAt"] },
links: { key: "id", idx: ["teacherId", "from", "to"] },
tags:  { key: "id", idx: ["teacherId"] },
events: { key: "id", idx: ["teacherId", "at"] },   // "at" 인덱스 추가 (기존 루프가 없는 인덱스만 만든다)
```

문서 모양

```js
// notes
{ id: "n_…", teacherId: "t_…" | null, kind: "anchor" | "note" | "daily" | "weekly" | "ask",
  anchorKey: "questions:q_…" | "",  anchor: { store, id } | null,  orphanOf: { store, id, title } | null,
  title: "", body: "", tags: ["재출제"], links: [{ text: "Lesson 3 · Reading 1", to: "p_…" | null }],
  date: "2026-09-14" | null,   // daily · weekly(월요일)
  ask: { question, scope, ctx, model, evidence: ["q_…"], used: [1, 2], followups: [] } | null,
  pinned: false, author: "", source: { kind: "quick" | "editor" | "ask" | "legacy" | "retro" }, createdAt, updatedAt }
// links  (id = "lk_" + from + "~" + to + "~" + kind)
{ id, teacherId, from: "n_…", to: "p_…", kind: "wiki" | "cite" | "manual", text: "", author: "", createdAt, updatedAt }
// tags   (id = "tag:" + name, name 은 앞 # 제거 · 공백 제거 · 영문 소문자)
{ id, teacherId: null, name: "재출제", color: "", desc: "", pinned: false, author: "", createdAt, updatedAt }
```

### 4.3 기존 저장소에 더하는 필드 (없으면 기본값으로 읽는다 — 마이그레이션 코드 없음)

| 저장소 | 필드 | 뜻 |
|---|---|---|
| exams · sources · passages · profiles · predictions · mocks · teachers | `updatedAt`(없으면 `createdAt`) | 색인 · 최근 |
| predictions | `target.date: "YYYY-MM-DD" | null` | D-day |
| events | 새 `kind`: `note` `ask` `link` `match` · `ref.id`(문서 id — 타임라인 점프) | |
| settings | `brain: { migrated: { legacyNotes: true } }` · `ui.askLight` · `ui.askK` | 공용 |
| questions | (변경 없음 — `tags` `note` 는 읽기만) | |

### 4.4 `30-db.js` 변경

- `VERSION = 2`, 위 STORES. `onupgradeneeded` 의 기존 루프가 없는 저장소 · 인덱스를 만든다.
- `onblocked` → `rej(Object.assign(new Error("다른 탭이 저장소를 붙잡고 있어요 …"), { code: "blocked" }))`.
- 쓰기 훅: `DB.onWrite(fn)` — `fn({ op: "put"|"del"|"clear", store, docs?, keys? , silent })` 를 `put/putAll/del/delWhere/clear/wipe` 뒤에 부른다. `putAll(…, silent=true)`(bootstrap)는 `silent:true` 로 부르고 INDEX 는 무시한다.
- `DB.range(store, idx, lo, hi)` → `IDBKeyRange.bound`. `DB.getMany(store, ids)`.
- `DB.STORES` 에 새 셋이 포함되므로 `wipe()` 도 지운다.

### 4.5 `39-sync.js` 변경

- `STORES` += `"notes", "links", "tags"`. `PRIVATE = ["notes", "links", "tags"]`, `st.private = localStorage orun_oracle_private === "on"`; `setPrivate(v)`. private 이면 `push/remove/pushAll/bootstrap` 에서 PRIVATE 저장소를 건너뛴다.
- `bootstrap`: `MERGE = ["notes", "links", "tags"]` 는 문서별로 `local.updatedAt > cloud.updatedAt` 이면 로컬을 남기고 큐에 push, 아니면 `DB.put(cloud, true)`. 나머지 저장소는 지금처럼 `putAll(silent)`. 반환 `{pulled, pushed, merged}`. 끝나면 `APP` 이 `INDEX.rebuild` · `LINKS.rebuild` 를 한 번 돈다.
- `rowId(store, id)` = `<작업공간>:<저장소>:<id>`. 작업공간을 붙이지 않으면 이름에서 나온 id(`tag:빈칸` · `settings:ui`)가 작업공간끼리 같은 행을 빼앗는다(표의 기본키가 `id` 하나뿐이고 쓰기는 `on_conflict=id`). 옛 규칙으로 올라간 행은 `bootstrap` 이 한 번 읽고 지운다. `teacher_id` 는 그대로(`teacherId` null 이면 null — 공용 태그 · 고아 메모).
- **삭제는 묘비(tombstone)로 남긴다.** 행을 지우는 대신 같은 `id` 에 `data = { __deleted: true, at, <키필드>: id }` 를 쓴다. `bootstrap` 은 묘비가 있는 문서를 로컬에서도 지우고(`DB.del(store, key, true)` — 다시 올리지 않는다) `mine` 에서도 뺀다. 묘비가 없으면 "지웠다" 와 "아직 안 올렸다" 를 구분할 수 없어 다른 기기가 지운 문서를 되살린다. 묘비는 180일 뒤 진짜로 지운다.
- **못 보낸 삭제는 localStorage(`orun_oracle_pendel`)에 적어 둔다.** 오프라인 · 개인 모드 · 동기화 꺼짐에서 지운 것이 탭과 함께 사라지지 않는다. `bootstrap` · 동기화 켜기 · 개인 모드 끄기에서 다시 큐에 올린다.
- **`flush` 는 요청이 나가 있는 동안 들어온 쓰기를 버리지 않는다.** 큐 항목마다 단조 증가 `seq` 를 달고, 배치를 보낸 뒤에는 그 배치 항목과 `seq` 가 그보다 작거나 같은 같은-id 항목만 지운다.
- **작업공간을 바꾸면 받기만 한다.** `setWorkspace` 가 바뀜을 기록하고(`orun_oracle_ws_new`) 다음 `bootstrap` 이 `mine` 자동 push 를 건너뛴다. 올리려면 설정 › 클라우드의 [모두 올리기](`#cPush`). 안 그러면 동료 작업공간 이름을 넣는 순간 이 브라우저의 자료가 통째로 그쪽에 합쳐진다.
- `setPrivate(true)` 는 **지금부터** 올리지 않을 뿐이라 이미 올라간 메모 · 링크 · 태그는 남는다. UI 가 토스트로 `SYNC.wipePrivateCloud()` 를 물어본다(§3.13). 노트 화면의 "이 브라우저에만" 문구도 그 뜻으로 적는다.

### 4.6 개인 UI 상태 (localStorage, 거울하지 않음)

`orun_oracle_ui2` = `{ nav: "open"|"closed", aside: "open"|"closed", lastRoute, recent: [id…8], graphFilters: {…}, home: "today"|"brain", changedSeen: true, askScope, libSort: {kind: [field, dir]} }`. `orun_oracle_author` = 서명. `orun_oracle_private` = "on"|"off". 기존 `orun_oracle_ws` · `orun_oracle_sync` · `orun_api_key` 등 그대로.

### 4.7 백업

`exportJson` 에 `notes: await pick("notes")`, `links`, `tags` 를 **명시로** 더한다(`pick` 은 teacherId 인덱스 — 선생님별 백업이면 그 선생님 것 + `teacherId null` 인 태그). `importJson` 은 `for (const s of ["profiles","predictions","mocks","events","notes","links","tags"]) if (Array.isArray(j[s])) await DB.putAll(s, j[s])`. `schema` 는 1 유지. 불러온 뒤 `INDEX.rebuild` · `LINKS.rebuild`.

### 4.8 파생(저장하지 않음)

`LINKS` 파생 그래프 · `INDEX` 색인 · 파생 태그 · 태그 카운트 · 성장 지표 · 다음에 할 일 · 주간 집계.

### 4.9 마이그레이션(추가만)

1. IndexedDB v1 → v2: 저장소 3 · 인덱스 1 추가. 데이터는 그대로.
2. `NOTES.migrateLegacy(questions, teachers)`: `note` 가 비어 있지 않은 문항 · 선생님마다 `n_legacy_<id>` anchor 노트(없을 때만). `settings.brain.migrated.legacyNotes = true` 로 한 번만.
3. 클라우드에 옛 문서만 있는 기기: bootstrap 뒤 같은 마이그레이션이 돈다(멱등).

---

## 5. 모듈 계약

### 5.1 파일과 빌드 순서 (`build.sh` 의 for 목록 = 번호 순)

```
30-db 31-extract 32-api 33-text 34-prompts 35-analyze 36-profile 37-predict 38-generate 39-sync
40-post 41-stage
42-index 43-links 44-notes 45-ask 46-graph2d
50-app-core 51-router 52-app-shell 53-ui-note 54-ui-views 55-ui-brain
```

- `51-app-ui.js` 는 지운다(내용이 52~55 로 나뉜다). `40-post.js` `41-stage.js` 이름은 그대로(`run-stage-smoke.js` 가 읽는다).
- **Node 안전**: 42~45 는 IIFE 시점에 `window/document/location/localStorage` 를 만지지 않는다(함수 안에서만). `unit.js` 가 이 넷을 잘라 Node 에서 돌린다: `cut("INDEX","LINKS") + cut("LINKS","NOTES") + cut("NOTES","ASK") + src.slice(indexOf("  const ASK = (function () {"), indexOf("  function makeGraph2D("))`. 반환 객체에 `INDEX, LINKS, NOTES, ASK` 를 더한다. 44-notes 는 `DB` 를 호출 시점에만 쓴다(단위 검사는 `parse/render/anchorKey/kindOf` 만).
- 선언 모양은 전부 `  const NAME = (function () {` (unit.js 의 cut 마커).
- `window.ORACLE = { APP, UI, API, DB, SYNC, TEXT, ANALYZE, PROFILE, PREDICT, GENERATE, INDEX, LINKS, NOTES, ASK, ROUTE, BUILD }`.
- `start()`: `UI.init()` → `ROUTE.init()` 는 `UI.init` 안에서 → `APP.boot()`.

### 5.2 `42-index.js` — `INDEX`

```
INDEX.tokenize(text) → string[]
INDEX.docOf(store, doc, ctx) → Doc            // ctx: { examTitle(id), passageSrc(id), teacherName(id), memoOf(anchorKey) }
INDEX.rebuild(all, ctx) → Promise<void>       // all: { teachers:[], exams:[], questions:[], passages:[], sources:[], profiles:[], predictions:[], mocks:[], notes:[] } — 조각 실행, state.progress 0..1
INDEX.upsert(store, doc, ctx) · INDEX.remove(id) · INDEX.clear()
INDEX.search(q, { teacherId, kinds, limit=30, minScore=0 }) → [{ id, store, kind, teacherId, title, sub, score, snippet, matched }]
INDEX.titles({ teacherId }) → [{ id, title, kind, teacherId }]
INDEX.prefix(q, { teacherId, limit=8 }) → 같은 모양 (접두 → 포함 순)
INDEX.grep(q, { teacherId, limit=20 }) → [{ id, store, kind, title, pos, snippet }]
INDEX.docs() → Map ; INDEX.get(id) → Doc|undefined ; INDEX.recent({ teacherId, limit }) → Doc[] (updatedAt 역순)
INDEX.state → { ready, building, progress, n } ; INDEX.on(fn)
```

### 5.3 `43-links.js` — `LINKS`

```
LINKS.rebuild(all) · LINKS.rebuildTeacher(teacherId, all) · LINKS.clear()
LINKS.derived(id) → [{ from, to, kind }]
LINKS.backlinks(id) → [{ from, kind, label, teacherId }]
LINKS.outlinks(id) → [{ to, kind, label }]
LINKS.neighbors(id, hops=1) → { nodes: [id], edges: [[a, b, kind]] }
LINKS.graph(teacherId, { kinds, focus, hops }) → { nodes: [{ id, kind, label, size, teacherId, hit, pUse }], edges: [[from, to, kind]] }
LINKS.resolve(text, teacherId, cacheId) → { id, title, kind } | null
LINKS.addUser({ from, to, kind, text, teacherId, author }) → Promise<doc>
LINKS.removeUser(id) → Promise ; LINKS.setUserLinks(from, [{ to, text }], kind="wiki") → Promise   // 그 노트의 wiki 링크 전체 교체
LINKS.userLinks({ from } | { to }) → doc[]
LINKS.counts(teacherId) → { nodes, edges }   // 브레인 상태줄용(지표 아님)
```

### 5.4 `44-notes.js` — `NOTES` (+ `NOTES.tags`)

```
NOTES.KIND / NOTES.kindOf(id) / NOTES.storeOf(id) / NOTES.prefixOf(store) / NOTES.anchorKey(store, id)
NOTES.parse(body) → { links: [{ text }], tags: [name] }
NOTES.render(body, resolve) → html            // resolve(text) → {id,title}|null ; esc 먼저
NOTES.excerpt(body, n=120) → string
NOTES.titleOf(doc) → string
NOTES.memo(anchorKey) → Promise<doc|null>
NOTES.saveMemo({ anchorKey, teacherId, body, author }) → Promise<doc|null>   // 빈 body 면 삭제
NOTES.create({ kind, title, body, teacherId, tags, date, source, ask, author }) → Promise<doc>
NOTES.update(id, patch) → Promise<doc> ; NOTES.remove(id) → Promise<{ undo }>  // 5초 뒤 확정
NOTES.orphan(store, ids) → Promise<n>
NOTES.migrateLegacy(questions, teachers) → Promise<n>
NOTES.daily(date, teacherId) → Promise<doc|null> ; NOTES.ensureDaily(date, teacherId) → Promise<doc>
NOTES.quick(text, teacherId, author, linkHints) → Promise<doc>       // 빠른 메모 (제목 = 첫 줄)
NOTES.relink() → Promise<n>              // 깨진 [[링크]] 중 이제 가리킬 노트가 생긴 것을 다시 잇는다 (APP.rebuildIndex · refreshLinks 가 부른다)
NOTES.sweepDeleted() → Promise<n>        // 지난 세션에서 5초 유예를 못 채운 삭제를 확정한다 (APP.boot 가 부른다)
NOTES.hidden(doc) → bool                 // 삭제 대기(pending) 이거나 deletedAt 이 찍힌 노트
NOTES.tags.load(docs) → n                // 태그 저장소 캐시를 채운다 — APP.rebuildIndex 가 all.tags 로 부른다(부팅 · 가져오기 · 다시 짓기)
NOTES.tags.ensure(names, author) → Promise ; NOTES.tags.list(teacherId) → [{ name, count, color }] ; NOTES.tags.rename(a, b) ; NOTES.tags.remove(name) ; NOTES.tags.docsWith(name, teacherId) → ids
NOTES.derivedTags(store, doc) → [name]
```

`saveMemo` · `create` · `update` 는 `linkHints: [{text, to}]` 를 받는다 — `[[` 자동완성에서 고른 문서의 id (§3.2 "같은 제목이 둘이면 id 로 구분").
삭제는 소프트 삭제다: `remove(id)` 가 그 자리에서 `deletedAt` 을 저장소에 적고(유예 중에는 목록 · 색인 · 그래프에서 빠진다) 5초 뒤 확정한다. 탭이 닫히면 다음 부팅의 `sweepDeleted()` 가 끝낸다 — 유예가 탭 수명에 달리지 않는다.

### 5.5 `45-ask.js` — `ASK`

```
ASK.KEYWORDS ; ASK.structured(question, { profile, prediction, teacher }) → [string]
ASK.retrieve(question, { teacherId, ctxId, k=12, budget=12000 }) → { evidence: [{ n, id, store, kind, title, text, why }], dropped }
ASK.evidenceText(doc, ctx) → string
ASK.prompt(question, { teacher, profile, prediction, structured, evidence }) → { system, user }   // PROMPTS.ask 위임
ASK.run(question, { teacherId, ctxId, signal, onText, onStatus }) → Promise<{ answer, used, invalid, followups, evidence, model, noEvidence, aborted }>
ASK.parseAnswer(text) → { body, used: [n], followups: [] }
ASK.renderCites(bodyHtml, evidence) → html     // [n] → <button class="cite" data-id data-n>
ASK.save({ question, result, teacherId, ctxId, author }) → Promise<noteDoc>
ASK.history(teacherId, limit) → Promise<doc[]>
```

`PROMPTS.ask({ teacherLine, compact, structured, evidence, question, ctxLine })` →

```
system:
{ROLE}
[역할 보강] 당신은 이 선생님에 관해 쌓인 노트만을 근거로 답하는 두뇌입니다. 근거에 없는 것은 "자료에 없어요" 라고 말합니다.
[선생님] 윤은영 · 흑석고 1학년 영어A · 시험 4 · 문항 61 · 프로파일 V3
[프로파일 요약] {JSON.stringify(compact)}
user:
[작업] 아래 [근거] 만을 근거로 강사의 질문에 한국어로 답합니다. 문장마다 근거 번호를 [n] 로 답니다. 숫자는 [구조 근거] 를 우선하고, 근거 번호 밖의 번호를 만들지 않습니다. 6문장 이내. 마지막 줄에 "USED: 1,2" 처럼 실제 인용한 번호를, 그 다음 줄에 "FOLLOWUP: 질문 | 질문" 을 씁니다. JSON · 코드펜스 없이 평문으로만.
[맥락] 지금 열려 있는 노트: 7번 · 빈칸 (선택)
[구조 근거]
프로파일 V3 (2026-09-14) · 빈칸 21% (시험당 3.0문항) · …
[근거]
[1 | 문항 | 2025 1학기 중간 · 5번 | 매칭 Lesson 2 · Reading 1 | ★프린트]
발문: … / 선지: … / 정답: ③ / 변형: 빈칸 · 마지막문장 · 구
[2 | 지문 | Lesson 3 · Reading 1 | 교과서 | ]
…
[질문]
빈칸을 주로 어디에 뚫어?
```

`mock-api.js` 는 `/아래 \[근거\] 만을 근거로 강사의 질문에/` 를 보고 **문자열**을 돌려준다(예: `"근거에 따르면 빈칸은 시험당 평균 3문항이며 마지막 문장에 뚫립니다 [1]. 프린트 지문에서 나온 비율은 절반입니다 [2].\nUSED: 1,2\nFOLLOWUP: 어법 포인트는? | 서술형 조건은?"`, 근거가 1개면 `[1]` 만). e2e 라우트는 `const a = mock.answer(prompt); body: mock.sse(typeof a === "string" ? a : JSON.stringify(a))`.

### 5.6 `34-prompts.js` · `36-profile.js` 변경

- `PROMPTS.ask(o)` 추가(위). `PROMPTS.narrative(compact, stemSamples, notes)` — `notes` 가 있으면 `[실제 발문 예시]` 앞에 `[강사 메모 — 강사가 이 선생님에 대해 직접 적은 관찰입니다. 통계와 어긋나면 통계를 우선하되, 통계가 말하지 않는 맥락으로 참고하세요]\n- …\n- …\n\n` 블록.
- `PROFILE.narrate(p, signal, opts)` — `opts.notes: string[]`(≤ 3, 각 ≤ 300자). 반환 `{ text, keywords, watchouts, at, usedNotes: n }`.

### 5.7 `41-stage.js` 추가 API

`setGraph(g)` · `clearGraph()` · `graph()` · `pickNode(x, y)` · `focusNode(id)` · `setNodeFilter(kinds)` · `nodeScreen(id) → {x, y, visible}|null`(캔버스 기준 픽셀 — HUD 배치 · e2e 용) · `fx.link(a, b)`. 기존 `addTeacher removeTeacher updateTeacher setProfile setLevel fx.{ingest,thinking,learned,predict,highlight} focus pick anchor resize setBackdrop setBackdropDim degrade fps teachers pause resume dispose debug` 그대로. `stage.running` 게터를 더한다(`pause/resume` 의 `running` 값 — e2e 용).

### 5.8 `46-graph2d.js` — `makeGraph2D(canvas, opts)`

`{ setGraph, setFocus, setNodeFilter, resize, pause, resume, pick(x, y) → {id, kind}|null, nodeScreen(id), dispose, running }`. `opts: { onPick(id), onHover(id), colorOf(teacherId) }`. 선언은 `  function makeGraph2D(canvas, opts) {` (두 칸 들여쓰기 — `unit.js` 의 ASK 구획 끝 마커).

### 5.9 `50-app-core.js` — `APP` 변경

- `boot()`: 무대를 만들지 않는다. 순서: settings → `SYNC.bootstrap` → teachers/seed → counts/latest → `NOTES.migrateLegacy` → `INDEX.rebuild` · `LINKS.rebuild`(비동기, `state.indexReady`) → `select` → `state.booted = true` → `emit("boot")`. `DB.open` 실패가 `code:"blocked"` 면 `emit("bootError", e)` 하고 종료(`#bootRetry` → `boot()` 재호출).
- 새 상태: `state.fxQueue: []` · `state.indexReady` · `state.selectedId` 에 `"*"` 허용.
- 새 함수: `ensureStage() → stage|null` · `leaveStage()`(`pause`) · `enterStage()`(`resume`+`resize`) · `queueFx(name, args)` · `growth(teacherId)` · `nextUp(teacherId) → [{ id, text, act, arg }]` · `weekSummary(teacherId, weekStart)` · `quickNote(text)` · `isAll()`.
- `stage` 를 참조하는 모든 `if (stage)` 는 그대로 두되, `fx.*` 호출은 `stage ? stage.fx.x(...) : queueFx("x", args)` 로 바꾼다(ingest · learned · predict · thinking 은 큐에 넣지 않음 — thinking 은 상태로 재구성).
- `learn()`: 강사 메모 수집 → `narrate(profile, null, { notes })`. 30판 가지치기 전에 `NOTES.orphan("profiles", ids)`.
- `deleteExam/deleteSource/deleteTeacher`: `NOTES.orphan` 먼저. `deleteTeacher` 의 `delWhere` 목록은 그대로(notes/links/tags 는 지우지 않고 `teacherId:null` 로 바꾼다 — `NOTES.detachTeacher(id)`).
- `setQuestionMatch`: `log(teacherId, "match", …, { id: questionId })`.
- `updateExamMeta`: `year/semester/term` 이 바뀌면 `recomputeReflection(teacherId)` 를 부른 뒤 `emit("data")`(프린트 `target` 일치가 바뀐다 — 지금은 부르지 않는다). 프린트 `target` 편집(자료 노트 `#dTy #dTs #dTt`)은 기존대로 `recomputeReflection`.
- `log()`: 상한 2,000/선생님.
- `exportJson/importJson/wipeAll`: §4.7. `wipeAll` 뒤 `INDEX.clear() · LINKS.clear()`.
- `emit` 이름: 기존(`boot teachers select data queue busy profile prediction mock toast needKey askVideo stageTap hover`) + `bootError` · `index`(색인 상태) · `note`(`{id, op}`) · `link` · `tag` · `ask` · `graph`(그래프 다시 그릴 것) · `growth`.
- `PALETTE[4] = "#c9d86b"`.

### 5.10 `51-router.js` — `ROUTE`

```
ROUTE.init()                       // hashchange 바인딩, 첫 라우트 (ui2.home 반영), 오버레이 닫기 훅
ROUTE.parse(hash) → { view, id, kind, name, query: {} }
ROUTE.go(path, { replace }) ; ROUTE.back() ; ROUTE.current() ; ROUTE.on(fn(route, prev)) ; ROUTE.href(route) → "#/…"
ROUTE.note(id) → "#/n/" + id ; ROUTE.all(kind, query) ; ROUTE.tag(name)
```

### 5.11 `52-app-shell.js` — `UI`

공개: `init toast openSheet closeSheet openSettings openTeacherSheet openDeleteSheet openFilesSheet openPickSheet openPredictSheet openMockSheet openHelp openPaper paperDocx openDrawer(어댑터) openCmdk closeCmdk run renderNav renderTopbar renderStatusbar renderTabbar renderOnboard updateEngine updateCloud setVideo ICONS irow esc h`. 키보드 · 드롭 · 팔레트 · 자동완성 팝(`UI.autocomplete(textarea, {teacherId})` — 53 이 쓴다) · 토스트 · 시트 전부 · 인쇄.

### 5.12 `53-ui-note.js` — `NOTEUI`

`render(id, query)` · `renderAside(id)` · `peek(id)` · `bindMemo(anchorKey, teacherId)` · 종류별 `blocks[kind](doc, data)` · `propsEditors`. 옛 `renderDrawer` 의 여섯 분기가 여기로 온다.

### 5.13 `54-ui-views.js` — `VIEWS`

`today()` · `inbox()` · `queueHtml(teacherId)`(기존) · `bindQueue(root)`(기존) · `library(kind, query)` · `tag(name)` · `timeline(week)` · `ask(query)` · `search(q)` · `renderAll(route)`.

### 5.14 `55-ui-brain.js` — `BRAINUI`

`enter(query)` · `leave()` · `refresh()`(`LINKS.graph` → `setGraph`) · `hud(id)` · `renderFlat()`(기존 tcard) · `bindDrop`(노드 드롭 부분) · `chipsLoop`(기존, `#vBrain` 안 좌표) · `fullscreen(on)`.

### 5.15 뷰 라우팅 규칙

- `ROUTE.on` → `UI.closeOverlays()` → `#main[data-view]` · `.view[hidden]` 토글 → `VIEWS/NOTEUI/BRAINUI` 렌더 → `UI.renderNav()`(활성 표시) → 브레인 진입/이탈 훅 → `ui2.lastRoute` 저장 → `#crumbs`.
- `APP.on("data"|"teachers"|"select"|"profile"|"prediction"|"mock"|"note"|"link"|"tag"|"ask")` → 현재 뷰만 다시 그린다(전체 `renderAll` 금지). `queue`/`busy` → 상태줄 · 인박스 · aside 큐만.
- 라우트 변경 시 `select` 는 필요할 때만(다른 선생님의 노트).

---

## 6. 시각 체계

### 6.1 밝기 — 어두운 화면 유지, "빛나는 HUD" → "잉크 위의 조용한 두뇌"

이유: 사용자가 JARVIS 룩을 좋아했고 스튜디오 · 생성기와 한 가족, 브레인 뷰 홀로그램과 배경 영상은 어두운 바탕에서만 성립, 시험지는 흰 종이라 대비가 산다. 대신 글 중심 뷰에서 유리 · 글로우 · 코너 장식을 걷어낸다.

### 6.2 토큰 (`10-css.html :root`)

```css
:root {
  /* 표면 */
  --bg: #0b1020;  --bg2: #0e1526;  --surface: #131c31;  --surface2: #18233b;
  --line: rgba(148,178,220,.14);  --line2: rgba(148,178,220,.32);
  /* 글 */
  --ink: #e6edf7;  --dim: #a9b8cc;  --faint: #8ea0b8;   /* --faint 는 --bg 7.1:1 · 카드(--surface) 6.4:1 · .ncard.new 겹침 4.5:1 — 어디에 놓아도 AA */
  /* 강조 — 홀로 청록은 링크 · 포커스 · 활동에만 */
  --holo: #5fc8ff;  --holo2: #9fe3ff;  --holo-soft: rgba(95,200,255,.14);
  --gold: #f5c518;  --ok: #46f0c5;  --bad: #ff6b7a;  --warn: #ffb454;
  --new: rgba(95,200,255,.16);            /* 24시간 안에 들어온 것 */
  /* 브레인 뷰 HUD 전용 (옛 이름 유지) */
  --void: #030812; --void2: #061024; --ice: #cfefff; --glass: rgba(6,18,40,.62); --glass2: rgba(6,16,36,.86);
  /* 글꼴 */
  --f: 'Orbitron', 'Noto Sans KR', 'Noto Sans', system-ui, sans-serif;   /* body — 규칙: 영문 Orbitron */
  --fk: 'Noto Sans KR', 'Noto Sans', system-ui, sans-serif;               /* 본문 · 입력 · 버튼 */
  /* 간격 · 모서리 · 그림자 · 모션 */
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px;
  --r-card: 10px; --r-input: 8px; --r-chip: 999px; --r-hud: 14px;
  --shadow-pop: 0 12px 40px rgba(0,0,0,.5);
  --t-fast: 120ms; --t-mid: 180ms; --t-view: 240ms; --ease: cubic-bezier(.2,.8,.2,1);
  --nav: 240px; --nav-min: 56px; --aside: 320px; --top: 48px; --status: 28px; --tab: 56px; --read: 760px;
}
```

### 6.3 타이포

| 역할 | 글꼴 | 크기 / 행간 / 자간 | 클래스 |
|---|---|---|---|
| 브랜드 | Orbitron 800 | 14px / .28em | `#brand b` |
| 아이브로우 · 구획 머리 | Orbitron 500 | 10px / 1 / .22em 대문자 | `.kicker` `.ph` `.sec h4` |
| 숫자 · % · 버전 · 날짜 · 키캡 | Orbitron 500 | 11~12px / .04em | `.num` `.en` `.badge` `kbd` |
| 지표 숫자 | Orbitron 600 | 26px / 1.1 | `.stat b` |
| 노트 제목 | Noto Sans KR 600 | 22px / 1.35 | `#noteTitle` |
| 뷰 제목 | Noto Sans KR 600 | 15px | `.view-title` |
| 본문 · 메모 · 발문 · 선지 | Noto Sans KR 400 | 14px / 1.7 | `.note-body` `.narr` |
| 표 · 속성 · 목록 | Noto Sans KR 400 | 13px / 1.5 | `.tbl` `.props` |
| 보조 | Noto Sans KR 400 | 11.5px, `--dim` | `.small` |
| 시험지 | 함초롬바탕 · Noto Serif KR | 변경 없음 | `#paperPage` |

규칙: `body { font-family: var(--f) }` 그대로. `#main, #nav, #aside, #cmdk, #sheetBody, #toasts, #statusbar, #tabbar, button, input, select, textarea { font-family: var(--fk) }`. 영문 본문(발문 · 선지 · 지문)은 Noto Sans 로 떨어진다. Orbitron 은 위 표의 클래스로만. **CLAUDE.md · AGENTS.md 의 글꼴 규칙 문구를 "영문 Orbitron 은 라벨 · 아이브로우 · 숫자 · 키캡, 영문 본문은 Noto Sans / Noto Sans KR, 시험지는 명조" 로 같은 커밋에서 고친다.**

### 6.4 간격 · 모서리 · 그림자 · 모션

- 4의 배수. 노트 섹션 사이 24, 속성 행 8, 카드 안 16, 카드 사이 12, 표 행 높이 36, 셀 좌우 10.
- 모서리: 카드 10, 입력 · 칩(사각) 8, 태그 칩 999, 브레인 HUD 14. `#aside` 는 0(벽에 붙음).
- 그림자: 팔레트 · 시트 · 미리보기만 `--shadow-pop`. 카드는 헤어라인. 글로우는 상태 LED · 브레인 노드 · `.busy` 진행 막대에만. `text-shadow` 는 `.hud` 안에서만.
- 모션: 호버 120ms · 패널 180ms · 뷰 전환 240ms(페이드 + 6px 상승) · 성장 펄스 400ms 1회 · `.new` 하이라이트는 24시간 뒤 사라짐(클래스 계산). `prefers-reduced-motion` 과 `sRed` 는 전부 끈다(기존 `* { transition-duration:.01ms }` 규칙 유지).
- 포커스: `:focus-visible { outline: 2px solid var(--holo); outline-offset: 2px }` 전역.
- 배경: `#room` 방사 그라디언트 · 스캔라인 · 코너 브래킷(`.glass::before/::after`)은 **`.hud`** 클래스로 격리해 브레인 뷰에서만. 노트 뷰는 단색 `--bg`.

### 6.5 컴포넌트 카탈로그

| 컴포넌트 | 클래스 / 구조 | 규칙 |
|---|---|---|
| 버튼 | `button` 기본(무광 `--surface`, 헤어라인) · `.pri`(holo 채움 15%, 테두리 holo) · `.ghost` · `.link` · `.danger` | 최소 높이 32, 글꼴 `--fk`. 호버 글로우 없음(테두리만 `--line2`) |
| 칩 | `.chip` · `.chip.gold`(프린트) · `.chip.dim` · `.chip.derived`(점선 테두리, `--dim`) · `.chip.tag`(둥근, `#` 접두) | 태그 칩 클릭 → 태그 페이지 |
| 배지 | `.badge` (`.ok .warn .bad`) | Orbitron 9.5px |
| 모노그램 | `.mono-kind[data-kind]` 시·문·지·자·프·예·모·메·질 | 종류색 없음, `--dim` 글자 + `--surface2` |
| 카드 | `.card` · `.card.new` | 헤어라인 · 10px |
| 노트 카드(목록) | `.ncard[data-id]` = 모노그램 + 제목 + 부제 + 태그 + 백링크 수 | |
| 속성 표 | `table.props` `th`(라벨 `--dim` 11.5px) `td`(값) · 편집 셀 `.edit`(점선 밑줄) · 추정 `.badge.warn` | |
| 사이드바 항목 | `.nav-item[data-nav]` · `.nav-item.on`(왼쪽 2px holo 바) · `.cnt`(Orbitron) | |
| 팔레트 | `#cmdk` (dialog) > `#cmdkInput` + `#cmdkList` 그룹 `.grp` > `.hit` (`.hit.on`) | 최대 높이 60vh, 위에서 12vh |
| 자동완성 | `#acPop` > `.hit[data-id]` | textarea 커서 아래(`getBoundingClientRect` + 줄 높이 근사) |
| 토스트 | `.toast` (`.ok .bad`) + 액션 버튼 | 기존 |
| 시트 | `#sheet.card` (glass 아님) · `.tabs` · `.field` · `.seg` · `.swatches` · `.actions` | 기존 구조 |
| 드로어 | (없음 — 노트 뷰로 대체) | |
| 큐 행 | `.q` `.q.err` `.bar.prog` `.memo` | 기존 |
| 표 | `table.tbl` · `th[data-sort]`(정렬 화살표) · `tr.rowbtn[data-id]` · `td.edit` | `overflow-x:auto` 컨테이너 |
| 타임라인 | `.tlDay` > `.ev` (시각 `.num` · 종류 `.mono-kind` · 문구 · 링크) | |
| 대화 | `.msg.me` · `.msg.brain` · `.cite`(`.unused .dashed`) · `.followup` | `#askLog aria-live=polite` |
| 할 일 | `.todo[data-act]` = 문장 + 버튼 | |
| 지표 | `.stat` > `b.num` + `span` | |
| 스파크라인 | `canvas.spark` | 2px 선, holo |
| 시험지 | `#paperPage` 변경 없음 | |
| HUD(브레인) | `.hud` = 옛 `.glass` 규칙 전부 + `.ph` 글로우 | 브레인 뷰에서만 |
| 미니 그래프 | `#asideGraphCanvas` 160px | 노드 ≤ 30 |

### 6.6 반응형 규칙

| 폭 | nav | aside | main | 기타 |
|---|---|---|---|---|
| ≥ 1280 | 240 | 320 | 나머지 | |
| 1100–1279 | 240 | 280 | | |
| 901–1099 | 56(아이콘) 기본 | 접힘 기본(`]` 로 오버레이 드로어) | | |
| ≤ 900 `body.narrow` | 서랍 | 본문 아래 | 100% | `#tabbar` 보임 · `#statusbar` 숨김 · 표 → 카드 |
| < 720 | | | | 3D → 2D(`state.mode`) · `#chips` 숨김 · 시트 전체 폭 |

인쇄: `@media print { html,body{height:auto;overflow:visible;background:#fff} body > *:not(#paper){display:none!important} #nav,#aside,#topbar,#statusbar,#tabbar,#cmdk,#toasts,#acPop{display:none!important} #paper{position:static;display:block!important;background:#fff} #paperBar{display:none} … }` — 기존 규칙 + 명시 목록.

### 6.7 접근성

- `#cmdk` `role=dialog aria-modal`, `#cmdkInput` `role=combobox aria-expanded aria-controls=cmdkList aria-activedescendant=hit-i`, `#cmdkList role=listbox`, `.hit role=option id=hit-i aria-selected`. `#acPop` 같은 규칙. `#askLog aria-live=polite`. `#toasts aria-live=polite`(기존). `#nav` `aria-label`, `#tabbar` `role=tablist`. 링크 이동은 전부 `<a href="#/…">` 라 키보드만으로 따라갈 수 있다. 표 셀 편집은 `Enter` 로 열고 `Esc` 로 닫는다.

### 6.8 아이콘

인라인 SVG `ICONS`(1.5px 선, 16px) 확장: `home inbox library brain timeline ask tag link backlink search pin note camera check more full`. 이모지 없음(시험지 · 토스트의 ✎ ★ ⚠ 는 글자로 유지). 종류는 모노그램 배지.

### 6.9 JARVIS 룩에서 남기는 것 / 버리는 것

남김: 홀로그램 다이얼 · 유형 별자리 · 힉스 필드 · 충격파 · 파티클(브레인 뷰), 힉스필드 배경 영상 슬롯, Orbitron 아이브로우, 청록 포커스, 엔진 · 클라우드 LED, 코너 워드마크(브레인 전체화면). 버림: 동시에 빛나는 유리 패널 5장, 상시 코너 워드마크, 파형 캔버스 `#wave` · 지구본 `#globe`(장식 — 삭제), 독 `#dock`(동작은 노트 액션 · ⌘K · 상태줄로), 스캔라인 · 코너 장식 전면 적용, 텍스트 글로우, 첫 화면의 3D.

---

## 7. 기존 기능 → 새 위치 (빠짐없이)

| 기존 기능 | 지금 자리 | 새 자리 | id / 보존 |
|---|---|---|---|
| 파일 드롭(전역 · 홀로그램) | `#dropAll` · 무대 pick | 전역 드롭 유지 + `#inboxDrop` `#homeDrop` + 브레인 노드 드롭 → 파일 시트 | `#dropAll` `body.dragging` |
| 파일 고르기 | 독 `#btnFiles` · `O` | `#inboxPick` `#homePick` · 선생님 노트 `#btnFiles` · ⌘K · `O` | `#btnFiles` `#fileInput` |
| 사진(OCR) | 드롭 · 고르기 | + `#inboxCamera` `#cameraInput` | 신설 |
| AI 에게 전할 말 메모 | 파일 시트 `#fsMemo` | 그대로 · 노트 `#noteAiMemo` 로 표시 | `#fsMemo #fsGo` |
| 종류 칩(자동→기출→범위→프린트) | 파일 시트 · 큐 행 | 그대로 + `#inboxKind` 기본값 | `[data-k]` `[data-flip]` |
| 선생님 고르기 시트 | `openPickSheet` | 그대로(`*` 범위 · 선생님 없음) | `[data-pick] #pickNew` |
| 큐 · 취소 · 재시도 · 모두 취소 · 완료 지우기 · 중복 그래도 넣기 · OCR 진행 · 메모 | `#intelBody` · `#queueMini` | `#queueList` · `#homeQueue` · `#asideQueue` · `#queueMini`(상태줄) | `[data-cancel] [data-retry] [data-force] [data-rm] #queueClear #queueCancelAll #qCancelAll` |
| 데이터화 결과 | 드로어 exam | 시험 노트 · 서재 시험/문항 표 | `[data-q]` |
| 지문 매칭 · 수동 수정 | 문항 드로어 `#dMatchSel` | 문항 노트 속성 `#dMatchSel` · `#qUnmatch` | 유지 |
| 프린트 반영율(시험별) | `#statusBody` 행 · 시험 드로어 | 선생님 노트 `#teacherStatus` · 시험 노트 속성 · 서재 시험 표 열 | |
| 프린트 반영율(자료별) | handouts 드로어 | 프린트 노트 · `#/all/sources?kind=프린트` · `#dAddPrint` | `UI.openDrawer("handouts")` 어댑터 |
| 프린트 반영율(프로파일) | `#pIntel` · `#pData` | 프로파일 노트 · 오늘 `#homeStats[data-stat=reflection]` | |
| 학습(자동 · 수동 · 강제) · 버전 · 델타 · 서술 | `#pIntel` · 독 `#btnLearn` · `L` | 프로파일 노트(`#profVer` 스위처 · delta 맨 위 · `#pfRelearn`) · 선생님 노트 `#btnLearn` · ⌘K · `L` | `#btnLearn #profVer` |
| 자동 학습 on/off | 설정 화면 탭 `#sAuto` | 그대로 | |
| 예측(대상 선택 · 청사진 · 복사) | `#pData` · 예측 시트 · `P` | 예측 노트(`#rangeMap #rCopy #rPredict #rMock`) · 예측 시트(+`#pdDate`) · `#btnPredict` | `#pdYear #pdSem #pdTerm #pdGo #rCopy` |
| 모의고사(개수 · 자료 · 강도 · 추가 요청 · 미리보기 · 인쇄 · DOCX · 중단) | 시트 · `#paper` · `M` | 모의고사 노트 `#openPaper #mockDocx` · 시트 그대로 · `#qAbortGen` 상태줄 · `#btnMock` | `#mkCount #mkStrength #mkExtra #mkGo [data-src] #paper*` |
| 지난 모의고사 | 내보내기 메뉴 → mocks 드로어 | `#/all/mocks` · 선생님 노트 `[data-mock]` | 어댑터 |
| 시험 메타 편집(추정 배지) | 시험 드로어 | 시험 노트 속성 + 서재 시험 표 셀 | `[data-m] [data-seg]` |
| 자료 종류 · 완전 표시 · 프린트 대상 시험 | 자료 드로어 | 자료 노트 속성 | `#dKind #dComplete #dTy #dTs #dTt` |
| 시험 · 자료 삭제 | 드로어 하단 | 노트 `#noteActions` | `#dDelExam #dDelSrc` |
| 선생님 만들기 · 편집 · 삭제 · 색 | 독 `#btnNew` · `#btnEditTeacher` · `Delete` | `#navTeacherMenu #btnNew` · 선생님 노트 `#btnEditTeacher #btnDelTeacher` · 같은 시트 | `#tf* #del*` |
| 선생님 선택 · ← → | 무대 클릭 · 패널 목록 | `#navTeacher` · `[data-teacher]` · 브레인 다이얼 클릭 · ← → | |
| 씨앗 선생님 | boot | 변경 없음 | |
| 백업 / 선생님별 백업 / 복원 / 전체 삭제 | 내보내기 메뉴 · 설정 데이터 | 설정 데이터 탭 · ⌘K · 선생님 노트 `#btnExportOne` · 삭제 시트 `#delExport` | `#sExport #sImport #sWipe #importInput` |
| 설정(엔진 · 클라우드 · 배경 · 힉스필드 · 보기 · 데이터) | 설정 시트 5탭 | 6탭(+브레인) · 문구만 갱신 | 모든 `#s* #c*` 유지 |
| 엔진 · 클라우드 LED | 상단 | 상단 | `#engine #cloud #engineLabel #cloudLabel` |
| 배경 영상 슬롯 · 밝기 · 힉스필드 프롬프트 | 설정 배경 탭 | 그대로(브레인 뷰에 적용) | `#sVidDrop #sVidPick #sOpa [data-copy] #videoInput` |
| 화질 · 움직임 · 2D · FPS | 설정 화면 탭 | 그대로 + `#sHome` | `#sQ #sRed #sFlat #sFps #fpsTag` |
| 2D 폴백(좁은 화면 · WebGL 없음) | `#flat #flatGrid .tcard` | 브레인 뷰 2D(`#brainFlat`) + 선생님 카드 열 | `#flatGrid .tcard[data-id] #flatNew` |
| 홀로그램 · 이펙트 · 드래그 회전 · 휠 | 첫 화면 | 브레인 뷰(지연 생성 · 재생 큐) | `#fx` |
| 상태 패널(SYSTEM STATUS) | `#statusBody` | 선생님 노트 `#teacherStatus` · 오늘 `#homeNext #homeLevel` | |
| GLOBAL INTELLIGENCE(분포 · 요약 · 타임라인 · 큐) | `#intelBody` | 프로파일 노트 · 선생님 노트 시험/자료 목록 · 인박스 큐 | |
| LISTENING 파형 · 토큰 수 | `#pListen #wave #listenTok` | 삭제(파형) · 토큰 수는 설정 데이터 탭 · `#askCost` | |
| I CAN HELP YOU WITH | `#pHelp [data-act]` | ⌘K 명령 · `#nextUp` · 노트 액션 | |
| REAL-TIME DATA(범위 지도 · 구성 · 유력 지문) | `#pData #rangeMap` | 예측 노트 | `#rangeMap` |
| 청사진 복사 | `#rCopy` · 메뉴 | 예측 노트 `#rCopy` · ⌘K | 유지 |
| 드로어 6종 | `#drawer` | 노트 뷰 · 서재 | `UI.openDrawer` 어댑터 |
| 독 | `#dock` | 삭제(노트 액션 · ⌘K · 상태줄) | 버튼 id 는 노트 액션으로 |
| 코너 워드마크 · 학교 이름 | 4개 상시 | 브레인 전체화면 · `#brandSub` · `#navTeacher` | `#wordsSchool` |
| 온보딩 3단계 | `#onboard` 스트립 | 오늘 카드 | `#onboard #ob1~3 #ob1Btn #ob2Btn` (+`#ob3Btn`) |
| 단축키 · 도움말 | `?` 시트 | 그대로 + 새 키 | `#btnHelp` |
| 좌우 패널 접기 `[ ]` | `#togL #togR` | `#navToggle #asideToggle` | 키 유지 |
| 토스트 | `#toasts` | 그대로 | |
| 이벤트 기록 | events | 타임라인 · 오늘 최근 | |
| 클라우드 동기화 · 작업공간 | 설정 클라우드 | 그대로 + notes/links/tags · `#sPrivate` | `#cOn #cWs …` |
| 키보드 단축키 전부 | `init` | §3.10 | |

---

## 8. e2e 시나리오 (`tests/e2e.js` 다시 쓰기 — 기존 검사의 의도 전부 + 새 기능)

모의 API · 모의 Supabase · 픽스처는 그대로. 모의 API 에 `ask` 분기(문자열 반환) 추가. 아래 각 항목이 `ok()` 한 줄 이상이다.

### 8.1 부팅 · 셸 (기존 1~8)
1. 키 저장 컨텍스트로 열면 `location.hash === "#/today"`, `#vToday` 보임, `#main[data-view=today]`. **`ORACLE.APP.stage()` 는 null**(지연 생성).
2. `#engine.ok` · 저장된 키 라벨.
3. `#onboard` 가 `#vToday` 안에 보인다(`hidden === false`).
4. 씨앗 선생님 2명(이름/과목/학교).
5. `#brandSub` 또는 `#navTeacher` 텍스트에 "흑석고".
6. 글꼴: `getComputedStyle(body).fontFamily` 에 Orbitron 과 Noto Sans KR 둘 다; `--fk` 에 Noto Sans KR; **`#main` 계산값은 Noto Sans KR 로 시작**; `#paperPage` 계산값에 "함초롬바탕" 또는 "Noto Serif KR".
7. 씨앗이 클라우드에(put ≥ 2, teachers 2). `#cloud.ok`.
8. `#indexMini` 가 색인 완료 뒤 "색인" 을 포함하고 `ORACLE.INDEX.state.ready === true`.

### 8.2 선생님 · 캡처 (기존 9~17)
9. `#navTeacher` 클릭 → `#btnNew` → `#tfName` "김영어" `#tfSchool` "흑석고" `#tfOk` → teachers 3 · `#navTeacher` 에 "김영어" · `#navLib [data-nav-kind=exams] .cnt` "0".
10. `#/inbox` 로 이동(`I` 키). `APP.enqueue(scope)` → `#queueList .q` 1개 → `done`, kind scope. 완료 행 `[data-open]` 클릭 → `#vNote[data-kind=source]` · `#noteBody [data-pass]` 8개.
11. `UI.openFilesSheet(handout)` → `#sheetWrap.on` · `[data-k]` 텍스트 "프린트" → `#fsMemo` 입력 → `#fsGo` → 완료 행 doneText "지문 2 · 포인트 6". 프린트 자료 `target/items/reflection === null`(기존 검사) · 메모가 프린트 색인 프롬프트에만(기존).
12. `#queueList` 텍스트에 "✎ 이 프린트는"(큐 메모 표시 — 옛 `#intelBody` 검사).
13. 기출 2건(하나는 memo + kinds:["exam"]) → done · 메모의 "2학기 기말" 이 라벨에(기존).
14. 자동 학습 → `profiles.size === 1` · 카운트 `exams 2 · passages 8 · questions 14 · sources 2` · matched ≥ 10 · 프로파일 v1 서술 · 유형 ≥ 4(기존).
15. 반영율(시험별 · 자료별 · 프로파일) 데이터 검사(기존 그대로).
16. 완료 토스트에 "문항" 과 "+" 가 있다(캡처 보상). `#navGrowth` 텍스트에 "14".
17. `#onboard.hidden === true`.

### 8.3 노트 페이지 (기존 22~23, 28~30)
18. `#/n/<tid>` → `#vNote[data-kind=teacher]` · `#teacherStatus` 에 "프린트 → 시험" 과 "김영어" · `[data-exam]` 2개.
19. `#/all/exams` → `#libTable tr[data-id]` 2행 · 첫 행 클릭 → `#vNote[data-kind=exam]` · `#noteBody [data-q]` ≥ 7 · 텍스트에 "★".
20. `[data-q]` 클릭 → `#vNote[data-kind=question]` · `#noteTitle` 에 "번" · `#noteProps` 에 "매칭 지문" · `#dMatchSel` 존재 · `#noteTags .chip.derived` ≥ 1.
21. `#dMatchSel` 로 다른 지문 선택 → `q.match.method === "user"` · events 에 `match` · 새 지문 노트 `#noteBacklinks` 에 이 문항 · 옛 지문 노트에는 없음.
22. 프로파일 노트(`#/n/<pfid>`) `#noteBody` 에 "빈칸" · delta 블록이 맨 위 · `#profVer` option 1개.
23. `UI.openDrawer("handouts")` → `location.hash` 가 `#/all/sources?kind=프린트` · `#libTable` 텍스트에 "반영".
24. 시험 노트에서 `[data-seg=semester]` 2학기 클릭 → `exam.meta.semester === 2` · `#noteTitle` 갱신 · `#teacherStatus` 반영율 문구 갱신(프린트 target 불일치로 값이 바뀜).

### 8.4 메모 · 링크 · 태그 · 백링크 (신규)
25. 문항 노트 `#noteMemoText` 에 `"[[Lesson 1 · Reading 1]] 재출제 유력 #재출제"` 입력 → `Control+Enter` → `notes` 1건(`kind:"anchor"`, `anchorKey` 일치, `tags:["재출제"]`) · `links` 1건(`kind:"wiki"`, `to` = 그 지문 id) · `tags` 에 `tag:재출제` · `#noteMemoView` 에 `a[data-link]` 와 `.tag` · 클라우드에 `store === "notes"` 행.
26. 그 지문 노트 `#noteBacklinks` 에 문항 제목 · `#asideBacklinks` 도. `#/tag/재출제` → `#tagList [data-id]` 1개. `#navTags [data-tag="재출제"]` 존재.
27. 깨진 링크: 메모에 `[[없는 제목]]` → 렌더에 `.broken` · `links` 에 저장되지 않음(to null).
28. 빠른 메모: `#/inbox` `#captureText` 에 "오늘 수업 #어법" → `#captureGo` → notes `kind:"note"` 1건 · `#/today #homeRecent` 첫 항목 `.new`.
29. 삭제 취소: 자유 메모 노트 `#nDel` → 토스트 "취소" 클릭 → 문서 남음. 다시 `#nDel` → 5.5초 뒤 없음.
30. 옛 메모 이전: 별도 컨텍스트에서 앱 로드 전에 v1 DB 를 만들고(`indexedDB.open("orun_oracle", 1)` 로 `questions` 등 생성) `note:"옛 메모"` 인 문항을 넣은 뒤 앱을 열면 `indexedDB.databases()` 버전 2 · `notes` 에 `n_legacy_<qid>` 1건 · 문항 노트 `#noteMemoView` 에 "옛 메모".

### 8.5 검색 · 팔레트 (신규)
31. `Control+k` → `#cmdk` 보임 · `#cmdkInput` 포커스 · "어법" 입력 → `#cmdkList .hit[data-hit]` 에 문항과 프린트가 섞여 있음 · `Enter` → `#/n/` 이동 · `#cmdk` 닫힘.
32. `>학습` → `.hit[data-hit="cmd:learn"]` → Enter → `APP.learn` 호출(`profiles` 버전 증가 또는 토스트 "바뀐 자료가 없어요").
33. `#태` → 태그 그룹만. `?빈칸` → Enter → `#/ask?q=빈칸`.
34. 12자 이상 원문 문구(픽스처 지문의 한 문장) → "원문에서" 그룹 `.hit[data-hit^="grep:"]` ≥ 1 → Enter → 지문 노트 `#noteBody mark` 존재.
35. `Escape` 로 닫힘. 입력창 안에서 `Control+k` 도 열림.

### 8.6 물어보기 (신규)
36. `A` → `#vAsk` · `#askInput` "빈칸을 몇 문항 내나요?" → `#askGo` → 모의 호출의 프롬프트에 `[구조 근거]` 와 `[근거]` 와 `[질문]` 이 있고 `system` 사용(`calls[].sys === true`) · `#askLog .msg.brain .cite[data-id]` ≥ 1 · `#askCites [data-cite]` 개수 == 근거 수 · `.unused` ≥ 0 · `#askCost` 에 "근거".
37. 칩 클릭 → `#/n/<id>` 이동 · 그 노트 `#noteBacklinks` 에 "물어보기". `notes` 에 `kind:"ask"` 1건 · `links` 에 `kind:"cite"` ≥ 1.
38. 근거 0: "피아노 협주곡 악보" → API 호출 수 불변 · `#askEmpty` 보임.
39. 키 없는 컨텍스트: `#askGo.disabled` · 안내 문구.
40. 맥락: 문항 노트 `#asideAskInput` "이 문항 작년에도?" → `#/ask?ctx=<qid>` · `#askCtx` 에 제목 · 프롬프트에 `[맥락]`.

### 8.7 예측 · 모의고사 · 시험지 (기존 25~27, 36)
41. `APP.predict(tid)` → 데이터 검사(기존) · `#/n/<pdid>` `#noteBody` 에 "유력 지문" · `#rangeMap` canvas · `.hot[data-pass]` ≥ 6 · `#rCopy` 클릭 → 토스트 "청사진".
42. `APP.generateMock(tid, {count: 8})` → n ≥ 7 · `#paper.on` · `.pq` ≥ 7 · `#paperClose` · DOCX > 4000 bytes(기존) · `#/all/mocks` 행 1 · 모의고사 노트 `#openPaper` → `#paper.on`.
43. 인쇄: `page.emulateMedia({media:"print"})` 뒤 `#nav` `display:none` · `#paper` `display:block` · `#paperPage` 글꼴 명조. 되돌린다.

### 8.8 브레인 (기존 1(무대), 10, 35)
44. `G` → `#/brain` · `ORACLE.APP.stage()` truthy · `stage.teachers()` 에 3명 · `stage.graph().nodes.length >= 8(지문) + 2(시험) + 14(문항)` · `stage.running === true`.
45. `#brainBar [data-node=question]` 끄기 → 노드 수 감소. 다시 켜기.
46. `stage.pickNode` 가 지문 노드를 돌려주는 좌표에서 클릭(`stage.anchor` 대신 `stage.debug()` 의 노드 스크린 좌표 API `stage.nodeScreen(id)` 를 e2e 용으로 둔다) → `#brainHud` 제목 일치 → `#brainHudOpen` → 노트.
47. `H` 로 나가면 `stage.running === false`; `G` 로 돌아오면 true.
48. 배경 영상: `APP.setBgVideo(webm)` → `state.bg.hasVideo` · `#bgVideo.src` · media 저장(기존) · 브레인 뷰 스크린샷 `e2e-brain-video.png` · `setBgVideo(null)`.
49. `#brainFull` → `body.brainFull` · `#wordsSchool` 텍스트에 "흑석고" · Esc 로 해제.

### 8.9 타임라인 · 성장 (신규)
50. `T` → `#vTimeline` · 오늘 `.tlDay[data-day]` 안에 `.ev` 종류 ingest · learn · note · ask · match ≥ 1씩 · `#tlWeek` 에 "문항 +" · `#tlFilter [data-f=note]` → 메모 행만.
51. `#tlToday` → `notes` 에 `kind:"daily"` `date` 오늘 1건 → 새로 고쳐도 같은 행. `#tlRetro` → `kind:"weekly"` 노트 열림, 본문에 집계 문장.
52. `#/today #nextUp .todo` ≥ 1 · 예측이 V1 기준이고 프로파일이 V2 면 "다시 예측" 항목.

### 8.10 백업 · 복원 · 동기화 (기존 31~33, 37)
53. `exportJson(null)` → JSON 에 `teachers 3 · questions 14 · profiles ≥ 1 · sources 2 · notes ≥ 3 · links ≥ 1 · tags ≥ 1 · schema === 1`.
54. 새로 고침 → teachers 3 · profiles 복원 · `#/n/<pd>` 유력 지문(기존 의도) · 클라우드 거울 카운트에 `notes links tags` 포함, `media` 없음.
55. 옛 백업(notes 키 없음)을 `importJson` → 오류 없음.
56. **병합**: ctx2(빈 IndexedDB)가 클라우드에서 notes 를 받는다 → ctx2 에서 메모 본문을 "B" 로 고침 → ctx1 새로 고침 → 본문 "B"(클라우드가 더 새로움). ctx1 에서 본문 "C" 로 고친 뒤 테스트가 모의 클라우드 행의 `data.updatedAt` 을 과거로 바꾸고 ctx1 새로 고침 → 본문 "C" 유지 · 클라우드 행이 "C" 로 갱신(push).
57. `#sPrivate` 켬 → 새 메모가 클라우드에 올라가지 않음(`store==="notes"` 행 수 불변). 끔.
58. PDF 추출 경로(기존 34) 그대로.

### 8.11 좁은 화면 · 키 없음 (기존 37~38)
59. 600×900 컨텍스트: `body.narrow` · `#tabbar` 보임 · `#nav` 접힘 · `#/brain` → `APP.state.mode === "flat"` · `#brainFlat` canvas · `[data-tab=more]` → 시트 → `[data-more=new]` → `#tfName` 박선생 `#tfOk` → `#flatGrid .tcard[data-id]` 4장.
60. 키 없음 표시(기존 문구 검사) · `#askGo.disabled`.
61. 콘솔 오류 없음(기존).

### 8.12 단위 검사 추가 (`unit.js`)
- `INDEX.tokenize("빈칸에 들어갈 Habits")` → `["빈칸","칸에","들어","어갈","habit"]` 포함. BM25: 제목 일치 문서가 본문 일치보다 위.
- `NOTES.parse("[[A]] x #태그1 #tag-2")` → links 1 · tags `["태그1","tag-2"]`. `NOTES.render('<img onerror=1> [[A]] **b**', () => null)` 에 `<img` 없음 · `<b>b</b>` 있음 · `.broken`.
- `ASK.parseAnswer("… [1] …\nUSED: 1,3\nFOLLOWUP: a | b")` → used `[1,3]` · followups 2. `PROMPTS.ask(...)` 결과 `user` 에 고정 문구 `아래 [근거] 만을 근거로 강사의 질문에` · `[구조 근거]` · `[질문]`.
- `LINKS.derived` 작은 데이터(문항 1 · 시험 1 · 지문 1)에서 belongs · match 2건, `backlinks(p1)` 에 q1.
- `PROMPTS.narrative(compact, stems, ["메모"])` 에 `[강사 메모` 포함, 없으면 미포함.
- `ASK.structured("빈칸 몇 문항?", {profile})` 에 "빈칸" 과 "문항" 포함; `ASK.structured("안녕", …)` 은 빈 배열.

스크린샷: `e2e-today.png e2e-inbox.png e2e-note-question.png e2e-library.png e2e-ask.png e2e-brain.png e2e-brain-video.png e2e-timeline.png e2e-paper.png e2e-narrow.png`.

---

## 9. 병렬 구현 계획

### 9.1 작업 패키지

| 패키지 | 소유 파일 | 의존 계약 | 완료 기준 |
|---|---|---|---|
| **P1 데이터 층** | `30-db.js` `39-sync.js` `42-index.js` `43-links.js` `44-notes.js` `45-ask.js` `34-prompts.js`(ask · narrative) `36-profile.js`(narrate) `tests/unit.js` `tests/mock-api.js` | §4 · §5.2~5.6 | `npm run test:unit` 초록(새 단위 검사 포함). Node 에서 42~45 가 IIFE 오류 없음. bootstrap 병합 단위 함수 `SYNC.mergeRule(local, cloud)` 검사 |
| **P2 코어 · 라우터** | `50-app-core.js` `51-router.js` | P1 API · §5.9~5.10 | 부팅 시 무대 없음 · `ensureStage` · `growth/nextUp/weekSummary` · 이벤트 이름 · `exportJson` 키 · 브라우저 콘솔에서 `ROUTE.go("#/n/…")` 가 `emit` 을 낸다 |
| **P3 셸 · 스타일 · DOM** | `10-css.html` `20-dom.html` `52-app-shell.js` | §2 id 계약 · §6 토큰 · P2 이벤트 | 모든 §2.17 id 가 DOM 에 있고, 시트 · 토스트 · 팔레트 · 키보드 · 드롭 · 설정 6탭 · 인쇄 CSS 가 동작. `#paper` body 직계 |
| **P4 노트 · 서재 · 오늘 · 인박스 · 타임라인 · 물어보기 뷰** | `53-ui-note.js` `54-ui-views.js` | P1 · P2 · P3 의 껍데기 id | 열 가지 노트 종류 렌더 · 메모 편집기(자동완성 · IME) · 표 정렬/필터/인라인 편집 · ask 스트리밍 · 타임라인 |
| **P5 브레인** | `41-stage.js`(추가) `46-graph2d.js` `55-ui-brain.js` `tests/run-stage-smoke.js`(setGraph 연기 추가) `tests/stage-smoke.tail.js` | P2 `ensureStage` · LINKS.graph | `npm run test:stage` 초록(그래프 500 노드 셰이더 오류 없음) · 2D 폴백 · HUD · 전체화면 · 재생 큐 |
| **P6 e2e** | `tests/e2e.js` `tests/fixtures/*`(필요 시) | §8 | 61 항목 + 스크린샷 10장 |
| **P7 문서** | `AGENTS.md` `CLAUDE.md` `oracle/README.md` `oracle/design/spec.md` | 전부 | 모듈 표 23 파일 · 글꼴 규칙 문구 · 검사 목록 · 저장소 목록 갱신 |

P1 · P3 · P5 는 서로 독립이라 **동시에 시작**한다. P2 는 P1 의 시그니처(문서)만 보고 시작한다. P4 는 P3 의 `20-dom.html` 초안(1일차)과 P1 의 API 문서로 시작하고 스텁으로 개발한다. P6 은 §8 대로 먼저 써 두고 통합 때 돌린다.

### 9.2 통합 순서 (단계마다 `cd oracle && npm run build && npm test` 초록)

1. **뼈대**: P1(30 · 39 · 42~45 스텁 반환 포함) + P2 + P3 + 빈 뷰 + 어댑터. 기존 e2e 는 이 시점에 §8 로 교체한다(옛 검사는 살릴 수 없다 — 부팅 무대 · `#panelL` · `#intelBody` 큐 · 폰트). 3D 는 브레인 뷰에서 켜지기만 하면 된다.
2. **노트 · 서재**: P4 의 노트 템플릿 · 표 · 인박스 · 오늘. 드로어 코드 삭제.
3. **두뇌 층**: INDEX · LINKS · NOTES 실제 구현 + ⌘K + 메모 편집기 + 태그 + 백링크 + 타임라인.
4. **물어보기 · 그래프**: ASK + P5 그래프 + 성장 지표 + 재생 큐.
5. **시각 정리**: 토큰 · 타이포 · 아이콘 · 모션 · 접근성 · 스크린샷 갱신 · 문서(P7).

각 단계는 작업 브랜치 → PR → CI(`oracle-ci.yml`) 초록 → 사용자 규칙대로 `main` 머지 → 라이브 sha256 확인 → HTML 파일 전송.

### 9.3 위험과 대응

| 위험 | 대응 |
|---|---|
| e2e 전면 교체 중 회귀를 못 봄 | 1단계에서 §8 의 "기존" 표시 항목을 먼저 옮겨 초록으로 만든 뒤 신규 항목을 더한다 |
| IndexedDB 버전 올림 · 다른 탭 | `#bootError` + `#bootRetry` · `onversionchange` 로 옛 탭 닫힘(기존) |
| 색인 · 파생 재구축 비용 | 조각 실행 · `state.ready` 게이트 · bootstrap 뒤 한 번만 |
| 3D 를 뷰 안에 넣으며 좌표(`anchor` · `pick`)가 어긋남 | 캔버스 기준 `getBoundingClientRect`(pick 은 이미 그렇다) · `#chips` 를 같은 컨테이너에 |
| `unit.js` 절단 마커 | 42~45 의 선언 모양 고정 · `makeGraph2D(` 마커 |
| 단일 파일 크기 | 현재 ~460KB → 약 +120KB. 상한(16MB)과 멀다 |
| 열린 RLS 에 실명 메모 | `#sPrivate` · 편집기 안내문 · 서명 |
| mock-api 문구 결합 | `ask` 고정 문구를 이 문서에 못박음 · `AGENTS.md` 규칙(34-prompts 와 mock-api 같은 커밋) |
| 사용자가 홀로그램 첫 화면을 그리워함 | `#sHome` · `#homeChanged` 안내 · `G` 한 번 |
| 인라인 편집이 학습 중 문서를 덮음 | 모든 속성 편집은 `DB.get → patch → put`(기존 `learn()` 패턴) |
| 동시 편집(두 기기) | `updatedAt` 병합. 충돌 배너 · 버전 이력은 §10 |

---

## 10. 나중으로 미루는 것 (명시적으로)

1. 저장된 뷰 · 보드 · 갤러리 뷰 · 다중 선택 일괄 태그(database-first §3.3) — 표 + 카드만.
2. 주간 회고의 LLM 초안 — 로컬 집계 초안만.
3. 모바일에서 여러 장 사진을 한 파일로 묶기 — 각 파일이 따로 큐에 들어간다.
4. 자동완성 · 호버 프리뷰(Obsidian 식) — ⌘클릭 고정 미리보기만.
5. `Backspace` 뒤로가기 — 브라우저 뒤로만.
6. 노트 버전 이력 · 충돌 배너 · 휴지통 — `updatedAt` 병합 + 5초 취소만.
7. 태그 색 · 설명 편집 UI 의 세부(필드는 있다) — 태그 페이지에서 설명만.
8. 사용자 인증 · 작업공간 권한 — 열린 RLS 그대로, `#sPrivate` 와 서명으로 완화.
9. 임베딩 · 의미 검색 — BM25 + 원문 substring.
10. 그래프 간선 묶기 · 3D 클러스터 라벨 · 타임라인 축 그래프 — 궤도 배치만.
11. ⌘K 에서 문항 표 필터를 명령으로 만들기(`>필터: 유형=빈칸`) — 서재 칩으로.
12. 접근성 전면 감사(스크린리더 통과 검사) — role/aria · 포커스 링 · 대비까지.
13. 작업공간 간 검색 · 다른 학교 선생님 비교.
14. 인박스에서 붙여넣은 긴 텍스트의 자동 기출 변환 — 제안 토스트까지만.
15. 이벤트 · 질문 기록의 압축 · 아카이브 — 상한만.
