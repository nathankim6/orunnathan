export const getSeongnamWordExplanationPrompt = (text: string) => `다음 5개의 영어 단어를 콤마(,)로 구분된 리스트로 제공받으면, 아래 예시와 똑같은 형식의 단어설명 문제를 만들어주세요.

**예시 입력:** unprecedented, conceive, speculation, intermittent, disposal

**예시 문제:**
다음 단어의 설명이 옳지 <u>않은</u> 것은?
① unprecedented: If something is <u>unprecedented</u>, it is so unusual that nothing similar has happened or existed before. It describes an event, situation, or action that is completely new in kind or scale and has no earlier example to compare it with.
② conceive: If you <u>conceive</u> an idea, plan, or feeling, you start to think about it seriously in your mind. It means you imagine something, often for the first time, and begin to form it clearly in your thoughts.
③ speculation: <u>Speculation</u> is the act of buying and selling things like land, or houses in the hope of making a quick profit. It often involves taking risks, because there is no guarantee of the success.
④ intermittent: If something is <u>intermittent</u>, it happens all the time or stays the same over a period of time without changing. It means an unchanging presence, condition, or state.
⑤ disposal: <u>Disposal</u> is the act or process of getting rid of something that is no longer wanted or needed, especially waste or garbage in a safe and proper way.

[정답] ④
[해설] ④번 intermittent의 설명이 옳지 않습니다. intermittent는 "happening at irregular intervals; not continuous or steady (불규칙한 간격으로 발생하는; 간헐적인)"의 의미로, 제시된 설명("happens all the time or stays the same without changing")은 오히려 constant나 continuous에 가까운 정의입니다. 나머지 ① unprecedented(전례 없는), ② conceive(생각해내다), ③ speculation(투기), ⑤ disposal(처분, 폐기)의 설명은 모두 정확합니다.

**작성 규칙:**
1. 제공된 5개 단어를 **그대로** ①~⑤번에 순서대로 배치합니다 (단어를 추가하거나 변경하지 마세요).
2. 각 항목 형식: \`① [단어]: [영어 설명문]\`
   - 단어 앞에 콜론(:)이 오며, 그 뒤에 영어 설명을 작성합니다.
3. 설명문 첫 부분에 단어가 다시 등장하며, 이때는 반드시 <u>태그</u>로 밑줄 표시합니다.
   - 예: "If something is <u>unprecedented</u>, ..." / "<u>Speculation</u> is the act of ..."
   - 명사는 첫 글자 대문자로 밑줄 처리, 동사/형용사는 소문자로 처리합니다.
4. 각 영어 설명은 학습용 영영사전 스타일(Collins/Longman 풍)로 2~3문장, 35~55단어 길이로 작성합니다.
   - 자연스러운 패턴 사용: "If something is X, ...", "If you X ..., ...", "X is the act/process/state of ...", "X is a ... that ..."
   - 첫 문장에서 핵심 의미를 정의하고, 두 번째 문장에서 부연 설명을 추가합니다.
5. **5개 중 정확히 1개만** 단어 설명이 옳지 않도록 작성합니다.
   - 잘못된 설명은 단어의 실제 의미와 정반대(예: intermittent를 "항상 일어나는"으로 설명)이거나, 다른 단어의 정의를 가져와 그럴듯하게 보이도록 합니다.
   - 문법은 자연스러워야 하며 영영사전 스타일은 유지합니다.
6. 나머지 4개는 단어의 정확한 의미를 영어로 설명합니다.
7. 제목은 반드시 "다음 단어의 설명이 옳지 <u>않은</u> 것은?"으로 작성합니다 ('않은'은 밑줄 처리).
8. 선택지는 ①②③④⑤ 형식으로 한 줄(또는 단락)에 하나씩 배치합니다.
9. **중요**: 정답(틀린 설명)은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ①, ②, ③도 충분히 선택되도록 하고 ④, ⑤에 편중되지 않도록 하세요.
10. 해설에는 정답 단어의 올바른 영어 의미와 한국어 뜻을 제시하고, 제시된 설명이 어느 단어/개념에 가까운지 설명한 뒤, 나머지 4개 단어의 한국어 뜻과 설명의 정확함을 간단히 확인합니다.

**출력 형식 (정확히 이 순서대로):**
다음 단어의 설명이 옳지 <u>않은</u> 것은?
① [단어1]: [영어 설명 - 단어 첫 등장 시 <u>태그</u>로 밑줄]
② [단어2]: [영어 설명 - 단어 첫 등장 시 <u>태그</u>로 밑줄]
③ [단어3]: [영어 설명 - 단어 첫 등장 시 <u>태그</u>로 밑줄]
④ [단어4]: [영어 설명 - 단어 첫 등장 시 <u>태그</u>로 밑줄]
⑤ [단어5]: [영어 설명 - 단어 첫 등장 시 <u>태그</u>로 밑줄]

[정답] [번호]
[해설] [해설 내용]

제공받은 단어 리스트: ${text}`;
