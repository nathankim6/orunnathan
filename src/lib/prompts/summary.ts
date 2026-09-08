export const getSummaryPrompt = (text: string) => `당신은 수능 영어 [40] 요약문 유형 출제 전문가입니다. 아래 실제 수능/모의고사 스타일을 정확히 따라 문제를 만들어주세요.

═══════════════════════════════════════════════
■ 문제 형식 (수능 [40]번 표준)
═══════════════════════════════════════════════
1. 발문: "다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?"
2. 영어 원문 지문 (수정/생략 금지)
3. ↓ 화살표
4. 한 문장 영어 요약문 — 본문 전체를 압축, (A)와 (B) 빈칸 두 개 포함
5. 5개 선지 (①~⑤) — 표 형태로 (A) 단어 / (B) 단어 제시
6. [정답] / [해설]

═══════════════════════════════════════════════
■ (A), (B) 단어 선정 규칙
═══════════════════════════════════════════════
- 품사: 동사, 명사, 형용사, 부사 모두 가능 (실제 수능에 명사도 자주 출제됨: license, fragility, success 등)
- (A)와 (B)는 본문의 핵심 메시지를 결정짓는 두 축이어야 함
- 정답의 (A), (B)는 본문에서 직접 paraphrase 가능한 어휘 (본문 단어를 그대로 쓰지 말고 동의어/상위어로)
- 5개 선지의 (A) 5개, (B) 5개는 모두 서로 다른 단어 (총 10개 단어 모두 달라야 함)

═══════════════════════════════════════════════
■ ★★ 깔때기(funnel) 구조 — 반드시 ★★
═══════════════════════════════════════════════
선지는 다음 구조여야 함:
- (A) 칸: 5개 중 2~3개가 문맥상 (A)에 적합, 나머지는 명백히 부적합
- (B) 칸: (A)가 적합한 2~3개 중 (B)도 적합한 것은 단 1개 (= 정답)
- 결과: 학생은 (A)로 후보 좁히고, (B)로 정답 1개 확정

═══════════════════════════════════════════════
■ ★★★ 복수정답 방지 — 가장 중요 ★★★
═══════════════════════════════════════════════
1. 정답 단어의 동의어/근접어를 다른 선지에 절대 사용 금지
   ❌ 정답 "confronting/avoiding"인데 다른 선지에 "embracing/escaping" 포함 → 복수정답
   ❌ 정답 "enhance"인데 다른 선지에 "improve, boost, strengthen"
   ❌ 정답 "innate"인데 다른 선지에 "inborn, natural, inherent"
2. 정답 단어와 의미장(semantic field)이 겹치는 단어는 모두 배제
3. 오답은 본문의 어떤 문장으로도 정당화될 수 없어야 함 (반대 의미 / 무관 / 본문 부정 내용)
4. 5개 선지 각각을 요약문에 대입했을 때, 본문 결론과 정확히 일치하는 조합이 오직 1개

═══════════════════════════════════════════════
■ 정답 위치 분포
═══════════════════════════════════════════════
- 정답은 ①~⑤에 균등 분포 (실제 수능: ②, ③, ④가 더 자주 정답)
- 특정 번호(①, ⑤)에만 몰리지 않도록 본문 글자 수 L을 이용:
  K = (L mod 5) + 1 → K번 위치에 정답 배치
- 이 계산 과정은 출력하지 말 것

═══════════════════════════════════════════════
■ 실제 수능형 예시 (반드시 이 스타일 따라하기)
═══════════════════════════════════════════════

[예시 1]
다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?

In the digital age, the concept of "ownership" has become increasingly complex, particularly concerning digital goods like e-books and software. Unlike physical items, digital products are licensed, not sold. This means consumers purchase the right to use the product under specific terms, but they do not own it in the traditional sense. This distinction has profound implications. For instance, users cannot resell, lend, or even bequeath their digital libraries to others as they could with physical books. Furthermore, the provider can revoke access to the content at any time if the user violates the terms of service, or if the company itself ceases to exist.

↓

The shift from physical to digital goods has altered the concept of ownership, where consumers acquire a mere (A) __________ to use a product rather than outright possession, which (B) __________ their traditional rights associated with ownership.

         (A)              (B)
①   license       …    expands
②   license       …    restricts
③   copyright     …    protects
④   copyright     …    complicates
⑤   privilege     …    guarantees

[정답] ②
[해설] 정답은 ②번입니다. 본문은 디지털 상품이 "판매되는 것이 아니라 라이선스가 부여된다(licensed, not sold)"고 명시하므로 (A)는 license가 적절합니다. 또한 소비자가 재판매·대여·상속할 수 없고 제공자가 접근권을 회수할 수 있다는 점에서 전통적 소유권이 "제한된다(restricts)"는 것이 (B)에 적절합니다. ①은 (B) expands가 본문과 정반대, ③④는 (A) copyright가 본문 근거 없음, ⑤는 (A) privilege와 (B) guarantees 모두 부적절합니다.

[예시 2]
다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?

The introduction of non-native species into new ecosystems, whether intentionally or accidentally, often leads to unforeseen and devastating consequences. These "invasive species" can outcompete native organisms for resources, disrupt food webs, and introduce new diseases. A classic example is the cane toad in Australia, introduced to control pests in sugarcane fields but which became a far greater menace itself, poisoning native predators and causing a decline in their populations.

↓

The introduction of non-native species can severely (A) __________ local ecosystems by outcompeting native life and causing significant economic damage, thereby demonstrating the (B) __________ of ecological balance when faced with human actions.

         (A)              (B)
①   enrich       …    resilience
②   support      …    complexity
③   threaten     …    stability
④   disrupt      …    fragility
⑤   restore      …    importance

[정답] ④
[해설] 정답은 ④번입니다. 본문은 외래종이 토착 생물과 경쟁하고 먹이 그물을 "교란한다(disrupt)"고 명시하므로 (A)는 disrupt가 적절합니다. 또한 인간의 개입 앞에서 생태계 균형이 매우 "깨지기 쉽다(fragility)"는 메시지를 전달하므로 (B)는 fragility가 적절합니다. ①⑤는 (A)가 본문과 정반대(enrich/restore), ②는 본문 근거 없음, ③의 threaten은 (A) 후보이나 (B) stability(안정성)는 본문과 모순됩니다.

═══════════════════════════════════════════════
■ 출력 형식
═══════════════════════════════════════════════
다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?

${text}

↓

[한 문장 영어 요약문, (A) __________ 와 (B) __________ 포함]

         (A)              (B)
①   [word]    …    [word]
②   [word]    …    [word]
③   [word]    …    [word]
④   [word]    …    [word]
⑤   [word]    …    [word]

[정답] [번호]
[해설] 정답은 [번호]번입니다. 본문은 "[본문 핵심 인용]"이라고 했으므로 (A)는 [정답A]가, "[본문 인용]"이라고 했으므로 (B)는 [정답B]가 적절합니다. [각 오답이 왜 틀렸는지 1~2문장씩 설명 — 어느 선지의 어느 칸이 본문의 어느 부분과 모순/무관한지].

═══════════════════════════════════════════════
■ ⚠️ 출력 직전 자가검토 (모두 YES여야 함)
═══════════════════════════════════════════════
□ 요약문에 (A), (B) 빈칸만 있고 정답 단어가 노출되지 않았는가?
□ 10개 visible words가 모두 서로 다른가?
□ 정답 (A), (B) 각각에 대해 본문에서 직접 인용 가능한 근거가 있는가?
□ 정답 단어의 동의어/근접어가 다른 선지에 포함되어 있지 않은가? (confronting↔embracing, enhance↔improve 등)
□ (A)가 적합한 선지가 2~3개, 그 중 (B)도 적합한 것이 정확히 1개인가?
□ 5개 선지를 하나씩 요약문에 대입했을 때, 본문 결론과 일치하는 조합이 정답 1개뿐인가?
□ 나머지 4개 오답 각각에 대해 "본문의 어느 문장과 모순/무관한가"를 한 문장으로 댈 수 있는가?
→ 하나라도 NO면 REWRITE!

중요:
- "[정답]" "[해설]" 표기 정확히 사용 (대괄호 포함)
- 해설은 반드시 한국어
- 검증 과정, 메타 정보, "단어 개수 확인" 같은 디버그 출력 절대 금지
- 본문 내용을 그대로 사용 (수정 금지)

이제 아래 지문으로 위 형식의 [40] 요약문 문제를 만들어주세요:

${text}`;
