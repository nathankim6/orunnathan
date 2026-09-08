export const getBlankPrompt = (text: string, paraphrase: boolean = true) => {
  // Check if text contains user-specified blanks
  const hasUserBlanks = text.includes('[') && text.includes(']');

  // Capture original bracketed expressions for explanation reference
  const originalExpressions: string[] = [];
  if (hasUserBlanks) {
    const matches = text.match(/\[(.*?)\]/g);
    if (matches) {
      matches.forEach(m => originalExpressions.push(m.slice(1, -1)));
    }
  }

  const promptText = hasUserBlanks
    ? text.replace(/\[(.*?)\]/g, '____________')
    : text;

  const answerRule = paraphrase
    ? `   - **CRITICAL - 정답 패러프레이즈 필수 (변형 모드):**
     * 정답은 ${hasUserBlanks ? '대괄호 안에 있던 단어' : '원문에서 제거한 단어'}와 **절대 동일한 표현을 사용하지 마세요**
     * 정답은 원문과 **같은 의미의 완전히 다른 영어 단어**로 패러프레이즈하여 제시하세요
     * 예: 원문이 "inevitable"이라면 → "unavoidable" 또는 "certain" 등으로 바꿔서 제시
     * 원문의 단어를 그대로 사용하지 말고, 완전히 다른 동의어로 제시하세요`
    : `   - **CRITICAL - 정답 원문 그대로 (원본 모드):**
     * 정답은 ${hasUserBlanks ? '대괄호 안에 있던 단어' : '원문에서 제거한 단어'}를 **있는 그대로** 정답 선택지로 사용하세요
     * 패러프레이즈하거나 다른 동의어로 바꾸지 마세요
     * 원문의 표현을 그대로 정답으로 제시해야 합니다`;

  const explanationRule = paraphrase
    ? `   - **변형(패러프레이즈) 모드입니다.** 해설에 다음을 반드시 포함하세요:
     * 원문의 빈칸 표현: "${hasUserBlanks ? originalExpressions.join(', ') : '(원문 단어)'}"
     * 정답 선택지가 원문 표현을 어떻게 패러프레이즈했는지 명시 (예: "원문의 'inevitable'을 같은 의미의 'unavoidable'로 패러프레이즈했습니다.")`
    : `   - **원본 모드입니다.** 해설에 원문의 빈칸 표현이 정답에 그대로 사용되었음을 명시하세요: "${hasUserBlanks ? originalExpressions.join(', ') : '(원문 단어)'}"`;

  return `당신은 영어 지문을 입력받아 빈칸 채우기 문제를 만드는 수능 영어 전문가입니다. 다음 규칙에 따라 문제를 만들어주세요:

주어진 영어 지문을 읽고 다음 단계에 따라 빈칸 채우기 문제를 만드세요:
${hasUserBlanks
  ? '1. 대괄호로 표시된 부분을 빈칸으로 만듭니다. 빈칸 답은 반드시 단어 한 개로 구성되어야 합니다.'
  : '1. 지문의 핵심 주제나 요지를 가장 잘 반영하는 단어 하나를 선택하여 빈칸으로 만듭니다. 빈칸에 들어갈 답은 반드시 단어 한 개로 구성되어야 합니다.'}
2. [OUTPUT] 섹션에 다음과 같은 순서로 작성합니다:
   - "다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오."
   - 한 줄 띄우기
   - 빈칸이 포함된 전체 지문 (빈칸은 반드시 "____________" 형태로 표시)
3. 5개의 선택지를 반드시 영어로만 만듭니다:
${answerRule}
   - **CRITICAL - 오답 선택지 규칙:**
     * 나머지 4개의 오답은 정답과 **확실히 구별되는 의미**를 가진 단어여야 합니다
     * 오답은 정답의 유의어나 비슷한 의미를 가진 단어를 사용하지 마세요
     * 오답은 다음 중 하나여야 합니다:
       - 문맥상 전혀 무관한 단어 (주제와 관련 없는 단어)
       - 정답과 반대되거나 대조되는 의미의 단어
       - 문맥상 명백히 틀린 의미의 단어
     * 정답과 의미가 겹치거나 유사한 단어는 절대 오답으로 사용하지 마세요
   - 모든 선택지는 반드시 단어 한 개로만 구성된 영어 단어여야 합니다.
   - 선택지들은 로마 숫자와 함께 나열합니다 (①, ②, ③, ④, ⑤).
   - **중요**: 정답은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요.
4. [정답] 섹션에 정답 번호를 적습니다.
5. [해설] 섹션에는 다음 내용을 간단명료하게 작성합니다:
   - **중요**: 해설 첫 문장에 "정답은 [번호]번입니다." 형식으로 정답 번호를 명시
   - 지문의 핵심 주제와 논리적 흐름
   - [번호]번 선택지가 가장 적절한 이유
${explanationRule}
   - 각 오답이 적절하지 않은 이유

모든 섹션을 연속해서 작성하고, 각 섹션 사이에 빈 줄을 넣지 않습니다.

위의 규칙에 따라 다음 지문에 대한 빈칸 문제를 생성해주세요:

${promptText}`;
};
