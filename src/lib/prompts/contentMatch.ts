export const getContentMatchPrompt = (text: string, choiceLanguage: 'english' | 'korean' = 'english') => {
  const isKorean = choiceLanguage === 'korean';
  const choiceLang = isKorean ? '한국어' : 'English';
  const choiceInstruction = isKorean
    ? '{지문 내용과 일치하는 내용을 한국어로 작성}'
    : '{Write a statement that matches the passage content in English}';

  return `You are an expert English reading comprehension question generator. Your task is to create a multiple-choice question that tests understanding of the given English passage.

# PASSAGE TO USE
${text}

# OUTPUT FORMAT
You must strictly follow this exact format:

다음의 내용과 일치하는 것을 고르시오.

${text}

① ${choiceInstruction}
② ${choiceInstruction}
③ ${choiceInstruction}
④ ${choiceInstruction}
⑤ ${choiceInstruction}

**CRITICAL**: 
- Randomly select ONE option (①~⑤) to be the CORRECT answer that matches the passage
- The other FOUR options must contain information that does NOT match or contradicts the passage
- Ensure answer distribution is balanced across all positions (①~⑤), avoiding bias toward ④ or ⑤

**CRITICAL - Answer and Explanation Number Match**: 
- If you select ③ as the correct answer: [정답] ③ AND [해설] 정답은 ③번입니다...
- If you select ① as the correct answer: [정답] ① AND [해설] 정답은 ①번입니다...
- The number in [정답] and [해설] MUST be identical!

[정답] [Random number from ①~⑤ that contains the matching statement]

[해설]
정답은 [same number as above]번입니다. [same number]번 선택지는 지문의 "[relevant quote from passage]"와 일치합니다.
나머지 선택지들은 지문 내용과 일치하지 않습니다:
- [번호]번: [왜 불일치하는지 간단 설명]
- [번호]번: [왜 불일치하는지 간단 설명]
- [번호]번: [왜 불일치하는지 간단 설명]
- [번호]번: [왜 불일치하는지 간단 설명]

# GUIDELINES
1. The passage given to you must be kept unchanged in the output
2. ALL answer choices (①~⑤) must be written in ${choiceLang} ONLY
3. Exactly ONE option matches the passage (correct answer), FOUR options contradict or are unsupported
4. Maintain similar length and complexity across all options
5. Base all options on information explicitly stated in or directly inferable from the text
6. Avoid using absolute terms (always, never, all, none) unless specifically supported by the text`;
};
