/**
 * 요약문 빈칸영작 문제의 보기와 정답을 검증하고 수정하는 유틸리티
 */

/**
 * 문자열에서 단어를 추출하고 정규화
 * - 공백으로 분리
 * - 앞뒤 공백 제거
 * - 빈 문자열 제거
 */
function extractWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length > 0);
}

/**
 * 보기 형식에서 단어를 추출
 * - `/` 구분자로 분리
 * - 앞뒤 공백 제거
 */
function extractChoiceWords(choiceText: string): string[] {
  return choiceText
    .split('/')
    .map(word => word.trim())
    .filter(word => word.length > 0);
}

/**
 * 두 단어 배열이 동일한지 비교 (순서 무관)
 */
function areWordsSame(words1: string[], words2: string[]): boolean {
  if (words1.length !== words2.length) {
    return false;
  }
  
  const sorted1 = [...words1].sort();
  const sorted2 = [...words2].sort();
  
  return sorted1.every((word, index) => word === sorted2[index]);
}

/**
 * 배열을 무작위로 섞기 (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 요약문 빈칸영작 문제의 보기와 정답을 검증하고 수정
 * 
 * @param content 문제 전체 내용
 * @returns 수정된 문제 내용
 */
export function validateAndFixSummaryBlankWriting(content: string): string {
  // <보기> 섹션 찾기
  const choiceMatch = content.match(/<보기>\s*([\s\S]*?)\s*(?=\[정답\])/);
  if (!choiceMatch) {
    return content; // <보기> 섹션이 없으면 원본 반환
  }
  
  // [정답] 섹션 찾기
  const answerMatch = content.match(/\[정답\]\s*([^\n]+)/);
  if (!answerMatch) {
    return content; // [정답] 섹션이 없으면 원본 반환
  }
  
  const choiceText = choiceMatch[1].trim();
  const answerText = answerMatch[1].trim();
  
  // 보기와 정답에서 단어 추출
  const choiceWords = extractChoiceWords(choiceText);
  const answerWords = extractWords(answerText);
  
  // 단어가 동일한지 검증
  if (areWordsSame(choiceWords, answerWords)) {
    return content; // 이미 올바르면 원본 반환
  }
  
  console.log('🔍 요약문 빈칸영작 검증 실패 - 자동 수정 중');
  console.log('보기 단어:', choiceWords);
  console.log('정답 단어:', answerWords);
  
  // 정답의 단어들로 보기 재구성 (순서는 무작위로 섞음)
  const shuffledWords = shuffleArray(answerWords);
  const newChoiceText = shuffledWords.join(' / ');
  
  // 보기 섹션 교체
  const newContent = content.replace(
    /<보기>\s*[\s\S]*?\s*(?=\[정답\])/,
    `<보기>\n${newChoiceText}\n\n`
  );
  
  console.log('✅ 자동 수정 완료');
  console.log('새 보기:', newChoiceText);
  
  return newContent;
}
