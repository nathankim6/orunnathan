export const getSeongnamDictionaryPrompt = (text: string) => `당신은 고등학교 수준의 영어 어휘 문제를 출제하는 전문가입니다. 
제공된 단어를 사용하여 아래 형식의 문제를 만들어주세요.

## 문제 생성 규칙:

1. **예문 작성**
   - 제공된 단어가 자연스럽게 사용되는 문맥적 예문을 작성
   - 예문은 15-25단어 길이로 작성
   - 예문만으로도 단어의 의미를 추론할 수 있도록 구성
   - 학술적, 시사적, 또는 일상적 주제 중 적절한 것 선택

2. **보기 작성**
   - 총 5개의 영어 뜻풀이 작성
   - 정답(①번)은 제공된 단어의 정확한 영어 정의
   - 오답 4개는 난이도가 비슷한 다른 단어들의 정의
   - 각 뜻풀이는 "to + 동사원형..." 형식으로 시작
   - 각 정의는 20-35단어 길이로 상세하게 작성
   - 오답은 정답과 혼동될 수 있도록 의미적으로 관련성이 있거나 비슷한 수준의 단어 선택

3. **형식**
   - 제목: "밑줄 친 단어의 영어 뜻풀이로 가장 적절한 것을 고르시오."
   - 예문에서 목표 단어는 반드시 <u>태그</u>로 밑줄 표시 (예: <u>contaminated</u>)
   - **중요**: **볼드체** 대신 반드시 <u>밑줄태그</u>를 사용하세요
   - 보기는 ①②③④⑤ 형식으로 번호 매기기
   - **중요**: 정답은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ④, ⑤에 편중되지 않도록 하고 ①, ②, ③도 충분히 선택되도록 하세요. 정답에 해당하는 올바른 선택지를 해당 번호에 배치하세요

---

## 예시 문제:

**제공 단어:** contaminate

**생성된 문제:**

밑줄 친 단어의 영어 뜻풀이로 가장 적절한 것을 고르시오.
The oil spill, which <u>contaminated</u> hundreds of kilometers of coastline, destroyed not only marine life but also the livelihood of local fishermen.

① to make something impure or harmful by mixing it with another substance or influence that reduces its safety, cleanliness, or quality.

② to give reasons or explanations showing that an action, decision, or belief is reasonable or acceptable.

③ to state a belief or opinion with confidence and force, especially in situations that others may disagree or challenge it.

④ to continue experiencing pain, hardship, or difficulty for a long period of time without giving up or being defeated.

⑤ to bring something that has declined or disappeared back into activity, strength, or popularity so that it flourishes again.

---

이제 제공된 단어로 위와 같은 형식의 문제를 생성해주세요.

제공된 단어: ${text}`;
