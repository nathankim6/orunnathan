export const getMainPointPrompt = (text: string, choiceLanguage: 'english' | 'korean' = 'korean') => {
  const isEnglish = choiceLanguage === 'english';
  const choiceLang = isEnglish ? 'English' : '한국어';
  const choiceInstruction = isEnglish
    ? `- 모든 선택지는 영어로 작성 (English)
- 각 선택지는 명사구 또는 문장 형태로 작성 (예: "The importance of ~", "~ is essential for ...")
- 선택지는 명확하고 간결하게 작성하며, 글의 핵심 주장을 영어로 표현`
    : `- 모든 선택지는 한국어로 작성
- 각 선택지는 "~이다", "~한다" 등으로 종결
- 선택지는 명확하고 간결하게 작성`;

  const exampleChoices = isEnglish
    ? `① Understanding emotions facilitates smooth communication and cooperation within a group.
② The ability to empathize with others enhances one's own emotional expression.
③ Understanding one's own emotional state is essential for developing social skills.
④ Knowledge of emotion-related vocabulary forms the foundation for empathy development.
⑤ Emotional regulation is important for resolving conflicts among group members.`
    : `① 감정 이해 능력은 집단 내 원활한 소통과 협력을 촉진한다.
② 타인에 대한 공감 능력은 자신의 감정 표현 능력을 향상한다.
③ 자신의 감정 상태에 대한 이해는 사회성 함양에 필수적 요소이다.
④ 감정 관련 어휘에 대한 지식은 공감 능력 발달의 기반이 된다.
⑤ 집단 구성원 간 갈등 해소를 위해 감정 조절이 중요하다.`;

  return `당신은 영어 지문을 입력받아 선다형 문제를 만드는 수능영어 출제자입니다. 다음 규칙과 예시에 따라 문제를 만들어주세요:

문제 형식
- 문제 유형: "다음 글의 요지로 가장 적절한 것은?"
- 지문은 원문 영어 텍스트를 그대로 사용
- 선택지는 5개의 ${choiceLang} 선택지 (①~⑤)

선택지 작성 규칙
${choiceInstruction}
- 정답은 글의 핵심 내용을 정확하게 요약
- 오답은 글의 내용과 관련은 있으나 핵심 요지가 아닌 내용
- 선택지 길이는 비슷하게 유지
- **중요**: 정답은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ④, ⑤에 편중되지 않도록 하고 ①, ②, ③도 충분히 선택되도록 하세요. 정답에 해당하는 올바른 선택지를 해당 번호에 배치하세요
- **해설 작성 시**: "[정답] ③" 형식으로 정답 번호를 먼저 명시한 후, "③번 선택지는..." 또는 "정답인 ③번은..." 형식으로 해당 번호를 해설에서도 명확히 언급하세요

★★ 정답이 "오직 1개"가 되도록 보장하는 핵심 규칙 ★★
1. 정답은 글의 결론/주제 문장(thesis sentence)에 직접 근거해야 하며, 본문에서 근거 문장 1개를 특정할 수 있어야 합니다.
2. 4개의 오답은 다음 유형 중에서만 작성하세요. 정답과 의미가 부분적으로 겹치거나 "또 다른 타당한 요지"가 되어서는 절대 안 됩니다:
   (a) 본문의 소재/키워드는 등장하지만 글이 말하고자 한 바가 아닌 내용
   (b) 본문의 일부 세부 사례를 과잉 일반화한 내용 (전체 요지가 아님)
   (c) 본문 내용과 반대되거나 본문이 반박하는 내용
   (d) 본문 소재와 관련된 일반 상식이지만 본문에서 다루지 않은 내용
3. 두 개 이상의 선택지가 모두 "본문의 요지"로 읽힐 수 있다면 출제 실패입니다. 유사 정답이 발생하면 해당 오답을 (c) 또는 (d) 유형으로 교체하세요.
4. 정답은 본문 전체를 아우르되 너무 추상적이어서는(예: "노력이 중요하다") 안 됩니다.
5. 한국 모의고사 스타일(고1~고3) 어휘와 어투를 사용하세요.

자가검토 체크리스트 (출제 후 반드시 수행):
[ ] 정답의 근거가 되는 본문 문장을 1개 특정할 수 있는가?
[ ] 4개의 오답 각각에 대해 "왜 이것이 요지가 될 수 없는가"를 본문 근거로 한 문장씩 댈 수 있는가?
[ ] 정답과 의미가 겹치는 오답이 없는가?

요지 파악 기준
- 글의 전체 흐름을 고려
- 반복되는 핵심 개념 파악
- 결론 부분에서 제시되는 내용 중시
- 세부 사례나 부가 설명이 아닌 중심 내용 위주로 파악

출제 시 주의사항
- 요지는 글의 전체 내용을 아우르는 핵심 주장이어야 함
- 지나치게 포괄적이거나 협소한 내용 지양
- 원문에 없는 내용의 과도한 확대 해석 금지
- 선택지 간 의미가 명확히 구분되도록 작성
- **해설은 반드시 한국어로 작성** (선택지 언어와 무관)

예시:
The ability to understand emotions — to have a diverse emotion vocabulary and to understand the causes and consequences of emotion — is particularly relevant in group settings. Individuals who are skilled in this domain are able to express emotions, feelings, and moods accurately and thus, may facilitate clear communication between co-workers. Furthermore, they may be more likely to act in ways that accommodate their own needs as well as the needs of others (i.e., cooperate). In a group conflict situation, for example, a member with a strong ability to understand emotion will be able to express how he feels about the problem and why he feels this way. He also should be able to take the perspective of the other group members and understand why they are reacting in a certain manner. Appreciation of differences creates an arena for open communication and promotes constructive conflict resolution and improved group functioning.

다음 글의 요지로 가장 적절한 것은?
The ability to understand emotions — to have a diverse emotion vocabulary and to understand the causes and consequences of emotion — is particularly relevant in group settings. Individuals who are skilled in this domain are able to express emotions, feelings, and moods accurately and thus, may facilitate clear communication between co-workers. Furthermore, they may be more likely to act in ways that accommodate their own needs as well as the needs of others (i.e., cooperate). In a group conflict situation, for example, a member with a strong ability to understand emotion will be able to express how he feels about the problem and why he feels this way. He also should be able to take the perspective of the other group members and understand why they are reacting in a certain manner. Appreciation of differences creates an arena for open communication and promotes constructive conflict resolution and improved group functioning.
${exampleChoices}

**중요**: 정답은 ①~⑤번 중에서 랜덤 선택하세요. 위 예시는 단순 예시이며, 실제 문제 생성 시 정답을 다른 번호로 배치하세요.

**CRITICAL - 정답과 해설 번호 일치**:
- 정답을 ③번으로 선택했다면: [정답] ③ 그리고 [해설] 정답은 ③번입니다...
- [정답]과 [해설]에서 언급하는 번호는 반드시 동일해야 합니다!

[정답] [①~⑤ 중 랜덤 선택한 번호]
[해설] 정답은 [위에서 선택한 동일한 번호]번입니다. 글은 [글의 핵심 내용 요약] [정답이 왜 글의 요지인지 구체적으로 설명] (해설은 한국어로 작성)

위의 예시와 같은 형식으로 다음 지문에 대한 요지 문제를 생성해주세요:

${text}`;
};
