import { QuestionType } from "@/types/question";
import { getPromptForType } from "./questionTypes";
import { verifyGrammarQuestion } from "./grammar/verifyGrammarQuestion";
import { verifyQuestionConsistency } from "./grammar/verifyQuestionConsistency";
import { AnthropicClient } from "./ai/anthropicClient";
import { OpenAIClient } from "./ai/openaiClient";
import { DeepseekClient } from "./ai/deepseekClient";
import { GeminiClient } from "./ai/geminiClient";
import { AIClient } from "./grammar/types";
import { VeritasPair } from "./prompts/grammar";
import { supabase } from "@/integrations/supabase/client";
import { validateTopicWritingQuestion } from "./topicWritingValidator";
import { validateConditionWritingQuestion } from "./conditionWritingValidator";
import { validateBlankWritingQuestion } from "./blankWritingValidator";
import { validateOrderQuestion } from "./orderQuestionValidator";
import { generateOrderQuestion } from "./orderQuestionGenerator";
import { randomizeConjunctionAnswer } from "./conjunctionValidator";
import { isSeodapType, validateSeodapQuestion, getSeodapVerificationPrompt } from "./seodapValidator";
import { sanitizeIrrelevantQuestionOutput } from "./irrelevantSanitizer";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  retryCount: number = 0
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // 재시도 가능한 에러: 429 (rate limit), 529 (overloaded), 503 (service unavailable)
    const isRetryable = 
      error.message.includes("429") || 
      error.message.includes("rate limit") ||
      error.message.includes("529") || 
      error.message.includes("overloaded") ||
      error.message.includes("503") ||
      error.message.includes("service unavailable");
    
    if (isRetryable) {
      if (retryCount >= MAX_RETRIES) {
        throw new Error("서버가 과부하 상태이거나 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.");
      }
      
      const delayTime = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`⏳ 재시도 대기 중... ${delayTime}ms (시도 ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(delayTime);
      
      return retryWithExponentialBackoff(operation, retryCount + 1);
    }
    throw error;
  }
}

const generateGrammarWorkbookFromData = async (text: string) => {
  try {
    // Veritas Supabase Edge Function을 통해 New Veritas's Choice 오답 데이터 가져오기
    const { data: response, error } = await supabase.functions.invoke('get-veritas-grammar-data', {});

    if (error) {
      console.error('Error calling Veritas data function:', error);
      throw new Error('New Veritas\'s Choice 오답 데이터를 가져오는 중 오류가 발생했습니다.');
    }

    if (!response.success) {
      console.error('Veritas function returned error:', response.error);
      throw new Error('New Veritas\'s Choice 오답 데이터를 가져오는 중 오류가 발생했습니다.');
    }

    const incorrectOptions = response.data;

    if (!incorrectOptions || incorrectOptions.length === 0) {
      throw new Error('New Veritas\'s Choice 오답 데이터가 없습니다.');
    }

    // 문제 생성 - 텍스트 위치 순서대로 처리 (제한 없이 최대한 많이)
    let modifiedText = text;
    const answers: string[] = [];
    let questionNumber = 1;

    console.log(`🎯 New Veritas's Choice 기반 어법워크북 생성 시작`);
    console.log(`📖 원문 길이: ${text.length}자`);
    console.log(`📚 사용 가능한 오답 옵션: ${incorrectOptions.length}개`);

    // 모든 매칭 위치를 찾아서 정렬
    const allMatches: Array<{
      position: number;
      endPosition: number;
      matchedText: string; // 실제 텍스트에서 매칭된 단어
      incorrect_text: string;
      usage_count: number;
    }> = [];

    // 각 오답 옵션에 대해 텍스트에서 모든 매칭 위치 찾기
    for (const option of incorrectOptions) {
      const { correct_text, incorrect_text, usage_count } = option;
      
      // "X"가 포함된 선택지는 제외 (예: [X/to], [X/for])
      if (incorrect_text.trim().toUpperCase() === 'X') continue;
      
      // 정확한 매칭을 위한 정규식 (단어 경계 고려)
      const escapedText = correct_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedText}\\b`, 'gi');
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({
          position: match.index,
          endPosition: match.index + match[0].length,
          matchedText: match[0],
          incorrect_text,
          usage_count
        });
      }
    }

    // 위치 순서대로 정렬 (텍스트 앞쪽부터)
    allMatches.sort((a, b) => a.position - b.position);

    console.log(`🔍 전체 매칭 발견: ${allMatches.length}개`);

    // 겹치지 않는 매칭만 선택하여 문제 생성
    const selectedMatches = [];
    let lastEndPosition = -1;

    for (const match of allMatches) {
      // 이전 매칭과 겹치지 않는지 확인
      if (match.position >= lastEndPosition) {
        selectedMatches.push(match);
        lastEndPosition = match.endPosition;
      }
    }

    console.log(`✅ 선택된 매칭: ${selectedMatches.length}개`);

    // 텍스트를 뒤에서부터 교체 (앞쪽 위치가 변경되지 않도록)
    let workingText = text;
    const reverseMatches = [...selectedMatches].reverse();
    
    for (let i = 0; i < reverseMatches.length; i++) {
      const match = reverseMatches[i];
      const questionNum = selectedMatches.length - i; // 원래 순서대로 번호 매기기
      
      const choicePattern = `(${questionNum})[${match.incorrect_text}/${match.matchedText}]`;
      
      // 텍스트 교체
      const beforeMatch = workingText.substring(0, match.position);
      const afterMatch = workingText.substring(match.endPosition);
      workingText = beforeMatch + choicePattern + afterMatch;
      
      console.log(`✅ 문제 ${questionNum}: "${match.matchedText}" → [${match.incorrect_text}/${match.matchedText}] (위치: ${match.position}, 사용빈도: ${match.usage_count})`);
    }

    // 정답 배열 생성 (순서대로) - 실제 매칭된 텍스트 사용
    for (let i = 0; i < selectedMatches.length; i++) {
      answers.push(selectedMatches[i].matchedText);
    }

    if (answers.length === 0) {
      throw new Error('생성 가능한 문제가 없습니다. 텍스트와 New Veritas\'s Choice 오답 데이터가 일치하지 않습니다.');
    }

    // 정답을 사용자 예시와 같은 형식으로 포맷팅
    const formattedAnswers = answers.map((answer, index) => `(${index + 1})${answer}`).join(' ');

    // 최종 결과 포맷팅 - 사용자 예시와 동일한 형식
    const result = `다음 중 어법상 옳은 것을 고르시오.
${workingText}

어법 정답
${formattedAnswers}`;

    console.log(`🎉 어법워크북 생성 완료: ${answers.length}개 문제`);
    return result;
  } catch (error) {
    console.error('Error generating grammar workbook:', error);
    throw error;
  }
};

// Common function to randomize answer distribution for 5-choice questions
function randomizeFiveChoiceAnswerDistribution(output: string, typeId?: string): string {
  try {
    // Normalize [정답] variants
    output = output.replace(/\*+\s*\[정답\]\s*\*+/g, '[정답]');
    output = output.replace(/^\s*정답\s*[:：]\s*/gmi, '[정답] ');
    output = output.replace(/^\s*Answer\s*[:：]\s*/gmi, '[정답] ');

    const numeralsArr = ['①','②','③','④','⑤'];
    const numerals = '①②③④⑤';

    // Locate the [정답] marker to split sections
    const answerMarkerIdx = output.search(/\[정답\]/);
    if (answerMarkerIdx === -1) return output;

    // Find the first 5 options BEFORE [정답] (avoid matching the [보기 해석] section)
    const beforeAnswer = output.slice(0, answerMarkerIdx);
    const optionRegex = /^(?<indent>\s*)(?<mark>①|②|③|④|⑤|[1-5][\.)])\s+(?<text>.*)$/gm;
    const optionMatches = [...beforeAnswer.matchAll(optionRegex)];
    if (optionMatches.length < 5) return output;

    const mainMatches = optionMatches.slice(0, 5);
    const optionStart = mainMatches[0].index!;
    const optionEnd = mainMatches[4].index! + mainMatches[4][0].length;

    const texts = mainMatches.map(m => m.groups?.text ?? '');
    const indents = mainMatches.map(m => m.groups?.indent ?? '');

    // Extract current answer index from [정답]
    const afterAnswer = output.slice(answerMarkerIdx);
    const ansMatch = afterAnswer.match(/\[정답\][^\S\r\n]*(?:\r?\n[^\S\r\n]*)?(?<sym>[①-⑤]|[1-5])(?:\s*번)?/);
    if (!ansMatch?.groups?.sym) return output;

    const sym = ansMatch.groups.sym;
    let answerIndex = numerals.indexOf(sym);
    answerIndex = answerIndex >= 0 ? answerIndex + 1 : parseInt(sym, 10);
    if (!(answerIndex >= 1 && answerIndex <= 5)) return output;

    // Choose a balanced new index (even distribution across sessions), excluding current index
    let candidateIndices = [1, 2, 3, 4, 5].filter(i => i !== answerIndex);
    let newIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    try {
      const storageKey = `answer_dist_${typeId || 'generic'}`;
      const raw = localStorage.getItem(storageKey);
      const counts: Record<string, number> = raw ? JSON.parse(raw) : {} as any;
      for (let i = 1; i <= 5; i++) if ((counts as any)[i] == null) (counts as any)[i] = 0;

      let min = Infinity;
      let pool: number[] = [];
      for (const i of candidateIndices) {
        const c = (counts as any)[i] as number;
        if (c < min) { min = c; pool = [i]; }
        else if (c === min) pool.push(i);
      }
      newIndex = pool[Math.floor(Math.random() * pool.length)];
      (counts as any)[newIndex] = ((counts as any)[newIndex] ?? 0) + 1;
      localStorage.setItem(storageKey, JSON.stringify(counts));
    } catch {}

    // Rebuild options with the correct one at newIndex
    const correctText = texts[answerIndex - 1];
    const remaining = texts.filter((_, i) => i !== answerIndex - 1);
    const newTexts: string[] = [];
    for (let i = 0, r = 0; i < 5; i++) {
      if (i === newIndex - 1) newTexts[i] = correctText;
      else newTexts[i] = remaining[r++];
    }

    const rebuilt = newTexts.map((t, i) => `${indents[i] ?? ''}${numeralsArr[i]} ${t}`).join('\n');

    // Replace only the main options block (before [정답])
    const before = beforeAnswer.slice(0, optionStart);
    const between = beforeAnswer.slice(optionEnd);
    let updated = before + rebuilt + between + output.slice(answerMarkerIdx);

    // Update the [정답] marker to the new index
    if (/\[정답\]\s*\r?\n\s*[①-⑤1-5]/.test(updated)) {
      updated = updated.replace(/\[정답\]\s*\r?\n\s*[①-⑤1-5](?:\s*번)?/, `[정답]\n${numeralsArr[newIndex - 1]}`);
    } else {
      updated = updated.replace(/\[정답\]\s*[①-⑤1-5](?:\s*번)?/, `[정답] ${numeralsArr[newIndex - 1]}`);
    }

    // Update [해설] section to match the new answer number and reorder explanations
    const oldNumeral = numeralsArr[answerIndex - 1];
    const newNumeral = numeralsArr[newIndex - 1];
    
    console.log(`🔄 답안 번호 변경: ${oldNumeral} → ${newNumeral}`);
    
    // Build permutation map: old position → new position
    // For each position in newTexts, find where that text was in original texts
    const permutationMap: Record<number, number> = {}; // old index (1-5) → new index (1-5)
    
    for (let newPos = 0; newPos < 5; newPos++) {
      const text = newTexts[newPos];
      const oldPos = texts.findIndex(t => t === text);
      if (oldPos !== -1) {
        permutationMap[oldPos + 1] = newPos + 1; // Convert to 1-based indices
      }
    }
    
    console.log('🔀 순서 변경 맵:', permutationMap);
    
    // Find [해설] section and update
    const explanationIdx = updated.indexOf('[해설]');
    if (explanationIdx !== -1) {
      const beforeExplanation = updated.slice(0, explanationIdx);
      let afterExplanation = updated.slice(explanationIdx);
      
      console.log(`📝 [해설] 원본 (첫 200자):`, afterExplanation.substring(0, 200));
      
      // Step 1: Update "정답은 X번입니다" in the first sentence
      afterExplanation = afterExplanation.replace(
        /(정답은\s*)([①-⑤])(\s*번입니다)/,
        `$1${newNumeral}$3`
      );
      
      // Step 2: Update any mentions of correct answer in explanation text
      // e.g., "따라서 ... ① 'word1 - word2'입니다" → "② 'word1 - word2'입니다"
      const correctAnswerPattern = new RegExp(
        `(가장 적절한 말은|들어갈 말로|정답은)\\s*${oldNumeral}\\s*['']`,
        'g'
      );
      afterExplanation = afterExplanation.replace(
        correctAnswerPattern,
        `$1 ${newNumeral} '`
      );
      
      // Step 3: Update all option references in explanation text according to permutation map
      // BUT skip the first sentence "정답은 X번입니다" - only update references after that
      // Split by first sentence
      const firstSentenceMatch = afterExplanation.match(/^[^.!?]*[.!?]\s*/);
      const firstSentence = firstSentenceMatch ? firstSentenceMatch[0] : '';
      const restOfExplanation = afterExplanation.substring(firstSentence.length);
      
      // CRITICAL FIX: Use permutationMap directly (old position → new position)
      // The explanation text was written based on ORIGINAL option order
      // So we need to replace "old number" with "new number" using permutationMap
      let updatedRest = restOfExplanation;
      const placeholders: Record<string, string> = {};
      
      // For each original position, find its new position and create replacement
      for (let oldIdx = 1; oldIdx <= 5; oldIdx++) {
        const newIdx = permutationMap[oldIdx];
        if (!newIdx) continue; // Skip if no mapping exists
        const oldNum = numeralsArr[oldIdx - 1];
        const newNum = numeralsArr[newIdx - 1];
        placeholders[`__PLACEHOLDER_${oldIdx}__`] = newNum;
        
        // Replace "①번" followed by anything (선택지는, 은, 이, etc.)
        // This will match "①번 선택지는", "①번은", "①번이", etc.
        const pattern = new RegExp(`${oldNum}번`, 'g');
        updatedRest = updatedRest.replace(pattern, `__PLACEHOLDER_${oldIdx}__번`);
      }
      
      // Replace placeholders with actual numerals
      for (const [placeholder, numeral] of Object.entries(placeholders)) {
        const pattern = new RegExp(placeholder, 'g');
        updatedRest = updatedRest.replace(pattern, numeral);
      }
      
      // Reconstruct: first sentence + updated rest
      afterExplanation = firstSentence + updatedRest;
      
      // Step 3: Reorder per-option explanations (lines starting with ①②③④⑤)
      // Extract lines that start with circled numbers
      const lines = afterExplanation.split('\n');
      const explanationLines: { numeral: string; line: string; originalIdx: number }[] = [];
      
      lines.forEach((line) => {
        const match = line.match(/^\s*([①-⑤])\s+/);
        if (match) {
          const numeral = match[1];
          const originalIdx = numeralsArr.indexOf(numeral) + 1;
          explanationLines.push({ numeral, line, originalIdx });
        }
      });
      
      // Reorder explanation lines according to permutation map
      if (explanationLines.length > 0) {
        const reorderedExplanations = explanationLines
          .map(({ line, originalIdx }) => {
            const newIdx = permutationMap[originalIdx];
            const newNumeral = numeralsArr[newIdx - 1];
            // Replace the leading numeral with the new one
            return line.replace(/^\s*[①-⑤]/, newNumeral);
          })
          .sort((a, b) => {
            const aNum = numeralsArr.indexOf(a.match(/^[①-⑤]/)?.[0] || '①');
            const bNum = numeralsArr.indexOf(b.match(/^[①-⑤]/)?.[0] || '①');
            return aNum - bNum;
          });
        
        // Reconstruct the explanation section
        const reconstructed: string[] = [];
        let explIdx = 0;
        lines.forEach((line) => {
          const isExplLine = line.match(/^\s*[①-⑤]\s+/);
          if (isExplLine) {
            if (explIdx < reorderedExplanations.length) {
              reconstructed.push(reorderedExplanations[explIdx++]);
            }
          } else {
            reconstructed.push(line);
          }
        });
        
        afterExplanation = reconstructed.join('\n');
      }
      
      console.log(`📝 [해설] 변경 후 (첫 200자):`, afterExplanation.substring(0, 200));
      
      updated = beforeExplanation + afterExplanation;
    } else {
      console.warn('⚠️ [해설] 섹션을 찾을 수 없습니다.');
    }

    // If a [보기 해석] section exists, reorder its 5 items with the same permutation
    try {
      const viewIdx = updated.indexOf('[보기 해석]');
      if (viewIdx !== -1) {
        const afterView = updated.slice(viewIdx);
        const transMatches = [...afterView.matchAll(optionRegex)];
        if (transMatches.length >= 5) {
          const tStart = viewIdx + (transMatches[0].index ?? 0);
          const tEnd = viewIdx + (transMatches[4].index ?? 0) + transMatches[4][0].length;
          const transTexts = transMatches.slice(0, 5).map(m => m.groups?.text ?? '');
          const transIndents = transMatches.slice(0, 5).map(m => m.groups?.indent ?? '');

          // Use permutationMap to reorder Korean translations
          // Create reverse map: newIdx -> oldIdx
          const reverseMap: Record<number, number> = {};
          for (const [oldIdxStr, newIdx] of Object.entries(permutationMap)) {
            const oldIdx = parseInt(oldIdxStr);
            reverseMap[newIdx] = oldIdx;
          }
          
          console.log('🔍 [보기 해석] 재정렬 디버깅:');
          console.log('permutationMap:', permutationMap);
          console.log('reverseMap:', reverseMap);
          console.log('원본 한글 transTexts:', transTexts);
          
          // Build newTrans using reverseMap
          const newTrans: string[] = [];
          for (let newIdx = 1; newIdx <= 5; newIdx++) {
            const oldIdx = reverseMap[newIdx];
            if (oldIdx) {
              newTrans[newIdx - 1] = transTexts[oldIdx - 1];
              console.log(`새 위치 ${newIdx}번 ← 원본 위치 ${oldIdx}번: "${transTexts[oldIdx - 1]?.substring(0, 30)}..."`);
            }
          }
          
          console.log('재정렬된 한글 newTrans:', newTrans);

          const rebuiltTrans = newTrans.map((t, i) => `${transIndents[i] ?? ''}${numeralsArr[i]} ${t}`).join('\n');
          updated = updated.slice(0, tStart) + rebuiltTrans + updated.slice(tEnd);
        }
      }
    } catch {}

    return updated;
  } catch {
    return output;
  }
}

// Ensure blank line before [정답] section
function ensureBlankLineBeforeAnswer(content: string): string {
  // Match: non-newline char + single newline + optional spaces + [정답]
  // Replace with: that char + two newlines + [정답] (creates blank line)
  return content.replace(/([^\n])\n[ ]*(\[정답\])/g, '$1\n\n$2');
}

// Remove debug output from AI responses (randomization procedure details)
function removeDebugOutput(content: string): string {
  // Remove entire [정답 랜덤화 절차] section and similar debug output
  content = content.replace(/\[정답 랜덤화 절차\][\s\S]*?(?=\n\n[①-⑤]|\n\[정답\]|$)/g, '');
  
  // Remove lines like "본문 길이: L = 1,108 (공백/문장부호 포함)"
  content = content.replace(/본문\s*길이\s*:?\s*L\s*=\s*\d+[^\n]*\n?/g, '');
  
  // Remove lines like "K = (1,108 mod 5) + 1 = 4"
  content = content.replace(/K\s*=\s*\([^\)]+\)\s*\+\s*\d+\s*=\s*\d+[^\n]*\n?/g, '');
  
  // Remove lines like "정답을 ④번에 배치"
  content = content.replace(/정답을\s*[①-⑤]\s*번에\s*배치[^\n]*\n?/g, '');
  
  // Remove "ANSWER RANDOMIZATION" section if it appears
  content = content.replace(/ANSWER\s+RANDOMIZATION[\s\S]*?(?=\n\n[①-⑤]|\n\[정답\]|$)/gi, '');
  
  // Remove any remaining standalone procedural lines
  content = content.replace(/Step\s+\d+:[\s\S]*?(?=\n\n|\n[①-⑤]|\[정답\]|$)/gi, '');
  
  // Remove verification comments (검증 관련 멘트 제거)
  content = content.replace(/\n*,?\s*"?검증:[\s\S]*?[✓✗]\s*\n*/gi, '');
  content = content.replace(/\n*검증 결과:[\s\S]*?(?=\n\n|\[|$)/gi, '');
  content = content.replace(/\n*-\s*정답 단어[^\n]*(?:\n[^\n]*[✓✗][^\n]*)*\n*/gi, '');
  content = content.replace(/\n*-\s*보기 단어[^\n]*\n*/gi, '');
  content = content.replace(/\n*-\s*단어 개수[^\n]*\n*/gi, '');
  content = content.replace(/\n*\*\*번호 개수 검증:\*\*[^\n]*\n*/gi, '');
  content = content.replace(/\n*번호 개수 검증:[^\n]*\n*/gi, '');
  content = content.replace(/,\s*"검증:[\s\S]*?"\s*$/gi, '');
  content = content.replace(/\n*-\s*모든 단어[^\n]*[✓✗][^\n]*\n*/gi, '');
  
  // Remove markdown formatting artifacts (**, *, _)
  content = content.replace(/\*\*+/g, '');
  content = content.replace(/(?<!\w)_(?!\w)/g, '');
  
  // Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  return content.trim();
}

// For combinedQuestion: detect when AI re-emits the passage before/after question 15/16
// and strip the duplicate. Uses fingerprint of first 60 chars of largest text block.
function stripDuplicatePassageInCombined(content: string): string {
  // Split by question number markers (14., 15., 16.)
  const questionMarkerRegex = /(^|\n)(\d{2})\.\s/g;
  const matches: { num: number; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = questionMarkerRegex.exec(content)) !== null) {
    const num = parseInt(m[2], 10);
    if (num >= 14 && num <= 20) {
      matches.push({ num, index: m.index + (m[1] ? 1 : 0) });
    }
  }
  if (matches.length < 2) return content;

  // Extract passage fingerprint: first 80 alphabetic chars of content before first question
  const headSection = content.slice(0, matches[0].index);
  const fingerprint = headSection.replace(/<[^>]+>/g, '').replace(/[^a-zA-Z]/g, '').slice(0, 80);
  if (fingerprint.length < 40) return content;

  // For each subsequent question section, check if it contains the fingerprint
  // If so, strip the duplicated passage portion (keep only the question text starting at "NN.")
  const sections: string[] = [];
  sections.push(content.slice(0, matches[0].index)); // passage + intro

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
    let section = content.slice(start, end);

    // Skip first question - it doesn't duplicate
    if (i === 0) {
      sections.push(section);
      continue;
    }

    // Check if this section contains the passage fingerprint (substring match, ignoring tags/whitespace)
    const sectionAlpha = section.replace(/<[^>]+>/g, '').replace(/[^a-zA-Z]/g, '');
    if (sectionAlpha.includes(fingerprint)) {
      // Find the question stem line: "NN. ..." up to first ① or [정답] (excluding repeated passage)
      // Strategy: locate "NN." then find the LAST occurrence of a long English-alpha block before the first ①/[정답]
      // and remove it.
      const stemMatch = section.match(/^(\d{2})\.\s*([^\n]*)/);
      const stemLine = stemMatch ? stemMatch[0] : `${matches[i].num}.`;

      // Find where choices/answer start
      const choiceIdx = section.search(/(?:①|\[정답\])/);
      if (choiceIdx > 0) {
        const beforeChoices = section.slice(0, choiceIdx);
        const afterChoices = section.slice(choiceIdx);

        // In beforeChoices, keep only the stem line and strip any repeated passage paragraph
        // A "passage paragraph" = consecutive non-stem lines containing 5+ English words
        const lines = beforeChoices.split('\n');
        const cleaned: string[] = [];
        for (const line of lines) {
          // Always keep the stem line
          if (line.trim().match(/^\d{2}\.\s/)) {
            cleaned.push(line);
            continue;
          }
          // Keep short instruction-like lines
          const wordCount = (line.match(/[a-zA-Z]+/g) || []).length;
          if (wordCount < 8) {
            cleaned.push(line);
            continue;
          }
          // Skip long English content (likely duplicated passage)
          // — but only if the fingerprint matches this line's region
          const lineAlpha = line.replace(/<[^>]+>/g, '').replace(/[^a-zA-Z]/g, '');
          if (fingerprint.slice(0, 30).length > 0 && sectionAlpha.includes(fingerprint.slice(0, 30)) && lineAlpha.length > 30) {
            // Check this specific line is part of the passage by checking if its start matches
            // any consecutive 30-char window of the original passage
            const headAlpha = headSection.replace(/<[^>]+>/g, '').replace(/[^a-zA-Z]/g, '');
            if (headAlpha.includes(lineAlpha.slice(0, 30))) {
              continue; // skip — duplicated passage line
            }
          }
          cleaned.push(line);
        }
        section = cleaned.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n' + afterChoices;
      }
    }
    sections.push(section);
  }

  return sections.join('').replace(/\n{3,}/g, '\n\n');
}


// Function to randomize answer distribution for double-answer (2 correct) questions
function randomizeDoubleAnswerDistribution(output: string, typeId?: string): string {
  try {
    // Normalize [정답] variants
    output = output.replace(/\*+\s*\[정답\]\s*\*+/g, '[정답]');
    output = output.replace(/^\s*정답\s*[:：]\s*/gmi, '[정답] ');

    const numeralsArr = ['①','②','③','④','⑤'];
    const numerals = '①②③④⑤';

    // Locate the [정답] marker
    const answerMarkerIdx = output.search(/\[정답\]/);
    if (answerMarkerIdx === -1) return output;

    // Find the first 5 options BEFORE [정답]
    const beforeAnswer = output.slice(0, answerMarkerIdx);
    const optionRegex = /^(?<indent>\s*)(?<mark>①|②|③|④|⑤|[1-5][\.)])\s+(?<text>.*)$/gm;
    const optionMatches = [...beforeAnswer.matchAll(optionRegex)];
    if (optionMatches.length < 5) return output;

    const mainMatches = optionMatches.slice(0, 5);
    const optionStart = mainMatches[0].index!;
    const optionEnd = mainMatches[4].index! + mainMatches[4][0].length;

    const texts = mainMatches.map(m => m.groups?.text ?? '');
    const indents = mainMatches.map(m => m.groups?.indent ?? '');

    // Extract current answer indices from [정답] (e.g., "①, ③" or "1, 3")
    const afterAnswer = output.slice(answerMarkerIdx);
    const ansMatch = afterAnswer.match(/\[정답\][^\S\r\n]*(?:\r?\n[^\S\r\n]*)?(?<ans1>[①-⑤1-5])(?:\s*번)?\s*,\s*(?<ans2>[①-⑤1-5])(?:\s*번)?/);
    if (!ansMatch?.groups?.ans1 || !ansMatch?.groups?.ans2) return output;

    const sym1 = ansMatch.groups.ans1;
    const sym2 = ansMatch.groups.ans2;
    
    let idx1 = numerals.indexOf(sym1);
    idx1 = idx1 >= 0 ? idx1 + 1 : parseInt(sym1, 10);
    
    let idx2 = numerals.indexOf(sym2);
    idx2 = idx2 >= 0 ? idx2 + 1 : parseInt(sym2, 10);

    if (!(idx1 >= 1 && idx1 <= 5 && idx2 >= 1 && idx2 <= 5 && idx1 !== idx2)) return output;

    // All possible pairs (10 combinations)
    const allPairs: [number, number][] = [
      [1,2], [1,3], [1,4], [1,5],
      [2,3], [2,4], [2,5],
      [3,4], [3,5],
      [4,5]
    ];

    // Choose a balanced new pair using localStorage for distribution tracking
    let newPair = allPairs[Math.floor(Math.random() * allPairs.length)];
    try {
      const storageKey = `answer_dist_double_${typeId || 'generic'}`;
      const raw = localStorage.getItem(storageKey);
      const counts: Record<string, number> = raw ? JSON.parse(raw) : {};
      
      // Initialize counts for all pairs
      for (const [a, b] of allPairs) {
        const key = `${a},${b}`;
        if (counts[key] == null) counts[key] = 0;
      }

      // Find pairs with minimum count
      let min = Infinity;
      let pool: [number, number][] = [];
      for (const pair of allPairs) {
        const key = `${pair[0]},${pair[1]}`;
        const c = counts[key];
        if (c < min) { min = c; pool = [pair]; }
        else if (c === min) pool.push(pair);
      }
      
      newPair = pool[Math.floor(Math.random() * pool.length)];
      const newKey = `${newPair[0]},${newPair[1]}`;
      counts[newKey] = (counts[newKey] ?? 0) + 1;
      localStorage.setItem(storageKey, JSON.stringify(counts));
    } catch {}

    // Create a shuffled array that places the 2 correct answers at newPair positions
    const correctText1 = texts[idx1 - 1];
    const correctText2 = texts[idx2 - 1];
    const remaining = texts.filter((_, i) => i !== idx1 - 1 && i !== idx2 - 1);
    
    const newTexts: string[] = [];
    let remainingIdx = 0;
    for (let i = 0; i < 5; i++) {
      const pos = i + 1;
      if (pos === newPair[0]) {
        newTexts[i] = correctText1;
      } else if (pos === newPair[1]) {
        newTexts[i] = correctText2;
      } else {
        newTexts[i] = remaining[remainingIdx++];
      }
    }

    const rebuilt = newTexts.map((t, i) => `${indents[i] ?? ''}${numeralsArr[i]} ${t}`).join('\n');

    // Replace the options block
    const before = beforeAnswer.slice(0, optionStart);
    const between = beforeAnswer.slice(optionEnd);
    let updated = before + rebuilt + between + output.slice(answerMarkerIdx);

    // Update the [정답] marker to the new pair
    const newAnswerStr = `${numeralsArr[newPair[0] - 1]}, ${numeralsArr[newPair[1] - 1]}`;
    if (/\[정답\]\s*\r?\n/.test(updated)) {
      updated = updated.replace(/\[정답\]\s*\r?\n\s*[①-⑤1-5](?:\s*번)?\s*,\s*[①-⑤1-5](?:\s*번)?/, `[정답]\n${newAnswerStr}`);
    } else {
      updated = updated.replace(/\[정답\]\s*[①-⑤1-5](?:\s*번)?\s*,\s*[①-⑤1-5](?:\s*번)?/, `[정답] ${newAnswerStr}`);
    }

    // Update [해설] section to match the new answer numbers and reorder explanations
    const oldNumeral1 = numeralsArr[idx1 - 1];
    const oldNumeral2 = numeralsArr[idx2 - 1];
    const newNumeral1 = numeralsArr[newPair[0] - 1];
    const newNumeral2 = numeralsArr[newPair[1] - 1];
    
    console.log(`🔄 답안 번호 변경: ${oldNumeral1}, ${oldNumeral2} → ${newNumeral1}, ${newNumeral2}`);
    
    // Build permutation map: old position → new position
    const permutationMap: Record<number, number> = {}; // old index (1-5) → new index (1-5)
    
    for (let i = 0; i < 5; i++) {
      const pos = i + 1;
      if (pos === newPair[0]) {
        permutationMap[idx1] = pos; // first correct answer moves to newPair[0]
      } else if (pos === newPair[1]) {
        permutationMap[idx2] = pos; // second correct answer moves to newPair[1]
      } else {
        // Find which original index this incorrect option came from
        const text = newTexts[i];
        const originalIdx = texts.findIndex(t => t === text) + 1;
        permutationMap[originalIdx] = pos;
      }
    }
    
    console.log('🔀 순서 변경 맵:', permutationMap);
    
    // Find [해설] section and update answer references
    const explanationIdx = updated.indexOf('[해설]');
    if (explanationIdx !== -1) {
      const beforeExplanation = updated.slice(0, explanationIdx);
      let afterExplanation = updated.slice(explanationIdx);
      
      console.log(`📝 [해설] 원본 (첫 200자):`, afterExplanation.substring(0, 200));
      
      // Step 1: Update "정답은 X번, Y번입니다" or similar patterns in the first sentence
      afterExplanation = afterExplanation.replace(
        /(정답은\s*)([①-⑤])\s*,\s*([①-⑤])(\s*번입니다)/,
        `$1${newNumeral1}, ${newNumeral2}$4`
      );
      
      // Also handle patterns like "정답은 ①번, ③번입니다"
      afterExplanation = afterExplanation.replace(
        /(정답은\s*)([①-⑤])(\s*번)\s*,\s*([①-⑤])(\s*번입니다)/,
        `$1${newNumeral1}$3, ${newNumeral2}$5`
      );
      
      // Step 1.5: Update "X번 선택지는", "Y번 선택지는" that immediately follow "정답은..."
      // This fixes the bug where explanation mentions old answer numbers right after stating correct answers
      // Replace old numerals in the first ~300 characters after "정답은"
      const firstPart = afterExplanation.substring(0, Math.min(300, afterExplanation.length));
      const restPart = afterExplanation.substring(Math.min(300, afterExplanation.length));
      
      let updatedFirstPart = firstPart;
      // Replace oldNumeral1 with newNumeral1 in "X번 선택지" pattern
      updatedFirstPart = updatedFirstPart.replace(
        new RegExp(`(${oldNumeral1})(번\\s*선택지)`, 'g'),
        `${newNumeral1}$2`
      );
      // Replace oldNumeral2 with newNumeral2 in "Y번 선택지" pattern
      updatedFirstPart = updatedFirstPart.replace(
        new RegExp(`(${oldNumeral2})(번\\s*선택지)`, 'g'),
        `${newNumeral2}$2`
      );
      
      afterExplanation = updatedFirstPart + restPart;
      
      // Step 2: Update any mentions of correct answers in explanation text
      // Handle both old numerals appearing in explanations
      const patterns = [
        new RegExp(`(가장 적절한|들어갈 말로|정답은)\\s*${oldNumeral1}\\s*['']`, 'g'),
        new RegExp(`(가장 적절한|들어갈 말로|정답은)\\s*${oldNumeral2}\\s*['']`, 'g'),
      ];
      
      afterExplanation = afterExplanation.replace(patterns[0], `$1 ${newNumeral1} '`);
      afterExplanation = afterExplanation.replace(patterns[1], `$1 ${newNumeral2} '`);
      
      // Step 2.5: Update all option references in explanation text according to permutation map
      // BUT skip the first sentence "정답은 X번, Y번입니다" - only update references after that
      // Split by first sentence
      const firstSentenceMatch = afterExplanation.match(/^[^.!?]*[.!?]\s*/);
      const firstSentence = firstSentenceMatch ? firstSentenceMatch[0] : '';
      const restOfExplanation = afterExplanation.substring(firstSentence.length);
      
      // CRITICAL FIX: Use permutationMap directly (old position → new position)
      // The explanation text was written based on ORIGINAL option order
      // So we need to replace "old number" with "new number" using permutationMap
      let updatedRest = restOfExplanation;
      const placeholders: Record<string, string> = {};
      
      // For each original position, find its new position and create replacement
      for (let oldIdx = 1; oldIdx <= 5; oldIdx++) {
        const newIdx = permutationMap[oldIdx];
        if (!newIdx) continue; // Skip if no mapping exists
        const oldNum = numeralsArr[oldIdx - 1];
        const newNum = numeralsArr[newIdx - 1];
        placeholders[`__PLACEHOLDER_${oldIdx}__`] = newNum;
        
        // Replace "①번" followed by anything (선택지는, 은, 이, etc.)
        // This will match "①번 선택지는", "①번은", "①번이", etc.
        const pattern = new RegExp(`${oldNum}번`, 'g');
        updatedRest = updatedRest.replace(pattern, `__PLACEHOLDER_${oldIdx}__번`);
      }
      
      // Replace placeholders with actual numerals
      for (const [placeholder, numeral] of Object.entries(placeholders)) {
        const pattern = new RegExp(placeholder, 'g');
        updatedRest = updatedRest.replace(pattern, numeral);
      }
      
      // Reconstruct: first sentence + updated rest
      afterExplanation = firstSentence + updatedRest;
      
      // Step 3: Reorder per-option explanations (lines starting with ①②③④⑤)
      const lines = afterExplanation.split('\n');
      const explanationLines: { numeral: string; line: string; originalIdx: number }[] = [];
      
      lines.forEach((line) => {
        const match = line.match(/^\s*([①-⑤])\s+/);
        if (match) {
          const numeral = match[1];
          const originalIdx = numeralsArr.indexOf(numeral) + 1;
          explanationLines.push({ numeral, line, originalIdx });
        }
      });
      
      // Reorder explanation lines according to permutation map
      if (explanationLines.length > 0) {
        const reorderedExplanations = explanationLines
          .map(({ line, originalIdx }) => {
            const newIdx = permutationMap[originalIdx];
            const newNumeral = numeralsArr[newIdx - 1];
            // Replace the leading numeral with the new one
            return line.replace(/^\s*[①-⑤]/, newNumeral);
          })
          .sort((a, b) => {
            const aNum = numeralsArr.indexOf(a.match(/^[①-⑤]/)?.[0] || '①');
            const bNum = numeralsArr.indexOf(b.match(/^[①-⑤]/)?.[0] || '①');
            return aNum - bNum;
          });
        
        // Reconstruct the explanation section
        const reconstructed: string[] = [];
        let explIdx = 0;
        lines.forEach((line) => {
          const isExplLine = line.match(/^\s*[①-⑤]\s+/);
          if (isExplLine) {
            if (explIdx < reorderedExplanations.length) {
              reconstructed.push(reorderedExplanations[explIdx++]);
            }
          } else {
            reconstructed.push(line);
          }
        });
        
        afterExplanation = reconstructed.join('\n');
      }
      
      console.log(`📝 [해설] 변경 후 (첫 200자):`, afterExplanation.substring(0, 200));
      
      updated = beforeExplanation + afterExplanation;
    } else {
      console.warn('⚠️ [해설] 섹션을 찾을 수 없습니다.');
    }

    return updated;
  } catch {
    return output;
  }
}

export const generateQuestion = async (
  type: QuestionType, 
  text: string, 
  paraphraseLevel: string = "1", 
  complexity: string = "수능",
  mode?: 'basic' | 'advanced' | 'two-blanks' | 'three-blanks',
  signal?: AbortSignal,
  veritasPairs?: VeritasPair[],
  choiceLanguage?: 'english' | 'korean',
  combinedTypes?: string[],
  paraphraseBlank: boolean = true,
  subType?: 'underline' | 'boxed'
) => {
  try {
    // Debug logging to check the type structure
    console.log("Type object received:", type);
    console.log("Type ID:", type?.id);
    console.log("Type ID check result:", type?.id === "order");
    
    // Handle order questions with pure logic (no AI)
    if (type?.id === "order") {
      console.log("✅ Processing order question with pure logic - bypassing AI completely");
      const orderMode = (mode === 'basic' || mode === 'advanced') ? mode : 'basic';
      const result = generateOrderQuestion(text, orderMode);
      console.log("✅ Order question generated successfully with logic");
      return result;
    }
    
    // Handle grammar workbook with Supabase data
    if (type?.id === "grammarWorkbook") {
    console.log("✅ Processing grammar workbook with Supabase data - bypassing AI completely");
      const result = await generateGrammarWorkbookFromData(text);
      console.log("✅ Grammar workbook generated successfully with Supabase data");
      return result;
    }

    // Get API keys first (needed for grammar pairs analysis)
    const claudeApiKey = localStorage.getItem("claude_api_key");
    const geminiApiKey = localStorage.getItem("gemini_api_key");
    const gptApiKey = localStorage.getItem("gpt_api_key");
    const deepseekApiKey = localStorage.getItem("deepseek_api_key");

    // Use pre-cached Veritas data or fetch from database
    let selectedGrammarPairs: VeritasPair[] | undefined;
    if (type?.id === "grammar") {
      // If Veritas pairs are provided (pre-cached), use them for faster generation
      if (veritasPairs && veritasPairs.length > 0) {
        selectedGrammarPairs = veritasPairs;
        console.log(`✅ Using pre-cached Veritas data (${selectedGrammarPairs.length} pairs) - faster generation!`);
      } else {
        // Fallback to database fetch if no cached data provided
        try {
          console.log("📚 Using Veritas Data Manager for grammar question...");
          const { veritasDataManager } = await import('./grammar/veritasDataManager');
          
          // 데이터베이스 상태 확인
          const dataStatus = await veritasDataManager.getDataStatus();
          
          if (!dataStatus.exists) {
            console.log("⚠️ No categorized Veritas data found in database. Triggering analysis...");
            
            // 분석 시작 (Edge Function 호출)
            const result = await veritasDataManager.triggerAnalysis();
            
            if (!result.success) {
              console.error("❌ Failed to trigger analysis:", result.message);
              throw new Error(result.message);
            }
            
            console.log("⏳ Analysis started:", result.message);
            console.log("📌 Please wait 5-10 minutes for the first analysis to complete, then try generating again.");
            
            throw new Error('Veritas 데이터 분석이 진행 중입니다. 5-10분 후 다시 시도해주세요.');
          } else {
            console.log(`✅ Using database Veritas data (${dataStatus.count} pairs)`);
          }
          
          // 다양한 카테고리에서 5개 선택
          selectedGrammarPairs = await veritasDataManager.selectDiversePairs(5);
          console.log(`✅ Selected ${selectedGrammarPairs.length} diverse grammar pairs for question generation`);
          
        } catch (error) {
          console.error('Error using Veritas data manager:', error);
          console.log('⚠️ Proceeding without Veritas data');
        }
      }
    }
    
    console.log("📝 Proceeding with AI generation for type:", type?.id || type);
    
    if (!claudeApiKey && !geminiApiKey && !gptApiKey && !deepseekApiKey) {
      throw new Error("API key not found. Please enter your API key in the settings.");
    }

    let client: AIClient;
    
    // 서답형 카테고리 유형인지 확인
    const isSeodapQuestion = isSeodapType(type.id);
    
    if (claudeApiKey) {
      // 서답형 유형은 OPUS 4.5 모델 사용, 그 외는 Sonnet 4.5 사용
      const modelToUse = isSeodapQuestion ? "claude-opus-4-5-20251101" : "claude-sonnet-4-5-20250929";
      console.log(`🤖 Claude 모델 선택: ${modelToUse} (서답형: ${isSeodapQuestion})`);
      
      client = new AnthropicClient({
        apiKey: claudeApiKey,
        model: modelToUse,
        maxTokens: isSeodapQuestion ? 8000 : 4000 // 서답형은 더 긴 응답 허용
      });
    } else if (geminiApiKey) {
      client = new GeminiClient({
        apiKey: geminiApiKey,
        model: "gemini-3-flash-preview"
      });
    } else if (gptApiKey) {
      client = new OpenAIClient({
        apiKey: gptApiKey,
        model: "gpt-4-turbo-preview"
      });
    } else {
      client = new DeepseekClient({
        apiKey: deepseekApiKey!,
        model: "deepseek-chat"
      });
    }

    let processedText = text;
    
    if (paraphraseLevel !== "1") {
      console.log(`Paraphrasing text with paraphrase level ${paraphraseLevel}`);
      
      const paraphrasePrompt = paraphraseLevel === "2" 
        ? `Please partially paraphrase the following text in English, changing some words and sentences while maintaining the core meaning. Keep approximately 50% of the original text and paraphrase the rest. If the input is not in English, translate it to English first, then paraphrase:\n\n${text}`
        : `Please completely paraphrase the entire text in English while maintaining its core meaning and difficulty level. Change all sentences but keep the same concepts and complexity. If the input is not in English, translate it to English first, then paraphrase:\n\n${text}`;

      processedText = await retryWithExponentialBackoff(async () => {
        if (signal?.aborted) throw new Error('AbortError');
        return await client.generateCompletion(paraphrasePrompt, signal);
      });
      
      console.log('Text successfully paraphrased');
    }

    console.log(`Generating question with complexity level: ${complexity}`);
    
    let complexityInstruction = "";
    if (complexity === "GRE") {
      complexityInstruction = "이 문제는 GRE 시험 수준의 최상급 난이도로 만들어야 합니다. 다음 가이드라인을 반드시 따라주세요:\n\n" +
                             "1. 어휘: 대학원생 수준의 최고급 학술 어휘와 전문 용어를 사용하세요. 어휘 난이도는 CEFR C2 이상 수준이어야 합니다. 특히 선택지에 사용되는 영어 어휘는 반드시 C2 이상의 고급 학술 어휘로 구성하세요.\n" +
                             "2. 문장 구조: 복잡한 중첩 구문, 학술적 수사법, 정교한 조건문을 사용하세요.\n" +
                             "3. 추론 수준: 고도의 논리적 사고, 복잡한 암시적 내용 파악, 미묘한 함의 분석, 반론 구성이 필요한 문제를 만드세요. 단순한 사실 확인이 아닌 깊은 분석적 사고를 요구해야 합니다.\n" +
                             "4. 선택지: 모든 선지가 정답처럼 보이며 매우 유사하고 구분이 어려운 선택지로 구성하세요. 선택지 간의 차이가 매우 미묘해야 합니다. **중요: 선택지의 길이는 다른 난이도와 비슷하게 간결하게 유지하되, 어휘와 개념의 난이도만 높이세요. 한 줄 정도의 길이로 작성하세요.**\n" +
                             "5. 주제: 철학, 과학 이론, 문학 비평, 경제 이론과 같은 추상적이고 학술적인 주제를 다루세요.\n" +
                             "6. **CRITICAL**: 지문 자체는 절대 변경하지 마세요. 밑줄 친 부분(오류를 만드는 선택지)을 제외하고는 원문의 모든 단어를 정확히 그대로 유지하세요. 단어 추가, 삭제, 변경 모두 금지입니다.\n" +
                             "7. 반드시 각 문제 유형의 프롬프트에 제시된 예시와 형식을 정확히 따라야 합니다. 선택지가 영어로 제시되어야 하는 유형과 한국어로 제시되어야 하는 유형을 구분하여 출력하세요.";
    } else if (complexity === "토플") {
      complexityInstruction = "이 문제는 TOEFL 시험 수준의 중상급 난이도로 만들어야 합니다. 다음 가이드라인을 반드시 따라주세요:\n\n" +
                             "1. 어휘: 대학 수준의 학술적 어휘와 다양한 의미를 가진 단어들을 사용하세요. 어휘 난이도는 CEFR C1 수준이어야 합니다. 특히 선택지에 사용되는 영어 어휘는 반드시 C1 수준으로 구성하세요.\n" +
                             "2. 문장 구조: 완료시제, 수동태, 가정법 등 다양한 문법 구조를 사용하세요.\n" +
                             "3. 추론 수준: 단순 정보 확인을 넘어 암시, 의도, 함축된 의미를 파악하는 추론 능력을 요구하는 문제를 만드세요.\n" +
                             "4. 선택지: 다소 매력적인 오답을 포함하여 깊은 이해력을 테스트하세요. 정답과 오답의 구분에 주의 깊은 분석이 필요해야 합니다.\n" +
                             "5. **CRITICAL**: 지문 자체는 절대 변경하지 마세요. 밑줄 친 부분(오류를 만드는 선택지)을 제외하고는 원문의 모든 단어를 정확히 그대로 유지하세요. 단어 추가, 삭제, 변경 모두 금지입니다. 선택지와 설명만 위 기준에 맞게 구성하세요.\n" +
                             "6. 반드시 각 문제 유형의 프롬프트에 제시된 예시와 형식을 정확히 따라야 합니다. 선택지가 영어로 제시되어야 하는 유형과 한국어로 제시되어야 하는 유형을 구분하여 출력하세요.";
    } else { // "수능" 기본값
      complexityInstruction = "이 문제는 한국 수능 영어 수준의 기본 난이도로 만들어야 합니다. 다음 가이드라인을 반드시 따라주세요:\n\n" +
                             "1. 어휘: 고등학교 영어 과정에서 배우는 명확하고 기본적인 어휘를 사용하세요. 어휘 난이도는 CEFR B1 수준이어야 합니다. 특히 선택지에 사용되는 영어 어휘는 반드시 B1 수준으로 구성하세요.\n" +
                             "2. 문장 구조: 간결하고 명확한 문법 구조를 사용하세요.\n" +
                             "3. 추론 수준: 주로 직접적인 정보 확인과 기초적인 추론 능력을 테스트하는 문제로 구성하세요. 고급 비판적 사고나 특수 지식은 요구하지 마세요.\n" +
                             "4. 선택지: 정답과 오답 사이에 명확한 구분이 있어야 합니다. 선택지는 단순 명료해야 합니다.\n" +
                             "5. **CRITICAL**: 지문 자체는 절대 변경하지 마세요. 밑줄 친 부분(오류를 만드는 선택지)을 제외하고는 원문의 모든 단어를 정확히 그대로 유지하세요. 단어 추가, 삭제, 변경 모두 금지입니다. 선택지와 설명만 위 기준에 맞게 구성하세요.\n" +
                             "6. 반드시 각 문제 유형의 프롬프트에 제시된 예시와 형식을 정확히 따라야 합니다. 선택지가 영어로 제시되어야 하는 유형과 한국어로 제시되어야 하는 유형을 구분하여 출력하세요.";
    }
    
    const basePrompt = type?.id === "grammar" && selectedGrammarPairs && subType !== 'boxed'
      ? getPromptForType(type, processedText, mode, selectedGrammarPairs, choiceLanguage, combinedTypes, paraphraseBlank, subType)
      : getPromptForType(type, processedText, mode, undefined, choiceLanguage, combinedTypes, paraphraseBlank, subType);
    
    const strictFormatInstructions = `
다음 지시사항을 엄격히 준수하세요:

1. 프롬프트에서 제공된 형식과 예시를 정확히 따라야 합니다.
2. 선택지의 언어는 문제 유형마다 다릅니다:
   - 다음 유형은 반드시 영어 선택지로 제공: topic, title, blank, blankMultiple, contentMatch, contentMismatch, vocabulary, implication
   - 다음 유형은 반드시 한글 선택지로 제공: mainPoint(한글), purpose(한글), claim(한글)
   - 각 유형의 예시에 나온 언어 형식을 정확히 준수하세요
3. 문제 설명과 해설은 각 유형의 예시와 동일한 언어로 제공하세요.
4. 선택지 형식(번호, 괄호, 마침표 등)을 정확히 예시와 일치시키세요.
5. **CRITICAL**: 지문 자체는 절대 변경하지 마세요. 밑줄 친 부분(오류를 만드는 선택지)을 제외하고는 원문의 모든 단어를 정확히 그대로 유지하세요. 단어 추가, 삭제, 변경 모두 금지입니다.
6. 출력 형식의 모든 섹션을 빠짐없이 포함하세요.

위 지침을 엄격히 따르지 않으면 문제가 제대로 생성되지 않을 수 있습니다.
`;

    const finalPrompt = strictFormatInstructions + "\n\n" + complexityInstruction + "\n\n" + basePrompt;
    
    console.log("Final prompt structure (beginning):", finalPrompt.substring(0, 200) + "...");
    
    let result = await retryWithExponentialBackoff(async () => {
      if (signal?.aborted) throw new Error('AbortError');
      return await client.generateCompletion(finalPrompt, signal);
    });

    if (type.id === "contentMismatch") {
      if (!result.includes("① ") || !result.match(/①.*[a-zA-Z]/)) {
        console.log("Regenerating contentMismatch question to ensure English options");
        
        const enforcedPrompt = `${strictFormatInstructions}
        
특별 지시사항: 내용불일치 문제는 반드시 다음 형식을 따라야 합니다:
1. 문제 제목: "다음의 내용과 일치하지 않는 것을 고르시오."
2. 원본 영어 텍스트를 그대로 제시
3. 5개의 영어 선택지 (①~⑤)
4. 정답은 ①~⑤ 중 랜덤하게 선택
5. 정답 설명 및 한국어 번역 제공

아래 예시 형식을 정확히 따르세요:

다음의 내용과 일치하지 않는 것을 고르시오.

[영어 원문 텍스트]

① [영어 선택지1]
② [영어 선택지2]
③ [영어 선택지3]
④ [영어 선택지4]
⑤ [영어 선택지5]

[정답] [①~⑤ 중 랜덤 선택]

[해설]
[정답] 선택지는 "[내용]"이라고 했는데, 지문에서는 "[실제 내용]"이라고 언급했으므로 지문의 내용과 일치하지 않습니다.

[보기 해석]
① [첫 번째 선택지 한국어 번역]
② [두 번째 선택지 한국어 번역]
③ [세 번째 선택지 한국어 번역]
④ [네 번째 선택지 한국어 번역]
⑤ [다섯 번째 선택지 한국어 번역]

${basePrompt}`;

        result = await retryWithExponentialBackoff(async () => {
          if (signal?.aborted) throw new Error('AbortError');
          return await client.generateCompletion(enforcedPrompt, signal);
        });
      }
    } else if (type.id === "blank" || type.id === "blankMultiple") {
      if (!result.includes("① ") || !result.match(/①.*[a-zA-Z]/)) {
        console.log("Regenerating blank question to ensure English options");
        
        const enforcedPrompt = `${strictFormatInstructions}
        
특별 지시사항: 빈칸 문제는 반드시 다음 형식을 따라야 합니다:
1. 문제 제목: "다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오."
2. 빈칸이 포함된 원본 영어 텍스트 제시
3. 5개의 영어 선택지 (①~⑤)
4. 정답 및 해설 제공

선택지는 반드시 영어로 작성해야 합니다.

${basePrompt}`;

        result = await retryWithExponentialBackoff(async () => {
          if (signal?.aborted) throw new Error('AbortError');
          return await client.generateCompletion(enforcedPrompt, signal);
        });
      }
    } else if (type.id === "mainPoint") {
      if (!result.includes("① ") || !result.match(/①.*[ㄱ-ㅎㅏ-ㅣ가-힣]/)) {
        console.log("Regenerating mainPoint question to ensure Korean options");
        
        const enforcedPrompt = `${strictFormatInstructions}
        
특별 지시사항: 요지 문제는 반드시 다음 형식을 따라야 합니다:
1. 문제 제목: "다음 글의 요지로 가장 적절한 것은?"
2. 원본 영어 텍스트를 그대로 제시
3. 5개의 한글 선택지 (①~⑤)
4. 정답 및 한글 해설 제공

선택지는 반드시 한글로 작성해야 합니다.

${basePrompt}`;

        result = await retryWithExponentialBackoff(async () => {
          if (signal?.aborted) throw new Error('AbortError');
          return await client.generateCompletion(enforcedPrompt, signal);
        });
      }
    }

    if (type.id === "grammar") {
      result = await verifyGrammarQuestion(client, result);
    }

    // 주제문영작 문제 검증 및 자동 수정
    if (type.id === "topicWriting") {
      console.log("🔍 주제문영작 검증 시작...");
      const validation = validateTopicWritingQuestion(result);
      
      if (!validation.isValid) {
        console.warn("⚠️ 주제문영작 검증 실패:", validation.errors);
        
        if (validation.correctedContent) {
          console.log("✅ 자동 수정 완료");
          result = validation.correctedContent;
          
          // 수정 후 재검증
          const revalidation = validateTopicWritingQuestion(result);
          if (!revalidation.isValid) {
            console.error("❌ 자동 수정 후에도 검증 실패. 재생성 필요.");
            // 재생성 시도
            const retryPrompt = `${finalPrompt}\n\n⚠️ 이전 생성에서 오류가 발견되었습니다. 다음 규칙을 반드시 준수하세요:\n1. 정답 문장을 먼저 작성한 후 단어 개수를 정확히 세세요\n2. 정답 문장의 모든 단어를 추출하세요 (같은 단어가 여러 번 나오면 그 횟수만큼)\n3. 제시 단어 = 정답 문장의 모든 단어\n4. 조건의 단어 수 = 정답 문장의 단어 개수\n5. 최종 검증을 수행하세요`;
            
            result = await retryWithExponentialBackoff(async () => {
              if (signal?.aborted) throw new Error('AbortError');
              return await client.generateCompletion(retryPrompt, signal);
            });
            
            // 재생성 후 다시 검증
            const finalValidation = validateTopicWritingQuestion(result);
            if (!finalValidation.isValid && finalValidation.correctedContent) {
              result = finalValidation.correctedContent;
            }
          }
        }
      } else {
        console.log("✅ 주제문영작 검증 성공");
      }
    }

    // 빈칸영작 문제 단어 무작위 배열
    if (type.id === "blankWriting") {
      console.log("🔍 빈칸영작 단어 무작위 배열 시작...");
      const validation = validateBlankWritingQuestion(result);
      
      if (validation.correctedContent) {
        console.log("✅ 단어가 무작위로 배열되었습니다.");
        result = validation.correctedContent;
      } else if (!validation.isValid) {
        console.warn("⚠️ 빈칸영작 처리 중 오류:", validation.errors);
      }
    }

    // conditionWriting 문제 단어 무작위 배열
    if (type.id === "conditionWriting") {
      console.log("🔍 conditionWriting 단어 무작위 배열 시작...");
      const validation = validateConditionWritingQuestion(result);
      
      if (validation.correctedContent) {
        console.log("✅ 단어가 무작위로 배열되었습니다.");
        result = validation.correctedContent;
      } else if (!validation.isValid) {
        console.warn("⚠️ conditionWriting 처리 중 오류:", validation.errors);
      }
    }

    // 연결사 문제 정답 번호 무작위 배정
    if (type.id === "conjunction") {
      console.log("🔍 연결사 문제 정답 번호 무작위 배정 시작...");
      result = randomizeConjunctionAnswer(result);
      console.log("✅ 연결사 문제 정답 번호 무작위 배정 완료");
    }

    // 순서 문제 검증 및 자동 수정
    if (type.id === "order") {
      console.log("🔍 순서 문제 검증 시작...");
      const validation = validateOrderQuestion(result, processedText);
      
      if (!validation.isValid) {
        console.warn("⚠️ 순서 문제 검증 실패:", validation.errors);
        
        // 재생성 시도 (원문을 강조)
        const retryPrompt = `${finalPrompt}

⚠️⚠️⚠️ 중요한 오류 수정 지침 ⚠️⚠️⚠️

이전 생성에서 다음과 같은 오류가 발견되었습니다:
${validation.errors.join('\n')}

다시 한번 강조합니다:

🚫 절대로 새로운 문장을 만들어내지 마세요!
🚫 원문에 없는 내용을 추가하지 마세요!
✅ 제공된 원문의 문장들만 사용하세요!
✅ 도입부 + (A) + (B) + (C) = 원문 전체 (100% 동일)

원문:
${text}

위 원문의 모든 문장을 그대로 사용하여 순서 문제를 만드세요.`;
        
        result = await retryWithExponentialBackoff(async () => {
          if (signal?.aborted) throw new Error('AbortError');
          return await client.generateCompletion(retryPrompt, signal);
        });
        
        // 재생성 후 다시 검증
        const revalidation = validateOrderQuestion(result, processedText);
        if (!revalidation.isValid) {
          console.error("❌ 재생성 후에도 검증 실패:", revalidation.errors);
          // 사용자에게 오류 메시지 추가
          result = result + `\n\n⚠️ 검증 실패: ${revalidation.errors.join(', ')}`;
        } else {
          console.log("✅ 재생성 후 검증 성공");
        }
      } else {
        console.log("✅ 순서 문제 검증 성공");
      }
    }

    // [32-34] 빈칸 (blankMultiple) 원문 무결성 검증 - 다른 지문 생성 방지
    if (type.id === "blankMultiple") {
      const fingerprint = (s: string) =>
        s.replace(/\[.*?\]/g, '')
         .replace(/_+/g, '')
         .replace(/[^a-zA-Z]/g, '')
         .toLowerCase()
         .slice(0, 80);
      
      const sourceFp = fingerprint(text);
      const passageMatch = result.match(/(?:다음 글의 빈칸[^\n]*\n+)([\s\S]*?)(?=\n\s*①)/);
      const generatedPassage = passageMatch ? passageMatch[1] : result;
      const generatedFp = fingerprint(generatedPassage);
      
      let matchScore = 0;
      const minLen = Math.min(sourceFp.length, generatedFp.length);
      for (let i = 0; i < minLen; i++) {
        if (sourceFp[i] === generatedFp[i]) matchScore++;
      }
      const matchRatio = minLen > 0 ? matchScore / minLen : 0;
      
      if (matchRatio < 0.7 && sourceFp.length > 30) {
        console.warn(`⚠️ [32-34] 빈칸: AI가 다른 지문을 생성함 (일치율 ${(matchRatio * 100).toFixed(1)}%). 재생성 시도...`);
        
        const retryPrompt = `${getPromptForType(type, text, undefined, undefined, undefined, undefined, paraphraseBlank)}

⚠️⚠️⚠️ 매우 중요: 이전 생성에서 AI가 제공된 지문을 무시하고 다른 지문을 만들었습니다.

🚨 절대 규칙:
- 아래 [원본 지문]을 글자 단위로 그대로 사용하세요
- 다른 지문을 만들거나 임의로 패러프레이즈하지 마세요
- 빈칸 부분만 ______ 로 대체하고 나머지는 한 글자도 바꾸지 마세요

[원본 지문]
${text}

위 원본 지문을 그대로 사용하여 빈칸 추론 문제를 만드세요.`;
        
        try {
          result = await retryWithExponentialBackoff(async () => {
            if (signal?.aborted) throw new Error('AbortError');
            return await client.generateCompletion(retryPrompt, signal);
          });
          console.log("✅ [32-34] 빈칸 재생성 완료");
        } catch (e) {
          console.error("❌ [32-34] 빈칸 재생성 실패:", e);
        }
      } else {
        console.log(`✅ [32-34] 빈칸 원문 무결성 확인 (일치율 ${(matchRatio * 100).toFixed(1)}%)`);
      }
    }

    // 서답형 문제 검증 및 자동 수정 (topicWriting, blankWriting 제외 - 별도 validator 있음)
    if (isSeodapType(type.id) && type.id !== 'topicWriting' && type.id !== 'blankWriting') {
      console.log(`🔍 서답형 문제 검증 시작: ${type.id}`);
      const seodapValidation = validateSeodapQuestion(type.id, result);
      
      if (!seodapValidation.isValid) {
        console.warn(`⚠️ 서답형 문제 검증 실패 (${type.id}):`, seodapValidation.errors);
        
        // AI를 통한 재검증 및 수정
        const verificationPrompt = getSeodapVerificationPrompt(type.id, result, seodapValidation.errors);
        
        try {
          const correctedResult = await retryWithExponentialBackoff(async () => {
            if (signal?.aborted) throw new Error('AbortError');
            return await client.generateCompletion(verificationPrompt, signal);
          });
          
          // 수정된 결과 재검증
          const revalidation = validateSeodapQuestion(type.id, correctedResult);
          if (revalidation.isValid) {
            console.log(`✅ 서답형 문제 수정 완료: ${type.id}`);
            result = correctedResult;
          } else {
            console.warn(`⚠️ 서답형 문제 수정 후에도 일부 오류 존재:`, revalidation.errors);
            // 수정된 내용이 있으면 적용
            if (seodapValidation.correctedContent) {
              result = seodapValidation.correctedContent;
            }
          }
        } catch (error) {
          console.error(`❌ 서답형 문제 수정 중 오류:`, error);
          // 기본 수정만 적용
          if (seodapValidation.correctedContent) {
            result = seodapValidation.correctedContent;
          }
        }
      } else {
        console.log(`✅ 서답형 문제 검증 성공: ${type.id}`);
      }
    }

    // 서답형 문제는 추가로 AI 풀이 검증 수행 (문제검증 버튼과 동일한 로직)
    if (isSeodapType(type.id)) {
      console.log(`🔍 서답형 문제 AI 풀이 검증 시작: ${type.id}`);
      try {
        const apiKey = localStorage.getItem("anthropic_api_key") || "";
        if (apiKey) {
          const { verifyQuestion } = await import("./questionVerifier");
          const verificationResult = await verifyQuestion(result, type.id, 1, apiKey);
          
          if (verificationResult.hasChanges && verificationResult.errors.length > 0) {
            console.log(`⚠️ 서답형 AI 검증에서 오류 발견:`, verificationResult.errors);
            // 수정된 내용으로 교체
            result = verificationResult.verified;
            console.log(`✅ 서답형 문제 AI 검증 수정 완료`);
          } else {
            console.log(`✅ 서답형 문제 AI 풀이 검증 통과`);
          }
        }
      } catch (error) {
        console.error(`❌ 서답형 AI 풀이 검증 중 오류:`, error);
        // 검증 실패해도 기존 결과 유지
      }
    }

    // 모든 문제에 대해 정답과 해설 일치 여부 먼저 검증 (랜덤화 전에)
    console.log("🔍 문제 검증 단계 시작...");
    result = await verifyQuestionConsistency(client, result, signal);
    console.log("✅ 문제 검증 완료");

    if (type.id === "irrelevant") {
      result = sanitizeIrrelevantQuestionOutput(result);
    }

    // Apply answer randomization to all Suneung 5-choice question types
    const fiveChoiceTypes = [
      "purpose", "mood", "claim", "implication", "title", 
      "mainPoint", "topic", "contentMismatch", "contentMatch",
      "vocabulary", "blank", "blankMultiple", "irrelevant", 
      "order", "insert", "summary", "seongnamHumanities"
    ];
    
    if (fiveChoiceTypes.includes(type.id)) {
      result = randomizeFiveChoiceAnswerDistribution(result, type.id);
    }

    // Apply answer randomization to double-answer question types
    const doubleAnswerTypes = ["seongnamClaimDouble"];
    
    if (doubleAnswerTypes.includes(type.id)) {
      result = randomizeDoubleAnswerDistribution(result, type.id);
    }
    
    // Ensure blank line before [정답] section for all questions
    result = ensureBlankLineBeforeAnswer(result);
    
    // Remove any debug output from the result
    result = removeDebugOutput(result);

    if (type.id === "irrelevant") {
      result = sanitizeIrrelevantQuestionOutput(result);
    }

    // Safety net for combinedQuestion: detect and strip duplicated passages
    if (type.id === "combinedQuestion") {
      result = stripDuplicatePassageInCombined(result);
    }

    return result;
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
};
