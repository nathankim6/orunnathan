
export const getContentMismatchPrompt = (text: string, choiceLanguage: 'english' | 'korean' = 'english') => {
  const isKorean = choiceLanguage === 'korean';
  const choiceLang = isKorean ? '한국어' : 'English';
  const choiceInstruction = isKorean
    ? '{지문 내용과 일치하는 내용을 한국어로 작성}'
    : '{Write a statement that matches the passage content in English}';

  return `You are an expert English reading comprehension question generator. Your task is to create multiple-choice questions that test understanding of English passages.

# INPUT FORMAT
The input will be an English passage. The passage should contain clear opinions, explanations, or arguments about a topic.

# OUTPUT FORMAT
You must strictly follow this exact format:

다음의 내용과 일치하지 않는 것을 고르시오.

${text}

① ${choiceInstruction}
② ${choiceInstruction}
③ ${choiceInstruction}
④ ${choiceInstruction}
⑤ ${choiceInstruction}

**중요**: 
- 정답(내용과 일치하지 않는 선택지)은 ①~⑤번 중에서 랜덤하게 선택하여 고르게 분포시키세요. 특히 ④, ⑤에 편중되지 않도록 하고 ①, ②, ③도 충분히 선택되도록 하세요
- 특정 번호(예: 항상 ③번)에 정답이 몰리지 않도록 주의하세요
- 나머지 4개 선택지는 모두 지문 내용과 일치해야 합니다
- Randomly select ONE of the options (①~⑤) to contain information that does NOT match the passage content. Ensure answer distribution is balanced across all positions, especially avoiding bias toward ④ or ⑤
- The other four options should match the passage content

**CRITICAL - 정답과 해설 번호 일치**: 
- 정답을 ③번으로 선택했다면: [정답] ③ 그리고 [해설] 정답은 ③번입니다...
- 정답을 ①번으로 선택했다면: [정답] ① 그리고 [해설] 정답은 ①번입니다...
- [정답]과 [해설]에서 언급하는 번호는 반드시 동일해야 합니다!

[정답] [Random number from ①~⑤ that contains the contradictory statement - 예: ③]

[해설]
정답은 [위에서 선택한 동일한 번호]번입니다. [동일한 번호]번 선택지는 "[선택지의 내용]"이라고 했는데, 
지문에서는 "[지문의 실제 내용]"이라고 언급했으므로 지문의 내용과 일치하지 않습니다.
나머지 선택지들은 모두 지문 내용과 일치합니다.

Important:
1. The passage given to you should be kept unchanged.
2. ALL answer choices (①, ②, ③, ④, ⑤) must be written in ${choiceLang} ONLY.
3. The correct answer should be randomly distributed among ①~⑤ options to ensure balanced answer distribution. One option must contain information that contradicts the passage.
4. The other four choices must all contain information that matches the passage.`;
};
