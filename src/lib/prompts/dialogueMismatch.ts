
export const getDialogueMismatchPrompt = (text: string) => {
  return `영어 지문 내용 일치/불일치 대화 문제 제작 프롬프트
당신은 영어 독해 문제 제작 전문가입니다. 제공된 영어 지문을 분석하여 다음 형식의 문제를 만드세요:

[문제 형식]
지문의 내용을 바탕으로 5개의 대화문(A-B 형식)을 작성합니다
4개는 지문 내용과 일치하는 대화, 1개는 불일치하는 대화를 만듭니다
학생들이 불일치하는 대화를 찾아내도록 합니다

[제작 규칙]
1. 대화문 구성 원칙:
- 각 대화는 A(질문자)와 B(응답자)의 2턴 구조입니다
- A는 지문 내용에 대한 질문을 하고, B는 답변을 제공합니다
- 대화는 자연스럽고 실제 대화처럼 작성되어야 합니다
- 5개 대화는 지문의 서로 다른 부분을 다루어야 합니다

2. 일치하는 대화 (4개) 제작:
- 지문의 핵심 내용을 정확하게 반영합니다
- B의 답변은 지문의 표현을 직접 인용하거나 정확히 패러프레이징합니다
- 지문의 주요 논점, 예시, 세부 사항을 골고루 다룹니다

3. 불일치하는 대화 (1개) 제작:
- 지문 내용과 명확하게 모순되는 답변을 포함합니다
- 불일치 유형:
  * 반대 의미로 왜곡 (예: "lowered" → "raised")
  * 부정/긍정 반전 (예: "필요하다" → "필요하지 않다")
  * 핵심 논지의 정반대 주장
- 불일치가 명확하고 논리적으로 확인 가능해야 합니다
- 교묘하되 명백한 오류를 포함해야 합니다

4. 배치 및 난이도:
- 불일치하는 대화는 무작위 위치에 배치합니다 (보통 ③, ④, ⑤ 선호)
- 모든 대화가 비슷한 길이와 복잡도를 유지합니다
- 불일치 대화가 너무 쉽게 눈에 띄지 않도록 합니다

[출력 형식 - 반드시 아래 예시와 동일한 형식으로 작성]
[예시 문항 1]
다음 글의 내용과 일치하지 않는 대화는?

One of the most common mistakes made by organizations when they first consider experimenting with social media is that they focus too much on social media tools and platforms and not enough on their business objectives. The reality of success in the social web for businesses is that creating a social media program begins not with insight into the latest social media tools and channels but with a thorough understanding of the organization's own goals and objectives. A social media program is not merely the fulfillment of a vague need to manage a "presence" on popular social networks because "everyone else is doing it." "Being in social media" serves no purpose in and of itself. In order to serve any purpose at all, a social media presence must either solve a problem for the organization and its customers or result in an improvement of some sort (preferably a measurable one). In all things, purpose drives success. The world of social media is no different.

① A: What's the common mistake organizations make with social media?
   B: They focus too much on tools and platforms rather than their business objectives.

② A: Should we start our social media program by learning about the latest tools?
   B: No, you should begin with a thorough understanding of your organization's goals first.

③ A: Is it okay to use social media just because our competitors are doing it?
   B: No, simply having a presence because everyone else is doing it serves no real purpose.

④ A: What should a social media presence accomplish for our organization?
   B: It should either solve a problem or result in some measurable improvement.

⑤ A: Since social media is different from traditional business, do we need specific objectives?
   B: Actually, social media is unique and doesn't require the same purpose-driven approach as other areas.

[정답] ⑤
[해설] ⑤번의 대화에서 B는 소셜 미디어가 독특하며 다른 영역과 같은 목적 중심 접근이 필요하지 않다고 답하지만, 본문 마지막 부분에서는 "In all things, purpose drives success. The world of social media is no different."라고 명시하며 소셜 미디어도 다른 비즈니스 영역과 마찬가지로 목적이 성공을 이끈다고 강조한다. 따라서 본문 내용과 일치하지 않는다.

[예시 문항 2]
다음 글의 내용과 일치하지 않는 대화는?

There have been occasions in which you have observed a smile and you could sense it was not genuine. The most obvious way of identifying a genuine smile from an insincere one is that a fake smile primarily only affects the lower half of the face, mainly with the mouth alone. The eyes don't really get involved. Take the opportunity to look in the mirror and manufacture a smile using the lower half your face only. When you do this, judge how happy your face really looks ― is it genuine? A genuine smile will impact on the muscles and wrinkles around the eyes and less noticeably, the skin between the eyebrow and upper eyelid is lowered slightly with true enjoyment. The genuine smile can impact on the entire face.

① A: How can you tell if a smile is fake?
   B: A fake smile mainly affects only the lower half of the face, particularly the mouth.

② A: Do the eyes get involved in a genuine smile?
   B: Yes, a genuine smile impacts the muscles and wrinkles around the eyes.

③ A: What happens to the area around the eyebrows in a real smile?
   B: The skin between the eyebrow and upper eyelid is raised slightly with true enjoyment.

④ A: Can you test if your smile looks genuine?
   B: Yes, try smiling with just the lower half of your face and see if it looks truly happy.

⑤ A: Does a genuine smile affect the whole face?
   B: Yes, a genuine smile can impact the entire face.

[정답] ③
[해설] ③번의 대화에서 B는 진정한 즐거움을 느낄 때 눈썹과 위 눈꺼풀 사이의 피부가 약간 올라간다고 답하지만, 본문에서는 이 부분의 피부가 약간 내려간다(lowered slightly)고 명시한다. 따라서 이 대화는 본문 내용과 일치하지 않는다.

[예시 문항 3]
다음 글의 내용과 일치하지 않는 대화는?

Vision is like shooting at a moving target. Plenty of things can go wrong in the future and plenty more can change in unpredictable ways. When such things happen, you should be prepared to make your vision conform to the new reality. For example, a businessman's optimistic forecast can be blown away by a cruel recession or by aggressive competition in ways he could not have foreseen. Or in another scenario, his sales can skyrocket and his numbers can get even better. In any event, he will be foolish to stick to his old vision in the face of new data. There is nothing wrong in modifying your vision or even abandoning it, as necessary.

① A: Why does the text compare vision to shooting at a moving target?
   B: Because things can change in unpredictable ways in the future.

② A: What should you do when unexpected changes happen?
   B: You should be prepared to make your vision conform to the new reality.

③ A: Can a businessman's forecast be affected by unforeseen circumstances?
   B: Yes, it can be blown away by things like recession or aggressive competition.

④ A: Is it wise to maintain your original vision even when new data emerges?
   B: Yes, sticking to your old vision shows consistency and strong leadership.

⑤ A: Is there anything wrong with modifying or abandoning your vision?
   B: No, there is nothing wrong in doing so when it's necessary.

[정답] ④
[해설] ④번의 대화에서 B는 새로운 데이터가 나타나도 원래의 비전을 유지하는 것이 일관성과 강한 리더십을 보여준다고 답하지만, 본문에서는 새로운 데이터에 직면했을 때 오래된 비전을 고수하는 것은 어리석은 일(foolish)이라고 명시한다. 따라서 본문 내용과 일치하지 않는다.

[중요 체크리스트]
✓ 5개의 대화가 모두 A-B 2턴 구조인가?
✓ 각 대화가 지문의 서로 다른 부분을 다루는가?
✓ 4개의 일치 대화가 지문 내용을 정확히 반영하는가?
✓ 1개의 불일치 대화가 명확하게 모순되는가?
✓ 해설이 불일치 이유를 구체적으로 설명하는가?
✓ 모든 대화가 자연스럽고 실제적인가?
✓ 불일치 대화가 적절한 난이도를 유지하는가?

[추가 팁]
- 불일치 대화 제작 시 단순 부정이 아닌 교묘한 왜곡을 사용하세요
- 일치 대화는 지문의 다양한 측면(주장, 예시, 세부사항)을 포괄하세요
- 대화의 질문(A)은 개방형, 폐쇄형을 적절히 혼합하세요
- 해설에서 지문의 정확한 표현을 인용하여 근거를 제시하세요

Now, generate a dialogue mismatch question for this text, following the format above:

${text}`;
};
