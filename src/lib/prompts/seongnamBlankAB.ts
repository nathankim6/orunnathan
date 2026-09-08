export const getSeongnamBlankABPrompt = (text: string) => `다음 영어 지문을 분석하여, 아래 예시와 똑같은 형식의 빈칸 (A), (B) 문제를 만들어주세요.

**예시 문제:**
다음 빈칸 (A)와 (B)에 들어갈 말로 가장 적절한 것은?
Although there is usually a correct way of holding and playing musical instruments, the most important instruction to begin with is that they are not toys and that they must be looked after. Allow children time to explore ways of handling and playing the instruments for themselves before showing them. ___(A)___ allows young learners to gain an understanding of the instrument's capabilities and its physical characteristics before moving on to formal instruction. Finding different ways to produce sounds is an important stage of musical exploration. Correct playing comes from the desire to find the most appropriate sound quality and find the most comfortable playing position so that one can play with control over time. As instruments and music become more complex, learning appropriate playing techniques becomes increasingly relevant. To summarize, the path to becoming a skilled musician is a harmonious blend of ___(B)___ and the systematic learning of correct techniques for artistic expression.

① (A) Self-directed musical experimentation / (B) free experimentation that builds the foundation
② (A) Adult-guided practice sessions / (B) natural discovery that lights the spark
③ (A) Free exploration and discovery time / (B) teacher guidance that holds the reins
④ (A) Direct copying of techniques / (B) rule memorization that walks the line
⑤ (A) Unguided instrument discovery / (B) strict practice that bears the burden

[정답] ①
[해설] (A)와 (B) 모두 학습자가 스스로 악기를 탐색하고 실험하는 자기 주도적 학습이 형식적 교육에 앞서 중요하다는 글의 핵심 주제와 일치해야 합니다. (A)에는 "Self-directed musical experimentation(자기 주도적 음악 실험)"이 와야 학습자가 악기의 특성을 이해할 수 있다는 다음 문장과 자연스럽게 연결됩니다. (B)에는 "free experimentation that builds the foundation(기초를 다지는 자유로운 실험)"이 와야 "체계적인 정확한 기술 학습(systematic learning of correct techniques)"과 조화로운 결합을 이룬다는 결론과 부합합니다. 따라서 정답은 ①번입니다.

**작성 규칙:**
1. 제공된 영어 지문에서 의미상 핵심이 되는 명사구 2개를 선택하여 (A)와 (B) 빈칸으로 만듭니다.
   - (A)는 지문 전반부에, (B)는 지문 후반부(특히 결론/요약 부분)에 위치하도록 합니다.
   - 빈칸 표시는 반드시 \`___(A)___\` 와 \`___(B)___\` 형식 (밑줄 3개 + 라벨 + 밑줄 3개)으로 표시합니다.
2. **원문 보호**: 빈칸 처리되는 명사구를 제외하고 원문의 문장 구조, 단어, 순서, 구두점을 절대 수정하지 마세요. 빈칸 부분만 \`___(A)___\` / \`___(B)___\`로 교체합니다.
3. 5개 선택지를 ①~⑤로 작성하며, 각 선택지는 다음 형식을 정확히 따릅니다:
   \`① (A) [표현1] / (B) [표현2]\`
   - 한 줄에 (A)와 (B)를 함께 배치하고 슬래시(/)로 구분합니다.
4. (A)와 (B)는 글의 핵심 주제와 논리적으로 일치하는 표현이어야 정답입니다.
5. **오답 전략**:
   - 한 쪽만 맞고 다른 쪽이 틀린 경우 (A는 맞지만 B는 틀림, 혹은 그 반대)
   - 글의 주제와 정반대되는 표현
   - 그럴듯하지만 글의 흐름과 어긋나는 표현
   - (B) 표현은 비유적/관용적 표현(예: "that builds the foundation", "that holds the reins", "that bears the burden")을 포함하여 다양한 뉘앙스를 만듭니다.
6. 제목은 반드시 "다음 빈칸 (A)와 (B)에 들어갈 말로 가장 적절한 것은?"으로 작성합니다.
7. **중요**: 정답은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ①, ②, ③도 충분히 선택되도록 하고 ④, ⑤에 편중되지 않도록 하세요. 정답에 해당하는 올바른 (A)/(B) 조합을 해당 번호에 배치하세요.
8. 해설에는 글의 핵심 주제, (A)와 (B)에 정답이 들어가야 하는 논리적 근거, 정답 번호를 명확히 제시합니다.

**출력 형식 (정확히 이 순서대로):**
다음 빈칸 (A)와 (B)에 들어갈 말로 가장 적절한 것은?
[빈칸 (A), (B)가 포함된 영어 지문]

① (A) [표현] / (B) [표현]
② (A) [표현] / (B) [표현]
③ (A) [표현] / (B) [표현]
④ (A) [표현] / (B) [표현]
⑤ (A) [표현] / (B) [표현]

[정답] [번호]
[해설] [해설 내용]

영어 지문: ${text}`;
