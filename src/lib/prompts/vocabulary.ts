
export const getVocabularyPrompt = (text: string) => `당신은 수능 영어 출제 전문가입니다. 제가 영어 지문을 제공하면, 해당 지문을 바탕으로 "문맥상 낱말의 쓰임이 적절하지 않은 것" 문제를 생성해 주세요.

🚨🚨🚨 **가장 중요한 2가지 규칙 (ABSOLUTE RULES)** 🚨🚨🚨
⚠️ **규칙 1: 반드시 정확히 5개의 번호(①②③④⑤)가 지문 안에 모두 포함되어야 합니다. 4개 이하는 절대 허용되지 않습니다.**
⚠️ **규칙 2: 원문의 문장을 단 한 문장도 추가하거나 삭제하지 마세요. 원문 문장 개수 = 출력 문장 개수여야 합니다.**
⚠️ **짧은 지문이라도 반드시 5개를 찾으세요. 한 문장에서 2~3개 단어를 선택해도 됩니다.**
⚠️ **원문에 없던 문장을 절대 추가하지 마세요**

---

## 🚨 절대 금지 사항 (Critical Rules)
1. ❌ **원문에 없던 문장을 절대 추가하지 마세요**
2. ❌ **원문의 문장을 절대 삭제하지 마세요**
3. ❌ **원문의 문장 순서를 절대 바꾸지 마세요**
4. ❌ **정답이 2개 이상 되는 문제를 절대 만들지 마세요**
5. ✅ **원문의 모든 문장을 그대로 유지하고, 오직 5개 단어만 교체하세요**

---

## 📋 Step-by-Step 문제 생성 프로세스

### **STEP 0: 지문 적합성 사전 검증 (매우 중요)**
문제를 생성하기 전에 반드시 확인하세요:
- [ ] 지문에 교체 가능한 의미 있는 단어가 **최소 5개 이상** 있는가?
- [ ] 5개 단어를 서로 다른 문장에서 골고루 선택할 수 있는가?

**적합한 단어 후보:**
- 형용사 (natural, important, significant 등)
- 동사 (recognize, observe, make 등)
- 부사 (easily, significantly, effectively 등)
- 명사 (concept, ability, solution 등)

**⚠️ 지문이 너무 짧아도 반드시 5개를 찾아야 합니다:**
- 한 문장에서 2개 이상의 단어를 선택해도 됩니다
- 단, 문맥상 명확한 동의어/반의어가 존재하는 단어만 선택하세요

### **STEP 1: 원문 분석 및 확인**
- 원문의 총 문장 개수를 세세요
- 원문의 모든 문장을 목록으로 정리하세요
- 🚨 이 문장들은 절대 변경/추가/삭제되어서는 안 됩니다

### **STEP 2: 정확히 5개 단어 선정 (필수)**
⚠️ **이 단계에서 반드시 5개를 선정해야 합니다** ⚠️

**선정 과정:**
1. 원문을 처음부터 끝까지 읽으며 교체 가능한 단어 후보를 **7-10개** 먼저 목록화
2. 그 중에서 가장 적합한 **정확히 5개**를 최종 선정
3. 선정된 5개 단어를 ①②③④⑤ 번호로 지정

**선정 기준:**
- 형용사, 동사, 부사, 명사 등 다양한 품사
- 🚨 **지문 전체에 반드시 고르게 분포** (필수)
  - 지문을 처음/중간/끝 3구간으로 나눠 각 구간에서 최소 1개씩 선정
  - ①은 지문 앞부분, ⑤는 지문 뒷부분에 위치해야 함
  - 한 문장이나 한 단락에 2개 이상 몰리지 않도록 분산
  - 마지막 한두 문장에 ③④⑤가 몰리는 것 절대 금지
- 문맥 파악이 필요한 단어
- 명확한 동의어/반의어가 존재하는 단어

🚨 **검증:** 5개가 아니면 다시 선정하세요. 4개나 6개는 허용되지 않습니다.

### **STEP 3: 정답 번호 먼저 결정 (랜덤)**
- 🎲 먼저 1~5 사이의 숫자를 무작위로 선택하세요
- 이 번호가 정답(부적절한 단어)이 될 번호입니다
- 📊 ①②③④⑤ 각각 20% 확률로 정답이 되어야 합니다
- ⚠️ 절대로 ①번이나 ②번에만 편향되지 마세요

### **STEP 4: 단어 변환 (4개 동의어 + 1개 반의어)**

**4-1. 정답 번호의 단어 (1개)**
- 선택한 정답 번호의 단어를 **반의어**로 교체
- 🚨 **반의어 선택 기준 (매우 중요)**:
  - 원문 단어와 의미가 **명확하게 반대**여야 함
  - 부정문 맥락에서는 특히 주의: "cannot manage" vs "cannot afford"는 둘 다 부정적이므로 반의어 관계가 아님
  - 긍정/부정을 뒤집어야 함: natural ↔ unnatural, increase ↔ decrease, support ↔ oppose
  - **테스트**: "원문 단어를 반의어로 바꾸면 문장의 의미가 완전히 반대가 되는가?"
- 이 단어는 문맥상 **반드시 부적절**해야 함

**4-2. 나머지 4개 번호의 단어**
- 나머지 4개 번호의 단어를 **동의어**로 교체
- 🚨 **동의어 선택 기준 (매우 중요)**:
  - 해당 문맥에서 원문 단어와 **완벽하게 대체 가능**해야 함
  - 문법적으로 동일한 품사여야 함
  - 뉘앙스가 거의 동일해야 함
  - **테스트**: "원문 단어를 동의어로 바꿔도 문장의 의미가 100% 유지되는가?"
- 동의어 선택 후 반드시 검증:
  - "이 동의어를 사용해도 문맥상 자연스러운가?"
  - "원문 단어와 의미가 정확히 일치하는가?"
  - "이 문맥에서 부적절하지 않은가?"
- ⚠️ 만약 선택한 동의어가 문맥상 조금이라도 어색하다면:
  - 다른 동의어를 선택하거나
  - 다른 원문 단어를 선택하세요
- 이 4개 단어는 문맥상 **반드시 모두 적절**해야 함

### **STEP 5: 복수 정답 방지 검증 (매우 중요)**

**검증 체크리스트:**
- [ ] 동의어로 교체한 4개 단어가 **모두** 문맥상 자연스럽고 적절한가?
- [ ] 반의어로 교체한 1개 단어**만** 문맥상 부적절한가?
- [ ] 정답이 **정확히 1개**인가?
- [ ] 🚨 **특별 검증**: 부정문 맥락에서 유사한 부정적 의미를 가진 단어끼리 교체하지 않았는가?
  - 예: "cannot manage" ↔ "cannot afford" (둘 다 부정적 → 반의어 아님!)
  - 예: "fail to" ↔ "neglect to" (둘 다 부정적 → 반의어 아님!)

**🚨 만약 아래 상황이면 다시 만드세요:**
- 동의어 중 하나라도 문맥상 어색하거나 부적절함 → **다시 STEP 4로**
- 반의어가 실제로는 유사한 의미를 가짐 → **다시 STEP 4로**
- 반의어가 문맥상 적절함 → **다시 STEP 4로**
- 정답이 2개 이상임 → **다시 STEP 2로**
- 정답이 0개임 → **다시 STEP 4로**

### **STEP 6: 문제 작성**

**원문 유지 규칙 (절대 준수):**
- ✅ 원문의 모든 문장을 그대로 복사
- ✅ 선정된 5개 단어만 변환된 단어로 교체하고 번호와 밑줄 추가
- ❌ 원문에 없던 문장을 절대 추가하지 마세요
- ❌ 원문의 문장을 절대 삭제하지 마세요
- ❌ 문장의 구조나 순서를 절대 변경하지 마세요

**번호 표시 형식 (정확히 따르세요):**
- ①<u>단어</u> - 첫 번째 선택된 단어 위치에
- ②<u>단어</u> - 두 번째 선택된 단어 위치에
- ③<u>단어</u> - 세 번째 선택된 단어 위치에
- ④<u>단어</u> - 네 번째 선택된 단어 위치에
- ⑤<u>단어</u> - 다섯 번째 선택된 단어 위치에

**출력 형식:**
\`\`\`
다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?

[원문 그대로 + 5개 단어만 ①②③④⑤번호와 함께 변환]

[정답] ○번
[해설] 정답은 ○번입니다. ○번 [부적절한 단어]는 문맥상 적절하지 않습니다. [문맥 설명]이므로, [부적절한 단어]가 아니라 [원문의 적절한 단어]가 되어야 문맥에 맞습니다.
\`\`\`

### **STEP 7: 최종 검증 (출력 전 필수) - 5개 확인**

🚨🚨🚨 **출력하기 전에 반드시 아래를 확인하세요** 🚨🚨🚨

**검증 1: 5개 번호 개수 확인 (가장 중요)**
생성한 지문에서 다음을 직접 세어보세요:
- [ ] ① 가 지문에 있는가? → 있으면 ✓
- [ ] ② 가 지문에 있는가? → 있으면 ✓
- [ ] ③ 가 지문에 있는가? → 있으면 ✓
- [ ] ④ 가 지문에 있는가? → 있으면 ✓
- [ ] ⑤ 가 지문에 있는가? → 있으면 ✓

**⚠️ 5개 모두 ✓가 아니면 절대 출력하지 마세요!**
**⚠️ 4개만 있으면 다시 STEP 2로 돌아가서 5개를 선정하세요!**

**검증 2: 원문 비교**
- [ ] 원문의 문장 개수 = 문제 지문의 문장 개수인가?
- [ ] 원문에 없던 문장이 추가되지 않았는가?
- [ ] 원문의 문장이 삭제되지 않았는가?
- [ ] 5개 단어를 제외한 모든 내용이 원문과 동일한가?
- 🚨 하나라도 아니면 다시 만드세요

**검증 3: 정답 확인**
- [ ] 동의어로 교체한 4개 단어가 문맥상 적절한가?
- [ ] 반의어로 교체한 1개 단어만 문맥상 부적절한가?
- [ ] 정답이 정확히 1개인가?
- [ ] 🚨 **재검증**: 각 단어를 원문에 대입해보고 의미가 맞는지 확인
  - 4개 동의어: 대입 시 원래 의미 유지되어야 함
  - 1개 반의어: 대입 시 의미가 완전히 반대/부적절해야 함
- 🚨 정답이 2개 이상이거나 0개이면 다시 만드세요

---

## 📝 예시

### 예시 1 (정답: ②번) - 5개 번호 모두 포함

**원문:**
All human cultures mark the passing of time by the differences they observe in the world around them. Our choice of which differences to mark depends firstly on what we can observe and secondly on what is important in our lives. How we mark the differences ─ the shapes of our calendars and our rituals ─ depends on the connections we make between those two things. In the agricultural society of pre-modern Europe, where higher latitudes make the seasons easily observable, it was natural to monitor the solar cycle. Conversely, among the largely nomadic peoples of Arabia, for whom seasonal changes were less significant, the lunar calendar was a more sensible choice. That did not make it inevitable that Islam would use a lunar calendar and Roman Christianity a solar one, but political and religious decisions were made from options limited by geography and lifestyle, filtered through tradition.

**생성된 문제:**

다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?

All human cultures mark the passing of time by the differences they observe in the world around them. Our choice of which ①<u>distinctions</u> to mark depends firstly on what we can notice and secondly on what is important in our lives. How we mark the differences ─ the shapes of our calendars and our rituals ─ depends on the connections we make between those two things. In the agricultural society of pre-modern Europe, where higher latitudes make the seasons easily observable, it was ②<u>unnatural</u> to monitor the solar cycle. Conversely, among the largely nomadic peoples of Arabia, for whom seasonal changes were ③<u>less</u> significant, the lunar calendar was a more sensible choice. That did not make it ④<u>unavoidable</u> that Islam would use a lunar calendar and Roman Christianity a solar one, but political and religious decisions were made from options ⑤<u>restrained</u> by geography and lifestyle, filtered through tradition.

[정답] ②
[해설] 정답은 ②번입니다. ②번 unnatural은 문맥상 적절하지 않습니다. 지문에서 "계절의 변화가 쉽게 관찰되는 높은 위도의 전근대 유럽 농업 사회"에서는 태양력을 따르는 것이 부자연스러운(unnatural) 것이 아니라 자연스러운(natural) 것이어야 문맥에 맞습니다.

**번호 개수 검증:** ① ② ③ ④ ⑤ = 5개 ✓

### 예시 2 (정답: ④번) - 5개 번호 모두 포함

**원문:**
The concept of intelligence has evolved significantly over time. Early theories focused primarily on logical reasoning and mathematical ability. However, modern psychology recognizes multiple forms of intelligence. Emotional intelligence, for example, involves understanding and managing one's own emotions while also recognizing emotional states in others. Creative intelligence enables individuals to generate novel solutions to problems. Social intelligence allows people to navigate complex interpersonal dynamics effectively.

**생성된 문제:**

다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?

The concept of intelligence has ①<u>developed</u> significantly over time. Early theories focused primarily on logical reasoning and mathematical ability. However, modern psychology ②<u>acknowledges</u> multiple forms of intelligence. Emotional intelligence, for example, involves understanding and managing one's own emotions while also ③<u>identifying</u> emotional states in others. Creative intelligence enables individuals to generate ④<u>conventional</u> solutions to problems. Social intelligence allows people to ⑤<u>handle</u> complex interpersonal dynamics effectively.

[정답] ④
[해설] 정답은 ④번입니다. ④번 conventional은 문맥상 적절하지 않습니다. 지문에서 창의적 지능(Creative intelligence)은 문제에 대한 참신한(novel) 해결책을 만들어내는 것이므로, 관습적인(conventional) 것이 아니라 새로운(novel) 해결책이어야 문맥에 맞습니다.

**번호 개수 검증:** ① ② ③ ④ ⑤ = 5개 ✓

---

## 🎯 최종 지시사항

**🚨 가장 중요: 반드시 5개의 번호(①②③④⑤)가 지문에 포함되어야 합니다 🚨**

**출력 형식:**
- "단어 변환표:", "생성된 문제:" 등의 제목이나 설명은 출력하지 마세요
- 바로 "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?"로 시작하세요
- 문제 지문, [정답], [해설]만 출력하세요

**정답 번호 랜덤화:**
- 예시들과 다른 번호를 정답으로 선택하는 것을 우선 고려하세요
- ③번, ④번, ⑤번도 ①번, ②번만큼 자주 정답이 되어야 합니다
- 절대로 특정 번호에 편향되지 마세요

**하나라도 실패하면 처음부터 다시:**
- ⚠️ 번호가 5개가 아님 → 다시 (가장 중요!)
- 원문 문장 개수 ≠ 문제 문장 개수 → 다시
- 정답이 2개 이상 또는 0개 → 다시
- 원문에 없던 문장 추가됨 → 다시

지문: ${text}`;
