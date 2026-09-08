## 분석 (업로드 PDF 171문항)

PDF의 어법/어휘 문항은 정확히 **2개 서브유형**이 섞여 있음:

**[29] 어법**
- **A. 밑줄형**: "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?" — 지문에 ①~⑤ 밑줄
- **B. 네모형**: "(A), (B), (C)의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것은?" — 지문에 (A)[X / Y] 3개 + ①~⑤ 조합표

**[30] 어휘**
- **A. 밑줄형**: "다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은?" — ①~⑤ 밑줄
- **B. 네모형**: "(A), (B), (C)의 각 네모 안에서 문맥에 맞는 낱말로 가장 적절한 것은?" — 3개 네모 + 조합표

현재 코드:
- `grammar`(A) ✅, `vocabulary`(A) ✅
- `grammarSelection`(B) — 별도 [내신형] 옵션으로만 존재
- 어휘 네모형(B) — 없음

## 변경 계획

### 1) 프롬프트 (PDF 샘플 형식과 1:1 일치하도록 재작성)
- **`src/lib/prompts/grammar.ts`** (밑줄형, 기존): PDF 샘플 2~3개를 few-shot으로 삽입. 출력 형식·해설 톤·밑줄 길이 분포·문법 카테고리 다양성 규칙을 PDF 기준으로 정렬.
- **`src/lib/prompts/grammarSelection.ts`** (네모형, 기존): PDF 표 형식과 동일하게 5행 조합표 + (A)[X / Y] 표기·해설 형식 강화, PDF few-shot 예시 1~2개 삽입.
- **`src/lib/prompts/vocabulary.ts`** (밑줄형, 기존): PDF 샘플 톤·해설 형식 보강(기존 유지 + 예시 교체).
- **`src/lib/prompts/vocabularySelection.ts`** (네모형, 신규): PDF 어휘 네모형 샘플(예: characters/characteristics, effects/compacts, burst/trusted 패턴)을 그대로 따르도록 신규 작성. 헷갈리기 쉬운 형태·유사어 쌍 카테고리 명시.

### 2) 라우팅
- **`src/lib/questionTypes.ts`**: `getPromptForType`의 `grammar` / `vocabulary` 케이스에 `subType?: 'underline' | 'boxed'` 인자 추가. `boxed`면 selection 프롬프트로 분기.
- **`src/lib/prompts/index.ts`**: 신규 `vocabularySelection` export.

### 3) UI 토글 (passage 단위 옵션)
- **`QuestionState.tsx`**: passage 상태에 `grammarSubType`, `vocabularySubType` 필드 추가 + 변경 핸들러.
- **`Passage.tsx`**: 어법/어휘 type일 때 `밑줄형 | 네모(A)(B)(C)형` 2-버튼 토글 노출 (기존 `summaryMode` 토글과 동일한 패턴).
- **`TypeEntry.tsx` / `MainContent.tsx` / `PassageList.tsx`**: 핸들러 prop 전달.
- **`QuestionActions.tsx`**: `generateQuestion` 호출 시 서브타입 전달.
- **`singleQuestionGenerator.ts` / `generateQuestion` 시그니처**: 옵션 인자 추가.

### 4) 직접출제모드는 영향 없음
직접출제(Veritas 대립쌍 수동 선택)는 그대로. 토글은 자동출제 경로에만 노출.

## 기술 메모
- 기본값: 두 유형 모두 `underline`(기존 동작 유지) → 회귀 없음.
- 네모형 출력은 마크다운 테이블(`| (A) | (B) | (C) |`) 그대로 사용 — 기존 `grammarSelection` 렌더링이 이미 지원.
- 해설 형식 통일: 정답 1줄 + 각 박스별 1줄 문법/문맥 근거.

진행해도 될까요? 승인 시 4개 파일 신규/수정 + UI 토글까지 한 번에 반영합니다.
