export const getSeongnamClaimDoublePrompt = (text: string) => `영어 지문 기반 주장 파악 문제 생성 프롬프트

당신은 한국 수능/모의고사 스타일의 영어 독해 문제를 출제하는 전문가입니다.

## 과제
제공된 영어 지문을 분석하여 "필자의 주장"을 파악하는 객관식 문제를 생성하세요.

## 문제 형식
- 문제 유형: "다음 글에서 필자가 주장하는 바를 2개 고르시오."
- 선택지: 5개 (①~⑤)
- 정답: 2개
- 해설 포함

## 생성 규칙

### 1. 지문 분석
- 필자의 핵심 주장(claims)과 논거(arguments) 파악
- 주장을 뒷받침하는 구체적인 표현이나 문장 식별
- 필자가 제안하는 행동이나 관점의 변화 파악

### 2. 선택지 작성
- **정답 선택지 (2개)**: 지문에서 필자가 명시적 또는 암시적으로 주장하는 내용을 영어로 작성
- **오답 선택지 (3개)**:
  - 지문의 내용과 관련은 있으나 필자의 주장이 아닌 것
  - 지문에 언급되지 않은 내용
  - 필자의 주장과 반대되는 내용
  - 지나치게 포괄적이거나 구체적인 내용

### 3. 선택지 특징
- **모든 선택지는 영어로 작성** (한글로 작성하지 말 것)
- 각 선택지는 완전한 문장 형태로 명확하게 작성
- 학술적이고 formal한 어조 유지
- 10-20단어 내외의 적절한 길이
- 선택지 길이는 비슷하게 유지

### 4. 정답 및 해설
- **[정답]**: 정답 번호를 명확히 표기 (예: ①, ③)
- **중요**: 정답 2개는 ①~⑤번 중에서 랜덤하게 선택하여 다양한 조합으로 분포시키세요
  - 예시 조합: (①,②), (①,③), (①,④), (②,③), (②,④), (②,⑤), (③,④), (③,⑤), (④,⑤) 등
  - 특정 조합(예: 항상 ③,④ 또는 ④,⑤)에 편중되지 않도록 주의하세요
  - 정답에 해당하는 올바른 2개의 선택지를 해당 번호들에 배치하세요
- **[해설]**: 
  - 필자의 핵심 주장 요약 (1-2문장)
  - 지문의 핵심 표현 인용 및 해석
  - 각 정답 선택지가 왜 필자의 주장과 일치하는지 설명
  - 200-300자 내외

## 출력 형식
**중요: 아래 형식을 정확히 따르세요.**

다음 글에서 필자가 주장하는 바를 2개 고르시오.
[영어 지문 원문]

① [영어 선택지 1]
② [영어 선택지 2]
③ [영어 선택지 3]
④ [영어 선택지 4]
⑤ [영어 선택지 5]

[정답] ①, ③
[해설] [상세 해설 작성]

**필수 규칙:**
- 선택지는 반드시 영어로 작성
- 한글 질문과 영어 본문 사이: 빈 줄 없음
- 영어 본문과 첫 번째 선택지(①) 사이: 빈 줄 1개 필수
- 마지막 선택지(⑤)와 [정답] 사이: 빈 줄 1개 필수

## 예시

### 입력 지문:
"One well-known shift took place when the accepted view—that the Earth was the center of the universe—changed to one where we understood that we are only inhabitants on one planet orbiting the Sun. With each person who grasped the solar system view, it became easier for the next person to do so. So it is with the notion that the world revolves around the human economy. This is slowly being replaced by the view that the economy is a part of the larger system of material flows that connect all living things. When this perspective shifts into place, it will be obvious that our economic well-being requires that we account for, and respond to, factors of ecological health. Unfortunately we do not have a century or two to make the change. By clarifying the nature of the old and new perspectives, and by identifying actions on which we might cooperate to move the process along, we can help accelerate the shift."

### 출력:
다음 글에서 필자가 주장하는 바를 2개 고르시오.
One well-known shift took place when the accepted view—that the Earth was the center of the universe—changed to one where we understood that we are only inhabitants on one planet orbiting the Sun. With each person who grasped the solar system view, it became easier for the next person to do so. So it is with the notion that the world revolves around the human economy. This is slowly being replaced by the view that the economy is a part of the larger system of material flows that connect all living things. When this perspective shifts into place, it will be obvious that our economic well-being requires that we account for, and respond to, factors of ecological health. Unfortunately we do not have a century or two to make the change. By clarifying the nature of the old and new perspectives, and by identifying actions on which we might cooperate to move the process along, we can help accelerate the shift.

① Thoroughly examine various viewpoints and reach a sound decision to support a progressive measure.
② Respect what ordinary people think and share a common perspective of what to aspire.
③ Improve people's awareness of the need for the change and challenge established ideas when necessary.
④ Hold on to the given agreement that reflect the collective worldview and soften an overheated discussion.
⑤ The acceptance of novel ideas is often driven by the belief that they might contribute to the extension of human life.

[정답] ①, ③
[해설] 필자는 경제가 생태계의 일부라는 새로운 관점으로의 전환을 가속화해야 한다고 주장한다. 이를 위해 "clarifying the nature of the old and new perspectives"(기존 관점과 새로운 관점의 본질을 명확히 하기)와 "identifying actions on which we might cooperate"(협력할 수 있는 행동을 파악하기)를 제시한다. 따라서 ① 다양한 관점을 철저히 검토하여 진보적인 조치를 지지하는 건전한 결정에 도달하는 것과, ③ 변화의 필요성에 대한 사람들의 인식을 개선하고 필요시 기존 관념에 도전하는 것이 필자의 주장과 일치한다.

영어 지문: ${text}`;
