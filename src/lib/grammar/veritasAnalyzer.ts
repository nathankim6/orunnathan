import { AIClient } from './types';
import { VeritasPair } from '../prompts/grammar';

// 어법 카테고리 정의
export const GRAMMAR_CATEGORIES = [
  '시제',
  '수일치',
  '태(능동/수동)',
  '준동사',
  '관계사',
  '병렬구조',
  '수식관계',
  '접속관계',
  '조동사',
  '가산/불가산',
  '비교구문',
  '도치구문',
  '가정법',
  '명사절',
  '부사절',
  '분사구문',
  '강조구문'
] as const;

export type GrammarCategory = typeof GRAMMAR_CATEGORIES[number];

interface VeritasOption {
  correct_text: string;
  incorrect_text: string;
  usage_count: number;
}

/**
 * GPT를 사용하여 Veritas 대립쌍의 어법 카테고리를 분석
 */
export async function analyzeVeritasPairCategory(
  client: AIClient,
  correct: string,
  incorrect: string
): Promise<GrammarCategory> {
  const prompt = `다음 영어 어법 대립쌍을 분석하고, 가장 적절한 어법 카테고리를 하나만 선택하세요.

대립쌍:
- 올바른 표현: ${correct}
- 틀린 표현: ${incorrect}

가능한 카테고리:
${GRAMMAR_CATEGORIES.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}

위 카테고리 중 하나만 선택하여 카테고리명만 정확히 답변하세요. (번호 없이 카테고리명만)`;

  try {
    const response = await client.generateCompletion(prompt);
    
    // 응답에서 카테고리 추출
    const cleanResponse = response.trim().replace(/[0-9.)\s]+/, '');
    
    // 정확히 일치하는 카테고리 찾기
    for (const category of GRAMMAR_CATEGORIES) {
      if (cleanResponse.includes(category)) {
        return category;
      }
    }
    
    // 기본값
    console.warn(`Category not found for pair: ${correct}/${incorrect}, defaulting to 기타`);
    return '시제'; // 기본값
  } catch (error) {
    console.error('Error analyzing category:', error);
    return '시제'; // 오류 시 기본값
  }
}

/**
 * Veritas 데이터에서 5개의 서로 다른 카테고리의 대립쌍을 선택
 */
export async function selectDiverseVeritasPairs(
  client: AIClient,
  veritasData: VeritasOption[],
  targetCount: number = 5
): Promise<VeritasPair[]> {
  const categoryMap = new Map<GrammarCategory, VeritasPair[]>();
  
  console.log(`🔍 Analyzing ${veritasData.length} Veritas pairs...`);
  
  // 각 대립쌍의 카테고리를 분석 (최대 30개만 분석하고 병렬 처리로 속도 개선)
  const samplesToAnalyze = veritasData.slice(0, 30);
  
  // 병렬로 분석하여 속도 향상 (배치 크기 10)
  const batchSize = 10;
  for (let i = 0; i < samplesToAnalyze.length; i += batchSize) {
    const batch = samplesToAnalyze.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map(async (option) => {
        try {
          const category = await analyzeVeritasPairCategory(
            client,
            option.correct_text,
            option.incorrect_text
          );
          
          const pair: VeritasPair = {
            correct: option.correct_text,
            incorrect: option.incorrect_text,
            category: category
          };
          
          console.log(`  ✓ ${option.correct_text} ↔ ${option.incorrect_text} → [${category}]`);
          return { pair, category };
        } catch (error) {
          console.warn(`Failed to analyze pair: ${option.correct_text}/${option.incorrect_text}`);
          return null;
        }
      })
    );
    
    // 결과를 categoryMap에 추가
    for (const result of results) {
      if (result) {
        const { pair, category } = result;
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(pair);
      }
    }
  }
  
  console.log(`📊 Categories found: ${categoryMap.size}`);
  
  // 각 카테고리에서 하나씩 선택하여 다양성 확보
  const selectedPairs: VeritasPair[] = [];
  const categories = Array.from(categoryMap.keys());
  
  for (let i = 0; i < targetCount && i < categories.length; i++) {
    const category = categories[i];
    const pairs = categoryMap.get(category)!;
    
    // 사용 빈도가 높은 것을 우선 선택 (이미 usage_count 기준으로 정렬되어 있음)
    if (pairs.length > 0) {
      selectedPairs.push(pairs[0]);
    }
  }
  
  // 부족한 경우 다른 카테고리에서 추가 선택
  if (selectedPairs.length < targetCount) {
    for (const category of categories) {
      if (selectedPairs.length >= targetCount) break;
      
      const pairs = categoryMap.get(category)!;
      for (let i = 1; i < pairs.length && selectedPairs.length < targetCount; i++) {
        selectedPairs.push(pairs[i]);
      }
    }
  }
  
  console.log(`✅ Selected ${selectedPairs.length} diverse pairs:`);
  selectedPairs.forEach((pair, i) => {
    console.log(`  ${i + 1}. [${pair.category}] ${pair.correct} ↔ ${pair.incorrect}`);
  });
  
  return selectedPairs;
}

/**
 * GPT를 사용하여 각 보기에 대한 상세한 해설 생성
 */
export async function generateExplanationWithGPT(
  client: AIClient,
  pair: VeritasPair,
  usedForm: 'correct' | 'incorrect',
  context: string
): Promise<string> {
  const prompt = `다음 어법 대립쌍과 문맥을 보고, 상세한 어법 해설을 작성하세요.

어법 카테고리: [${pair.category}]
대립쌍: ${pair.correct} ↔ ${pair.incorrect}
사용된 형태: ${usedForm === 'correct' ? pair.correct : pair.incorrect}
문맥: ${context}

다음 형식으로 답변하세요:
[${pair.category}]: (사용된 형태)가 사용되었으며, 이는 (문법 원리에 대한 상세한 설명)이므로 ${usedForm === 'correct' ? '적절합니다' : '부적절합니다'}.${usedForm === 'incorrect' ? ` 올바른 형태는 ${pair.correct}입니다.` : ''}

해설은 구체적이고 명확해야 하며, 학습자가 이해하기 쉽도록 작성하세요.`;

  try {
    const response = await client.generateCompletion(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating explanation:', error);
    return `[${pair.category}]: ${usedForm === 'correct' ? pair.correct : pair.incorrect}가 사용되었습니다.`;
  }
}
