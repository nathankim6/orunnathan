export const getGrammarWorkbookPrompt = (text: string) => `이제 제가 영어지문을 입력하면 예시와 똑같은 형식으로 문제를 생성하세요.

## 목적
입력된 지문을 바탕으로 수능 영어 수준의 정교한 어법 문제를 자동으로 생성하는 프롬프트입니다.

## 수능/내신 빈출 어법 포인트 TOP 30 (이 포인트들을 중심으로 출제)
1. 현재분사 vs 과거분사 (능동/수동 의미) — exciting/excited, used/using, living/lived
2. 동명사/분사 vs 원형/명사 — doing/do, building/build
3. 형용사 vs 부사 (-ly 구분) — considerable/considerably, natural/naturally
4. 관계대명사 what vs 접속사 that — what(선행사 포함)/that(선행사 필요)
5. 주어-동사 수일치 (is/are) — 원거리 수일치
6. 능동태 vs 수동태 (be p.p.) — increase/be increased
7. 동사 3인칭 단수 -s/-es 수일치 — constitute/constitutes, include/includes
8. to부정사 vs 동명사 — to do/doing
9. 관계대명사 vs 관계부사 (which/where) — which(불완전문)/where(완전문)
10. 수일치 was/were — 단수/복수
11. 분사구문 (독립분사구문 포함) — Remaining/Remained
12. 대명사 vs 재귀대명사 — them/themselves
13. 사역/지각동사 목적보어 — let him go/let him to go
14. 병렬구조 — and/or/but 전후 동일 형태
15. 가주어/가목적어 it — It is.../What is...
16. be동사 vs 대동사 do — as they are/as they do
17. 관계대명사 which vs that (계속적/제한적) — , which/, that(불가)
18. 접속사 vs 전치사 (because/because of) — because+절/because of+명사
19. 관계대명사 which vs what (선행사 유무)
20. 관계대명사 계속적 용법 (, which)
21. 5형식 동사 목적보어 (to부정사/원형) — expect to/make 원형
22. 복합관계사 (-ever) — whatever/what
23. 도치구문 — Never has he/Never he has
24. 의문사+to부정사 — what to do/how to do
25. 접속사 vs 전치사 (while/during) — while+절/during+명사
26. 비교급/동등비교 — more than/as...as
27. 의문사 how vs what — how+형부/what+명사
28. 가정법 시제 — if I were/if I was
29. 동격 that vs 관계대명사 that — the fact that/the fact which
30. 동명사 관용구 — prevent from -ing

## 기존 문법 주요 영역 (수능 영어 문법 포괄)
[기존 섹션 그대로 유지]

## 프롬프트 가이드라인
### 문제 생성 규칙
1. 위 20개 문법 포인트에서 최소 3-4개 요소 복합 적용
2. 난이도: 수능 수준 (고급)
3. 실제 문맥에서의 문법 활용 중심
4. 각 문제는 다음 형식을 따릅니다:
   - 문제 유형: 어법상 알맞은 표현 고르기
   - 보기: 2-4개의 문법적 대안
   - 정답 포함: 문제 하단에 정답 및 해설 제공

## 예시 

### 입력 지문

For companies interested in delighting customers, exceptional value and service become part of the overall company culture. For example, year after year, Pazano ranks at or near the top of the hospitality industry in terms of customer satisfaction. The company's passion for satisfying customers is summed up in its credo, which promises that its luxury hotels will deliver a truly memorable experience. Although a customer­centered firm seeks to deliver high customer satisfaction relative to competitors, it does not attempt to maximize customer satisfaction. A company can always increase customer satisfaction by lowering its price or increasing its services. But this may result in lower profits. Thus, the purpose of marketing is to generate customer value profitably. This requires a very delicate balance: the marketer must continue to generate more customer value and satisfaction but not 'give away the house'.

### 생성된 문제
다음 중 어법상 알맞은 표현을 고르시오.

For companies [interesting/interested] in delighting customers, exceptional value and service become part of the overall company culture. For example, year after year, Pazano [ranks/rank] at or near the top of the hospitality industry in terms of customer satisfaction. The company's passion for satisfying customers [are/is] [summing/summed] up in its credo, [which/that] [promise/promises] [what/that] its luxury hotels will deliver a truly memorable experience. [Despite/Although] a customer-centered firm seeks [delivering/todeliver] high customer satisfaction relative to competitors, it does not attempt [maximizing/to maximize] customer satisfaction. A company can always [be increased/increase] customer satisfaction by lowering its price or [increase/increasing] its services. But this may result [from/in] lower profits. Thus, the purpose of marketing [is/are] to [be generated/generate] customer value [profitably/profitable]. This requires a very [delicately/delicate] balance: the marketer must continue [to generate/togenerating] more customer value and satisfaction but not [give/giving] away the house.

(1) interested (2) ranks (3) is (4) summed (5) which (6) promises (7) that (8) Although (9) to deliver (10) to maximize (11) increase (12) increasing (13) in (14) is (15) generate (16) profitably (17) delicate (18) to generate (19) giving

## 추가 가이드라인
- 난이도: 수능 수준 영어
- 문법적 정확성과 문맥적 자연스러움 동시 고려
- 다양한 문법 요소 포함
- **중요: 선택지에 "X"를 사용하지 마세요. [X/to], [X/for] 같은 형태는 절대 금지입니다. 반드시 두 선택지 모두 실제 단어여야 합니다. 예: [X/to] 대신 [omit/to] 또는 다른 실제 단어 쌍을 사용하세요.**
- 실제 수능 영어 문제 스타일 모방 이제 제가 영어지문을 입력하면 예시와 똑같은 형식으로 문제를 생성하세요.

이제 제가 지문을 입력하면 예시처럼 바로 문제를 생성해주세요.

[INPUT]
${text}

[OUTPUT]`;
