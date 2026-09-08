export const getGrammarCorrectionUnderlinePrompt = (text: string) => `주어진 영어 지문을 바탕으로 밑줄 친 부분 중 어법상 틀린 것을 찾아 고치는 서답형 문제를 만들어주세요.

## 문제 형식
- 문제 지시문: "다음 밑줄 친 부분 중 어법상 틀린 것을 모두 찾아 바르게 고쳐 쓰시오."
- 원문 지문을 그대로 사용하되, 지문 내 핵심 구문 8~12개에 번호를 매기고 밑줄 처리
- 밑줄 친 부분 중 3~4개에 어법 오류를 의도적으로 삽입
- 나머지 밑줄 부분은 원문 그대로 유지 (정답이 아닌 함정)

## 밑줄 구문 선정 규칙
1. 각 밑줄 구문은 최소 3단어 이상, 최대 10단어 이내로 설정
2. 밑줄 구문은 문장의 핵심 문법 요소를 포함해야 함
3. 밑줄 구문은 지문 전체에 고르게 분포 (한 문장에 몰리지 않도록)
4. 밑줄 구문 사이에는 밑줄이 없는 일반 텍스트가 있어야 함

## 오류 삽입 규칙
1. 3~4개의 어법 오류를 삽입할 것 (전체 밑줄 중 일부만 틀리게)
2. 각 오류는 서로 다른 문법 카테고리에서 출제할 것
3. 원문의 올바른 표현을 어법상 틀린 표현으로 변경

## 출제 가능한 어법 포인트 (이 중에서 3~4개를 선택)
- 현재분사 vs 과거분사 (능동/수동)
- 관계대명사 vs 관계부사 (which/where, what/that 등)
- 주어-동사 수일치 (수식어구가 삽입되어 6단어 이상 떨어진 원거리 수일치만)
- 능동태 vs 수동태
- to부정사 vs 동명사
- 분사구문 (현재분사/과거분사)
- 병렬구조
- 접속사 vs 전치사 (because/because of, although/despite 등)
- 형용사 vs 부사
- 대명사/재귀대명사
- 가주어/가목적어 it
- 비교급/최상급

## 금지 사항
- 조동사 + 동사원형 조합의 단순 문제는 출제하지 않음
- 단순 철자 오류는 출제하지 않음
- 원문에 없는 문장을 추가하거나 삭제하지 않음
- HTML 태그(<u>, <b> 등)를 절대 사용하지 않음
- '*' 기호를 사용하지 않음

## 출력 형식 (반드시 이 형식을 정확히 따를 것)

다음 밑줄 친 부분 중 어법상 틀린 것을 모두 찾아 바르게 고쳐 쓰시오.

[지문 본문을 그대로 쓰되, 밑줄칠 구문 앞에 번호)를 붙이고 해당 구문을 [[대괄호 두 개]]로 감싸서 표시]

예시 출력:
Students often mistake familiarity with true mastery, 1) [[creating a dangerous "illusion of competence"]] 2) [[where recognized information feels]] like genuine knowledge, but they struggle 3) [[when asked to recall or apply it independently]]. This cognitive bias, 4) [[strengthened by passive study methods]], 5) [[leads learners]] to overestimate their understanding. Teaching materials (even informally or imaginatively) 6) [[actively counters this illusion]] by requiring deep processing, active recall, structured organization, and revealing gaps in knowledge. It introduces powerful methods like teaching imaginary students, peer-teaching in study groups, 7) [[employing the Feynman Technique]], 8) [[and written explanations for others]]. 9) [[Ultimately, adopt the teacher mindset]] 10) [[transform surface familiarity]] into real mastery, 11) [[exposing and filling gaps in knowledge]] and ensuring solid, reliable understanding.

→ ＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿

[정답]
6) actively counters → actively counter (주어-동사 수일치: 주어 Teaching materials가 복수)
9) Ultimately, adopt → Ultimately, adopting (분사구문: 부사절을 분사구문으로 전환)
3) when asked to recall → when asking to recall (능동/수동: 주어 they가 직접 recall하는 능동)

[해설]
각 오류에 대한 상세한 문법 설명을 제공하세요.
정답이 아닌 밑줄 구문들이 왜 올바른 표현인지도 간략히 설명하세요.

영어 지문: ${text}`;
