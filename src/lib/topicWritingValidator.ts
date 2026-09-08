/**
 * 주제문영작 문제 검증 및 자동 수정 모듈
 */

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  correctedContent?: string;
}

interface ParsedQuestion {
  question: string;
  condition: string;
  wordCount: number;
  providedWords: string[];
  blank: string;
  answer: string;
}

/**
 * 주제문영작 문제를 파싱합니다.
 */
function parseTopicWritingQuestion(content: string): ParsedQuestion | null {
  try {
    // 조건에서 단어 개수 추출
    const wordCountMatch = content.match(/[–-]\s*(\d+)단어로\s+빈칸을\s+완성하시오/);
    const wordCount = wordCountMatch ? parseInt(wordCountMatch[1]) : 0;

    // 제시 단어 추출 (보기: 또는 다음 단어를 ...으로 시작하는 부분)
    const wordsMatch = content.match(/(?:보기:|다음\s+단어를[^:]*:)\s*([^\n]+)/);
    let providedWords: string[] = [];
    if (wordsMatch) {
      // 슬래시(/)로 구분된 단어들을 추출
      providedWords = wordsMatch[1]
        .split(/\s*\/\s*/)
        .map(w => w.trim())
        .filter(w => w.length > 0);
    }

    // 정답 추출
    const answerMatch = content.match(/\[정답\]\s*(.+?)(?:\n|$)/);
    const answer = answerMatch ? answerMatch[1].trim() : '';

    return {
      question: content,
      condition: wordCountMatch ? wordCountMatch[0] : '',
      wordCount,
      providedWords,
      blank: '',
      answer
    };
  } catch (error) {
    console.error('주제문영작 파싱 오류:', error);
    return null;
  }
}

/**
 * 정답 문장의 모든 단어를 추출합니다.
 */
function extractWordsFromAnswer(answer: string): string[] {
  // 정답에서 단어 추출 (구두점 제거)
  return answer
    .replace(/[.,!?;:'"]/g, '') // 구두점 제거
    .split(/\s+/)
    .filter(w => w.length > 0);
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
 * 주제문영작 문제를 검증합니다.
 */
export function validateTopicWritingQuestion(content: string): ValidationResult {
  const errors: string[] = [];
  
  const parsed = parseTopicWritingQuestion(content);
  if (!parsed) {
    return {
      isValid: false,
      errors: ['문제 형식을 파싱할 수 없습니다.']
    };
  }

  // 정답에서 실제 단어 추출
  const answerWords = extractWordsFromAnswer(parsed.answer);
  
  console.log('🔍 주제문영작 검증 시작:');
  console.log('  - 조건의 단어 수:', parsed.wordCount);
  console.log('  - 정답의 실제 단어 수:', answerWords.length);
  console.log('  - 정답 단어들:', answerWords);
  console.log('  - 제시 단어들:', parsed.providedWords);

  // 1. 조건의 단어 수와 정답의 단어 수 비교
  if (parsed.wordCount !== answerWords.length) {
    errors.push(
      `조건의 단어 수(${parsed.wordCount})와 정답의 단어 수(${answerWords.length})가 일치하지 않습니다.`
    );
  }

  // 2. 제시 단어 수와 정답 단어 수 비교
  if (parsed.providedWords.length !== answerWords.length) {
    errors.push(
      `제시 단어 수(${parsed.providedWords.length})와 정답 단어 수(${answerWords.length})가 일치하지 않습니다.`
    );
  }

  // 3. 제시 단어가 정답의 모든 단어를 포함하는지 확인
  const providedWordsLower = parsed.providedWords.map(w => w.toLowerCase());
  const answerWordsLower = answerWords.map(w => w.toLowerCase());
  
  const missingWords: string[] = [];
  const answerWordCount: Record<string, number> = {};
  const providedWordCount: Record<string, number> = {};
  
  // 정답 단어 빈도 카운트
  answerWordsLower.forEach(word => {
    answerWordCount[word] = (answerWordCount[word] || 0) + 1;
  });
  
  // 제시 단어 빈도 카운트
  providedWordsLower.forEach(word => {
    providedWordCount[word] = (providedWordCount[word] || 0) + 1;
  });
  
  // 정답의 각 단어가 제시 단어에 있는지, 개수도 맞는지 확인
  for (const [word, count] of Object.entries(answerWordCount)) {
    const providedCount = providedWordCount[word] || 0;
    if (providedCount === 0) {
      missingWords.push(word);
    } else if (providedCount < count) {
      errors.push(
        `단어 "${word}"가 정답에 ${count}번 필요하지만 제시 단어에는 ${providedCount}번만 있습니다.`
      );
    }
  }
  
  if (missingWords.length > 0) {
    errors.push(
      `정답에 필요한 단어가 제시 단어에 없습니다: ${missingWords.join(', ')}`
    );
  }

  // 4. 제시 단어에 정답에 없는 단어가 있는지 확인
  const extraWords: string[] = [];
  for (const [word, count] of Object.entries(providedWordCount)) {
    const answerCount = answerWordCount[word] || 0;
    if (answerCount === 0) {
      extraWords.push(word);
    } else if (answerCount < count) {
      errors.push(
        `제시 단어에 "${word}"가 ${count}번 있지만 정답에는 ${answerCount}번만 필요합니다.`
      );
    }
  }
  
  if (extraWords.length > 0) {
    errors.push(
      `제시 단어에 정답에 없는 단어가 포함되어 있습니다: ${extraWords.join(', ')}`
    );
  }

  const isValid = errors.length === 0;

  if (!isValid) {
    console.error('❌ 주제문영작 검증 실패:', errors);
    
    // 자동 수정 시도
    const corrected = attemptAutoCorrection(content, parsed, answerWords);
    if (corrected) {
      return {
        isValid: false,
        errors,
        correctedContent: corrected
      };
    }
  } else {
    console.log('✅ 주제문영작 검증 성공');
  }

  return {
    isValid,
    errors,
    correctedContent: isValid ? undefined : content
  };
}

/**
 * 문제를 자동으로 수정합니다.
 */
function attemptAutoCorrection(
  originalContent: string,
  parsed: ParsedQuestion,
  answerWords: string[]
): string | null {
  try {
    console.log('🔧 자동 수정 시도 중...');

    // 정답 단어를 기반으로 제시 단어와 조건 재생성
    const correctWordCount = answerWords.length;
    // 단어들을 무작위로 섞어서 제시
    const shuffledWords = shuffleArray(answerWords);
    const correctProvidedWords = shuffledWords.join(' / ');

    // 원본 내용에서 조건과 제시 단어 부분을 교체
    let corrected = originalContent;

    // 1. 단어 개수 수정
    corrected = corrected.replace(
      /[–-]\s*\d+단어로\s+빈칸을\s+완성하시오/,
      `- ${correctWordCount}단어로 빈칸을 완성하시오`
    );

    // 2. 제시 단어 수정
    corrected = corrected.replace(
      /(?:보기:|다음\s+단어를[^:]*:)\s*([^\n]+)/,
      `보기: ${correctProvidedWords}`
    );

    console.log('✅ 자동 수정 완료');
    console.log('  - 수정된 단어 수:', correctWordCount);
    console.log('  - 수정된 제시 단어:', correctProvidedWords);

    return corrected;
  } catch (error) {
    console.error('자동 수정 실패:', error);
    return null;
  }
}
