export const getReferenceInferencePrompt = (text: string) => {
  // 정답 번호를 랜덤하게 선택 (1-5)
  const randomAnswerNumber = Math.floor(Math.random() * 5) + 1;
  const answerSymbols = ['①', '②', '③', '④', '⑤'];
  const selectedAnswer = answerSymbols[randomAnswerNumber - 1];

  return `# 역할 부여
당신은 대한민국 수능 영어 영역 출제 위원입니다. 특히 문맥을 파악하여 지칭하는 대상을 추론하는 "지칭 추론(Referential Inference)" 유형의 전문가입니다.

# 작업 목표
제공된 [영어 지문]을 분석하여, 밑줄 친 5개의 부분 중 **가리키는 대상이 나머지 넷과 완전히 다른 하나**를 찾는 5지 선다형 문제를 만드세요.

# 🔴 정답 번호 지정 (필수)
**이번 문제의 정답은 반드시 ${selectedAnswer}번이어야 합니다.**

# 🔴🔴 핵심 제작 규칙 - 반드시 4:1 대립 구조 (절대 준수)

## 1. 명확한 4:1 대립 구조 (The "4 vs 1" Rule)
- **반드시 4개는 동일한 개념/대상**을 지칭해야 합니다.
- **반드시 1개(정답)만 반대되거나 다른 개념/대상**을 지칭해야 합니다.
- ⚠️ **3:2 구도는 절대 불가!** 만약 지문에서 4:1 구도를 만들 수 없다면, 다른 개념 쌍을 찾으세요.

## 2. 대립 구조 설정 방법
- 지문 내에서 서로 **대조되거나 반대되는 두 가지 개념(A vs B)**을 찾으세요.
  - 예: '부정적 태도' vs '긍정적 태도', '문제점' vs '해결책', '과거' vs '현재'
- **개념 A를 지칭하는 부분 4개**를 찾아 밑줄을 그으세요.
- **개념 B를 지칭하는 부분 1개(정답)**를 찾아 ${selectedAnswer}번에 배치하세요.

## 3. 밑줄 선정 시 검증 체크리스트
밑줄을 긋기 전에 반드시 확인하세요:
- [ ] 4개의 밑줄이 정말로 **같은 개념/대상**을 가리키는가?
- [ ] 1개의 밑줄(정답)이 정말로 **나머지 4개와 반대되는 개념**을 가리키는가?
- [ ] 3:2나 2:3 구도가 아닌 **명확한 4:1 구도**인가?
- [ ] 밑줄 친 부분만 읽어도 그것이 **어떤 개념/대상을 지칭하는지** 명확한가?

## 4. 밑줄 대상 선정 핵심 원칙 (가장 중요!)
- **밑줄은 반드시 특정 개념이나 대상을 "지칭·가리키는" 표현에만 그어야 합니다.**
- 밑줄 친 부분이 무엇을 가리키는지 학생이 문맥을 통해 추론할 수 있어야 합니다.
- 지문에서 핵심 개념 A와 대조 개념 B를 먼저 정한 뒤, 그것들을 **지칭하는 대명사, 지시어, 동의어, 환언 표현, 명사구**에 밑줄을 그으세요.
- ⚠️ **금지**: 문장 전체에 밑줄, 단순 행동/사건 서술에 밑줄, 맥락 없는 단편적 표현
- ✅ **올바른 밑줄 대상**: 
  - 대명사: it, they, this, these
  - 지시 표현: this approach, such methods, the technique
  - 동의어/환언: a kind of journaling → the morning pages → free writing (같은 대상의 다른 표현)
  - 명사구: the habit of early rising, a loss of creativity
- ❌ **잘못된 밑줄 대상**: 
  - 문장 전체를 통째로 밑줄
  - "started eight years ago" 같은 단순 사실 서술
  - 어떤 개념도 지칭하지 않는 일반적 표현

## 5. 밑줄 길이의 다양화
- 밑줄을 단어 하나(대명사)에만 긋지 마세요.
- **반드시 3단어 이상의 긴 명사구, 동명사구, 혹은 절(clause)을 포함**하세요.
- 예시: 
  - 짧음: <u>it</u>, <u>he</u>
  - 긺: <u>the strict regulations prompting innovation</u>, <u>giving up on the investment</u>

## 5. 문제 구성
- 지문 내 흐름에 따라 순서대로 ①~⑤ 번호를 매기세요.
- 정답(반대 개념)은 반드시 ${selectedAnswer}번에 배치하세요.
- 문제 발문: "다음 밑줄 친 부분 중 의미하는 대상이 다른 하나는?"

# 출력 형식
1. **문제 발문**: 다음 밑줄 친 부분 중 의미하는 대상이 다른 하나는?
2. **지문**: 밑줄과 번호(① <u>...</u>)가 적용된 영어 지문.
3. **정답 및 해설**: 
   - [정답] ${selectedAnswer}
   - [해설] 4:1 구도를 명확히 설명 (예: "①, ②, ③, ④는 모두 'X'를 의미하고, ⑤만 'Y'를 의미합니다.")

---

# 잘못된 예시 (3:2 구도 - ❌ 이렇게 하면 안 됨)
① hating the thing - 부정적
② Doing it from place of hatred - 부정적  
③ your situation is a gift from life - 긍정적
④ a lesson in acceptance - 긍정적
⑤ resisting what must be done - 부정적

→ 이것은 부정적 3개 vs 긍정적 2개로 **3:2 구도**이므로 **불가!**

# 올바른 예시 (4:1 구도 - ✅ 이렇게 해야 함)
① hating the thing - 부정적
② Doing it from place of hatred - 부정적
③ resisting what must be done - 부정적
④ a lesson in acceptance - 긍정적 (정답!)
⑤ creating more suffering through resistance - 부정적

→ 이것은 부정적 4개 vs 긍정적 1개로 **명확한 4:1 구도!**

---

**🔴 최종 확인: 이번 문제의 정답은 반드시 ${selectedAnswer}번이며, 반드시 4:1 대립 구조여야 합니다.**

# [영어 지문]
${text}`;
};
