export const getOrderWritingPrompt = (text: string) => `배열영작 문제를 만들어주세요.

## 문제 생성 규칙:

1. **문장 선정**:
   - **대괄호 []가 있는 경우**: 사용자가 대괄호로 감싼 문장들을 찾아서 문제로 출제
   - **대괄호가 없는 경우**: 지문에서 주제문이나 핵심 내용을 담은 적절한 길이의 문장을 1~2개 자동으로 선정
     * 주제문 우선 선택 (지문의 핵심 메시지를 담은 문장)
     * 너무 짧거나 긴 문장은 피하고, 10~20단어 정도의 문장 선택
     * 선정한 문장은 대괄호로 표시하지 말고 (A), (B)로 바로 라벨링
2. **문장 개수 확인**: 대괄호로 감싸진 문장이 1개면 (A)만, 2개면 (A), (B)만 생성
3. **라벨링**: 감싸진 문장들을 순서대로 (A), (B), (C)... 로 표시
4. **단어 추출 및 배열**: 
   - 원문 문장에서 모든 단어를 정확히 추출
   - 구두점(. , ! ? 등)은 별도 처리
   - 정답 문장의 단어와 보기의 단어가 100% 일치해야 함
   - 단어 개수도 정확히 일치해야 함

## 출력 형식:

[서답형] 다음 글을 읽고, 물음에 답하시오.

[원문 지문을 그대로 제시하되, 대괄호로 감싼 문장들을 (A), (B) 등으로 표시하고 해당 위치에 섞인 단어들을 대괄호 안에 표시]

**중요**: 대괄호로 감싸진 문장 개수만큼만 문제를 생성하세요.
- 1개 문장이면 (A)만
- 2개 문장이면 (A), (B)만
- 3개 문장이면 (A), (B), (C)만

(A)를 어법에 맞게 주어진 단어를 배열하시오.
[첫 번째 문장의 단어들을 무작위 순서로 나열, 마침표는 별도 표시, 단어 사이는 슬래시(/)로만 구분하고 쉼표나 마침표를 절대 사용하지 말 것]

(대괄호 문장이 2개 이상인 경우만)
(B)를 어법에 맞게 주어진 단어를 배열하시오.
[두 번째 문장의 단어들을 무작위 순서로 나열, 마침표는 별도 표시, 단어 사이는 슬래시(/)로만 구분하고 쉼표나 마침표를 절대 사용하지 말 것]

[정답]
(A) [올바른 어순의 완전한 문장]
(대괄호 문장이 2개 이상인 경우만)
(B) [올바른 어순의 완전한 문장]

## 예시:

**중요**: 보기에 제시하는 단어들은 반드시 정답 문장과 정확히 일치해야 합니다.

**입력 지문:**
When writing a novel, research for information needs to be done. The thing is that some kinds of fiction demand a higher level of detail: crime fiction, for example, or scientific thrillers. The information is never hard to find; one website for authors even organizes trips to police stations, so that crime writers can get it right. Often, a polite letter will earn you permission to visit a particular location and record all the details that you need. But remember that [you will drive your readers to boredom if you think that you need to pack everything you discover into your work.] [The details that matter are those that reveal the human experience.] The crucial thing is telling a story, finding the characters, the tension, and the conflict—not the train timetable or the building blueprint.

**출력 결과:**
[서답형] 다음 글을 읽고, 물음에 답하시오.

When writing a novel, research for information needs to be done. The thing is that some kinds of fiction demand a higher level of detail: crime fiction, for example, or scientific thrillers. The information is never hard to find; one website for authors even organizes trips to police stations, so that crime writers can get it right. Often, a polite letter will earn you permission to visit a particular location and record all the details that you need. But remember that (A) [to / boredom / you / will / drive / your / readers / if / you / think / that / you / need / to / pack / everything / you / discover / into / your / work.] (B) [The / details / that / matter / are / those / that / reveal / the / human / experience.] The crucial thing is telling a story, finding the characters, the tension, and the conflict—not the train timetable or the building blueprint.

(A)를 어법에 맞게 주어진 단어를 배열하시오.
to / boredom / you / will / drive / your / readers / if / you / think / that / you / need / to / pack / everything / you / discover / into / your / work.

(B)를 어법에 맞게 주어진 단어를 배열하시오.
The / details / that / matter / are / those / that / reveal / the / human / experience.

[정답]
(A) you will drive your readers to boredom if you think that you need to pack everything you discover into your work.
(B) The details that matter are those that reveal the human experience.

---

**지문:**
${text}`;
