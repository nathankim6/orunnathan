export const getVocabularySelectionPrompt = (text: string) => `주어진 영어 지문을 바탕으로 **(A), (B), (C) 네모(괄호) 안 어휘 선택형** 객관식 문제를 만들어주세요.

## 문제 형식 (수능/모의고사 [30]번 변형 — 네모형 어휘)
- 문제 지시문: "(A), (B), (C)의 각 네모 안에서 문맥에 맞는 낱말로 가장 적절한 것은?"
- 원문 지문에서 3개 위치를 골라 (A), (B), (C)로 표시
- 각 위치에 [문맥상 적절한 단어 / 헷갈리기 쉬운 부적절한 단어] 두 선택지를 제시
- 5개의 선택지(①~⑤)를 표 형태로 제시, 각 선지는 (A)-(B)-(C) 조합

## 어휘 쌍(pair) 선정 원칙 (가장 중요)
각 (A)/(B)/(C)의 두 단어는 다음 중 **하나의 패턴**을 따라야 합니다:

1. **형태가 유사한 혼동어 (paronym/형태 혼동)**
   - characters / characteristics (등장인물 / 특성)
   - affection / infection (애정 / 감염)
   - source / sauce (원천 / 소스)
   - accompanied / accomplished (수반된 / 성취된)
   - respectively / respectfully (각각 / 공손하게)
   - selection / suspicion (선택 / 의심)
   - effects / compacts (효과 / 협정)
   - inattention / attention (부주의 / 주의) ← 접두사 in- 추가형
   - imitate / hesitate (모방하다 / 망설이다)
   - trusted / burst (신뢰받는 / 터진)
   - preferring / transferring (선호하는 / 옮기는)

2. **명백한 반의어 (정반대 의미)**
   - attention ↔ inattention
   - increase ↔ decrease
   - enable ↔ disable
   - reveal ↔ conceal

3. **문맥상 한 쪽만 자연스러운 의미 짝**
   - flight / sleep (비행 / 잠) — "새가 ___ 중에만 보이는 깃털"
   - hesitate / imitate (망설이다 / 모방하다) — "다른 동물의 보호색을 ___"

**❌ 절대 금지 (어법 차원 차이)**: -ed/-ing, 단수/복수 동사, to부정사/동명사 등 **어법** 변별은 금지. 이것은 어법 문제가 아닌 **어휘 의미** 변별 문제입니다.

## 출제 절차
1. 원문에서 의미 변별이 명확한 3개 단어를 선정 (지문 앞/중/뒤 고르게 분포)
2. 각각에 대해 위 패턴 중 하나로 혼동어 / 반의어를 짝지어 [정답 / 오답] 또는 [오답 / 정답] 형태로 제시 (순서는 랜덤)
3. 정답 (A)-(B)-(C) 1개 조합 + 오답 4개 조합을 표로 구성, 총 5개 선지
4. **정답 번호는 ①~⑤ 중 랜덤** (특정 번호 편중 금지)
5. 5개 선지의 (A)/(B)/(C) 값이 두 후보에 걸쳐 다양하게 분포되도록 구성

## 출력 형식 (정확히 이대로, 다른 텍스트 금지)

(A), (B), (C)의 각 네모 안에서 문맥에 맞는 낱말로 가장 적절한 것은?

[지문 본문 — (A)[X / Y], (B)[X / Y], (C)[X / Y] 형식으로 3곳에 표시. 그 외 원문은 100% 그대로 유지]

|  | (A) | (B) | (C) |
|---|---|---|---|
| ① | 단어 | 단어 | 단어 |
| ② | 단어 | 단어 | 단어 |
| ③ | 단어 | 단어 | 단어 |
| ④ | 단어 | 단어 | 단어 |
| ⑤ | 단어 | 단어 | 단어 |

[정답] ③

[해설]
(A) [정답 단어] 선택 이유 — 문맥상 "..."이므로 [오답 단어](뜻)가 아니라 [정답 단어](뜻)가 적절.
(B) [정답 단어] 선택 이유 — ...
(C) [정답 단어] 선택 이유 — ...

## 실제 수능형 예시

(A), (B), (C)의 각 괄호 안에서 문맥에 맞는 낱말로 가장 적절한 것은?

A colleague of mine, Andrew, went to see Jurassic Park. In one scene the main (A)[characters / characteristics] wait with growing terror as a Tyrannosaurus rex approaches. They can hear him, but can't see him in the pouring tropical rain. Andrew was engrossed. At one point he could even feel rain wetting his face where he sat. Just then, people around him began screaming. He thought: Wow! These (B)[compacts / effects] are really incredible! Then he glanced up and saw that part of the ceiling had fallen — the "rain" was water from the (C)[trusted / burst] pipes.

|  | (A) | (B) | (C) |
|---|---|---|---|
| ① | characters | effects | burst |
| ② | characters | effects | trusted |
| ③ | characters | compacts | burst |
| ④ | characteristics | effects | trusted |
| ⑤ | characteristics | compacts | burst |

[정답] ①

[해설]
(A) characters: 영화의 "주인공들"이 공포 속에서 기다리는 장면이므로 characteristics(특성)가 아닌 characters(등장인물).
(B) effects: 영화의 "특수효과"가 정말 놀랍다는 감탄이므로 compacts(협정)가 아닌 effects.
(C) burst: 천장이 무너지면서 "터진" 파이프에서 나온 물이라는 문맥이므로 trusted가 아닌 burst.

## 절대 준수
- 원문 추가/삭제/수정 금지. 3개 단어 자리에만 (A)[X / Y] 표기.
- 5개 선지의 (A)-(B)-(C) 조합은 모두 서로 달라야 함.
- 정답은 정확히 1개 — 다른 4개 조합은 최소 1개의 부적절한 선택을 반드시 포함.

영어 지문: ${text}`;
