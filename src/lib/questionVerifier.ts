import { AnthropicClient } from "./ai/anthropicClient";
import { AIClient } from "./grammar/types";

const VERIFICATION_PROMPT = `당신은 영어 시험 문제를 직접 풀어보고 검증하는 전문가입니다.

## 핵심 원칙
**오류가 없으면 절대 수정하지 마세요!** 원본을 그대로 반환해야 합니다.

## 검증 절차
1. **문제 유형 파악**: 이 문제가 어떤 유형인지 파악하세요 (빈칸, 순서배열, 주제, 요약 등)
2. **직접 풀이**: 지문을 읽고 문제 유형에 맞게 직접 답을 도출하세요
3. **정답 비교**: 당신이 도출한 답과 제시된 정답이 일치하는지 확인
4. **해설 확인**: 해설이 정답 도출 과정을 올바르게 설명하는지 확인

## 수정이 필요한 명백한 오류 (이 경우에만 수정)
- 정답이 논리적으로 틀린 경우 (직접 풀었을 때 다른 답이 나오는 경우)
- 해설이 정답과 모순되는 경우
- 선지에 명백한 오타나 문법 오류가 있는 경우

## 수정하면 안 되는 경우
- 문제가 정상적으로 작동하는 경우
- 표현이 다르더라도 의미가 맞는 경우
- 스타일이나 형식이 마음에 들지 않는 경우
- 더 나은 표현이 있다고 생각되는 경우

## 응답 형식
<errors>
(발견된 오류를 구체적으로 나열. 오류가 없으면 반드시 "오류 없음"이라고만 작성)
</errors>
<corrected>
(오류가 있는 경우에만 수정된 문제 작성. 오류가 없으면 원본을 그대로 복사)
</corrected>

[문제]
`;

export interface VerificationResult {
  original: string;
  verified: string;
  hasChanges: boolean;
  questionId: string;
  questionNumber: number;
  errors: string[];
}

function createVerificationClient(): AIClient {
  const claudeApiKey = localStorage.getItem('claude_api_key');

  if (!claudeApiKey) {
    throw new Error('Anthropic API 키가 설정되지 않았습니다. 메인페이지에서 Claude API 키를 설정해주세요.');
  }

  return new AnthropicClient({
    apiKey: claudeApiKey,
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 8000,
    temperature: 0.7
  });
}

export async function verifyQuestion(
  content: string,
  questionId: string,
  questionNumber: number,
  apiKey: string
): Promise<VerificationResult> {
  const client = createVerificationClient();

  try {
    const responseText = await client.generateCompletion(VERIFICATION_PROMPT + content);

    const errorsMatch = responseText.match(/<errors>([\s\S]*?)<\/errors>/);
    const errorsText = errorsMatch ? errorsMatch[1].trim() : "";
    const errors: string[] = [];
    
    if (errorsText && errorsText !== "오류 없음") {
      const errorLines = errorsText.split('\n').filter(line => line.trim());
      errors.push(...errorLines);
    }

    const correctedMatch = responseText.match(/<corrected>([\s\S]*?)<\/corrected>/);
    let verifiedContent = correctedMatch ? correctedMatch[1].trim() : content;

    if (!correctedMatch) {
      verifiedContent = responseText
        .replace(/^(수정된 문제:|문제:|검토 결과:)\s*/i, "")
        .replace(/^```[\s\S]*?\n/, "")
        .replace(/\n```$/, "")
        .trim();
    }

    const hasChanges = verifiedContent !== content.trim() || errors.length > 0;

    return {
      original: content,
      verified: verifiedContent,
      hasChanges,
      questionId,
      questionNumber,
      errors,
    };
  } catch (error) {
    console.error("Question verification failed:", error);
    throw error;
  }
}

export async function verifyAllQuestions(
  questions: Array<{ id: string; content: string; questionNumber: number }>,
  apiKey: string,
  onProgress?: (current: number, total: number) => void
): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    if (!question.content || question.content.trim() === "") {
      continue;
    }

    if (onProgress) {
      onProgress(i + 1, questions.length);
    }

    const result = await verifyQuestion(
      question.content,
      question.id,
      question.questionNumber,
      apiKey
    );

    results.push(result);
  }

  return results;
}
