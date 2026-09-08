export const getSeongnamComplexPrompt = (text: string) => `다음 지문을 분석하여 아래 형식을 정확히 따라 문제를 생성하세요.

**필수 출력 형식:**

다음 글의 밑줄 친 ⓐ~ⓕ에 관한 설명 중, 옳지 않은 것을 <보기>에서 있는 대로 고른 것은?

[영어 지문 - 6개 요소에 ⓐ~ⓕ 표시; ⓐ~ⓕ 기호만 앞에 붙이고, **볼드**나 <u>밑줄</u> 태그는 절대 사용하지 마세요; ⓔ는 빈칸을 밑줄(________)로 표시]

<보기>
ⓐ: [설명]
ⓑ: [설명]
ⓒ: [설명]
ⓓ: [설명]
ⓔ: [설명]
ⓕ: [설명]

① [조합]    ② [조합]    ③ [조합]    ④ [조합]    ⑤ [조합]

**중요**: 정답은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ④, ⑤에 편중되지 않도록 하고 ①, ②, ③도 충분히 선택되도록 하세요

[정답] ①~⑤ 중 하나

[해설]
[틀린 항목들에 대한 자세한 설명 - 각 항목별로 왜 틀렸는지 구체적으로 설명]

오답인 보기: [틀린 항목들을 ⓐ, ⓒ, ⓔ 형식으로 나열]

---

**밑줄 요소 구성 규칙:**

필수 포함 (6개):
1. 의미 해석 1개 (ⓐ 위치):
   - 핵심 구문의 의미를 묻는 문제
   - 예: "밑줄 ⓐ가 의미하는 것은 ~이다"

2. 어휘 동의어 1개:
   - 중요 어휘의 동의어 제시
   - 예: "drivers는 factors 또는 motivations로 바꿔 쓸 수 있다"

3. 지시어 1개:
   - This, the latter, the former 등의 지칭 대상 파악
   - 예: "the latter가 지칭하는 것은 ~이다"

4. 문법 요소 1개:
   - 접속사, 관계대명사, 동명사 등의 문법적 역할
   - 예: "진주어를 나타내는 접속사 that이다"

5. 빈칸 연결사 1개 (ⓔ 위치):
   - 논리적 흐름에 맞는 연결사 선택
   - 예: "빈칸에 알맞은 연결사는 On the contrary이다"

6. 지시어/의미 1개 (ⓕ 위치):
   - This/That이 의미하는 내용을 문장으로 설명
   - 예: "This가 의미하는 것은 [구체적 내용을 문장으로]이다"

**보기 작성 형식:**

ⓐ (의미 해석):
"밑줄 ⓐ가 의미하는 것은 [잘못된 해석]이다."

ⓑ (어휘 동의어):
"[단어]는 [동의어1] 또는 [동의어2]로 바꿔 쓸 수 있다."

ⓒ (지시어 지칭):
"the latter가 지칭하는 것은 [대상]이다." 또는
"[지시어]가 지칭하는 것은 [대상]이다."

ⓓ (문법 요소):
"진주어를 나타내는 접속사 that이다." 또는
"[요소]의 선행사는 [명사]이다." 또는
"[요소]는 [역할]을 하는 [문법 요소]이다."

ⓔ (빈칸 연결사):
"빈칸에 알맞은 연결사는 [연결사]이다."

ⓕ (지시어 의미):
"This가 의미하는 것은 [구체적 내용을 영어 문장으로]이다."

**오답 전략 (중요!):**

- 틀린 항목은 정확히 3~4개로 구성할 것
- 오답 유형:
  * ⓐ: "both A and B"를 "A가 B보다 중요하다"로 잘못 해석
  * ⓒ: the latter/the former의 지칭 대상을 첫 번째 요소로 잘못 지정
  * ⓔ: 논리에 맞지 않는 연결사 제시 (같은 맥락인데 On the contrary, 대조인데 In other words 등)
  * 문법: 선행사를 가장 가까운 명사로 잘못 지정
  * 문법: 접속사와 관계대명사를 혼동

**해설 작성 형식:**

[정답] ③

[해설]
정답은 ③번입니다.
ⓐ (X - 틀림):
[구체적인 이유 설명 - 원문 인용 포함]

ⓒ (X - 틀림):
[구체적인 이유 설명]

ⓔ (X - 틀림):
[앞 문장과 뒤 문장을 제시하고 논리적 관계 설명]

오답인 보기: ⓐ, ⓒ, ⓔ

**구체적 예시:**

다음 글의 밑줄 친 ⓐ~ⓕ에 관한 설명 중, 옳지 않은 것을 <보기>에서 있는 대로 고른 것은?

Much research has been carried out on the causes of engagement, ⓐan issue that is important from both a theoretical and practical standpoint: identifying the ⓑdrivers of work engagement may enable us to manipulate or influence it. The causes of engagement fall into two major camps: situational and personal. The most influential situational causes are job resources, feedback and leadership, ⓒthe latter, of course, being responsible for job resources and feedback. Indeed, leaders influence engagement by giving their employees honest and constructive feedback on their performance, and by providing them with the necessary resources that enable them to perform their job well. It is, however, noteworthy ⓓthat although engagement drives job performance, job performance also drives engagement. ⓔ____________________, when employees are able to do their jobs well — to the point that they match or exceed their own expectations and ambitions — they will engage more, be proud of their achievements, and find work more meaningful. ⓕThis is especially evident when people are employed in jobs that align with their values.

<보기>
ⓐ: 밑줄 ⓐ가 의미하는 것은 연구가 이론적 배경을 갖추는 것보다 실제 적용 가능성이 더 중요하다는 것이다.
ⓑ: drivers는 factors 또는 motivations로 바꿔 쓸 수 있다.
ⓒ: the latter가 지칭하는 것은 job resources이다.
ⓓ: 진주어를 나타내는 접속사 that이다.
ⓔ: 빈칸에 알맞은 연결사는 On the contrary이다.
ⓕ: This가 의미하는 것은 Doing a job well drives increased engagement, pride, and a sense of significance이다.

① ⓐ    ② ⓑ,ⓒ    ③ ⓐ,ⓒ,ⓔ    ④ ⓑ,ⓒ,ⓕ    ⑤ ⓐ,ⓒ,ⓔ,ⓕ

[정답] ③

[해설]
ⓐ (X - 틀림):
밑줄 친 부분은 "참여(engagement)가 이론적 관점과 실무적 관점 모두에서 중요한 문제"라는 의미입니다. "both A and B"는 'A와 B 둘 다'를 의미하므로, 어느 하나가 더 중요하다는 뜻이 아닙니다.

ⓒ (X - 틀림):
the latter는 직전에 언급된 세 가지(job resources, feedback, leadership) 중 마지막 것인 leadership을 지칭합니다. job resources는 첫 번째 요소이므로 틀렸습니다.

ⓔ (X - 틀림):
앞 문장: "직무 성과가 참여를 이끌기도 한다"
뒤 문장: "직원들이 일을 잘 수행하면 더 참여하게 된다"
앞뒤 내용이 같은 맥락을 다시 설명하는 것이므로 In other words(다시 말해서)가 적절합니다.

오답인 보기: ⓐ, ⓒ, ⓔ

---

영어 지문: ${text}

위 형식을 정확히 따라 문제를 생성하세요.`;
