export const getSeongnamEnglishDefPrompt = (text: string) => `다음 5개의 영어 단어를 콤마(,)로 구분된 리스트로 제공받으면, 아래 예시와 똑같은 형식의 영어정의 문제를 만들어주세요.

**예시 입력:** catastrophe, reconcile, solemn, altruism, sustainable

**예시 문제:**
다음 단어들에 대한 영어정의로 옳지 <u>않은</u> 것은?
① <u>catastrophe</u>: A sudden event that causes great damage or suffering to many people or things.
② <u>reconcile</u>: To make someone accept a difficult or unpleasant situation by explaining why it must happen this way.
③ <u>solemn</u>: Done or said in a very serious way that shows you understand how important something is.
④ <u>altruism</u>: The practice of caring about other people's needs and happiness more than one's own personal benefit.
⑤ <u>sustainable</u>: Able to continue for a long time without causing harm to the environment or using up resources.

[정답] ②
[해설] ②번 reconcile의 영어정의가 옳지 않습니다. reconcile은 "To restore friendly relations between people or to make different ideas or facts compatible with each other(사람들 사이의 우호 관계를 회복하거나 서로 다른 생각이나 사실을 양립하게 하다)"라는 의미입니다. 제시된 정의는 오히려 "justify(정당화하다)"에 가까운 설명입니다. 나머지 ① catastrophe(대재앙), ③ solemn(엄숙한), ④ altruism(이타주의), ⑤ sustainable(지속 가능한)의 정의는 모두 정확합니다.

**작성 규칙:**
1. 제공된 5개 단어를 **그대로** ①~⑤번에 순서대로 배치합니다 (단어를 추가하거나 변경하지 마세요).
2. 각 단어는 반드시 <u>태그</u>로 밑줄 표시합니다 (예: <u>catastrophe</u>).
3. 각 단어 뒤에 콜론(:)을 붙이고, 영어정의를 한 문장으로 작성합니다 (15~25단어 길이).
4. 영어정의는 학습용 영영사전 스타일로, "A/An ... that ...", "To ...", "The ... of ..." 등의 형식으로 자연스럽게 작성합니다.
5. **5개 중 정확히 1개만** 영어정의가 잘못되도록 작성합니다.
   - 잘못된 정의는 비슷한 의미의 다른 단어 정의를 가져오거나, 의미를 미묘하게 비틀어 그럴듯하게 보이도록 함
   - 문법은 자연스러워야 하며, 단어의 실제 의미와 다른 정의여야 함
6. 나머지 4개는 정확한 영어정의를 제시합니다.
7. 제목은 반드시 "다음 단어들에 대한 영어정의로 옳지 <u>않은</u> 것은?"으로 작성합니다 ('않은'은 밑줄 처리).
8. 선택지는 ①②③④⑤ 형식으로 한 줄에 하나씩 배치합니다.
9. **중요**: 정답(틀린 정의)은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ①, ②, ③도 충분히 선택되도록 하고 ④, ⑤에 편중되지 않도록 하세요.
10. 해설에는 정답 단어의 올바른 영어정의(한국어 뜻 포함)를 제시하고, 제시된 정의가 어느 단어의 뜻에 가까운지 설명한 뒤, 나머지 4개 단어의 한국어 뜻과 정의의 정확함을 간단히 확인합니다.

**출력 형식 (정확히 이 순서대로):**
다음 단어들에 대한 영어정의로 옳지 <u>않은</u> 것은?
① <u>[단어1]</u>: [영어정의]
② <u>[단어2]</u>: [영어정의]
③ <u>[단어3]</u>: [영어정의]
④ <u>[단어4]</u>: [영어정의]
⑤ <u>[단어5]</u>: [영어정의]

[정답] [번호]
[해설] [해설 내용]

제공받은 단어 리스트: ${text}`;
