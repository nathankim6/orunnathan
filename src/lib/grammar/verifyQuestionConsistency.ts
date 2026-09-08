import { AIClient } from "./types";

/**
 * 생성된 문제의 정답과 해설이 일치하는지 Claude AI를 통해 재검증합니다.
 * 불일치가 발견되면 수정된 버전을 반환합니다.
 */
export async function verifyQuestionConsistency(
  client: AIClient,
  questionText: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    console.log("🔍 정답과 해설 일치 여부 검증 시작...");

    const verificationPrompt = `다음 문제를 분석하여 정답과 해설이 일치하는지 확인해주세요.

문제:
${questionText}

확인 사항:
1. [정답] 섹션에 표시된 정답이 올바른지 확인
2. [해설] 섹션의 설명이 정답과 일치하는지 확인
3. 정답 선택지의 내용이 해설의 논리와 일치하는지 확인
4. 만약 불일치가 있다면, 무엇이 잘못되었는지 명확히 파악

**중요 규칙:**
- 검증 과정, 분석 내용, 단어 개수 확인 등의 메타 정보를 절대 출력하지 마세요
- "검증:", "단어 개수:", "매칭 확인" 등의 검증 로그를 포함하지 마세요
- 오직 문제 내용만 출력하세요

응답 형식:
1. 첫 줄에 "일치" 또는 "불일치" 중 하나만 작성
2. 불일치인 경우, "---수정된 문제---" 다음에 수정된 문제만 출력 (검증 과정 없이 문제 본문만)

예시 (일치하는 경우):
일치

예시 (불일치하는 경우):
불일치
---수정된 문제---
[수정된 문제 전체 - 검증 과정 없이 문제 본문만]`;

    const verificationResult = await client.generateCompletion(verificationPrompt, signal);
    
    const firstLine = verificationResult.trim().split('\n')[0];
    
    if (firstLine.includes("일치")) {
      console.log("✅ 정답과 해설이 일치합니다.");
      return questionText;
    } else {
      console.log("⚠️ 정답과 해설 불일치 발견. 수정 중...");
      
      // "---수정된 문제---" 이후의 내용 추출
      const correctedSectionMatch = verificationResult.match(/---수정된 문제---\s*([\s\S]*)/);
      
      if (correctedSectionMatch && correctedSectionMatch[1]) {
        let correctedQuestion = correctedSectionMatch[1].trim();
        
        // 불필요한 검증 멘트 제거
        correctedQuestion = removeVerificationComments(correctedQuestion);
        
        console.log("✅ 문제가 수정되었습니다.");
        return correctedQuestion;
      } else {
        console.warn("⚠️ 수정된 문제를 찾을 수 없습니다. 원본을 반환합니다.");
        return questionText;
      }
    }
  } catch (error) {
    console.error("검증 중 오류 발생:", error);
    // 오류가 발생하면 원본 문제를 반환
    return questionText;
  }
}

/**
 * 검증 과정에서 삽입된 불필요한 멘트를 제거합니다.
 */
function removeVerificationComments(content: string): string {
  // 검증 관련 패턴들 제거
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
  
  // 연속된 빈 줄 정리
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
}
