# ORUN VOCA 개편 설계안 — 정규수업 단어시험 대비 반복 학습 앱

작성 2026-09-17 · 대상 Lovable 프로젝트 `orunvoca` (62ab60f1…) · DB: Supabase `ORUN ACADEMY` (jpanpwbdlhsxnyaldddm)

## 0. 한 줄 요약

지금의 ORUN VOCA 는 "관리자가 만든 단어장을 반 코드 하나로 같이 들어와 시험 보는 앱" 이다.
개편안은 **학생 한 명 한 명이 자기 코드로 들어와, 시험 범위를 4가지 4지선다로 무제한 반복하고,
그 횟수·성취도·시간이 담임 대시보드와 가정 리포트로 쌓이는 앱** 으로 바꾼다.
핵심 변경은 셋 — ① 학생 개인 계정과 담임-반 구조, ② 4지선다 연습 엔진, ③ 세션 단위 학습 기록.

## 1. 지금 상태 (조사 결과)

| 항목 | 현재 | 문제 |
|---|---|---|
| 로그인 | 액세스 코드 하나 (`student_access_codes`). 실제 코드 4개, 그중 3개가 반 전체 공용(`BLACK11`·`3FO`, max_users 500) | 학생을 구분하지 못한다 → 학생별 기록 불가 |
| 관리자 | 코드 `admin`·`101100`·`orun0088` 하드코딩, sessionStorage 플래그 | 담임 역할이 없다. 반 담임이 자기 반만 볼 수 없다 |
| 학습 모드 | 5가지(뜻 입력·철자 입력·예문 빈칸 입력·영영풀이 선택·동반의어). 대부분 **타이핑** | 기획의 4가지 **고르기** 와 다르다. 타이핑은 느리고 반복 횟수가 줄어든다 |
| 기록 | `student_test_history` 에 이름 기준 누적(1,490행). 저장 코드가 `localStorage.studentData` 를 읽는데 로그인은 `sessionStorage` 에 쓴다 | 지금은 **저장이 안 된다**. 시간은 어디에도 없다(숙제 제출만 `time_spent_seconds`) |
| 단어장 | `card_sets` 16개, `word_data` JSON(day·word·meaning·example·englishDefinition·synonym·antonym) | 그대로 쓴다. 자산이다 |
| 오답 선지 | `word_quiz_cache` 8,682행(quiz_type 별 wrong_choices) + 엣지 함수 | 그대로 쓴다. 4지선다의 선지 재료 |
| DB | 출석·직원·채팅 등 다른 앱 테이블과 **한 프로젝트를 같이 쓴다**. `classes`(15)·`students`(100) 는 출석 앱 것 | 새 테이블은 `voca_` 접두어로 분리한다. 남의 테이블을 건드리지 않는다 |

## 2. 역할과 로그인

```
원장(admin)  ─ 모든 반 · 단어장 관리 · 담임 계정 발급
담임(teacher) ─ 자기 반 학생 관리 · 학습 현황 · 시험 범위 지정 · 가정 리포트
학생(student) ─ 자기 반 범위 연습 · 내 기록
```

- **학생**: **반 코드 + 이름 + 휴대폰 뒷4자리** 로 들어온다. 담임이 미리 넣지 않아도 된다 —
  그 반에 (이름, 뒷4자리) 가 없으면 첫 로그인에 `voca_students` 행이 생기고, 담임 표에 "새로 등록" 표시가 붙는다.
  담임은 오타 계정을 다른 학생에 **합치기**(세션을 옮기고 행을 지운다) 하거나 삭제할 수 있다.
  동명이인은 뒷4자리로 갈린다. 반 코드는 `voca_classes.code`(예: `3FO`) 로 담임이 정한다.
- **담임**: Supabase Auth 이메일 로그인. 원장이 초대한다. `voca_teachers.auth_user_id` 로 잇는다.
  (기존 관리자 코드 셋은 원장 코드로 남긴다 — 화면 하나로 세 역할이 들어간다.)
- **RLS**: 담임은 `voca_classes.teacher_id = 내 id` 인 반과 그 학생·세션만 읽고 쓴다.
  학생은 anon 키로 들어오므로 **학생 쓰기는 RPC(`voca_login`, `voca_log_session`) 로만** 받고 반 코드+이름+뒷4자리로 검증한다.

## 3. 데이터 모델 (모두 새 테이블, `voca_` 접두어)

```sql
voca_teachers   (id, auth_user_id, name, is_admin, created_at)
voca_classes    (id, name, code UNIQUE, teacher_id → voca_teachers, grade, is_active, created_at)
voca_students   (id, class_id → voca_classes, name, phone_last4, is_active, created_at, last_seen_at,
                 UNIQUE(class_id, name, phone_last4))

-- 담임이 "이번 시험 범위" 를 지정한다. 학생 첫 화면이 이것을 본다.
voca_class_ranges (id, class_id, card_set_id → card_sets, days text[], exam_date date,
                   title, is_current bool, created_at)

-- 학습 기록의 핵심. 연습 한 판 = 한 행.
voca_sessions   (id, student_id, range_id, card_set_id, days text[],
                 mode text  -- 'en2ko' | 'ko2en' | 'def2en' | 'ex2en'
                 started_at, ended_at, active_seconds int,   -- 실제로 화면을 보고 푼 시간
                 total int, correct int, accuracy numeric,   -- accuracy = correct/total*100
                 wrong_words jsonb,                          -- [{word, meaning}]
                 completed bool, client_id text)             -- client_id: 중복 저장 방지

-- 문항 단위. 첫 판부터 남긴다. 나중에 "시간 대 성취" 분석의 재료.
voca_attempts   (id, session_id, student_id, word, mode, is_correct, chosen, response_ms,
                 is_retry bool, asked_at)

-- 가정 공유 링크
voca_report_shares (id, student_id, token UNIQUE, period_from, period_to, created_by, expires_at)
```

집계는 뷰 하나로 끝낸다.

```sql
create view voca_student_stats as
select s.id student_id, s.class_id,
  count(se.*)                              as total_sessions,      -- 총 학습 횟수
  round(avg(se.accuracy),1)                as avg_accuracy,        -- 평균 성취도
  coalesce(sum(se.active_seconds),0)       as total_active_seconds,-- 누적 학습시간
  max(se.ended_at)                         as last_studied_at
from voca_students s left join voca_sessions se on se.student_id = s.id and se.completed
group by s.id, s.class_id;
```

"이번 범위" 성취도는 같은 뷰를 `range_id` 로 한 번 더 자른다(`voca_range_stats`).

## 4. 학습 엔진 — 4가지 4지선다

| 모드 | 문제 | 정답 | 오답 선지 재료 |
|---|---|---|---|
| `en2ko` 영단어 → 뜻 | `word` | `meaning` | 같은 Day → 같은 단어장 → `word_quiz_cache(meaning).wrong_choices` |
| `ko2en` 뜻 → 영단어 | `meaning` | `word` | 같은 Day 단어(같은 품사 우선) → 단어장 → `word_quiz_cache(spelling)` |
| `def2en` 영영풀이 → 단어 | `englishDefinition` | `word` | 위와 같음 (`definition`) |
| `ex2en` 예문 빈칸 → 단어 | `example` 에서 단어를 `____` 로 | `word` | 위와 같음 (`example`) |

규칙 —
- 세션 = 기본 20문항(범위가 20개 미만이면 전부). 학생이 10/20/40/전체 를 고른다.
- 즉시 채점. 틀리면 정답을 보여 주고 **그 단어를 큐 뒤에 다시 넣는다**(세션 안 재출제). 재출제는 `total` 에 세지 않고 `accuracy` 는 첫 시도 기준.
- 선지 4개는 뜻·품사가 겹치지 않게 뽑고, 부족하면 캐시 → 그래도 부족하면 엣지 함수(`generate-*-wrong-choices`) 를 부르고 캐시에 넣는다. **캐시 우선, AI 는 마지막.** 반복 연습에 매번 AI 를 부르면 느리고 비싸다.
- `englishDefinition`·`example` 이 비어 있는 단어는 그 모드에서 뺀다. 그 모드에 단어가 5개 미만이면 타일을 비활성화하고 이유를 적는다.
- 횟수 제한 없음. 같은 범위·같은 모드를 몇 번이든.
- 키보드 1·2·3·4 로 답한다(PC). 모바일은 큰 버튼 4개.

## 5. 시간 측정 — "실제로 공부한 시간" 만 센다

`active_seconds` 는 벽시계 시간이 아니다.
- 1초 타이머는 **탭이 보이고(`visibilitychange`), 마지막 입력이 60초 이내**일 때만 돈다.
- 30초마다 `voca_log_session` RPC 로 upsert(heartbeat). 창을 닫아도 마지막 30초만 잃는다.
- 끝내기를 누르거나 마지막 문항을 풀면 `completed=true` 로 마감. `beforeunload` 에서 `navigator.sendBeacon` 으로 마지막 상태를 보낸다.
- `client_id`(브라우저가 만든 uuid) 로 upsert 하므로 재전송돼도 두 번 세지 않는다.
- 미완료 세션(`completed=false`)은 대시보드에서 "중단" 으로 따로 보이고 평균에는 안 넣는다. 시간은 넣는다.

## 6. 화면

### 학생 (모바일 우선)
1. **홈** — 담임이 지정한 "이번 시험 범위" 카드(단어장·Day·시험일·D-day) + 4가지 모드 타일 + 내 기록 세 숫자(횟수·평균·누적시간) + 이번 범위 성취도.
2. **연습** — 진행 바 · 문항 · 선지 4개 · 즉시 채점 · 우측 상단 활동 시간.
3. **결과** — 점수 · 틀린 단어 목록 · "틀린 것만 다시" · "한 번 더" · 홈.
4. **내 기록** — 날짜별 세션 목록, 모드별 정답률, 자주 틀리는 단어 TOP 10.
학생에게는 **담임이 지정한 범위만** 열린다. 단어장 목록·다른 Day 는 보이지 않는다. 범위가 없으면 "담임 선생님이 범위를 정하면 시작할 수 있어요" 만 보인다.

### 담임
1. **내 반** — 반 선택 → 학생 표: 이름 · 뒷4자리 · 총 횟수 · 평균 성취도 · 누적 시간 · 이번 범위 성취도 · 최근 학습 · "새로 등록" 표시. 열 정렬. 엑셀 내려받기. 혜택(컷트라인 조정)은 앱 밖에서 원장이 이 표를 보고 정한다 — 앱에는 규칙을 두지 않는다.
2. **학생 상세** — 세션 타임라인, 모드별 정답률, 누적 시간 추이, 틀린 단어 누적, 리포트 공유 버튼.
3. **범위 지정** — 단어장 · Day · 시험일 · 제목. 현재 범위 하나만 `is_current`.
4. **학생 관리** — 반 코드 정하기 · 학생 미리 추가(선택) · 오타 계정 합치기 · 반 이동 · 비활성.

### 원장
- 담임 계정 초대 · 반 만들기 · 담임 배정. 모든 반을 담임 화면과 같은 표로 본다. 단어장 관리는 지금 화면 그대로.

### 가정 리포트 (클래스카드와 다른 점 ②)
- 담임이 학생 상세에서 "가정에 보내기" → 기간을 고르면 `voca_report_shares` 에 토큰이 생기고 `/r/<token>` 링크가 나온다(30일 만료).
- 링크 화면(로그인 없음): 학생 이름 · 기간 · **총 학습 횟수 · 평균 성취도 · 누적 학습시간** · 날짜별 시간 막대 · 이번 범위 성취도 · 담임 한 줄 코멘트 · 옳은영어 로고. 이미지 저장 버튼(기존 Report Generator 가 하던 html→png).
- 카카오톡 붙여넣기용 요약 문장도 같이 만든다: "○○ 학생 9/1~9/14 · 단어 연습 23회 · 평균 87% · 누적 3시간 12분".

## 7. 기존 것과의 관계

| 기존 | 처리 |
|---|---|
| `card_sets`·`word_quiz_cache`·엣지 함수 | 그대로 쓴다 |
| `Study.tsx`(5모드 타이핑)·`Practice.tsx`(카드 플립) | 남긴다. 메뉴에서 "심화 연습" 으로 한 단계 뒤로. 나중에 세션 로깅만 붙인다 |
| `student_access_codes` 반 공용 코드 | 개편 뒤 비활성. 학생은 개인 코드로 |
| `student_test_history` | 읽기 전용 보관. 새 집계는 `voca_sessions` |
| 숙제·Vocathon·모의시험 | 손대지 않는다 |
| `classes`·`students`(출석 앱) | **쓰지 않는다.** 이름만 같고 주인이 다르다 |

## 8. 단계 (Lovable 에 보내는 순서)

각 단계가 끝나면 그 자체로 쓸 수 있어야 한다.

**1단계 — 사람과 반 (1주)**
`voca_teachers`·`voca_classes`·`voca_students`·`voca_class_ranges` 마이그레이션 + RLS + `voca_login` RPC.
로그인 화면에 세 역할 분기. 담임 로그인(이메일). 담임 화면: 반 코드·학생 관리·범위 지정. 학생 홈(범위 카드만).
→ 검증: 학생이 반 코드+이름+뒷4자리로 들어오면 담임 표에 나타난다.

**2단계 — 연습 엔진과 기록 (1~2주)**
`voca_sessions`·`voca_attempts` + `voca_log_session` RPC. 4모드 4지선다 화면, 선지 생성(캐시 우선), 활동 시간 측정, 결과 화면, 내 기록.
→ 검증: 20문항 세션 뒤 `voca_sessions` 에 한 행, `active_seconds` 가 실제와 ±5초.

**3단계 — 대시보드·가정 리포트 (1주)**
`voca_student_stats` 뷰, 담임 학생 표·상세, 계정 합치기, 공유 링크와 리포트 화면, 엑셀.
→ 검증: 표의 세 숫자가 `voca_sessions` 합계와 같고, 링크가 로그인 없이 열린다.

**4단계 — 정리**
기존 반 공용 코드 비활성, 메뉴 재배치, 사용 안 하는 페이지 숨김.

## 9. 결정된 것 (2026-09-17)

1. **혜택** — 앱에 넣지 않는다. 원장이 담임 표를 보고 오프라인으로 정한다.
2. **학생 로그인** — 반 코드 + 이름 + 뒷4자리. 첫 로그인에 자동 등록, 담임이 합치기·삭제.
3. **범위 밖 단어장** — 학생에게 열지 않는다. 지정 범위만.
4. **문항 단위 기록** — `voca_attempts` 를 첫 판부터 남긴다.

## 10. Lovable 첫 프롬프트 (1단계용, 붙여넣기)

> ORUN VOCA 를 "담임이 반을 관리하고 학생이 반 코드+이름+휴대폰 뒷4자리로 들어오는 구조" 로 바꿉니다.
> 새 테이블은 모두 `voca_` 접두어를 씁니다. 기존 테이블(`classes`, `students`, `student_access_codes`, `card_sets`)은 구조를 건드리지 않습니다. 기존 페이지·라우트는 지우지 말고 그대로 둡니다.
> 1) 마이그레이션: voca_teachers(id, auth_user_id unique, name, is_admin), voca_classes(id, name, code unique, teacher_id, grade, is_active), voca_students(id, class_id, name, phone_last4 char(4), is_active, created_at, last_seen_at, unique(class_id,name,phone_last4)), voca_class_ranges(id, class_id, card_set_id → card_sets, days text[], exam_date date, title, is_current bool). RLS: 담임(auth 사용자)은 teacher_id 가 자기 voca_teachers.id 인 반과 그 학생·범위만 select/insert/update. is_admin 담임은 전부.
> 2) security definer RPC `voca_login(class_code, name, phone_last4)`: 반 코드가 활성 반이면 (name, phone_last4) 학생을 찾고 없으면 만든 뒤 {student_id, class_id, class_name, current_range} 를 돌려준다. anon 이 호출한다.
> 3) `/` 로그인 화면(지금 Warm Editorial 디자인 유지): 탭 둘 — "학생"(반 코드·이름·뒷4자리 세 칸 → voca_login → sessionStorage.vocaStudent 저장 → /home) · "선생님"(이메일·비밀번호 Supabase Auth → /teacher). 기존 관리자 코드(admin/101100/orun0088)는 학생 탭의 반 코드 칸에 넣으면 지금처럼 /dashboard 로 간다.
> 4) `/teacher`: 내 반 목록(반 만들기: 이름·코드·학년) → 반 상세: 학생 표(이름·뒷4자리·최근 접속·등록일), 학생 미리 추가, 비활성, "이번 시험 범위" 지정 폼(단어장 select → 그 단어장의 selected_days 를 칩으로 → 시험일 → 제목, 저장하면 이 반의 다른 범위는 is_current=false).
> 5) `/home`(학생): 상단에 이름·반, 이번 범위 카드(단어장 제목·Day 목록·시험일·D-day), 그 아래 4개 모드 타일(영단어→뜻 · 뜻→영단어 · 영영풀이→단어 · 예문→단어, 아직 비활성 표시 "곧 열려요"). 범위가 없으면 안내문만.
> 디자인: 로그인 화면의 톤(#8b7355 · Noto Sans KR · Orbitron 은 라벨만) 을 유지하고, 학생 화면은 모바일 우선.

## 11. UI 시스템 (2026-09-19 전면 개편)

기준은 같은 저장소의 `projects/orunaistudio`(ORUN STUDIO) Premium Dark 시스템이다. 러버블에 세 묶음으로 보냈다.

- 토큰: 배경 `220 20% 4%` · 카드 `220 15% 7%` · 골드 `42 55% 72%` · 정답 `152 60% 55%` · 오답 `6 80% 62%`. 글래스(blur 18px, 상단 1px 하이라이트), 그림자 2단, 골드 글로우. 라이트 모드 없음.
- 글꼴: 본문·입력·버튼 Noto Sans KR, Orbitron 은 아이브로우·큰 숫자·키캡·로고만.
- 배경 `CinematicBackground`: CSS 오로라 + 필름 그레인 + 비네트 + (데스크톱만) 마우스 글로우. WebGL 없음 — 휴대폰 성능.
- 공용 `src/components/cinema/`: GlassCard · Eyebrow · BigNumber · PrimaryButton · GhostButton · AnswerButton · ProgressRing · StatTile · DdayChip · ModeTile · EmptyState · CinemaPageHeader.
- 셸: 글래스 상단바, 모바일은 하단 탭바(safe-area). 페이지 전환 fade.
- 묶음 1: 토큰·셸·로그인·학생 홈 / 묶음 2: 연습 시작·풀이·결과·내 기록 / 묶음 3: 담임 3화면·대시보드·나머지 관리 화면 전부 + 옛 웜 톤 하드코딩 0건 검증.
- 접근성: 터치 44px, focus-visible 골드 링, 대비 4.5:1, reduced-motion 시 애니메이션 없음.
