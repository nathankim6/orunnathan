// 서답형 문제 검증 및 수정 모듈

export interface SeodapValidationResult {
  isValid: boolean;
  errors: string[];
  correctedContent?: string;
}

// 서답형 카테고리에 포함된 문제 유형 ID
export const SEODAP_QUESTION_TYPES = [
  'orderWritingKorean',
  'orderWriting', 
  'summaryBlank',
  'summaryVocab',
  'summaryBlankWriting',
  'topicWriting',
  'blankWriting'
];

// 문제 유형이 서답형 카테고리인지 확인
export const isSeodapType = (typeId: string): boolean => {
  return SEODAP_QUESTION_TYPES.includes(typeId);
};

// 요약문 빈칸어휘(2개) 검증
const validateSummaryBlank = (content: string): SeodapValidationResult => {
  const errors: string[] = [];
  let correctedContent = content;

  // [정답] 섹션 확인
  if (!content.includes('[정답]')) {
    errors.push('정답 섹션이 없습니다.');
  }

  // (A), (B) 빈칸 확인
  if (!content.includes('(A)') || !content.includes('(B)')) {
    errors.push('(A), (B) 빈칸이 올바르게 표시되지 않았습니다.');
  }

  // 빈줄 정리
  correctedContent = correctedContent.replace(/\n{3,}/g, '\n\n');

  return {
    isValid: errors.length === 0,
    errors,
    correctedContent: errors.length > 0 ? correctedContent : undefined
  };
};

// 요약문 빈칸어휘(3개) 검증
const validateSummaryVocab = (content: string): SeodapValidationResult => {
  const errors: string[] = [];
  let correctedContent = content;

  // [정답] 섹션 확인
  if (!content.includes('[정답]')) {
    errors.push('정답 섹션이 없습니다.');
  }

  // (A), (B), (C) 빈칸 확인
  if (!content.includes('(A)') || !content.includes('(B)') || !content.includes('(C)')) {
    errors.push('(A), (B), (C) 빈칸이 올바르게 표시되지 않았습니다.');
  }

  // 선택지 확인 (①~⑤)
  const hasOptions = /[①②③④⑤]/.test(content);
  if (!hasOptions) {
    errors.push('선택지(①~⑤)가 없습니다.');
  }

  // 빈줄 정리
  correctedContent = correctedContent.replace(/\n{3,}/g, '\n\n');

  return {
    isValid: errors.length === 0,
    errors,
    correctedContent: errors.length > 0 ? correctedContent : undefined
  };
};

// 요약문 빈칸영작 검증
const validateSummaryBlankWriting = (content: string): SeodapValidationResult => {
  const errors: string[] = [];
  let correctedContent = content;

  // [정답] 섹션 확인
  if (!content.includes('[정답]')) {
    errors.push('정답 섹션이 없습니다.');
  }

  // 조건 확인
  if (!content.includes('조건') && !content.includes('<조건>')) {
    errors.push('조건이 명시되지 않았습니다.');
  }

  // 빈줄 정리
  correctedContent = correctedContent.replace(/\n{3,}/g, '\n\n');

  return {
    isValid: errors.length === 0,
    errors,
    correctedContent: errors.length > 0 ? correctedContent : undefined
  };
};

// 배열영작 검증 (우리말O/X 공통)
const validateOrderWriting = (content: string): SeodapValidationResult => {
  const errors: string[] = [];
  let correctedContent = content;

  // [정답] 섹션 확인
  if (!content.includes('[정답]')) {
    errors.push('정답 섹션이 없습니다.');
  }

  // 제시 단어 확인
  if (!content.includes('제시 단어') && !content.includes('주어진 단어') && !content.includes('다음 단어')) {
    errors.push('제시 단어가 없습니다.');
  }

  // 빈줄 정리
  correctedContent = correctedContent.replace(/\n{3,}/g, '\n\n');

  return {
    isValid: errors.length === 0,
    errors,
    correctedContent: errors.length > 0 ? correctedContent : undefined
  };
};

// 서답형 문제 통합 검증 함수
export const validateSeodapQuestion = (typeId: string, content: string): SeodapValidationResult => {
  console.log(`🔍 서답형 문제 검증 시작: ${typeId}`);

  switch (typeId) {
    case 'summaryBlank':
      return validateSummaryBlank(content);
    case 'summaryVocab':
      return validateSummaryVocab(content);
    case 'summaryBlankWriting':
      return validateSummaryBlankWriting(content);
    case 'orderWriting':
    case 'orderWritingKorean':
      return validateOrderWriting(content);
    case 'topicWriting':
    case 'blankWriting':
      // 이미 별도 validator가 있으므로 기본 검증만 수행
      return {
        isValid: content.includes('[정답]'),
        errors: !content.includes('[정답]') ? ['정답 섹션이 없습니다.'] : [],
        correctedContent: undefined
      };
    default:
      return {
        isValid: true,
        errors: [],
        correctedContent: undefined
      };
  }
};

// AI를 통한 서답형 문제 재검증 및 수정 프롬프트 생성
export const getSeodapVerificationPrompt = (typeId: string, content: string, errors: string[]): string => {
  return `다음 서답형 문제에 오류가 발견되었습니다. 오류를 수정해주세요.

문제 유형: ${typeId}
발견된 오류: ${errors.join(', ')}

원본 문제:
${content}

수정 지침:
1. 발견된 오류를 모두 수정하세요.
2. [정답] 섹션이 없으면 추가하세요.
3. 빈칸 표시((A), (B), (C))가 올바른지 확인하세요.
4. 조건이 필요한 문제의 경우 조건을 명확히 작성하세요.
5. 제시 단어와 정답 문장이 일치하는지 확인하세요.
6. 원본 문제의 내용과 형식을 최대한 유지하면서 오류만 수정하세요.

**중요: 검증 과정이나 분석 내용을 절대 출력하지 마세요. 수정된 문제 본문만 출력하세요.**
**"검증:", "단어 개수:", "매칭 확인" 등의 메타 정보를 포함하지 마세요.**

수정된 전체 문제를 출력하세요:`;
};

/**
 * 검증 과정에서 삽입된 불필요한 멘트를 제거합니다.
 */
export const removeVerificationComments = (content: string): string => {
  const patternsToRemove = [
    /\n*,?\s*"?검증:[\s\S]*?[✓✗]\s*\n*/gi,
    /\n*검증 결과:[\s\S]*?(?=\n\n|\[|$)/gi,
    /\n*-\s*정답 단어[^]*?(?=\n\n|\[|$)/gi,
    /\n*-\s*보기 단어[^]*?(?=\n\n|\[|$)/gi,
    /\n*-\s*단어 개수[^]*?(?=\n\n|\[|$)/gi,
    /\n*\*\*번호 개수 검증:\*\*[^\n]*\n*/gi,
    /\n*번호 개수 검증:[^\n]*\n*/gi,
    /,\s*"검증:[\s\S]*?"\s*$/gi,
    /\n*---+\s*검증\s*---+[\s\S]*?(?=\n\n\[|\n\[|$)/gi,
  ];
  
  let cleaned = content;
  for (const pattern of patternsToRemove) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  return cleaned;
};
