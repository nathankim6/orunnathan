/**
 * 순서 문제 검증 및 자동 수정 모듈
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  correctedContent?: string;
}

/**
 * 순서 문제를 검증합니다.
 * 원문의 모든 문장이 문제에 포함되어 있는지 확인합니다.
 */
export function validateOrderQuestion(generatedContent: string, originalText: string): ValidationResult {
  const errors: string[] = [];
  
  console.log('🔍 순서 문제 검증 시작');
  console.log('📄 원문 길이:', originalText.length);
  console.log('📝 생성된 문제 길이:', generatedContent.length);

  try {
    // 원문을 문장 단위로 분리 (간단한 방식)
    const originalSentences = splitIntoSentences(originalText);
    console.log('📋 원문 문장 수:', originalSentences.length);
    
    // 생성된 문제에서 도입부와 (A), (B), (C) 추출
    const extracted = extractOrderQuestionParts(generatedContent);
    
    if (!extracted) {
      errors.push('순서 문제 형식을 파싱할 수 없습니다.');
      return { isValid: false, errors };
    }

    // 모든 부분을 합쳐서 재구성
    const reconstructed = [
      ...extracted.intro,
      ...extracted.partA,
      ...extracted.partB,
      ...extracted.partC
    ].join(' ').trim();

    console.log('🔧 재구성된 텍스트 길이:', reconstructed.length);

    // 원문과 재구성된 텍스트 비교 (공백 정규화 후)
    const normalizedOriginal = normalizeText(originalText);
    const normalizedReconstructed = normalizeText(reconstructed);

    // 각 원문 문장이 재구성된 텍스트에 포함되어 있는지 확인
    const missingSegments: string[] = [];
    for (const sentence of originalSentences) {
      const normalizedSentence = normalizeText(sentence);
      if (normalizedSentence.length > 10 && !normalizedReconstructed.includes(normalizedSentence)) {
        missingSegments.push(sentence.substring(0, 50) + '...');
      }
    }

    // 재구성된 텍스트에 원문에 없는 내용이 있는지 확인 (문장 단위)
    const reconstructedSentences = splitIntoSentences(reconstructed);
    const addedSegments: string[] = [];
    
    for (const sentence of reconstructedSentences) {
      const normalizedSentence = normalizeText(sentence);
      if (normalizedSentence.length > 10 && !normalizedOriginal.includes(normalizedSentence)) {
        addedSegments.push(sentence.substring(0, 50) + '...');
      }
    }

    if (missingSegments.length > 0) {
      errors.push(`원문의 일부 내용이 문제에 포함되지 않았습니다: ${missingSegments.join(', ')}`);
      console.error('❌ 누락된 내용:', missingSegments);
    }

    if (addedSegments.length > 0) {
      errors.push(`문제에 원문에 없는 내용이 추가되었습니다: ${addedSegments.join(', ')}`);
      console.error('❌ 추가된 내용:', addedSegments);
    }

    // 길이 차이가 10% 이상이면 오류로 간주
    const lengthDiff = Math.abs(normalizedOriginal.length - normalizedReconstructed.length);
    const lengthDiffPercent = (lengthDiff / normalizedOriginal.length) * 100;
    
    if (lengthDiffPercent > 10) {
      errors.push(`재구성된 텍스트의 길이가 원문과 ${lengthDiffPercent.toFixed(1)}% 차이가 납니다.`);
      console.warn(`⚠️ 길이 차이: ${lengthDiffPercent.toFixed(1)}%`);
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      console.error('❌ 순서 문제 검증 실패:', errors);
    } else {
      console.log('✅ 순서 문제 검증 성공');
    }

    return {
      isValid,
      errors,
      correctedContent: isValid ? undefined : generatedContent
    };

  } catch (error) {
    console.error('순서 문제 검증 중 오류:', error);
    return {
      isValid: false,
      errors: ['검증 중 오류가 발생했습니다: ' + (error as Error).message]
    };
  }
}

/**
 * 텍스트를 문장 단위로 분리합니다.
 */
function splitIntoSentences(text: string): string[] {
  // 간단한 문장 분리 (마침표, 느낌표, 물음표 기준)
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * 순서 문제에서 도입부와 각 파트를 추출합니다.
 */
function extractOrderQuestionParts(content: string): {
  intro: string[];
  partA: string[];
  partB: string[];
  partC: string[];
} | null {
  try {
    // "주어진 글 다음에..." 부분과 (A), (B), (C) 추출
    const introMatch = content.match(/주어진 글 다음에[^\n]*\n\n(.*?)\n\n\(A\)/s);
    const partAMatch = content.match(/\(A\)\s+(.*?)\n\n\(B\)/s);
    const partBMatch = content.match(/\(B\)\s+(.*?)\n\n\(C\)/s);
    const partCMatch = content.match(/\(C\)\s+(.*?)(?:\n\n|①)/s);

    if (!introMatch || !partAMatch || !partBMatch || !partCMatch) {
      console.warn('⚠️ 순서 문제 파싱 실패 - 일부 파트를 찾을 수 없습니다');
      return null;
    }

    return {
      intro: splitIntoSentences(introMatch[1].trim()),
      partA: splitIntoSentences(partAMatch[1].trim()),
      partB: splitIntoSentences(partBMatch[1].trim()),
      partC: splitIntoSentences(partCMatch[1].trim())
    };
  } catch (error) {
    console.error('순서 문제 파싱 오류:', error);
    return null;
  }
}

/**
 * 텍스트를 정규화합니다 (비교용).
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')  // 여러 공백을 하나로
    .replace(/[.,!?;:'"()]/g, '')  // 구두점 제거
    .trim();
}
