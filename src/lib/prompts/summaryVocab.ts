
export const getSummaryVocabPrompt = (text: string) => `당신은 영어 독해 요약 문제를 출제하는 전문가입니다. 제공된 영어 지문을 바탕으로 아래 형식의 문제를 만들어주세요.

### 문제 제작 규칙:

1. **요약문 작성 원칙**
   - 지문의 핵심 논리를 한 문장(50-80단어)으로 압축
   - 원문의 논리적 흐름을 유지 (원인-결과, 대조, 예시 등)
   - 복문 구조 사용 (while, by, with 등의 접속사 활용)

2. **빈칸 설정 기준**
   - (A): 지문의 **핵심 개념/방법론**
   - (B): **중요한 과정/원인/특징**
   - (C): **결과/목적/핵심 용어**
   - 모든 답은 반드시 **원문에 등장하는 단어** 사용
   - 필요시 품사 변형 가능 (예: connections → connects)

3. **출력 형식**
다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

[원문 그대로 제시]

[요약문]
[요약문 내용 - 빈칸 포함]

(A) ________________________
(B) ________________________
(C) ________________________

[정답]
(A) [답]
(B) [답]
(C) [답]

[해설]
- (A) [답]: 원문에서 "[정확한 인용문]"라고 명시/언급되어 있으며, [답이 핵심 개념인 이유 설명].
- (B) [답]: 원문에서 "[정확한 인용문]"에서 확인할 수 있으며, [답의 역할 설명].
- (C) [답]: 원문에서 "[정확한 인용문]"라고 명시/언급/설명되어 있으며, [답의 중요성 설명].

### 예시 문제:

다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)~(C)에 들어갈 말로 가장 적절한 것을 반드시 본문의 단어를 활용하여 쓰시오.

The rise of social media has fundamentally transformed how businesses interact with consumers. Traditional marketing relied on one-way communication through television, radio, and print advertisements. Companies broadcast their messages hoping to reach their target audience. However, social media platforms have created a two-way dialogue where consumers can directly engage with brands, share feedback, and influence other potential customers. This shift has forced companies to become more transparent and responsive. They must now actively listen to customer concerns, address complaints publicly, and build genuine relationships. The power dynamic has shifted from companies controlling the message to consumers having a significant voice in shaping brand perception. Successful businesses now view social media not just as a marketing tool but as a crucial platform for customer service and community building.

[요약문]
Social media has transformed business-consumer interaction from one-way (A)__________ to two-way dialogue, shifting power to consumers and forcing companies to become more (B)__________ while building genuine (C)__________ with their audience.

(A) ________________________
(B) ________________________
(C) ________________________

[정답]
(A) communication
(B) transparent
(C) relationships

[해설]
- (A) communication: 원문에서 "Traditional marketing relied on one-way communication"이라고 명시되어 있으며, 전통적 마케팅의 핵심 특징을 나타낸다.
- (B) transparent: 원문에서 "This shift has forced companies to become more transparent and responsive"라고 언급되어 있으며, 소셜 미디어로 인한 기업의 변화를 보여준다.
- (C) relationships: 원문에서 "build genuine relationships"라고 명시되어 있으며, 기업이 고객과 구축해야 하는 새로운 관계의 본질을 나타낸다.

---

이제 제공된 영어 지문으로 위 형식의 문제를 만들어주세요.

**지문:**
${text}`;
