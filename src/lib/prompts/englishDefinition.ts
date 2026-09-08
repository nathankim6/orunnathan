export const getEnglishDefinitionPrompt = (text: string) => `주어진 영어 지문을 바탕으로 밑줄 친 단어의 영영풀이가 알맞지 않은 것을 찾는 객관식 문제를 만들어주세요.

## 문제 형식
- 문제 지시문: "다음 글의 밑줄 친 (a)~(e)의 영영풀이로 알맞지 않은 것은?"
- 원문 지문에서 5개의 핵심 어휘를 선정하여 (a)~(e)로 표시하고 밑줄 처리
- 5개의 선택지(①~⑤)에 각 단어의 영영풀이를 제시
- 그 중 1개만 해당 단어의 영영풀이로 알맞지 않은 것 (오답)

## 단어 선정 규칙
1. 지문에서 문맥상 중요한 역할을 하는 단어 5개를 선정
2. 너무 쉬운 기초 단어(the, is, have 등)는 제외
3. 품사가 다양하게 분포되도록 선정 (동사, 명사, 형용사, 부사 등)
4. 지문 전체에 고르게 분포되도록 배치
5. 선정된 단어는 원형(동사는 원형, 명사는 단수형 등)으로 표기하되, 지문에서는 원래 활용형 그대로 밑줄 표시

## 영영풀이 작성 규칙
1. 정답 선지 4개: 해당 단어의 **지문 속 문맥에 맞는** 정확한 영영사전 스타일 정의를 제공
2. 오답 선지 1개: 해당 단어의 실제 뜻과 다른, 그럴듯하지만 틀린 영영풀이를 제공
   - 완전히 다른 단어의 정의를 사용하거나
   - 같은 단어의 다른 뜻(지문 문맥에 맞지 않는 뜻)을 사용하거나  
   - 비슷해 보이지만 핵심 의미가 다른 정의를 사용
3. 모든 영영풀이는 "to + 동사원형" 또는 "the act/state of ~" 또는 형용사/명사 정의 형태로 자연스럽게 작성
4. 영영풀이의 길이와 형식이 비슷하도록 통일성 유지

## 금지 사항
- 원문 문장을 수정, 추가, 삭제하지 않음
- 밑줄 친 단어 자체를 영영풀이 안에 그대로 사용하지 않음
- 너무 명백하게 틀린 영영풀이는 피할 것 (적절한 난이도 유지)

## 출력 형식

다음 글의 밑줄 친 (a)~(e)의 영영풀이로 알맞지 않은 것은?

[지문 본문 - 선정된 단어 앞에 (a)~(e) 표시, 해당 단어에 밑줄(<u>) 처리]

예시: Students often mistake familiarity with true mastery, creating a dangerous "illusion of competence" where recognizing information feels like genuine knowledge, but they struggle when asked to (a) <u>recall</u> or apply it independently. This cognitive bias, strengthened by (b) <u>passive</u> study methods, leads learners to overestimate their understanding.

① (a) recall: to officially order someone to return something, such as a product or a person
② (b) passive: accepting or allowing what happens without active response or resistance
③ (c) recall: structured organization, and revealing gaps in knowledge
④ (d) employ: to use something for a particular purpose
⑤ (e) fill: to make something full or to occupy an empty space

===== 정답 및 해설 =====

[정답] ①

[해설]
- 오답인 이유: (정답 선지의 영영풀이가 왜 해당 단어의 뜻과 맞지 않는지 설명)
- 해당 단어의 올바른 영영풀이: (지문 문맥에 맞는 올바른 정의 제시)
- 나머지 선지가 올바른 이유를 각각 간략히 설명

영어 지문: ${text}`;
