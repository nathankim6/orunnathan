/**
 * 순서 문제 생성기 (AI 없이 로직으로만 생성)
 */

interface OrderQuestion {
  question: string;
  intro: string;
  partA: string;
  partB: string;
  partC: string;
  correctAnswer: number; // 1-5
  explanation: string;
}

/**
 * 텍스트를 문장 단위로 분리합니다.
 */
function splitIntoSentences(text: string): string[] {
  // 문장 종결 부호 뒤의 공백을 기준으로 분리
  // 하지만 약어(e.g., i.e., Dr., Mr. 등)는 분리하지 않도록 처리
  const sentences: string[] = [];
  let current = '';
  
  for (let i = 0; i < text.length; i++) {
    current += text[i];
    
    // 문장 종결 부호 발견
    if (['.', '!', '?'].includes(text[i])) {
      // 다음 문자가 공백이고 그 다음이 대문자인 경우 문장 끝으로 간주
      if (i + 1 < text.length && text[i + 1] === ' ') {
        if (i + 2 < text.length && /[A-Z]/.test(text[i + 2])) {
          // 약어 체크
          const lastWord = current.trim().split(/\s+/).pop() || '';
          const isAbbreviation = ['Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Inc', 'Ltd', 'Co', 'vs', 'etc', 'i.e', 'e.g'].includes(lastWord.replace('.', ''));
          
          if (!isAbbreviation) {
            sentences.push(current.trim());
            current = '';
            i++; // 공백 건너뛰기
          }
        }
      } else if (i === text.length - 1) {
        // 마지막 문장
        sentences.push(current.trim());
        current = '';
      }
    }
  }
  
  // 남은 내용이 있으면 추가
  if (current.trim()) {
    sentences.push(current.trim());
  }
  
  return sentences.filter(s => s.length > 0);
}

/**
 * 문장들을 3개 파트로 균등하게 분할합니다.
 */
function divideSentencesIntoParts(sentences: string[]): {
  partA: string[];
  partB: string[];
  partC: string[];
} {
  const totalSentences = sentences.length;
  
  // 각 파트에 최소 1개씩은 배정
  if (totalSentences < 3) {
    throw new Error('문장이 3개 미만이어서 순서 문제를 생성할 수 없습니다.');
  }
  
  // 균등 분배
  const baseSize = Math.floor(totalSentences / 3);
  const remainder = totalSentences % 3;
  
  let sizes = [baseSize, baseSize, baseSize];
  
  // 나머지를 앞에서부터 분배
  for (let i = 0; i < remainder; i++) {
    sizes[i]++;
  }
  
  const partA = sentences.slice(0, sizes[0]);
  const partB = sentences.slice(sizes[0], sizes[0] + sizes[1]);
  const partC = sentences.slice(sizes[0] + sizes[1]);
  
  return { partA, partB, partC };
}

/**
 * 정답 번호에 따른 순서를 반환합니다.
 */
function getOrderByAnswer(answer: number): string {
  const orders = [
    '(A)-(C)-(B)',  // ①
    '(B)-(A)-(C)',  // ②
    '(B)-(C)-(A)',  // ③
    '(C)-(A)-(B)',  // ④
    '(C)-(B)-(A)'   // ⑤
  ];
  return orders[answer - 1];
}

/**
 * 정답 번호에 따라 원본 파트들을 (A), (B), (C)로 재배열합니다.
 * 예: 정답이 ②번 (B)-(A)-(C)라면, A=part2, B=part1, C=part3로 배치하여
 * (B)-(A)-(C) 순서가 원본 순서(part1-part2-part3)가 되도록 함
 */
function shufflePartsForAnswer(
  answer: number,
  part1: string[],
  part2: string[],
  part3: string[]
): {
  partA: string[];
  partB: string[];
  partC: string[];
} {
  // 각 정답 번호에 대해 A, B, C가 어떤 원본 파트에 대응되는지 정의
  // 정답 순서가 원본 순서(1-2-3)가 되도록 역매핑
  const mappings: Record<number, [number, number, number]> = {
    1: [1, 3, 2], // ①: (A)-(C)-(B) → 원본순서 1-2-3이 되려면 A=1, C=2, B=3
    2: [2, 1, 3], // ②: (B)-(A)-(C) → 원본순서 1-2-3이 되려면 B=1, A=2, C=3
    3: [3, 1, 2], // ③: (B)-(C)-(A) → 원본순서 1-2-3이 되려면 B=1, C=2, A=3
    4: [2, 3, 1], // ④: (C)-(A)-(B) → 원본순서 1-2-3이 되려면 C=1, A=2, B=3
    5: [3, 2, 1]  // ⑤: (C)-(B)-(A) → 원본순서 1-2-3이 되려면 C=1, B=2, A=3
  };

  const [aIndex, bIndex, cIndex] = mappings[answer];
  const parts = [part1, part2, part3];

  return {
    partA: parts[aIndex - 1],
    partB: parts[bIndex - 1],
    partC: parts[cIndex - 1]
  };
}

/**
 * 순서 문제를 생성합니다 (AI 없이).
 * @param text 원문 텍스트
 * @param mode 'basic'은 첫 문장만 고정, 'advanced'는 첫 문장 + 마지막 문장 고정
 */
export function generateOrderQuestion(text: string, mode: 'basic' | 'advanced' = 'basic'): string {
  try {
    console.log('🔧 순서 문제 로직 생성 시작...');
    console.log('📄 원문 길이:', text.length);
    console.log('🎯 모드:', mode === 'basic' ? '기본 모드 (첫 문장만 고정)' : '고급 모드 (첫+마지막 문장 고정)');
    
    // 1. 문장 분리
    const sentences = splitIntoSentences(text);
    console.log('📋 문장 수:', sentences.length);
    
    // 최소 문장 수 체크 (모드에 따라 다름)
    const minSentences = mode === 'basic' ? 4 : 5; // 고급 모드는 최소 5개 필요 (도입1 + A,B,C 3개 + 결론1)
    if (sentences.length < minSentences) {
      return `출제불가: 문장 수가 부족합니다 (${mode === 'basic' ? '기본 모드는 최소 4개' : '고급 모드는 최소 5개'} 필요).`;
    }
    
    // 2. 도입부와 결론 설정
    let introSentences: string[];
    let conclusionSentences: string[] = [];
    let remainingSentences: string[];
    
    if (mode === 'advanced') {
      // 고급 모드: 첫 문장과 마지막 문장을 고정
      introSentences = [sentences[0]];
      conclusionSentences = [sentences[sentences.length - 1]];
      remainingSentences = sentences.slice(1, sentences.length - 1);
      
      console.log('📌 고급 모드 - 도입부: 첫 1개 문장 고정');
      console.log('📌 고급 모드 - 결론: 마지막 1개 문장 고정');
      console.log('📌 고급 모드 - 남은 문장 수:', remainingSentences.length);
    } else {
      // 기본 모드: 첫 1-2문장만 고정
      const introCount = sentences.length === 4 ? 1 : 2;
      introSentences = sentences.slice(0, introCount);
      remainingSentences = sentences.slice(introCount);
      
      console.log('📌 기본 모드 - 도입부 문장 수:', introCount);
      console.log('📌 기본 모드 - 남은 문장 수:', remainingSentences.length);
    }
    
    if (remainingSentences.length < 3) {
      return '출제불가: 도입부와 결론을 제외한 문장이 3개 미만입니다.';
    }
    
    // 3. 나머지를 3개 파트로 분할 (원본 순서)
    const { partA: part1, partB: part2, partC: part3 } = divideSentencesIntoParts(remainingSentences);
    
    console.log('📊 원본 파트 분할:');
    console.log('  - Part 1:', part1.length, '문장');
    console.log('  - Part 2:', part2.length, '문장');
    console.log('  - Part 3:', part3.length, '문장');
    
    // 4. 정답 번호 랜덤 선택 (1-5)
    const correctAnswer = Math.floor(Math.random() * 5) + 1;
    console.log('✅ 정답 번호:', correctAnswer, '-', getOrderByAnswer(correctAnswer));
    
    // 5. 정답에 맞게 파트들을 (A), (B), (C)로 재배열
    const { partA, partB, partC } = shufflePartsForAnswer(correctAnswer, part1, part2, part3);
    
    console.log('🔀 재배열된 파트:');
    console.log('  - Part A:', partA.length, '문장');
    console.log('  - Part B:', partB.length, '문장');
    console.log('  - Part C:', partC.length, '문장');
    
    // 6. 문제 포맷팅
    const intro = introSentences.join(' ');
    const aText = partA.join(' ');
    const bText = partB.join(' ');
    const cText = partC.join(' ');
    const conclusion = conclusionSentences.join(' ');
    
    let question: string;
    
    if (mode === 'advanced') {
      // 고급 모드: 첫 문장과 마지막 문장 모두 표시
      question = `주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오.

${intro}

(A) ${aText}

(B) ${bText}

(C) ${cText}

${conclusion}


① (A)-(C)-(B)
② (B)-(A)-(C)
③ (B)-(C)-(A)
④ (C)-(A)-(B)
⑤ (C)-(B)-(A)

[정답] ${['①', '②', '③', '④', '⑤'][correctAnswer - 1]}`;
    } else {
      // 기본 모드: 첫 문장만 표시
      question = `주어진 글 다음에 이어질 글의 순서로 가장 적절한 것을 고르시오.

${intro}

(A) ${aText}

(B) ${bText}

(C) ${cText}


① (A)-(C)-(B)
② (B)-(A)-(C)
③ (B)-(C)-(A)
④ (C)-(A)-(B)
⑤ (C)-(B)-(A)

[정답] ${['①', '②', '③', '④', '⑤'][correctAnswer - 1]}`;
    }
    
    console.log('✅ 순서 문제 생성 완료');
    
    return question;
    
  } catch (error) {
    console.error('❌ 순서 문제 생성 오류:', error);
    return `출제불가: ${(error as Error).message}`;
  }
}
