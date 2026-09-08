
export const getConjunctionPrompt = (text: string) => `
Generate a conjunction question based on the following text:
${text}

**CRITICAL RULES**:
1. You MUST use ONLY the conjunctions that ALREADY EXIST in the original text.
2. DO NOT modify, add, or change any part of the original text.
3. DO NOT insert new conjunctions that were not in the original text.
4. If the text does not have at least 2 suitable conjunctions from the list below, respond ONLY with:
   "연결사 개수 부족: 이 지문에는 적절한 연결사가 2개 미만입니다. 문제 생성이 불가능합니다."
5. Only create a question if there are at least 2 natural conjunctions already present in the text.

**VALID CONJUNCTIONS LIST** (Only these can be used as blanks):

🔴 Contrast (대조/역접):
- however, nevertheless, nonetheless, still, on the contrary, on the other hand, by contrast, in contrast, rather, but
- Alternatives: yet, conversely, more precisely

🟢 Result/Cause (결과/인과):
- therefore, thus, hence, as a result, consequently, for this reason, accordingly

🟡 Example (예시):
- for example, for instance, to illustrate

🔵 Elaboration/Emphasis (부연/강조):
- in fact, in other words, indeed, namely, specifically
- Alternatives: actually, in reality, certainly, truly, in particular

🟣 Addition (추가):
- moreover, furthermore, in addition, in addition to, besides

🟠 Similarity (유사):
- likewise, similarly
- Alternatives: in the same way, equally

⚪ Time (시간):
- meanwhile, afterward, eventually
- Alternatives: at the same time, simultaneously, concurrently, later, subsequently, then, finally, ultimately, in the end

⚫ Others (기타):
- instead, otherwise, admittedly
- Alternatives: alternatively, in place of, or else, if not, undoubtedly, granted

Follow this format strictly:
다음 글의 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?

[Text with (A) and (B) blanks]

① (A) ...... (B) 
② (A) ...... (B) 
③ (A) ...... (B) 
④ (A) ...... (B) 
⑤ (A) ...... (B) 

**CRITICAL**: The correct answer MUST be randomly distributed across ALL options ①-⑤. 
- Do NOT always put the correct answer at ① or ②
- Actively vary the position: sometimes ③, sometimes ④, sometimes ⑤
- Each position (①②③④⑤) should have equal probability of being correct
- First decide which position (1-5) will be correct, THEN construct your options

Example distribution targets:
- 20% of questions: correct answer is ①
- 20% of questions: correct answer is ②  
- 20% of questions: correct answer is ③
- 20% of questions: correct answer is ④
- 20% of questions: correct answer is ⑤

[정답] (Correct answer number - must vary: ①, ②, ③, ④, or ⑤)

[해설] 정답은 (번호)번입니다.
(A): (Explanation for A)
(B): (Explanation for B)

Use common conjunctions like:
- However, Nevertheless, Therefore
- In fact, Indeed, For example
- Moreover, Furthermore, In addition
- As a result, Consequently
- On the other hand, In contrast

Create challenging but clear questions that test understanding of logical connections between sentences.
`;
