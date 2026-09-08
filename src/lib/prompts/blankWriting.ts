
export const getBlankWritingPrompt = (text: string) => {
  return `🚨🚨🚨 중요: 이 프롬프트를 정확히 따르지 않으면 문제가 사용 불가능합니다 🚨🚨🚨

영어 지문 빈칸 완성 문제 제작 프롬프트

당신은 영어 독해 문제 제작 전문가입니다. 제공된 영어 지문을 분석하여 다음 형식의 문제를 만드세요:

[문제 형식]
지문의 핵심 문장에서 중요한 부분을 빈칸으로 만듭니다
빈칸은 10-12단어로 구성된 완전한 구문이어야 합니다
빈칸에 들어갈 단어들을 무작위로 섞어 제시합니다

**🔴🔴🔴 필수 검증 규칙 (반드시 준수 - 하나라도 위반하면 안됨):**

⚠️ 가장 흔한 오류들:
❌ 정답: "By doing so we can focus our thinking" (8단어)
   조건: "By / doing / so / we / can / focus / our / thinking / on / the" (10단어) ← 틀림!
   문제점: 정답에 없는 "on", "the"가 조건에 포함됨

❌ 정답: "a social media presence must either solve a problem for the organization" (12단어)
   조건: "social / media / presence / must / either / solve / problem / for / organization" (9단어) ← 틀림!
   문제점: 정답의 "a" (2개)가 조건에서 빠짐

✅ 올바른 예:
정답: "By doing so we can focus our thinking" (8단어)
조건: "our / can / thinking / so / focus / doing / we / By" (8단어) ← 맞음!
- 모든 단어가 1:1 대응
- 개수 일치
- 무작위 순서

**1단계: 정답 구문 작성 및 단어 개수 확인**
- 빈칸에 들어갈 구문을 10-12단어로 작성
- 작성한 구문의 단어를 하나씩 세기 (예: "a / social / media / presence / must / either / solve / a / problem / for / the / organization" = 12단어)
- 관사(a, an, the), 전치사(on, in, at, to, for 등), 접속사(and, but, or 등) 등 모든 단어를 빠짐없이 세기
- **중요: 관사나 구를 하나의 항목으로 취급하지 마세요. 각각의 단어를 개별적으로 세어야 합니다**
  - ❌ 잘못된 예: "a problem"을 1개로 세기
  - ✅ 올바른 예: "a"(1개) + "problem"(1개) = 2개

**2단계: 제시 단어 추출 및 랜덤화**
- 정답 구문의 모든 단어를 빠짐없이 추출 (전치사, 관사, 접속사 포함)
- 같은 단어가 여러 번 나오면 그 횟수만큼 모두 포함 (예: "a"가 2번 나오면 2개 포함)
- 🎲 **추출한 단어를 완전히 무작위 순서로 섞기 (난수 생성기 사용)**
- 🎲 **절대로 정답 구문의 순서대로 나열하지 마세요**
- 🎲 **의미 있는 패턴이나 순서가 보이지 않도록 충분히 섞으세요**
- 🎲 **학생이 단어 순서에서 힌트를 얻을 수 없도록 완전히 무작위로 배치하세요**

**3단계: 조건 설정**
- 조건의 단어 수 = 정답 구문의 정확한 단어 개수
- 제시 단어의 개수 = 정답 구문의 단어 개수

**4단계: 최종 검증 (필수)**
- ✅ 제시 단어의 개수 = 조건의 단어 수 = 정답 구문의 단어 개수인지 확인
- ✅ 제시 단어를 정답 순서대로 배열하면 정답 구문이 완성되는지 확인
- ✅ 정답 구문의 모든 단어(전치사, 관사, 접속사 포함)가 제시 단어에 있는지 확인
- ✅ 제시 단어에 정답 구문에 없는 단어가 있는지 확인 (있으면 안 됨)
- 🚨 **불일치가 발견되면 다시 만드세요!**

[제작 규칙]

빈칸 위치 선정:
- 지문의 핵심 내용이 담긴 문장을 선택합니다
- 문장의 중간 부분에서 의미 있는 구문을 빈칸으로 만듭니다
- 빈칸 앞뒤 문맥이 자연스럽게 연결되어야 합니다

빈칸 구문 구성:
- 정확히 10-12단어로 구성합니다
- 완전한 구문 형태여야 합니다 (주어+동사 또는 의미 있는 구절)
- 지문에 나온 단어를 그대로 사용합니다

단어 제시 방식:
- 빈칸에 들어갈 단어를 **각각 개별적으로** 모두 나열합니다
- 🎲 **단어는 완전히 무작위 순서로 배열합니다 (정답 순서와 무관하게)**
- 🎲 **절대로 정답 문장의 순서를 유지하지 마세요**
- 🎲 **각 문제마다 다른 무작위 순서를 사용하세요**
- ⚠️ **관사(a, the)도 별도의 단어로 취급합니다**
- ⚠️ **"a problem", "a cruel" 같은 구를 하나로 묶지 마세요 - 각각 분리해야 합니다**

[출력 형식 - 반드시 아래 예시와 동일한 형식으로 작성]
[예시 문항 1]
다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.
One of the most common mistakes made by organizations when they first consider experimenting with social media is that they focus too much on social media tools and platforms and not enough on their business objectives. The reality of success in the social web for businesses is that creating a social media program begins not with insight into the latest social media tools and channels but with a thorough understanding of the organization's own goals and objectives. A social media program is not merely the fulfillment of a vague need to manage a "presence" on popular social networks because "everyone else is doing it." "Being in social media" serves no purpose in and of itself. In order to serve any purpose at all, _______________________ and its customers or result in an improvement of some sort (preferably a measurable one). In all things, purpose drives success. The world of social media is no different.

[조건]
12단어로 빈칸을 완성하시오.
다음 단어를 한 번씩 사용하여 배열하시오.
a / social / media / presence / must / either / solve / a / problem / for / the / organization

[정답] a social media presence must either solve a problem for the organization

[예시 문항 2]
다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.
There have been occasions in which you have observed a smile and you could sense it was not genuine. The most obvious way of identifying a genuine smile from an insincere one is that a fake smile primarily only affects the lower half of the face, mainly with the mouth alone. The eyes don't really get involved. Take the opportunity to look in the mirror and manufacture a smile using the lower half your face only. When you do this, judge how happy your face really looks ― is it genuine? A genuine smile will impact on the muscles and wrinkles around the eyes and less noticeably, _______________________ with true enjoyment. The genuine smile can impact on the entire face.

[조건]
11단어로 빈칸을 완성하시오.
다음 단어를 한 번씩 사용하여 배열하시오.
the / skin / between / the / eyebrow / and / upper / eyelid / is / lowered / slightly

[정답] the skin between the eyebrow and upper eyelid is lowered slightly

[예시 문항 3]
다음 글을 읽고, 빈칸을 주어진 조건에 맞게 완성하시오.
Vision is like shooting at a moving target. Plenty of things can go wrong in the future and plenty more can change in unpredictable ways. When such things happen, you should be prepared to make your vision conform to the new reality. For example, _______________________ or by aggressive competition in ways he could not have foreseen. Or in another scenario, his sales can skyrocket and his numbers can get even better. In any event, he will be foolish to stick to his old vision in the face of new data. There is nothing wrong in modifying your vision or even abandoning it, as necessary.

[조건]
12단어로 빈칸을 완성하시오.
다음 단어를 한 번씩 사용하여 배열하시오.
a / businessman's / optimistic / forecast / can / be / blown / away / by / a / cruel / recession

[정답] a businessman's optimistic forecast can be blown away by a cruel recession

[중요 체크리스트]
✓ 빈칸은 문장의 중간 부분에 위치하는가?
✓ 빈칸 구문은 10-12단어인가?
✓ 조건의 단어 수 = 제시 단어 개수 = 정답 구문 단어 개수가 정확히 일치하는가?
✓ 제시된 단어들을 모두 사용하면 정답이 완성되는가?
✓ 정답 구문의 모든 단어가 제시 단어에 빠짐없이 포함되어 있는가?
✓ 제시 단어에 정답 구문에 없는 단어가 없는가?
✓ 빈칸 앞뒤 문맥이 자연스럽게 연결되는가?
✓ 지문의 원문 단어를 그대로 사용했는가?

**⚠️ 생성 절차 (반드시 순서대로 수행, 각 단계를 검증):**

**STEP 1: 정답 구문 작성**
- 빈칸에 들어갈 구문을 10-12단어로 작성
- 예: "a social media presence must either solve a problem for the organization"

**STEP 2: 단어 개수 세기 (모든 단어를 하나씩 세기)**
- 관사(a, the), 전치사(on, in, at, for), 접속사(and, but) 등 모든 단어 포함
- 예: a(1) / social(2) / media(3) / presence(4) / must(5) / either(6) / solve(7) / a(8) / problem(9) / for(10) / the(11) / organization(12) = 12단어

**STEP 3: 모든 단어 추출 (중복 포함, 빠짐없이)**
- 같은 단어가 여러 번 나오면 그 횟수만큼 모두 포함
- 예: [a, social, media, presence, must, either, solve, a, problem, for, the, organization]
- ⚠️ "a"가 2번 나오면 2번 모두 추출!

**STEP 4: 완전히 무작위로 섞기**
- 난수 생성기 사용
- 정답 순서와 무관하게 완전히 랜덤
- 예: [media, a, solve, organization, must, the, presence, problem, social, either, for, a]

**STEP 5: 최종 검증 (하나라도 실패하면 처음부터 다시)**
✅ 제시 단어 개수 = 정답 단어 개수? (예: 12 = 12)
✅ 정답의 모든 단어가 제시 단어에 있나? (중복 포함)
✅ 제시 단어에 정답에 없는 단어가 없나?
✅ 제시 단어를 정답 순서로 배열하면 정답이 완성되나?
✅ "[조건]"에 적은 "N단어" 숫자가 실제 슬래시(/)로 구분된 단어 수와 일치하나?

🚨🚨🚨 가장 흔한 오류 방지 🚨🚨🚨
- 정답 문장의 단어를 공백 기준으로 하나하나 세세요
- [조건]에서 "N단어"라고 쓸 때, 아래 슬래시로 구분된 단어 개수가 정확히 N개여야 합니다
- 예: "11단어"라고 했으면, 슬래시로 구분된 단어가 정확히 11개여야 함
- 예: "12단어"라고 했으면, 슬래시로 구분된 단어가 정확히 12개여야 함
- 숫자를 쓰기 전에 반드시 슬래시(/) 개수 + 1 = 총 단어 수를 직접 세세요

🚨 검증 실패 시 다시 생성! 🚨

⚠️ 출력 시 중요 사항:
- "# 빈칸 완성 문제", "## 문제 생성 과정" 같은 제목이나 헤더를 포함하지 마세요
- 마크다운 헤딩(#, ##, ###)을 사용하지 마세요
- 오직 문제 형식(다음 글을 읽고..., [조건], [정답])만 출력하세요
- **🔴 절대 금지**: 해설에 "수정된 문제", "올바른 조건", "재검증" 등 수정 과정을 포함하지 마세요
- **🔴 절대 금지**: [해설]에서 문제를 다시 출제하거나 조건을 다시 작성하지 마세요
- [해설]에는 정답 구문의 의미와 문맥적 근거만 간단히 설명하세요
- 만약 검증에서 불일치를 발견하면, 출력하지 말고 처음부터 다시 만든 뒤 최종 결과만 출력하세요

[해설] 출력 형식:
[정답] [정답 구문]
[해설] 빈칸에는 "[정답 구문]"이 들어갑니다. [지문 맥락에서 왜 이 구문이 적절한지 1-2문장으로 설명]

Now, generate a blank-filling question for this text. Output ONLY the question format (starting with "다음 글을 읽고..."), without any markdown headers or process explanations:

${text}`;
};
