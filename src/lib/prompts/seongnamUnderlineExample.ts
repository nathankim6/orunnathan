export const getSeongnamUnderlineExamplePrompt = (text: string) => {
  // 정답 번호를 랜덤하게 선택 (1-5)
  const randomAnswerNumber = Math.floor(Math.random() * 5) + 1;
  const answerSymbols = ['①', '②', '③', '④', '⑤'];
  const selectedAnswer = answerSymbols[randomAnswerNumber - 1];

  return `당신은 고등학교 수준의 영어 독해 문제를 출제하는 전문가입니다.
제공된 영어 지문을 사용하여 아래 형식의 문제를 만들어주세요.

## 🔴 정답 번호 지정 (필수)
**이번 문제의 정답은 반드시 ${selectedAnswer}번이어야 합니다.**
- 정답에 해당하는 "밑줄 친 부분에 해당하지 않는 예시"를 ${selectedAnswer}번에 배치하세요.
- 나머지 번호에는 밑줄 친 부분에 해당하는 올바른 예시를 배치하세요.

## 문제 생성 규칙:

1. **지문 분석 및 밑줄 표시**
   - 지문에서 핵심 개념이나 심리적 메커니즘을 설명하는 1-3개 문장을 선택하여 밑줄 표시
   - 밑줄 친 부분은 반드시 <u>태그</u>로 감싸서 밑줄 표시 (예: <u>밑줄 칠 문장</u>). **볼드체** 사용 금지
   - 밑줄 친 부분은 구체적 예시로 설명할 수 있는 추상적 개념이나 일반적 원리여야 함

2. **선택지 작성 (영어)**
   - 총 5개의 구체적 상황 예시를 영어로 작성
   - 오답 4개: 밑줄 친 부분의 내용을 잘 보여주는 실제적 예시
   - 정답 1개 (${selectedAnswer}번): 밑줄 친 부분과 일치하지 않는 예시 (반대 상황이거나 핵심 요소가 빠진 경우)
   - 각 선택지는 구체적 인물, 상황, 행동, 결과를 포함
   - 선택지 길이는 1-2문장으로 비슷하게 유지
   - 모든 선택지는 영어로 작성할 것

3. **해설 작성**
   - [정답] ${selectedAnswer}
   - [해설]에서 정답이 왜 밑줄 친 부분에 해당하지 않는지 명확히 설명:
     * 상황 요약
     * 원인/과정 분석
     * 반응/결과 설명
     * 문제점: 지문 내용과 어떻게 불일치하는지 설명

---

## 예시 문제:

다음 글의 밑줄 친 부분에 해당하는 예시가 아닌 것은?

When we get an unfavorable outcome, in some ways the last thing we want to hear is that the process was fair. <u>As outrageous as the combination of an unfavorable outcome and an unfair process is, this combination also brings with it a consolation prize: the possibility of attributing the bad outcome to something other than ourselves.</u> We may reassure ourselves by believing that our bad outcome had little to do with us and everything to do with the unfair process. If the process is fair, however, we cannot nearly as easily externalize the outcome; we got what we got "fair and square." When the process is fair we believe that our outcome is deserved, which is another way of saying that there must have been something about ourselves (what we did or who we are) that caused the outcome.

① When our class lost the basketball game, the referee's missing the other team's foul was, in a way, a consolation for me.
② I attribute my unsuccessful job interview to the interviewer, as the final candidate selected turned out to be his cousin.
③ The reason I lost to my friend in the mobile game was that he had better characters than I did.
④ Our class was disappointed to lose at the final soccer game because of the referee's questionable calls, but we decided to admit our weak strategy for the lost game.
⑤ Because the crowd was unusually noisy during our team's golf shots, we ended up losing the match and blamed the association for inadequate game management.

[정답] ④
[해설] ①, ②, ③, ⑤는 모두 불리한 결과를 외부 요인(심판, 면접관, 게임 캐릭터, 관중)에 귀인하여 자기 위안을 찾는 경우입니다. 반면 ④는 패배 후에도 "우리의 약한 전략을 인정했다"고 하여 결과를 외부가 아닌 자신들에게 귀인하고 있으므로 밑줄 친 부분의 내용과 일치하지 않습니다.

---

**🔴 다시 한번 강조: 이번 문제의 정답은 반드시 ${selectedAnswer}번입니다.**

이제 제공된 지문으로 위와 같은 형식의 문제를 생성해주세요.

영어 지문: ${text}`;
};
