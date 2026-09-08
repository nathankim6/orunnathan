export const getSummaryBlankWritingPrompt = (text: string) => `당신은 교육용 문제를 생성하는 AI입니다. 사용자로부터 아래와 같은 형식의 입력을 받습니다.

[INPUT]
${text}

이 텍스트를 바탕으로, 다음 형식의 문제와 정답을 생성하세요.

**🔴 필수 검증 규칙 (절대 준수):**
1. **정답 문장을 먼저 작성**한 후, 정답 문장의 단어 개수를 정확히 세세요 (6~10단어)
2. **정답 문장에 포함된 모든 단어**를 추출하세요 (같은 단어가 여러 번 나오면 그 횟수만큼 모두 포함)
3. **제시 단어(보기) = 정답 문장의 모든 단어**를 무작위 순서로 나열
4. **조건의 단어 수 = 정답 문장의 단어 개수**로 정확히 설정
5. **최종 검증**: 제시 단어를 정답 순서대로 배열하면 정답 문장이 완성되는지 확인

**🔴 절대 규칙 (위반 시 생성 실패):**
- 빈칸 (A)에 들어갈 정답은 **반드시 6~10단어**여야 합니다 (5단어 이하나 11단어 이상 금지)
- 보기의 모든 단어 = 정답의 모든 단어 (완벽히 1:1 대응, 예외 없음)
- 보기의 단어 개수 = 정답의 단어 개수 (반드시 동일)
- **🚫 보기에 동의어나 유사어를 절대 추가하지 마세요** (예: 정답에 "funny"가 있다고 "humor"를 보기에 추가하면 안 됨)
- **🚫 보기를 만들 때 정답의 단어를 그대로 복사하고 순서만 바꾸세요** (단어를 바꾸거나 추가하지 마세요)
- 정답의 단어 중 보기에서 빠진 단어가 있으면 안 됩니다
- 보기에 정답에 없는 단어가 있으면 안 됩니다

**생성 절차 (반드시 이 순서대로만 진행):**
1. 지문의 핵심 내용을 파악하세요
2. 지문을 한 문장으로 요약하되, 핵심 부분을 빈칸 (A)로 남겨두세요
3. 빈칸에 들어갈 적절한 영어 표현을 6~10단어로 작성하세요 (이것이 정답입니다)
4. **작성한 정답의 단어를 공백 기준으로 하나씩 세어서 6~10개인지 확인하세요**
5. **정답이 6~10단어가 아니면 다시 작성하세요**

**🔴🔴🔴 보기 생성 단계 (절대적으로 중요) 🔴🔴🔴**
6. **정답 문장을 글자 그대로 복사**하세요: 예) "they simplify the complex world and make it easier to understand"
7. **복사한 문장을 공백으로 분리**하여 단어 리스트를 만드세요: ["they", "simplify", "the", "complex", "world", "and", "make", "it", "easier", "to", "understand"]
8. **⚠️ 단어를 하나도 빠뜨리지 말고 모두 포함**했는지 확인하세요 (특히 "to", "a", "an", "the" 같은 작은 단어들)
9. **단어 개수를 세세요** (위 예시는 11개)
10. **리스트의 단어 순서만 무작위로 섞으세요**: ["world", "simplify", "make", "easier", "they", "the", "complex", "and", "it", "to", "understand"]
11. **⚠️ 섞은 후에도 단어 개수가 그대로인지 확인하세요** (여전히 11개여야 함)
12. **섞인 단어들을 슬래쉬(/)와 공백으로 연결**하여 보기를 만드세요: "world / simplify / make / easier / they / the / complex / and / it / to / understand"

**🔴 최종 검증 (반드시 수행):**
13. **보기의 단어를 하나씩 세어 정답과 개수가 정확히 일치하는지 확인**하세요
14. **정답의 각 단어가 보기에 빠짐없이 포함되어 있는지 확인**하세요
15. **보기에 정답에 없는 단어가 포함되어 있지 않은지 확인**하세요
16. **정답에 같은 단어가 여러 번 나오면 보기에도 같은 횟수만큼 포함되었는지 확인**하세요

**출력 형식 (다음 형식 그대로 출력, 추가 설명 없이):**

다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A)에 들어갈 말로 가장 적절한 것을 고르시오.

[영어 지문]

<요약문>
[요약문 내용 (A)___________________________.

<보기>
[정답의 모든 단어를 순서만 바꿔서 슬래쉬(/)로 구분]

[정답] [빈칸에 들어갈 정답 표현]

**필수 검증 규칙:**
- 보기의 단어 개수 = 정답의 단어 개수 (반드시 동일)
- 정답은 **반드시 6~10단어**여야 합니다 (5단어 이하나 11단어 이상 절대 금지)
- 보기의 모든 단어는 정답에 있는 단어여야 하며, 추가 단어나 다른 단어가 절대 포함되면 안 됩니다
- 정답의 모든 단어는 보기에 정확히 한 번씩 포함되어야 합니다
- 보기는 정답의 단어를 그대로 가져와서 순서만 섞은 것이어야 합니다
- 단어 개수를 셀 때: 축약형(don't, isn't 등)은 1개로, 하이픈으로 연결된 단어(well-being 등)는 1개로 계산
- 관사(a, an, the), 전치사, 접속사도 모두 1개의 단어로 계산합니다

**✅ 올바른 예시 1:**
- 정답: "an intrinsic tendency to prefer in-group members"
- 정답 단어 분리: ["an", "intrinsic", "tendency", "to", "prefer", "in-group", "members"]
- 단어 개수: 7개
- 보기 생성: 위 7개 단어의 순서만 섞기 → ["an", "intrinsic", "prefer", "in-group", "tendency", "members", "to"]
- 보기: "an / intrinsic / prefer / in-group / tendency / members / to"
- 검증: 보기 7개 = 정답 7개 ✓, 모든 단어 1:1 매칭 ✓, "to" 포함 ✓

**✅ 올바른 예시 2:**
- 정답: "the ability to adapt to changing environments"
- 정답 단어 분리: ["the", "ability", "to", "adapt", "to", "changing", "environments"]
- 단어 개수: 7개 (주의: "to"가 두 번 나옴)
- 보기 생성: 위 7개 단어의 순서만 섞기 → ["changing", "the", "environments", "ability", "adapt", "to", "to"]
- 보기: "changing / the / environments / ability / adapt / to / to"
- 검증: 보기 7개 = 정답 7개 ✓, "to"가 두 번 포함됨 ✓

**✅ 올바른 예시 3:**
- 정답: "they simplify the complex world and make it easier to understand"
- 정답 단어 분리: ["they", "simplify", "the", "complex", "world", "and", "make", "it", "easier", "to", "understand"]
- 단어 개수: 11개
- 보기 생성: 위 11개 단어의 순서만 섞기 → ["world", "simplify", "make", "easier", "they", "the", "complex", "and", "it", "to", "understand"]
- 보기: "world / simplify / make / easier / they / the / complex / and / it / to / understand"
- 검증: 보기 11개 = 정답 11개 ✓, 모든 단어 포함 ✓, "to" 포함 ✓

**❌ 잘못된 예시 1 (절대 금지):**
- 정답: "an intrinsic tendency to prefer in-group members" (7단어)
- 보기: "preference / intrinsic / for / tendency / members / belonging / to / group" (8단어)
- 문제점: 보기 8개 ≠ 정답 7개 ✗, "preference", "for", "belonging" 등이 정답에 없음 ✗

**❌ 잘못된 예시 2 (동의어 추가 금지):**
- 정답: "documenting and sharing daily funny experiences" (6단어)
- 보기: "documenting / and / sharing / humor / funny / experiences / daily" (7단어)
- 문제점: 보기 7개 ≠ 정답 6개 ✗, "humor"가 정답에 없음 ✗ ("funny"의 동의어를 추가하면 안 됨)
- 올바른 보기: "documenting / and / sharing / daily / funny / experiences" (6단어)

**❌ 잘못된 예시 3 (단어 누락 금지):**
- 정답: "they simplify the complex world and make it easier to understand" (11단어)
- 보기: "world / simplify / make / easier / they / the / complex / and / it / understand" (10단어)
- 문제점: 보기 10개 ≠ 정답 11개 ✗, "to"가 보기에서 빠짐 ✗ (작은 단어도 절대 빠뜨리면 안 됨)
- 올바른 보기: "world / simplify / make / easier / they / the / complex / and / it / to / understand" (11단어)

**🔴🔴🔴 생성 전 최종 체크리스트 (모두 ✓ 되어야 함) 🔴🔴🔴**
□ 정답의 단어를 공백으로 분리하여 6~10개인지 확인했는가?
□ 정답의 모든 단어를 리스트로 만들었는가? (예: ["they", "simplify", "the", ...])
□ 보기를 만들 때 정답의 단어를 글자 하나도 바꾸지 않고 그대로 복사했는가?
□ 보기의 단어 개수가 정답과 정확히 일치하는가?
□ 보기의 모든 단어가 정답에 정확히 있는가?
□ 정답의 모든 단어가 보기에 빠짐없이 있는가? (특히 "to", "a", "the" 같은 작은 단어)
□ 같은 단어가 정답에 여러 번 나오면 보기에도 같은 횟수만큼 포함되어 있는가?
□ 동의어나 유사어를 추가하지 않았는가?

영어 지문: ${text}`;
