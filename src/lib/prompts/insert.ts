
export const getInsertPrompt = (text: string) => {
  // Check if text contains user-specified sentence to insert
  const hasUserSentence = text.includes('<') && text.includes('>');
  
  let sentenceToInsert = "";
  let processedText = text;
  
  if (hasUserSentence) {
    const match = text.match(/<(.*?)>/);
    if (match) {
      sentenceToInsert = match[1];
      processedText = text.replace(/<.*?>/, ''); // Remove the angled brackets text
    }
  }

  return `다음 지문을 분석하여 문장 삽입 문제를 생성합니다:

${hasUserSentence ? '지정된 문장을 사용' : '중요: 반드시 원래 지문에서 한 문장을 그대로 선택하여 "주어진 문장"으로 설정하세요. 새로운 문장을 만들거나 기존 문장을 수정하면 안 됩니다. 문장 선정 기준: 지시대명사(this, that, these, those), 지시형용사(such, another), 접속사(however, therefore, moreover, furthermore), 접속부사 등이 포함되어 문장의 흐름상 변화가 있거나 글의 흐름에서 중요한 의미를 갖는 문장을 우선 선택'}하여 삽입 문제를 만들어주세요.

전체 문장 수가 6개 이하인 경우: "문제 생성 불가: 문장 수 부족" 출력
7개 이상인 경우: 아래 형식으로 문제 생성

글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳을 고르시오.

<선택된 문장>

[선택된 문장이 제거된 원문에 ( ① ), ( ② ), ( ③ ), ( ④ ), ( ⑤ ) 삽입 지점 표시]

중요: 
- 선택된 문장이 원래 위치했던 곳이 정답이 되어야 함 (정답 적용 시 원래 지문과 100% 동일해야 함)
- 삽입 지점은 텍스트 전체에 고르게 분포시켜야 함 (연속된 2개 이상의 보기가 붙어있지 않도록)  
- 각 문장 사이사이에 균등하게 배치하되, 정답 위치는 반드시 선택된 문장의 원래 위치
- 검증: 정답 번호에 선택된 문장을 삽입했을 때 원래 제공된 지문과 완전히 일치하는지 확인

[정답] [정답 번호]
[해설] [선택된 문장이 해당 위치에 들어가야 하는 이유를 한글로 설명]

중요 지침:
- 밑줄을 사용하지 마세요
- 해설은 반드시 "[해설]" 형식으로 작성하세요
- 정답과 해설 사이에 빈 줄을 넣지 마세요
- ** 기호를 사용하지 마세요 (본문, 정답, 해설 어디에도)

${hasUserSentence ? `지정된 삽입 문장: "${sentenceToInsert}"` : ''}

분석할 원문:
${processedText}`;
};
