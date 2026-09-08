export const getGrammarSelectionPrompt = (text: string) => `주어진 영어 지문을 바탕으로 **(A), (B), (C) 네모(괄호) 안 어법 선택형** 객관식 문제를 만들어주세요.

## 문제 형식 (수능/모의고사 [29]번 변형 — 네모형 어법)
- 문제 지시문: "(A), (B), (C)의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것은?"
- 원문 지문에서 3개의 어법 포인트를 선정하여 (A), (B), (C)로 표시
- 각 포인트에 [올바른 표현 / 틀린 표현] 두 선택지를 괄호 안에 제시 (순서는 랜덤)
- 5개의 선지(①~⑤)를 표 형태로 제시, 각 선지는 (A)-(B)-(C) 조합

## 어법 쌍 선정 원칙
3개 포인트는 **서로 다른 어법 카테고리**에서 1개씩 선정. 다음 카테고리 중에서 선택:
- 현재분사 vs 과거분사 (감정/수동: annoying/annoyed, leaving/left, Sitting/Sat, placed/placing)
- 형용사 vs 부사 (-ly: dry/dryly, shy/shyly, correct/correctly)
- 현재분사 vs to부정사 vs 원형 (speak/spoken, listening/to listen)
- 능동 vs 수동 (be p.p.)
- 단수동사 vs 복수동사 — **원거리 수일치**만 (save/saves, is/are)
- 지시사 단/복수 (That/Those, This/These)
- 관계대명사 what vs 접속사 that
- 관계대명사 vs 관계부사 (which/where)
- 접속사 vs 전치사 (Although/Despite, Because/Because of, While/During)
- 동사 시제 (blamed/blames)
- to부정사 vs as (~ to be relaxed)
- 재귀대명사 vs 대명사

**❌ 절대 금지:**
- 조동사 + 동사원형 단순 변별 (will be / will is 등 — 너무 쉬움)
- 같은 카테고리 중복 (예: 3곳 모두 분사)
- 명백한 철자 오류

## 출제 절차
1. 원문에서 어법 포인트 3곳 선정 (지문 앞/중/뒤 고르게 분포)
2. 각 포인트에 [정답 / 오답] 또는 [오답 / 정답] 형태로 두 후보를 랜덤 순서로 제시
3. 정답 조합 1개 + 오답 4개 조합 = 총 5개 선지 (모두 달라야 함)
4. **정답 번호는 ①~⑤ 중 랜덤** 분포

## 출력 형식 (정확히 이대로, 다른 텍스트 금지)

(A), (B), (C)의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것은?

[지문 본문 — (A)[X / Y], (B)[X / Y], (C)[X / Y] 3곳 표시. 그 외 원문은 100% 그대로 유지]

|  | (A) | (B) | (C) |
|---|---|---|---|
| ① | 표현 | 표현 | 표현 |
| ② | 표현 | 표현 | 표현 |
| ③ | 표현 | 표현 | 표현 |
| ④ | 표현 | 표현 | 표현 |
| ⑤ | 표현 | 표현 | 표현 |

[정답] ②

[해설]
(A) [정답 표현]: 어법 카테고리명 + 문법 근거 한 문장.
(B) [정답 표현]: 어법 카테고리명 + 문법 근거 한 문장.
(C) [정답 표현]: 어법 카테고리명 + 문법 근거 한 문장.

## 실제 수능형 예시

(A), (B), (C)의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것은?

Do your eyes often feel (A)[dry / dryly] or have a stinging sensation? You may have dry eye syndrome. If (B)[leaving / left] untreated, it may weaken vision and lead to eye infections. Tears are essential for maintaining healthy eyes. Tears keep eyes moist and clean. If too few tears are produced or their chemical composition is altered, the (C)[annoyed / annoying] symptoms of dry eye syndrome may develop.

|  | (A) | (B) | (C) |
|---|---|---|---|
| ① | dry | leaving | annoyed |
| ② | dry | left | annoying |
| ③ | dryly | leaving | annoyed |
| ④ | dryly | left | annoying |
| ⑤ | dry | leaving | annoying |

[정답] ②

[해설]
(A) dry: [형용사 vs 부사] feel은 연결동사(linking verb)이므로 보어로 형용사 dry.
(B) left: [분사] 주절의 주어 it(=dry eye syndrome)이 "방치되는" 수동 관계이므로 과거분사 left (=if it is left untreated).
(C) annoying: [감정분사] 증상이 사람을 짜증나게 "만드는" 주체이므로 현재분사 annoying.

## 절대 준수
- 원문 추가/삭제/수정 금지. 3개 어법 포인트 자리에만 (A)[X / Y] 표기.
- 5개 선지의 (A)-(B)-(C) 조합은 모두 서로 달라야 함.
- 정답은 정확히 1개 — 정답 외 4개 조합은 최소 1개의 어법 오류를 반드시 포함.

영어 지문: ${text}`;
