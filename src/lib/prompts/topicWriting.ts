
export const getTopicWritingPrompt = (text: string) => `당신은 고등학교 영어 시험 출제 전문가입니다. 제가 영어 지문을 제공하면, 해당 지문을 바탕으로 "주제문 영작 문제"를 생성해 주세요.

### [문제 생성 규칙]

**🔴 필수 검증 규칙 (반드시 준수):**

**1단계: 정답 문장 작성 및 단어 개수 확인**
- 지문의 주제문을 8~12단어로 영어로 작성
- 작성한 문장의 단어를 하나씩 세기 (예: "Different / cultures / choose / their / calendar / systems / based / on / geography / and / lifestyle" = 11단어)
- 관사(a, an, the), 전치사(on, in, at, to, from 등), 접속사(and, but, or 등) 등 모든 단어를 빠짐없이 세기

**2단계: 제시 단어 추출**
- 정답 문장의 모든 단어를 빠짐없이 추출 (전치사, 관사, 접속사 포함)
- 같은 단어가 여러 번 나오면 그 횟수만큼 모두 포함
- 🎲 **추출한 단어를 완전히 무작위 순서로 섞기 (반드시 랜덤 순서)**
- 🎲 **절대로 정답 문장의 순서대로 나열하지 마세요**
- 🎲 **단어들이 의미 있는 순서로 보이지 않도록 충분히 섞으세요**

**3단계: 조건 설정**
- 조건의 단어 수 = 정답 문장의 정확한 단어 개수
- 제시 단어의 개수 = 정답 문장의 단어 개수

**4단계: 최종 검증 (필수)**
- 제시 단어의 개수 = 조건의 단어 수 = 정답 문장의 단어 개수인지 확인
- 제시 단어를 정답 순서대로 배열하면 정답 문장이 완성되는지 확인
- 정답 문장의 모든 단어(전치사, 관사, 접속사 포함)가 제시 단어에 있는지 확인

**1. 주제문 작성 기준**
- 지문의 핵심 내용을 8~12단어로 요약한 주제문을 작성합니다
- 고등학교 1학년 수준의 어휘와 문법을 사용합니다
- 문법적으로 완전하고 자연스러운 영어 문장이어야 합니다
- **중요: 문장이 완전하게 끝나야 합니다. 절대 생략하지 마세요**
  - ❌ "Individual problems are influenced by social factors rather than personal." (불완전 - personal 뒤에 명사 누락)
  - ✅ "Individual problems are influenced by social factors rather than personal factors." (완전)
  - ❌ "Students should focus on understanding rather than memorizing." (불완전 - memorizing 뒤에 목적어 누락)
  - ✅ "Students should focus on understanding concepts rather than memorizing facts." (완전)
- 비교 구조(rather than, better than, more than 등)를 사용할 때는 양쪽이 대등한 구조여야 합니다

**2. 제시 단어 선정 기준**
- 주제문에 포함된 모든 단어를 제시어로 제공합니다
- 🎲 **단어는 완전히 무작위 순서로 나열합니다 (정답 순서와 무관하게)**
- 🎲 **학생이 단어 순서에서 힌트를 얻을 수 없도록 충분히 섞으세요**
- **🔴 모든 제시 단어는 소문자로 표기합니다 (문장 첫 단어 포함, 고유명사 제외)**
- 필요시 어형 변화가 가능하도록 원형으로 제시할 수 있습니다

**3. 출력 형식**

\`\`\`
다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.

[영어 지문]

[조건]
- ○단어로 주제문을 영작하시오.
- 다음 단어를 한 번씩 사용하여 배열하시오. (필요시 단어의 어형을 변화할 것)
[제시 단어 - 무작위 순서로 나열]

주제문: __________________________________________.

[정답] [완성된 주제문 - 첫 글자도 소문자로 표기 (고유명사 제외)]
\`\`\`

### [예시]

**원문:**
The traditional bank manager in the 1950s was usually a respected pillar of the community, a cautious, careful sort of person who probably went to bed early and didn't drink too much. But from the 1970s a new kind of banker appeared ─ loud, flashy, and arrogant. These bankers loved taking big risks. They wanted to get rich quick and blow their money on fast cars and expensive champagne. They made their money through what's called 'speculation'. Normally, people buy things because they want to use them, such as wheat to make bread and petrol to run the car. But when people speculate, they buy things even when they have no interest in using them. They might buy a load of wheat simply because they think that its price is going to rise when a drought is predicted in wheat-growing areas. If their guess is right, they later sell the wheat for a profit.

**생성된 문제:**

다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.

The traditional bank manager in the 1950s was usually a respected pillar of the community, a cautious, careful sort of person who probably went to bed early and didn't drink too much. But from the 1970s a new kind of banker appeared ─ loud, flashy, and arrogant. These bankers loved taking big risks. They wanted to get rich quick and blow their money on fast cars and expensive champagne. They made their money through what's called 'speculation'. Normally, people buy things because they want to use them, such as wheat to make bread and petrol to run the car. But when people speculate, they buy things even when they have no interest in using them. They might buy a load of wheat simply because they think that its price is going to rise when a drought is predicted in wheat-growing areas. If their guess is right, they later sell the wheat for a profit.

[조건]
- 9단어로 주제문을 영작하시오.
- 다음 단어를 한 번씩 사용하여 배열하시오. (필요시 단어의 어형을 변화할 것)

cautious / changed / speculators / bankers / to / from / risk-taking / have / people

주제문: __________________________________________.

[정답] bankers have changed from cautious people to risk-taking speculators.

### [예시 2]

**원문:**
Paradoxically, it's uncertainty that makes us feel most alive. Think of events that shake you out of your everyday routine: maybe attending a family wedding, making a big presentation, or going somewhere you've never been. It's on those occasions that time seems to slow down a little, and you feel more fully engaged. The same holds true if the experience is risky, like mountain climbing or parasailing. Your senses are sharper. You notice more. Thanks to the release of a feel-good chemical in the brain called dopamine, you get a greater rush of pleasure from chance encounters with people than planned meetings. Good news, financial rewards, and gifts are more enjoyable if they are surprises. It's why the most popular television shows and movies are the ones with unexpected plot twists and astonishing endings.

**생성된 문제:**

다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.

Paradoxically, it's uncertainty that makes us feel most alive. Think of events that shake you out of your everyday routine: maybe attending a family wedding, making a big presentation, or going somewhere you've never been. It's on those occasions that time seems to slow down a little, and you feel more fully engaged. The same holds true if the experience is risky, like mountain climbing or parasailing. Your senses are sharper. You notice more. Thanks to the release of a feel-good chemical in the brain called dopamine, you get a greater rush of pleasure from chance encounters with people than planned meetings. Good news, financial rewards, and gifts are more enjoyable if they are surprises. It's why the most popular television shows and movies are the ones with unexpected plot twists and astonishing endings.

[조건]
- 9단어로 주제문을 영작하시오.
- 다음 단어를 한 번씩 사용하여 배열하시오. (필요시 단어의 어형을 변화할 것)

make / us / experiences / uncertainty / feel / alive / engaged / more / and

주제문: __________________________________________.

[정답] Uncertainty and unpredictable experiences make us feel more alive and engaged.

**❌ 위 예시 2의 오류:**
- 정답이 11단어인데 조건은 9단어, 제시 단어는 9개
- 정답에 "unpredictable"이 있는데 제시 단어에 없음
- 정답에 "and"가 2번 나오는데 제시 단어에 1번만 있음

**✅ 올바른 예시 2:**

다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오.

Paradoxically, it's uncertainty that makes us feel most alive. Think of events that shake you out of your everyday routine: maybe attending a family wedding, making a big presentation, or going somewhere you've never been. It's on those occasions that time seems to slow down a little, and you feel more fully engaged. The same holds true if the experience is risky, like mountain climbing or parasailing. Your senses are sharper. You notice more. Thanks to the release of a feel-good chemical in the brain called dopamine, you get a greater rush of pleasure from chance encounters with people than planned meetings. Good news, financial rewards, and gifts are more enjoyable if they are surprises. It's why the most popular television shows and movies are the ones with unexpected plot twists and astonishing endings.

[조건]
- 8단어로 주제문을 영작하시오.
- 다음 단어를 한 번씩 사용하여 배열하시오. (필요시 단어의 어형을 변화할 것)

make / us / experiences / uncertainty / feel / alive / engaged / more

주제문: __________________________________________.

[정답] uncertainty and experiences make us feel more alive and engaged.

### [지시사항]

위의 규칙과 예시를 참고하여, 제공된 영어 지문으로 동일한 형식의 문제를 생성해 주세요.

**⚠️ 출력 형식 (중요):**
- "생성 절차:", "단어 개수 세기:", "검증:" 등의 중간 과정이나 설명은 절대 출력하지 마세요
- 바로 "다음 글을 읽고, 주제문을 주어진 조건에 맞게 완성하시오."로 시작하세요
- 문제 지문, [조건], 제시 단어, 주제문 빈칸, [정답]만 출력하세요

**⚠️ 생성 절차 (내부적으로만 수행, 출력하지 않음):**
1. 지문을 읽고 주제문을 영어로 작성 (8~12단어)
2. 작성한 주제문의 단어를 하나씩 세기 - 전치사(on, in, at), 관사(a, the), 접속사(and, but) 등 모든 단어 포함
3. 주제문에 사용된 모든 단어를 추출 (같은 단어가 2번 나오면 2번 모두 포함, 전치사/관사/접속사도 모두 포함)
4. 🎲 **추출한 단어들을 완전히 무작위 순서로 섞기 (난수 생성기 사용)**
   - ⚠️ 절대로 정답 문장의 순서를 유지하지 마세요
   - ⚠️ 의미 있는 패턴이나 순서가 보이지 않도록 충분히 섞으세요
5. 조건의 단어 수를 주제문의 정확한 단어 개수로 설정
6. 최종 검증:
   - 제시 단어 개수 = 조건의 단어 수 = 정답 문장의 단어 개수
   - 정답 문장의 모든 단어(전치사, 관사, 접속사 포함)가 제시 단어에 있는지 확인
   - 제시 단어를 정답 순서대로 배열하면 정답 문장이 완성되는지 확인

**출력 내용:**
1. 생성된 문제 (지문 + 조건 + 제시 단어 + 빈칸)
2. 정답

지문: ${text}`;
