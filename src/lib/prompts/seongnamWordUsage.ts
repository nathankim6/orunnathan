export const getSeongnamWordUsagePrompt = (text: string) => `다음 5개의 영어 단어를 콤마(,)로 구분된 리스트로 제공받으면, 아래 예시와 똑같은 형식의 단어 쓰임 문제를 만들어주세요.

**예시 입력:** erode, dormant, burrow, trunk, nocturnal

**예시 문제:**
다음 중 밑줄 친 단어의 쓰임이 바르지 <u>않은</u> 것은?
① The cliff has been <u>erode</u>d by the waves of the sea.
② Fruit juices <u>dormant</u> unless they are kept refrigerated.
③ Some lizards can quickly <u>burrow</u> into loose soil to hide.
④ A banana tree's <u>trunk</u> contains a large amount of water.
⑤ Many desert animals are <u>nocturnal</u> because it helps to avoid the heat.

[정답] ②
[해설] ②번 문장에서 dormant(휴면 중인, 활동을 중단한)는 문맥상 어색합니다. 과일 주스가 냉장 보관되지 않으면 "상한다(spoil/ferment)"는 의미가 와야 자연스럽기 때문에 dormant의 쓰임이 바르지 않습니다. 나머지 ① erode(침식하다), ③ burrow(굴을 파다), ④ trunk(줄기/몸통), ⑤ nocturnal(야행성의)은 모두 문맥상 올바르게 쓰였습니다.

**작성 규칙:**
1. 제공된 5개 단어를 **그대로** ①~⑤번에 순서대로 배치합니다 (단어를 추가하거나 변경하지 마세요).
2. 각 단어가 들어간 영어 문장 1개씩, 총 5개의 문장을 작성합니다 (각 문장은 10~20단어 길이).
3. 문장 내 해당 단어는 반드시 <u>태그</u>로 밑줄 표시합니다 (예: <u>erode</u>).
   - 단어 형태가 변형되는 경우 어근만 밑줄 처리: 예 <u>erode</u>d, <u>burrow</u>ing
4. **5개 중 정확히 1개만** 단어의 쓰임이 문맥상 바르지 않도록 작성합니다.
   - 잘못된 문장은 문법은 맞지만 해당 단어가 의미상 부적절하여, 다른 단어로 바꿔야 자연스러워야 합니다.
   - 예: dormant(휴면 중인)을 "과일 주스가 냉장 보관되지 않으면 dormant한다"처럼 문맥상 어색하게 사용
5. 나머지 4개 문장은 해당 단어가 의미상 자연스럽게 쓰이도록 작성합니다.
6. 제목은 반드시 "다음 중 밑줄 친 단어의 쓰임이 바르지 <u>않은</u> 것은?"으로 작성합니다 ('않은'은 밑줄 처리).
7. 선택지는 ①②③④⑤ 형식으로 한 줄에 하나씩 배치합니다.
8. **중요**: 정답(틀린 쓰임)은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ①, ②, ③도 충분히 선택되도록 하고 ④, ⑤에 편중되지 않도록 하세요.
9. 해설에는 정답 문장에서 해당 단어가 왜 어색한지, 어떤 의미가 와야 자연스러운지 설명하고, 나머지 4개 단어의 한국어 뜻과 문맥상 적절함을 간단히 확인합니다.

**출력 형식 (정확히 이 순서대로):**
다음 중 밑줄 친 단어의 쓰임이 바르지 <u>않은</u> 것은?
① [단어1을 포함한 영어 문장]
② [단어2를 포함한 영어 문장]
③ [단어3을 포함한 영어 문장]
④ [단어4를 포함한 영어 문장]
⑤ [단어5를 포함한 영어 문장]

[정답] [번호]
[해설] [해설 내용]

제공받은 단어 리스트: ${text}`;
