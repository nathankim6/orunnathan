export const getReferencePrompt = (text: string) => {
  // 정답 개수를 랜덤하게 선택 (2-5개)
  const correctCount = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, or 5

  // ⓐ~ⓕ 중에서 랜덤하게 정답 선택
  const allSymbols = ['ⓐ', 'ⓑ', 'ⓒ', 'ⓓ', 'ⓔ', 'ⓕ'];
  const shuffled = [...allSymbols].sort(() => Math.random() - 0.5);
  const correctAnswers = shuffled.slice(0, correctCount).sort((a, b) =>
    allSymbols.indexOf(a) - allSymbols.indexOf(b)
  );
  const incorrectAnswers = shuffled.slice(correctCount).sort((a, b) =>
    allSymbols.indexOf(a) - allSymbols.indexOf(b)
  );

  const correctAnswerString = correctAnswers.join(', ');
  const incorrectAnswerString = incorrectAnswers.join(', ');

  // 각 보기별 라벨(부합/불부합) — AI가 채워야 할 슬롯이 아니라 지시문에 사용
  const labelFor = (s: string) => (correctAnswers.includes(s) ? '주제와 부합' : '주제와 부합하지 않음');

  return `당신은 고등학교 영어 내신문제 전문 출제자입니다.
아래 영어 지문을 읽고, "사례추론" 유형의 문제를 **완성된 형태**로 작성하세요.
대괄호 안의 지시문(예: "[사례 1 - 주제 부합]")을 그대로 출력하지 말고, **반드시 실제 영어 문장 사례로 치환**해야 합니다.

# 답안 설계 (이 값들은 고정)
- 정답: ${correctAnswerString} (총 ${correctCount}개) — 지문의 주제와 부합하는 사례
- 오답: ${incorrectAnswerString} — 지문의 주제와 부합하지 않는 사례

# 각 보기에 들어갈 내용
${allSymbols.map(s => `- ${s}: ${labelFor(s)}하는 실제 영어 사례 (2문장 이상의 서술적 영어 문장)`).join('\n')}

# 출력 형식 (이 형식 그대로 출력하되, 영어 문장은 직접 작성)
다음 보기의 ⓐ~ⓕ 중, 아래 글의 주제와 부합하는 사례는 모두 몇 개인가?

${text}

[보기]
ⓐ (여기에 ${labelFor('ⓐ')}하는 영어 사례 2문장 이상)
ⓑ (여기에 ${labelFor('ⓑ')}하는 영어 사례 2문장 이상)
ⓒ (여기에 ${labelFor('ⓒ')}하는 영어 사례 2문장 이상)
ⓓ (여기에 ${labelFor('ⓓ')}하는 영어 사례 2문장 이상)
ⓔ (여기에 ${labelFor('ⓔ')}하는 영어 사례 2문장 이상)
ⓕ (여기에 ${labelFor('ⓕ')}하는 영어 사례 2문장 이상)

[정답] ${correctAnswerString} (총 ${correctCount}개)

[해설]
본문의 주제를 한국어 한두 문장으로 요약한 뒤, ⓐ~ⓕ 각 보기가 왜 정답/오답인지 한국어로 분석.

# 절대 규칙
1. 대괄호 안 한국어 지시문("주제 부합", "사례 1" 등)을 출력에 포함하지 말 것.
2. 보기 ⓐ~ⓕ는 반드시 실제 영어 문장으로 작성할 것 (2문장 이상).
3. 정답 개수는 정확히 ${correctCount}개여야 하며, [정답]은 반드시 "${correctAnswerString}"로 출력할 것.
4. 출력은 위 "출력 형식" 부분만, 머리말·꼬리말·메타설명 없이.`;
};
