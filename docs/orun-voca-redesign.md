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

- **학생**: 담임이 만든다. 이름 + 휴대폰 뒷4자리(학부모) 를 넣으면 6자리 개인 코드가 생긴다.
  로그인은 개인 코드 하나. 지금의 로그인 화면(Portal Access)을 그대로 쓰고, 코드가 `voca_students` 에 있으면 학생으로 들어간다.
  코드가 유출돼도 남이 대신 공부해 주는 것 말고는 피해가 없으니 비밀번호는 두지 않는다.
- **담임**: Supabase Auth 이메일 로그인. 원장이 초대한다. `voca_teachers.auth_user_id` 로 잇는다.
  (기존 관리자 코드 셋은 원장 코드로 남긴다 — 화면 하나로 세 역할이 들어간다.)
- **RLS**: 담임은 `voca_classes.teacher_id = 내 id` 인 반과 그 학생·세션만 읽고 쓴다.
  학생은 anon 키로 들어오므로 **학생 쓰기는 RPC(`voca_log_session`) 로만** 받고 코드로 검증한다.

## 3. 데이터 모델 (모두 새 테이블, `voca_` 접두어)

```sql
voca_teachers   (id, auth_user_id, name, is_admin, created_at)
voca_classes    (id, name, teacher_id → voca_teachers, grade, is_active, created_at)
voca_students   (id, class_id → voca_classes, name, code UNIQUE(6자리), parent_phone_last4,
                 is_active, created_at, last_seen_at)

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

-- 문항 단위(분석용, 선택). 나중에 "시간 대 성취" 분석에 쓴다.
voca_attempts   (id, session_id, word, mode, is_correct, response_ms, asked_at)

-- 혜택 규칙. 담임이 켜고 끈다.
voca_reward_rules (id, class_id NULL=전체, name, min_sessions, min_avg_accuracy,
                   min_active_minutes, benefit text  -- 예: '컷트라인 -5점'
                   is_active)

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
1. **홈** — 담임이 지정한 "이번 시험 범위" 카드(단어장·Day·시험일·D-day) + 4가지 모드 타일 + 내 기록 세 숫자(횟수·평균·누적시간) + 이번 범위 성취도 + 혜택 달성 배지.
2. **연습** — 진행 바 · 문항 · 선지 4개 · 즉시 채점 · 우측 상단 활동 시간.
3. **결과** — 점수 · 틀린 단어 목록 · "틀린 것만 다시" · "한 번 더" · 홈.
4. **내 기록** — 날짜별 세션 목록, 모드별 정답률, 자주 틀리는 단어 TOP 10.
범위 밖 단어장도 열어 볼 수 있게 하되(기존 단어장 목록 유지), 홈에서는 범위를 앞세운다.

### 담임
1. **내 반** — 반 선택 → 학생 표: 이름 · 총 횟수 · 평균 성취도 · 누적 시간 · 이번 범위 성취도 · 최근 학습 · 혜택. 열 정렬. 엑셀 내려받기.
2. **학생 상세** — 세션 타임라인, 모드별 정답률, 누적 시간 추이, 틀린 단어 누적, 리포트 공유 버튼.
3. **범위 지정** — 단어장 · Day · 시험일 · 제목. 현재 범위 하나만 `is_current`.
4. **학생 관리** — 추가(이름·뒷4자리) · 코드 재발급 · 반 이동 · 비활성.
5. **혜택 규칙** — "세션 N회 이상 · 평균 M% 이상 · 누적 T분 이상 → 컷트라인 −K점". 표에 달성 배지로 나온다.

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
`voca_teachers`·`voca_classes`·`voca_students`·`voca_class_ranges` 마이그레이션 + RLS.
로그인 화면에 세 역할 분기. 담임 로그인(이메일). 담임 화면: 반·학생 관리·범위 지정. 학생 홈(범위 카드만).
→ 검증: 담임이 학생 10명을 넣고 코드로 로그인이 된다.

**2단계 — 연습 엔진과 기록 (1~2주)**
`voca_sessions`·`voca_attempts` + `voca_log_session` RPC. 4모드 4지선다 화면, 선지 생성(캐시 우선), 활동 시간 측정, 결과 화면, 내 기록.
→ 검증: 20문항 세션 뒤 `voca_sessions` 에 한 행, `active_seconds` 가 실제와 ±5초.

**3단계 — 대시보드·혜택·가정 리포트 (1주)**
`voca_student_stats` 뷰, 담임 학생 표·상세, 혜택 규칙, 공유 링크와 리포트 화면, 엑셀.
→ 검증: 규칙을 켜면 배지가 뜨고, 링크가 로그인 없이 열린다.

**4단계 — 정리**
기존 반 공용 코드 비활성, 메뉴 재배치, 사용 안 하는 페이지 숨김.

## 9. 결정이 필요한 것

1. **혜택 기준값** — 초안: 세션 15회 이상 · 평균 85% 이상 · 누적 120분 이상 → 컷트라인 −5점. 반마다 다르게 둘 수 있게 했다.
2. **학생 코드 방식** — 6자리 코드 하나(초안) vs 반 코드 + 이름 + 뒷4자리. 후자는 담임이 미리 넣지 않아도 되지만 동명이인과 오타 문제가 있다.
3. **범위 밖 단어장 개방** — 학생에게 전체 단어장을 열어 둘지(초안: 연다, 홈에서는 범위 우선).
4. **문항 단위 기록(`voca_attempts`)** — 첫 판부터 남길지. 저장량은 세션당 20~40행이라 부담은 없다. 초안: 남긴다.

## 10. Lovable 첫 프롬프트 (1단계용, 붙여넣기)

> ORUN VOCA 를 "담임이 반을 관리하고 학생이 개인 코드로 들어오는 구조" 로 바꿉니다.
> 새 테이블은 모두 `voca_` 접두어를 씁니다. 기존 테이블(`classes`, `students`, `student_access_codes`)은 건드리지 않습니다.
> 1) 마이그레이션: voca_teachers(auth_user_id), voca_classes(teacher_id), voca_students(class_id, name, code 6자리 unique, parent_phone_last4), voca_class_ranges(class_id, card_set_id, days text[], exam_date, is_current). RLS: 담임은 자기 반만.
> 2) `/` 로그인: 입력이 관리자 코드면 원장, `voca_students.code` 에 있으면 학생, 아니면 이메일 로그인 폼(담임).
> 3) 담임 화면 `/teacher`: 내 반 목록 → 학생 표(이름·코드·최근 접속) · 학생 추가/코드 재발급 · "이번 시험 범위" 지정(단어장·Day·시험일).
> 4) 학생 홈 `/home`: 이번 범위 카드(D-day 포함) + 4개 모드 타일(아직 동작 없음, 2단계).
> 디자인은 지금 로그인 화면의 Warm Editorial 톤(#8b7355 · Noto Sans KR · Orbitron 은 라벨만)을 유지합니다.
