export const getOrderWritingKoreanPrompt = (text: string) => `배열영작(우리말O) 문제를 만들어주세요.

⚠️ 중요 규칙:
1. 이 문제는 반드시 한국어 번역을 포함해야 합니다
2. 조건 없이 순수하게 배열만 하는 문제입니다
3. "<조건>" 섹션을 절대 추가하지 마세요
4. "첫 번째 단어는 대문자로 시작" 같은 조건을 추가하지 마세요

## 문제 생성 규칙:

1. **문장 선정**:
   - **대괄호 []가 있는 경우**: 사용자가 대괄호로 감싼 문장들을 문제로 출제
   - **대괄호가 없는 경우**: 지문에서 핵심 문장 1~2개를 자동 선정
2. **한국어 번역 필수**: 선택된 문장을 자연스러운 한국어로 번역하여 지문에 표시
3. **문장 개수**: 대괄호 문장이 1개면 (A)만, 2개면 (A), (B)만 생성
4. **단어 배열**: 
   - 원문 문장의 모든 단어를 정확히 추출
   - 구두점(. , ! ?)은 별도 처리
   - 정답 문장과 보기 단어가 100% 일치해야 함

## 출력 형식 (정확히 따르세요):

[서답형] 다음 글을 읽고, 물음에 답하시오.

[원문 지문에서 선택한 문장을 (A), (B)로 표시하고, 바로 뒤에 대괄호 안에 한국어 번역을 삽입]

(A)를 어법에 맞게 주어진 단어를 배열하시오.
[첫 번째 문장의 단어들을 무작위로 섞어서 슬래시(/)로 구분하여 나열, 마침표는 별도 표시]

(대괄호 문장이 2개인 경우만)
(B)를 어법에 맞게 주어진 단어를 배열하시오.
[두 번째 문장의 단어들을 무작위로 섞어서 슬래시(/)로 구분하여 나열, 마침표는 별도 표시]

[정답]
(A) [올바른 어순의 완전한 문장]
(B) [올바른 어순의 완전한 문장] (2개인 경우만)

## 예시:

**입력 지문:**
Despite all the high­tech devices that seem to deny the need for paper, paper use in the United States has nearly doubled recently. We now consume more paper than ever: 400 million tons globally and growing. Paper is not the only resource that we are using more of. Technological advances often come with the promise of using fewer materials. However, the reality is that they have historically caused more materials use, making us dependent on more natural resources. [The world now consumes far more "stuff" than it ever has.] We use twenty­seven times more industrial minerals, such as gold, copper, and rare metals, than we did just over a century ago. [We also each individually use more resources.] Much of that is due to our high­tech lifestyle.

**출력 결과:**
[서답형] 다음 글을 읽고, 물음에 답하시오.

Despite all the high­tech devices that seem to deny the need for paper, paper use in the United States has nearly doubled recently. We now consume more paper than ever: 400 million tons globally and growing. Paper is not the only resource that we are using more of. Technological advances often come with the promise of using fewer materials. However, the reality is that they have historically caused more materials use, making us dependent on more natural resources. (A) [세계는 이제 그 어느 때보다 훨씬 더 많은 "물건들"을 소비하고 있다.] We use twenty­seven times more industrial minerals, such as gold, copper, and rare metals, than we did just over a century ago. (B) [우리는 또한 각자 개별적으로도 더 많은 자원을 사용한다.] Much of that is due to our high­tech lifestyle.

(A)를 어법에 맞게 주어진 단어를 배열하시오.
consumes / "stuff" / now / The / more / has / world / it / than / ever / far .

(B)를 어법에 맞게 주어진 단어를 배열하시오.
individually / resources / We / use / more / also / each .

[정답]
(A) The world now consumes far more "stuff" than it ever has.
(B) We also each individually use more resources.

---

**절대 금지사항:**
- <조건> 섹션 추가 금지
- 추가적인 제약조건 언급 금지
- 한국어 번역 생략 금지

**지문:**
${text}`;
