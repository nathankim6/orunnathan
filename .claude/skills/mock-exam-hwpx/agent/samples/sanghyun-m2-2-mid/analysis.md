# 상현중학교 2학년 2학기 중간고사 — 출제 성향 분석과 출제 설계

입력: 기출 사진 14장(26-1 **기말** 8쪽 = 33문항 전부 선택형 · 26-1 **중간** 6쪽 = 27문항, 선택 20 + 서답 7) ·
학교 학습지 24쪽(L5 vocabulary 1·2 / grammar 1·2·3 / Listening & Speaking / Reading, L6 vocabulary 1·2 / grammar 1·2·3) ·
교과서 범위 자료(동아 이병민 중2 Lesson 5 *Love, Act, Save!* · Lesson 6 *Growing Teens* — 대화문·본문·기타 지문 xlsx/hwp, 어휘 xlsx) ·
특징 메모(중간 27문항 = 선택 20 / 서답 7, 서답형 40 % 쓰기 중심, 서술형은 영작, 본문 유형 주제·목적/일치/불일치·추론/어법/빈칸,
어법은 이전 시험 문법 연계·확장 — 지각동사면 사역·준사역·5형식까지).

## 1. 기출 형식 (26-1 중간고사를 그대로 따른다)

| 항목 | 기출 | 이번 모의고사 |
|---|---|---|
| 선택형 | 20문항 × 3점 = 60 | 같음 |
| 서답형 | 7문항 = 4점×4 + 6점×2 + 12점×1 = 40 | 같음 (서답형 1·3·5·6 = 4점, 2·4 = 6점(각 3), 7 = 12점(각 3)) |
| 총점 | 100 | 100 |
| 배점 표기 | 발문 끝 `(3점)` | render.py 가 `[3점]` 으로 붙임 |
| 묶음 | `[5~7]` 본문 · `[9~10, 서답형 1]` 본문 · `[14~17]` 본문 · `[19~20, 서답형 2~3]` 본문 | 같은 자리·같은 묶음 |
| 서답형 | 관련 지문 뒤에 끼어 있는 1·2·3 + 뒤쪽 독립 4·5·6·7 | 같음 |
| 판형 | 2단, 정보표(선택형/서답형 문항수·배점), 안내문 2줄, 저작권 꼬리말 | 학교 서식 HWPX (render.py) |

26-1 기말(33문항 전부 선택형)은 형식이 아니라 **문법 연계**의 근거로만 썼다: 3번(원인·결과 5형식 make/ask/advise/tell) ·
30번(want/ask/make/let 5형식) · 16·24·29(현재완료·관계대명사) → 이번 어법 문항의 "이전 시험 확장" 재료.

## 2. 번호별 유형 · 소스 매칭

| 번호 | 기출 유형 | 이번 소스 |
|---|---|---|
| 1 | 대화 내용 일치 | L6 L&S 1-B 셀카 / L5 L&S 1-B 업사이클링 / L6 Check Up B 스페인어 |
| 2 | 어법이 맞는 문장 | the 비교급·가주어 / each·every·all 수일치 / 지각·사역동사 목적격보어 |
| 3 | 대화 빈칸 (A) | L5 L&S 2-A 배낭 / L5 L&S 1-A3 대기 오염 / L6 L&S 2-A 스트레스 |
| 4 | 어법 옳은 것 모두(ⓐ~ⓖ) | 지각동사 + **사역(make/let)·준사역(help)·5형식(ask/advise + to)** 확장 — 학습지 L6 grammar 3-E 문장 + 26-1 기말 3·30번 |
| [5~7] | 주제 · 문장 삽입 (A)~(E) · 본문을 옮긴 대화 (A)~(E) 불일치 | L5 Monica / L6 Survey / L5 Timothy |
| 8 | 대화 읽고 답할 수 없는 질문 | L6 L&S 2-A / L6 L&S 1-A3 / L6 Check Up A |
| [9~10, 서1] | 어법 틀린 개수 (A)~(D) · 속담(또는 목적) · 문장 전환 | L6 Fly High / L5 Suin / L5 My Writing(Homin) |
| 11 | 대화 빈칸 배열 (A)~(C) | L6 L&S 1-A2 / L5 Check Up A / L5 Check Up C |
| 12 | 용법이 다른 하나 | 가주어 It vs 대명사 it / 가주어 vs 비인칭 it / 진주어 to부정사 vs 부사적(목적) — 26-1 중간 12번(to부정사 용법) 연계 |
| 13 | 밑줄 단어 쓰임 어색 | 학습지 vocabulary 1 예문 그대로 |
| [14~17] | 이유 · (A)~(C) 어법 표 · (D) 빈칸 문장 · <보기> 일치 개수(7문장) | L5 Timothy / L6 Fly High / L5 Suin |
| 18 | <보기> 빈칸에 못 들어가는 단어 | 학습지 vocabulary 1 예문 4문장 + 어휘 5개 |
| [19~20, 서2~3] | 일치 또는 지시대상 ⓐ~ⓔ · 영영풀이 ⓐ~ⓔ 짝 · 문장 전환 2개(6점) · 보기 단어 영작(4점) | L6 Survey+Principal / L5 Monica / L6 Carebot+Fly High |
| 서4 | <보기> 읽고 문장 2개 완성 (6점) | the 비교급 / each·every / 가주어 It |
| 서5 | 조건 영작(보기 단어 모두, 문법 지정) | 가주어 It(대화 속 빈칸) / 가주어 It / 지각동사 |
| 서6 | 대화 완성(의사소통 기능) | How often ~? / What can we do to ~? / Don’t forget to ~ |
| 서7 | 대화 12점 = (A)~(C) 문장 변환 3 + (D) 우리말 조건 영작 1 | 지각동사 while→분사 + the 비교급 / 두 문장→지각동사 + the 비교급 / each·every·all 주어 전환 + 가주어 It |

기출 26-1 중간에는 그림 문항이 없다(기말 25번 지도 문항은 이번 형식에 없음). 기출 10번 "속담" 자리는 3회에서 "글의 목적"(메모의 주제·목적 유형)으로 바꿨다.

## 3. 이번 범위의 문법·어휘

| 영역 | 포인트 | 근거 |
|---|---|---|
| L5 문법 | **가주어 It + to부정사** · **the 비교급 ~, the 비교급 …**(good→better, many/much→more, little→less, bad→worse) | 학습지 L5 grammar 1·2·3, Reading 8·15·30 |
| L6 문법 | **each/every + 단수, all + 복수(셀 수 없는 명사는 단수)** · **지각동사 + 목적어 + 동사원형/현재분사** | 학습지 L6 grammar 1·2·3 |
| 확장(메모) | 사역동사 make/let + 원형, 준사역 help + 원형/to, 5형식 ask/advise/want/tell + to부정사, 현재완료(have seen), 수동태(are cut) | 26-1 기말 3·16·30번, 26-1 중간 15번 |
| 어휘 | 영영풀이(학습지 vocabulary 2 표 L5 33개 · L6 32개), 예문(vocabulary 1), 숙어(stay up, all the time, slow down, find out…) | 13·18·20번 |

## 4. 3부 소스 배분

| | 1회 | 2회 | 3회 |
|---|---|---|---|
| 1 대화 일치 | L6 1-B 셀카 | L5 1-B 업사이클링 | L6 CU-B 스페인어 |
| 3 대화 빈칸 | L5 2-A 배낭 | L5 1-A3 대기 오염 | L6 2-A 스트레스 |
| [5~7] | L5 Monica | L6 Survey | L5 Timothy |
| 8 답 못 찾는 질문 | L6 2-A 스트레스 | L6 1-A3 잠 | L6 CU-A 개 산책 |
| [9~10, 서1] | L6 Fly High(전반) · 지각동사 원형 전환 | L5 Suin · 가주어 전환 | L5 Homin 편지 · to부정사 주어 전환 |
| 11 배열 | L6 1-A2 책상 | L5 CU-A 소풍 | L5 CU-C 의류 |
| 12 용법 | 가주어 vs 대명사 it | 가주어 vs 비인칭 it | 진주어 vs 부사적 to부정사 |
| [14~17] | L5 Timothy | L6 Fly High(전체) | L5 Suin |
| [19~20, 서2~3] | L6 Survey+Principal · 가주어/all 전환 · the 비교급 영작 | L5 Monica · the 비교급 합치기 · 가주어 영작 | L6 Carebot+Jina 인용 · 지각동사 원형 전환 · the 비교급 영작 |
| 서4 | the 비교급 2문장 | each/every 2문장 | 가주어 It 2문장 |
| 서5 | It is important to walk your dog every day | It is important to keep your desk tidy | I saw my friend pick up trash on the street |
| 서6 | How often do you have dinner | What can we do to reduce air pollution | Don’t forget to carry |
| 서7 | 축제(Fly High) 지각동사 분사 3 + the 비교급 | 운동회(My Writing) 두 문장→지각동사 3 + the 비교급 | 도서관 안내(Check Up)+용돈 기입장 each/every/all 전환 3 + 가주어 |

## 5. 메모 반영

- 서답형 7문항 40점 전부 **영작·문장 전환**(쓰기 중심). 객관식 서답형 아님.
- 본문 문항은 주제·목적(5·10) / 일치(19) / 불일치·추론(7·17) / 어법(9·15) / 빈칸(16) 을 모두 넣었다.
- 어법은 이번 범위(가주어·the 비교급·each/every/all·지각동사)에 **이전 시험 문법을 얹어** 냈다 — 4번은 지각동사에 사역·준사역·5형식(to부정사)을 섞은 7문장, 2번·9번·15번에 현재완료·수동태·감정 형용사를 끼웠다.
- 본문·대화 문장은 교과서 xlsx 그대로. 문법 예문은 학습지 문장(grammar 1~3 · vocabulary 1 예문)을 우선 썼고, 7번의 "본문을 옮긴 대화" 와 서답형 7의 대화만 본문 내용으로 새로 썼다.
- 미리보기 PDF 마지막 쪽에서 정답표가 꼬리말과 겹쳐 보이는 것은 HTML 미리보기 한계(한글 HWPX 는 정상).
