export const getImplicationPrompt = (text: string) => {
  // Check for user-selected text (marked with square brackets)
  const selectedText: string[] = [];
  let processedText = text;
  
  // Extract text marked with square brackets
  const regex = /\[(.*?)\]/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      selectedText.push(match[1].trim());
    }
  }
  
  // Remove the brackets but keep the text, and wrap it with underline tags
  processedText = text.replace(/\[(.*?)\]/g, '<u>$1</u>');

  // Modify the prompt based on whether text was selected
  const selectionInstruction = selectedText.length > 0
    ? `사용자가 선택한 다음 구문을 함축적 의미를 가진 부분으로 사용하세요:\n${selectedText.join('\n')}`
    : '글의 맥락 속에서 함축적 의미를 가진 중요 구문을 찾아 <u> 태그로 표시하세요. **CRITICAL**: 밑줄 선정 기준 - 지문의 주제문 또는 요지와 관련되면서도 실제 함축적인 또는 비유적인 의미가 있는 부분을 우선적으로 선정하세요. 필요하다면 긴 문장도 설정 가능합니다';

  // Get the selected phrase for the question title - use actual text or dynamic reference
  const selectedPhrase = selectedText.length > 0 ? selectedText[0] : "[밑줄 친 부분의 실제 텍스트]";

  return `당신은 영어 지문을 입력받아 선다형 문제를 만드는 전문가입니다. 다음 규칙과 예시에 따라 문제를 만들어주세요:

[대괄호 사용법]
함축적 의미를 가진 부분을 선택하려면 해당 부분을 대괄호([])로 감싸주세요.
예시: The boy [smiled at the old photograph], remembering his childhood days.

문제 형식:
**CRITICAL**: 질문 작성 시 밑줄 친 부분을 쌍따옴표로만 감싸세요. 질문 텍스트 안에는 <u> 태그를 사용하지 마세요.
예: 밑줄이 "filtered through tradition"이면 → 밑줄 친 "filtered through tradition"이(가) 다음 글에서 의미하는 바로 가장 적절한 것은?

문제 유형: 밑줄 친 "[실제 밑줄 친 영어 텍스트]"이(가) 다음 글에서 의미하는 바로 가장 적절한 것은?
제시문: 원문 영어 지문을 그대로 사용하되 ${selectionInstruction}

선택지 작성 규칙:
- 모든 선택지는 반드시 영어로 작성되어야 합니다
- 정답은 글의 맥락 속에서 해당 구문의 의미를 정확하게 설명
- 오답은 글의 내용과 관련되지만 구문의 실제 의미와는 다른 내용
- 모든 선택지는 완전한 영어 구문으로 작성
- 선택지는 문법적으로 올바르고 자연스러운 표현 사용
- 선택지 길이는 비슷하게 유지
- 각 선택지는 해석 가능하고 명확한 의미여야 함
- 정답은 지문의 문맥을 통해 명확히 도출될 수 있어야 함
- **중요**: 정답은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ④, ⑤에 편중되지 않도록 하고 ①, ②, ③도 충분히 선택되도록 하세요. 정답에 해당하는 올바른 선택지를 해당 번호에 배치하세요

해설 작성 규칙:
글의 맥락 속에서 해당 구문이 사용된 배경 설명
구문의 의미를 명확하게 설명
정답 선택지가 정답인 이유를 논리적으로 제시
한 문단으로 간단명료하게 작성

다음과 같은 형식으로만 답변해주세요:

밑줄 친 "[실제 밑줄 친 영어 텍스트]"이(가) 다음 글에서 의미하는 바로 가장 적절한 것은?

${processedText}

① [영어 선택지1]
② [영어 선택지2]  
③ [영어 선택지3]
④ [영어 선택지4]
⑤ [영어 선택지5]
[정답] [번호]
[해설] 정답은 [번호]번입니다. [번호]번 선택지는 [설명]`;
};
