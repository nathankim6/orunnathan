// Veritas 대립쌍 정보 인터페이스
export interface VeritasPair {
  correct: string;
  incorrect: string;
  category: string;
  explanation?: string;
}

export const getGrammarPrompt = (text: string, veritasPairs?: VeritasPair[]) => {
  // Veritas 대립쌍이 제공된 경우 해당 대립쌍을 기반으로 문제 생성
  const pairsInstruction = veritasPairs && veritasPairs.length > 0
    ? `\n\n**== New Veritas's Choice 대립쌍 (반드시 사용) ==**\n${veritasPairs.map((p, i) => 
        `${i + 1}. [${p.category}] ${p.correct} ↔ ${p.incorrect}`
      ).join('\n')}\n\n위 5개의 대립쌍을 반드시 각 보기에 하나씩 사용하세요. 각 보기는 서로 다른 어법 카테고리를 다뤄야 합니다.\n각 대립쌍에서 지문에 맞는 쪽을 선택하여 밑줄을 그으세요.\n\n`
    : '';

  return `🚨🚨🚨 출력 형식 필수 준수 🚨🚨🚨

아래 형식을 EXACTLY 따라 출력하세요. 한 글자도 빠뜨리지 마세요:

다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?

[영어 지문을 작성하되, 반드시 <u>①단어구문</u> 형식으로 밑줄 표시]

[정답] [번호]
[해설] [해설 내용]

주어진 영어 지문을 활용하여 New Veritas's Choice의 대립쌍을 기반으로 한 어법 문제를 생성하십시오.${pairsInstruction}

**== 필수 준수사항 ==**
1. 제공된 5개의 New Veritas's Choice 대립쌍을 반드시 모두 사용하세요
2. 각 보기(①~⑤)는 서로 다른 어법 카테고리를 다뤄야 합니다
3. 각 대립쌍에서 지문 문맥에 맞는 표현을 밑줄로 표시하세요
4. 틀린 것 찾기 문제의 경우, 정답 보기에는 문맥에 맞지 않는 표현을 사용하세요
5. **CRITICAL**: 지문 자체는 절대 변경하지 마세요. 밑줄 친 부분(오류를 만드는 선택지)을 제외하고는 원문의 모든 단어를 정확히 그대로 유지하세요. 단어 추가, 삭제, 변경 모두 금지입니다.
6. 출력 형식을 정확히 준수하세요 (빈 줄, 괄호, 기호 모두 정확히)
7. **🚨 절대 금지 유형**: "조동사 + 동사원형" 조합 문제는 출제하지 마세요 (예: have been making, will be considered 등). 조동사 뒤에 동사원형이 오는 것은 너무 기본적이어서 변별력이 없습니다. 대신 분사, 관계사, 수일치, 태 등 사고력이 필요한 포인트를 출제하세요.

**== 완전한 어법 포인트 체계 (1000+ 세부 규칙) ==**

**I. 동사 관련 포인트 (200+ 규칙)**
1. **시제 체계**
   - 12시제 정확한 구분 및 혼용 (현재완료 vs 과거완료진행, 미래완료 vs 미래진행 등)
   - 시제 일치 원칙과 예외 (간접화법, 역사적 현재, 불변의 진리)
   - 가정법 시제 (현재/과거/과거완료 가정법, 혼합가정법, 도치가정법)
   - 화법 전환 시 시제 변화 (직접화법↔간접화법)

2. **수일치 체계**
   - **🚨 필수**: 주어-동사 수일치 문제는 주어와 동사 사이에 수식어구(관계사절, 전치사구, 분사구 등)가 삽입되어 6단어 이상 떨어져 있는 "원거리 수일치"인 경우에만 출제하세요. 주어 바로 옆에 동사가 붙어있는 단순 수일치(예: "Seeing are" → "Seeing is")는 너무 쉬우므로 절대 출제하지 마세요.
   - 단수 취급 명사 (news, mathematics, physics, economics, athletics 등)
   - 복수 취급 명사 (people, police, cattle, goods, thanks 등)
   - 집합명사 수일치 (family, team, committee, government, audience 등)
   - 분수/백분율 + of + 명사 구조
   - the number of vs a number of
   - 관계사절 내 동사의 수일치
   - 도치구문에서의 수일치
   - either A or B, neither A nor B 구조
   - A as well as B, together with B 구조

3. **태 (능동/수동)**
   - 자동사의 수동태 불가 (rise, fall, happen, occur, exist 등)
   - 4형식 동사의 수동태 (give, show, tell, buy 등)
   - 5형식 동사의 수동태 (make, let, have, help 등)
   - 감각동사의 능동/수동 구분
   - get 수동태 vs be 수동태
   - 수동태 완료형 (have been done)
   - **중요**: "be being + -ing" 형태와 "be + -ing" 형태의 차이
     * "be + -ing" (현재진행형): 일반적인 진행 중인 동작 (예: are doing, is working)
     * "be being + 과거분사" (수동태 진행형): 진행 중인 수동 상황 (예: is being done, are being examined)
     * "be being + 형용사" (일시적 특성): 평소와 다른 일시적 행동/상태 (예: is being careful, are being rude)
     * **주의**: 문맥에 따라 "be being + -ing"와 "be + -ing"가 모두 문법적으로 가능한 경우가 있으므로, 단순히 형태만으로 틀렸다고 판단하지 말 것

4. **준동사 체계**
   - 부정사의 시제와 태 (완료부정사, 수동부정사)
   - 동명사 vs 현재분사 정확한 구분
   - 분사의 능동/수동, 현재/과거 구분
   - 분사구문의 시제 일치와 주어 일치
   - 독립분사구문과 의미상 주어
   - 완료분사구문 (having done)

**II. 관계사 포인트 (150+ 규칙)**
5. **관계대명사 vs 관계부사**
   - 선행사의 성격과 관계사 선택
   - 불완전문 vs 완전문 판단법
   - where = in/at which, when = in/at which
   - why = for which, how 관계부사

6. **관계사 생략과 제약**
   - 목적격 관계대명사 생략 조건
   - 전치사 + 관계대명사 구조에서 생략 불가
   - 계속적 용법에서 생략 불가
   - 주격 관계대명사 생략 불가

7. **특수 관계사**
   - what = the thing(s) that
   - as 관계대명사 (such A as, the same A as)
   - than 관계대명사
   - but 관계대명사 (부정어 + 명사 + but)
   - 복합관계사 (whatever, whoever, whichever 등)

**III. 병렬구조 포인트 (120+ 규칙)**
8. **등위접속사 병렬**
   - and, or, but 연결 시 형태 매칭
   - 동사 병렬 (시제, 태, 형태 일치)
   - 형용사/부사 병렬
   - 전치사구 병렬
   - 절 병렬

9. **상관접속사 병렬**
   - not only A but also B
   - either A or B / neither A nor B
   - both A and B
   - not A but B
   - B as well as A

10. **비교구문 병렬**
    - as + 형/부 + as 구조
    - more/less + 형/부 + than 구조
    - the + 비교급, the + 비교급
    - prefer A to B

**IV. 수식관계 포인트 (180+ 규칙)**
11. **형용사 vs 부사**
    - 연결동사 + 형용사 (보어)
    - 일반동사 + 부사 (수식어)
    - -ly 부사 vs -ly 형용사 (friendly, lovely, lively 등)
    - 형용사의 명사 수식 vs 부사의 동사/형용사 수식

12. **분사 수식**
    - 현재분사 vs 과거분사 구분 원리
    - 감정동사의 -ing/-ed 형태 (interesting/interested)
    - 분사의 전치 수식 vs 후치 수식
    - 분사구의 명사 수식

13. **부정사 수식**
    - 형용사적 용법 (to부정사의 명사 수식)
    - 부사적 용법 (목적, 결과, 감정의 원인)
    - 명사적 용법 (주어, 목적어, 보어)
    - too ~ to vs so ~ as to

14. **전치사구/부사구 수식**
    - 전치사구의 명사/동사 수식
    - 부사구의 동사/문장 수식
    - 장소 부사구 vs 시간 부사구 어순

**V. 접속관계 포인트 (100+ 규칙)**
15. **등위접속사 vs 종속접속사**
    - and, but, or vs because, although, while
    - 절과 절의 연결 원리
    - 접속사 중복 사용 금지

16. **명사절 접속사**
    - that절 (생략 가능/불가능 조건)
    - whether vs if 구분
    - 의문사 + to부정사 vs 의문사절

17. **부사절 접속사**
    - 시간: when, while, as, before, after, since, until
    - 이유: because, since, as, for
    - 조건: if, unless, provided, as long as
    - 양보: although, though, even though, while
    - 결과: so that, such that
    - 비교: as, than

18. **전치사 vs 접속사**
    - during vs while
    - because of vs because
    - in spite of vs although
    - instead of vs instead

**VI. 특수구문 포인트 (150+ 규칙)**
19. **강조구문**
    - It is/was ~ that 강조구문
    - 가주어 진주어 vs 강조구문 구분
    - What 강조구문
    - 부분강조 vs 문장강조

20. **도치구문**
    - 부정어 도치 (Never, Seldom, Hardly 등)
    - Only 도치 (Only when, Only if 등)
    - So/Such 도치
    - Here/There 도치
    - 가정법 도치 (Were I, Had I, Should I)

21. **생략구문**
    - 동사 생략 (and 병렬에서)
    - 접속사 생략 (that 생략 조건)
    - 관계사 생략
    - 비교구문에서 생략

22. **삽입/동격구문**
    - 삽입절 (I think, I believe 등)
    - 동격 that절
    - 동격의 of (the fact that)
    - 명사구 동격

**VII. 조동사 포인트 (80+ 규칙)**
23. **조동사 + have + p.p.**
    - must have p.p. (과거 추측)
    - should have p.p. (과거 당위)
    - could have p.p. (과거 가능성)
    - might have p.p. (과거 추측)
    - would have p.p. (가정법 과거완료)

24. **조동사 의미 구분**
    - can vs be able to
    - may vs might 확률 차이
    - shall vs will 미래 표현
    - should vs ought to 당위성

**VIII. 가산/불가산 명사 (60+ 규칙)**
25. **불가산 명사**
    - 추상명사 (happiness, information, advice 등)
    - 물질명사 (water, air, gold 등)
    - 집합명사 (furniture, equipment, luggage 등)

26. **가산명사 단복수**
    - 불규칙 복수형 (child-children, foot-feet 등)
    - 단복수 동형 (sheep, fish, deer 등)
    - 복수만 사용 (glasses, scissors, clothes 등)

**== 🔴 수능/내신 빈출 어법 출제 포인트 TOP 30 (오답 보기 필수 활용) ==**
**오답 보기(정답)는 반드시 아래 수능 기출 빈출 문법 포인트 중에서 선택하세요:**

| 순위 | 문법 포인트 | 대립쌍 예시 | 빈도 |
|------|------------|------------|------|
| 1 | 현재분사 vs 과거분사 (능동/수동) | -ing ↔ -ed (exciting/excited, used/using, living/lived) | ★★★★★ |
| 2 | 동명사/분사 vs 원형/명사 | doing ↔ do, building ↔ build | ★★★★★ |
| 3 | 형용사 vs 부사 (-ly 구분) | 연결동사+형용사 ↔ 일반동사+부사 (considerable/considerably) | ★★★★★ |
| 4 | 관계대명사 what vs 접속사 that | what(선행사 포함) ↔ that(선행사 필요) | ★★★★★ |
| 5 | 주어-동사 수일치 (is/are) | 원거리 수일치: 주어와 동사 사이 수식어구 삽입 | ★★★★★ |
| 6 | 능동태 vs 수동태 (be p.p.) | increase ↔ be increased, kill ↔ be killed | ★★★★☆ |
| 7 | 동사 3인칭 단수 -s/-es 수일치 | constitute ↔ constitutes, include ↔ includes | ★★★★☆ |
| 8 | to부정사 vs 동명사 | to do ↔ doing (목적어 자리, enjoy/avoid vs want/hope) | ★★★★☆ |
| 9 | 관계대명사 vs 관계부사 (which/where) | which(불완전문) ↔ where(완전문) | ★★★★☆ |
| 10 | 수일치 was/were | 단수주어+was ↔ 복수주어+were | ★★★☆☆ |
| 11 | 분사구문 (독립분사구문 포함) | Remaining ↔ Remained, Having done ↔ Done | ★★★☆☆ |
| 12 | 대명사 vs 재귀대명사 | them ↔ themselves, you ↔ yourself | ★★★☆☆ |
| 13 | 사역/지각동사 목적보어 | let him go ↔ let him to go, see him do ↔ see him doing | ★★★☆☆ |
| 14 | 병렬구조 (and/or/but 전후 동일 형태) | to A, B, and C → 형태 일치 필수 | ★★★☆☆ |
| 15 | 가주어/가목적어 it | It is important to ↔ What is important to | ★★★☆☆ |
| 16 | be동사 vs 대동사 do | as they are ↔ as they do | ★★★☆☆ |
| 17 | 관계대명사 which vs that (계속적/제한적) | , which(계속적) ↔ that(제한적) | ★★★☆☆ |
| 18 | 접속사 vs 전치사 (because/because of) | because+절 ↔ because of+명사구 | ★★★☆☆ |
| 19 | 관계대명사 which vs what (선행사 유무) | which(선행사 있음) ↔ what(선행사 없음) | ★★★☆☆ |
| 20 | 관계대명사 계속적 용법 (, which) | , which ↔ , that(불가) | ★★☆☆☆ |
| 21 | 5형식 동사 목적보어 (to부정사/원형) | expect him to die ↔ make him die | ★★☆☆☆ |
| 22 | 복합관계사 (-ever) | whatever ↔ what, whoever ↔ who | ★★☆☆☆ |
| 23 | 도치구문 (부정어/Only/So 도치) | Never has he ↔ Never he has | ★★☆☆☆ |
| 24 | 의문사+to부정사 | what to do ↔ how to do | ★★☆☆☆ |
| 25 | 접속사 vs 전치사 (while/during) | while+절 ↔ during+명사구 | ★★☆☆☆ |
| 26 | 비교급/동등비교 (than/as) | more than ↔ as...as, higher than ↔ higher as(오류) | ★★☆☆☆ |
| 27 | 의문사 how vs what | how+형/부 ↔ what+명사 | ★★☆☆☆ |
| 28 | 가정법 시제 | if I were ↔ if I was, had p.p. ↔ p.p. | ★★☆☆☆ |
| 29 | 동격 that vs 관계대명사 that | the fact that(동격) ↔ the fact which(관계사) | ★★☆☆☆ |
| 30 | 동명사 관용구 | prevent/keep/stop from -ing ↔ doing | ★★☆☆☆ |

**오답 설계 원칙:**
- 정답 보기의 오류는 위 빈출 포인트에서 선택하여, 학생이 실제 수능에서 마주칠 법한 함정을 제시
- 단순한 철자 오류나 비현실적 오류 금지 — 학생이 고민할 수 있는 자연스러운 오류만 출제
- 예: "interested → interesting" (감정분사 혼동), "which → where" (관계사 혼동), "are → is" (수일치 혼동)

**== 출제 의무사항 ==**
**1. New Veritas's Choice 대립쌍 활용:**
- 제공된 5개의 대립쌍을 각 보기(①~⑤)에 하나씩 정확히 배치하세요
- **🚨 필수: 5개의 보기는 반드시 서로 다른 어법 카테고리를 다뤄야 합니다 (예: ①시제, ②관계사, ③분사, ④수일치, ⑤병렬구조 등)**
- 같은 어법 카테고리가 중복되면 안 됩니다 (예: 시제+시제, 관계사+관계사 ❌)
- 지문에서 각 대립쌍이 적용될 수 있는 위치를 찾아 밑줄을 그으세요
- **🚨 중요**: 한 문장에 보기를 최대 1개만 배치하세요. 불가피한 경우(지문이 매우 짧을 때)를 제외하고 동일 문장에 2개 이상의 보기가 들어가면 안 됩니다. 5개 보기를 5개의 서로 다른 문장에 분산 배치하는 것이 원칙입니다.
- 예: "틀린 것 찾기" 문제라면, 정답 보기에는 대립쌍 중 틀린 쪽을 사용하고, 나머지 보기에는 올바른 쪽을 사용하세요

**2. 밑줄 길이 다양화 (난이도 조절):**
- **🚨 필수: 밑줄 길이는 최소 4단어 이상이어야 합니다 (4~15단어)**
- **🚨 3단어 이하의 밑줄은 절대 금지입니다. 반드시 4단어 이상으로 설정하세요.**
- 짧은 밑줄 (4~6단어): 명확한 문법 포인트 (예: <u>①that you inhale are</u>)
- 중간 밑줄 (6~10단어): 문맥 파악 필요 (예: <u>②that the evidence clearly supports this theory</u>)
- 긴 밑줄 (11~15단어): 고난도 문제 (예: <u>③which has been extensively studied by researchers in recent years</u>)
- **모든 보기의 밑줄 길이가 비슷하면 안 됩니다. 다양한 길이를 혼합하세요.**

**3. 해설 작성 원칙:**
- **중요**: 정답 보기에 대한 해설만 작성하세요
- 정답이 아닌 나머지 보기에 대한 해설은 작성하지 마세요
- 해설은 다음을 포함해야 합니다:
  a) 어법 카테고리명 (예: [시제], [수일치], [관계사] 등)
  b) 대립쌍의 정확한 문법 원리 설명
  c) 해당 보기가 정답인 이유 (틀린 것 찾기의 경우 왜 틀렸는지, 맞는 것 찾기의 경우 왜 맞는지)
  d) 틀린 것 찾기 문제의 경우 올바른 형태 제시
- **중요**: 해설에서 작은따옴표('')로 인용한 표현은 반드시 보기의 밑줄 친 부분과 정확히 일치해야 합니다
- 해설 작성 시 빈 줄 없이 연속적으로 작성하세요

**4. 문제 구성 원칙:**
- **중요**: 정답은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ④, ⑤에 편중되지 않도록 하고 ①, ②, ③도 충분히 선택되도록 하세요
- 각 보기는 New Veritas's Choice 대립쌍을 정확히 반영해야 합니다

**🚨🚨🚨 CRITICAL: 출력 형식 (필수 준수) 🚨🚨🚨**

출력 시작은 반드시 다음 텍스트로:
"다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?"

그 다음 빈 줄 하나를 넣고 영어 지문을 작성하세요.

**밑줄 표시 절대 규칙 (위반 시 재생성):**
- 모든 ①~⑤는 반드시 <u>①단어구문</u> 형식만 사용
- *, **, 또는 기타 기호로 밑줄 표시 절대 금지
- 번호만 쓰기 절대 금지
- **🚨 밑줄 길이: 4~15단어 다양하게 (3단어 이하 금지, 모두 같은 길이 금지)**
- **🚨 한 문장에 보기 1개씩 배치 (불가피한 경우 제외)**

**올바른 예시 (반드시 이 형식 사용):**
다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?

Scientists have confirmed <u>①that Mars once had more water</u> than expected. We can apply <u>②a special growing system that has been tested</u> successfully. The soil and <u>③the weak gravity of Mars are need</u> to be overcome. A scientist predicts <u>④that there will be 25 to 50 basic</u> food items. Until there <u>⑤are enough plants to produce sufficient amount</u> of oxygen.

[정답] ③
[해설] 정답은 ③번입니다. ③ [수일치]: 'the weak gravity of Mars'는 단수이므로 'are need'가 아닌 'needs'를 사용해야 합니다.

**절대 금지 (이런 형식 사용 금지):**
❌ Scientists have confirmed *①that Mars* (asterisk 금지)
❌ Scientists have confirmed **①that Mars** (double asterisk 금지)
❌ Scientists have confirmed ①that Mars (밑줄 없음 금지)

**필수 체크리스트:**
□ 첫 줄: "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?"
□ 모든 ①~⑤에 <u> 태그 있음
□ asterisk 사용 안 함

**형식 2: 맞는 것 찾기**
다음 글의 밑줄 친 부분 중, 어법상 맞는 것은?

🚨 반드시 <u>①텍스트</u> 형식으로 밑줄을 표시하세요! 🚨

[영어 지문을 작성하되, 모든 보기를 <u>①단어구문</u>, <u>②단어구문</u>, <u>③단어구문</u>, <u>④단어구문</u>, <u>⑤단어구문</u> 형식으로 반드시 밑줄 표시. 각 밑줄은 4~15단어 길이. 한 문장에 보기 1개씩 배치]

[정답] ②
[해설] 정답은 ②번입니다. ② [어법 카테고리]: 대립쌍 [correct/incorrect] 중 'correct'가 사용되었으며, 이는 [상세한 문법 원리 설명]이므로 적절합니다.

**형식 3: 네모 선택지**
다음 글의 (A), (B), (C)의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것은?

[영어 지문에 (A), (B), (C) 표시]

       (A)        (B)        (C)
① 선택지1 …… 선택지1 …… 선택지1
② 선택지1 …… 선택지1 …… 선택지2  
③ 선택지1 …… 선택지2 …… 선택지1
④ 선택지2 …… 선택지2 …… 선택지1
⑤ 선택지2 …… 선택지2 …… 선택지2

[정답] ④
[해설] 정답은 ④번입니다.
(A): [어법 카테고리] - 대립쌍 [correct/incorrect] 중 문맥상 'correct'가 적절합니다. [상세한 문법 원리와 선택 이유]
(B): [어법 카테고리] - 대립쌍 [correct/incorrect] 중 문맥상 'correct'가 적절합니다. [상세한 문법 원리와 선택 이유]
(C): [어법 카테고리] - 대립쌍 [correct/incorrect] 중 문맥상 'correct'가 적절합니다. [상세한 문법 원리와 선택 이유]

**형식 3: 네모 선택지**
다음 글의 (A), (B), (C)의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것은?

[원문 텍스트에 (A), (B), (C) 표시]

       (A)        (B)        (C)
① 선택지1 …… 선택지1 …… 선택지1
② 선택지1 …… 선택지1 …… 선택지2  
③ 선택지1 …… 선택지2 …… 선택지1
④ 선택지2 …… 선택지2 …… 선택지1
⑤ 선택지2 …… 선택지2 …… 선택지2

[정답] ④
[해설] 정답은 ④번입니다.
(A): [어법 카테고리] - 대립쌍 [correct/incorrect] 중 문맥상 'correct'가 적절합니다. [상세한 문법 원리와 선택 이유]
(B): [어법 카테고리] - 대립쌍 [correct/incorrect] 중 문맥상 'correct'가 적절합니다. [상세한 문법 원리와 선택 이유]
(C): [어법 카테고리] - 대립쌍 [correct/incorrect] 중 문맥상 'correct'가 적절합니다. [상세한 문법 원리와 선택 이유]

**주의사항:**
- 위 형식에서 벗어나지 마세요
- 빈 줄, 대괄호, 번호 매기기 등 모든 형식 요소를 정확히 따르세요
- 해설에서 포인트명을 반드시 명시하세요

INPUT: ${text}`;
};
