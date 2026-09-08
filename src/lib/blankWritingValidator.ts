/**
 * 빈칸영작 문제 검증 및 단어 무작위 배열 처리
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  correctedContent?: string;
}

interface ParsedQuestion {
  conditionSection: string; // 조건 전체 섹션
  wordList: string; // 단어 목록 부분
  answer: string; // 정답
}

/**
 * 배열을 무작위로 섞는 함수 (Fisher-Yates shuffle)
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
 * 빈칸영작 문제에서 조건, 단어 목록, 정답 추출
 */
function parseBlankWritingQuestion(content: string): ParsedQuestion | null {
  try {
    // [조건] 섹션 추출
    const conditionMatch = content.match(/\[조건\](.*?)(?=\[정답\])/s);
    if (!conditionMatch) {
      return null;
    }
    const conditionSection = conditionMatch[1].trim();

    // 조건 섹션에서 단어 목록 추출 (마지막 줄)
    const lines = conditionSection.split('\n').filter(line => line.trim());
    if (lines.length < 3) {
      return null;
    }
    const wordList = lines[lines.length - 1].trim();

    // [정답] 섹션 추출
    const answerMatch = content.match(/\[정답\]\s*(.+)/);
    if (!answerMatch) {
      return null;
    }
    const answer = answerMatch[1].trim();

    return { conditionSection, wordList, answer };
  } catch (error) {
    console.error("빈칸영작 파싱 오류:", error);
    return null;
  }
}

/**
 * 단어를 정규화 (소문자, 공백 제거)
 */
function normalizeWord(word: string): string {
  return word.toLowerCase().trim();
}

/**
 * 정답 문장에서 단어 추출
 */
function extractAnswerWords(answer: string): string[] {
  return answer
    .replace(/[.,!?;:()]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(normalizeWord);
}

/**
 * 단어 목록을 정답 기반으로 자동 수정 (무작위 배열)
 */
function attemptAutoCorrection(originalContent: string, parsed: ParsedQuestion, answerWords: string[]): string | null {
  try {
    console.log("🔧 빈칸영작 단어 목록 무작위 배열 중...");

    // 정답 단어를 무작위로 섞기
    const shuffledWords = shuffleArray(answerWords);
    const correctedWordList = shuffledWords.join(' / ');

    // 조건 섹션 재구성
    const conditionLines = parsed.conditionSection.split('\n').filter(line => line.trim());
    
    // 마지막 줄(단어 목록)을 새로운 무작위 단어 목록으로 교체
    conditionLines[conditionLines.length - 1] = correctedWordList;
    const newConditionSection = conditionLines.join('\n');

    // 원본 콘텐츠에서 [조건] 섹션만 교체
    const correctedContent = originalContent.replace(
      /(\[조건\]).*?(?=\[정답\])/s,
      `$1\n${newConditionSection}\n\n`
    );

    console.log("✅ 단어 목록이 무작위로 배열되었습니다.");
    console.log(`   원본: ${parsed.wordList.substring(0, 50)}...`);
    console.log(`   변경: ${correctedWordList.substring(0, 50)}...`);
    
    return correctedContent;
  } catch (error) {
    console.error("빈칸영작 자동 수정 오류:", error);
    return null;
  }
}

/**
 * 빈칸영작 문제 검증 및 단어 무작위 배열
 */
export function validateBlankWritingQuestion(content: string): ValidationResult {
  const errors: string[] = [];

  // 기본 형식 검증
  if (!content.includes("[조건]") || !content.includes("[정답]")) {
    errors.push("필수 섹션([조건], [정답])이 누락되었습니다.");
    return { isValid: false, errors };
  }

  const parsed = parseBlankWritingQuestion(content);
  if (!parsed) {
    errors.push("문제 파싱에 실패했습니다.");
    return { isValid: false, errors };
  }

  // 정답에서 단어 추출
  const answerWords = extractAnswerWords(parsed.answer);
  if (answerWords.length === 0) {
    errors.push("정답에서 단어를 추출할 수 없습니다.");
    return { isValid: false, errors };
  }

  // 항상 단어를 무작위로 섞어서 반환
  const correctedContent = attemptAutoCorrection(content, parsed, answerWords);
  
  if (correctedContent) {
    return {
      isValid: true,
      errors: [],
      correctedContent
    };
  }

  // 수정에 실패하면 원본 반환
  return { isValid: true, errors };
}
