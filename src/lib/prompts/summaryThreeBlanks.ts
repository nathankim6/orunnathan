export const getSummaryThreeBlanksPrompt = (text: string) => `당신은 수능 영어 [40] 요약문(빈칸 3개) 유형 출제 전문가입니다. 아래 실제 수능/모의고사 스타일을 정확히 따라 문제를 만들어주세요.

═══════════════════════════════════════════════
■ 문제 형식 (수능 [40]번 변형 — 빈칸 3개)
═══════════════════════════════════════════════
1. 발문: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B), (C)에 들어갈 말로 가장 적절한 것은?"
2. 영어 원문 지문 (수정/생략 금지)
3. ↓ 화살표
4. 한 문장 영어 요약문 — 본문 전체를 압축, (A), (B), (C) 빈칸 세 개 포함
5. 5개 선지 (①~⑤) — (A) 단어 / (B) 단어 / (C) 단어 세 열
6. [정답] / [해설]

═══════════════════════════════════════════════
■ (A), (B), (C) 단어 선정 규칙
═══════════════════════════════════════════════
- 품사: 동사, 형용사, 부사 위주 (명사도 가능)
- (A)(B)(C)는 본문의 핵심 메시지를 결정짓는 세 축이어야 함
- 정답 단어들은 본문에서 직접 paraphrase 가능 (본문 단어 그대로 X, 동의어/상위어 ○)
- 5개 선지의 (A) 5개, (B) 5개, (C) 5개 = 총 15개 단어 모두 서로 달라야 함

═══════════════════════════════════════════════
■ ★★ 3→2→1 깔때기(funnel) 구조 — 반드시 ★★
═══════════════════════════════════════════════
- (A) 칸: 5개 중 정확히 3개가 문맥상 (A)에 적합, 나머지 2개는 명백히 부적합
- (B) 칸: (A) 적합 3개 중 정확히 2개가 (B)도 적합
- (C) 칸: (A)+(B) 적합 2개 중 정확히 1개가 (C)도 적합 (= 정답)
- 결과: 학생은 (A)→(B)→(C) 순으로 후보를 좁혀 정답 1개 확정

═══════════════════════════════════════════════
■ ★★★ 복수정답 방지 — 가장 중요 ★★★
═══════════════════════════════════════════════
1. 정답 단어의 동의어/근접어를 다른 선지에 절대 사용 금지
   ❌ 정답 "enhance"인데 다른 선지에 "improve, boost, strengthen"
   ❌ 정답 "dangerous"인데 다른 선지에 "harmful, risky"
2. 정답 단어와 의미장(semantic field)이 겹치는 단어는 모두 배제
3. 오답은 본문의 어떤 문장으로도 정당화될 수 없어야 함 (반대 의미 / 무관 / 본문 부정 내용)
4. 5개 선지 각각을 요약문에 대입했을 때, 본문 결론과 정확히 일치하는 조합이 오직 1개

═══════════════════════════════════════════════
■ 정답 위치 분포
═══════════════════════════════════════════════
- 정답은 ①~⑤에 균등 분포 (특히 ②, ③, ④ 권장)
- 본문 글자 수 L에 대해 K = (L mod 5) + 1 → K번 위치에 정답
- 이 계산 과정은 출력하지 말 것

═══════════════════════════════════════════════
■ 실제 수능형 예시 (반드시 이 스타일 그대로 따라하기)
═══════════════════════════════════════════════

다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B), (C)에 들어갈 말로 가장 적절한 것은?

While gene editing technology like CRISPR holds great promise for curing genetic diseases, scientists warn that its application could expand far beyond therapeutic uses. The possibility of "designer babies" — children whose traits are selected by parents — raises serious ethical concerns. Once the technology becomes widely available, social pressure may push families to enhance non-medical traits such as intelligence or appearance, creating new forms of inequality. Therefore, many experts argue that strict regulation is needed before the line between treatment and enhancement is irreversibly crossed.

↓

While gene editing may initially seem (A) __________ for treating diseases, the technology could (B) __________ beyond medical needs, potentially leading humanity down a (C) __________ path.

         (A)              (B)              (C)
①   reasonable    …    expand       …    beneficial
②   reckless      …    limit        …    harmful
③   sensible      …    grow         …    dangerous
④   appropriate   …    restrict     …    stable
⑤   misguided     …    ignore       …    desirable

[정답] ③
[해설] 정답은 ③번입니다. 본문은 유전자 편집이 질병 치료에 큰 가능성을 지닌다고 했으므로 (A)는 sensible이 적절합니다. 또한 그 기술이 치료 목적을 넘어 확장될 수 있다고 했으므로 (B)는 grow가 적절합니다. 마지막으로 비치료적 형질 강화가 새로운 불평등을 낳을 수 있다고 경고하므로 (C)는 dangerous가 적절합니다. ②⑤는 (A)가 본문과 정반대(reckless/misguided), ①은 (C) beneficial이 본문 경고와 모순, ④는 (B) restrict가 본문과 정반대입니다.

═══════════════════════════════════════════════
■ 출력 형식 (이 형식 그대로, 다른 라벨/마크다운 추가 금지)
═══════════════════════════════════════════════
다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B), (C)에 들어갈 말로 가장 적절한 것은?

${text}

↓

[한 문장 영어 요약문, (A) __________, (B) __________, (C) __________ 모두 포함]

         (A)              (B)              (C)
①   [word]    …    [word]    …    [word]
②   [word]    …    [word]    …    [word]
③   [word]    …    [word]    …    [word]
④   [word]    …    [word]    …    [word]
⑤   [word]    …    [word]    …    [word]

[정답] [번호]
[해설] 정답은 [번호]번입니다. 본문은 "[본문 핵심 인용]"이라고 했으므로 (A)는 [정답A]가, "[본문 인용]"이라고 했으므로 (B)는 [정답B]가, "[본문 인용]"이라고 했으므로 (C)는 [정답C]가 적절합니다. [각 오답이 왜 틀렸는지 1문장씩 — 어느 선지의 어느 칸이 본문의 어느 부분과 모순/무관한지].

═══════════════════════════════════════════════
■ ⚠️ 출력 직전 자가검토 (모두 YES여야 함)
═══════════════════════════════════════════════
□ 요약문이 영어 한 문장이고 (A), (B), (C) 세 빈칸이 모두 있는가?
□ 요약문에 정답 단어가 직접 노출되지 않았는가?
□ 15개 visible words(5×3)가 모두 서로 다른가?
□ 정답 단어의 동의어/근접어가 다른 선지에 없는가?
□ (A) 적합이 정확히 3개, 그 중 (B) 적합이 2개, 그 중 (C) 적합이 1개(=정답)인가?
□ 선지가 markdown 표(|, ---)가 아니라 일반 텍스트 줄("①  word  …  word  …  word")인가?
□ [정답]과 [해설]이 분리되어 있고 [정답] 뒤에 ①~⑤ 중 하나만 있는가?
□ 메타 정보(주제 요약, 분석 노트, "단어 개수 확인" 등)가 전혀 없는가?
→ 하나라도 NO면 REWRITE!

중요:
- "[정답]" "[해설]" 표기 정확히 사용 (대괄호 포함)
- 해설은 반드시 한국어
- 마크다운 헤더(#), 굵게(**), 코드블록, 표 형식(|, ---) 사용 금지
- 본문 내용을 그대로 사용 (수정·번역·생략 금지)
- "[요약문]" 같은 별도 라벨 붙이지 말 것 — ↓ 화살표 다음에 바로 요약문

이제 아래 지문으로 위 형식의 [40] 요약문(빈칸 3개) 문제를 만들어주세요:

${text}`;
